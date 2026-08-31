<script setup>
import { ref, onMounted, computed } from "vue";
import { listarEquipos } from "../services/equipos.service";
import { listarAlquileres } from "../services/alquileres.service";
import { api } from "../services/api";

const equipos = ref([]);
const alquileres = ref([]);
const vencimientos = ref([]);
const cargando = ref(true);
const error = ref("");

const cargar = async () => {
  cargando.value = true;
  error.value = "";
  try {
    const [equiposRes, alquileresRes, vencimientosRes] = await Promise.all([
      listarEquipos(),
      listarAlquileres(),
      api.get("/alquileres/vencimientos").then((res) => res.data),
    ]);
    equipos.value = equiposRes;
    alquileres.value = alquileresRes;
    vencimientos.value = [...vencimientosRes].sort(
      (a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento)
    );
  } catch (requestError) {
    error.value = requestError.response?.data?.error || "No se pudo cargar el panel.";
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);

const contarPorEstado = (lista, estado) =>
  lista.filter((item) => item.estado === estado).length;

const equiposStats = computed(() => [
  { label: "Disponibles", clase: "disponible", total: contarPorEstado(equipos.value, "DISPONIBLE") },
  { label: "Alquilados", clase: "alquilado", total: contarPorEstado(equipos.value, "ALQUILADO") },
  { label: "En mantenimiento", clase: "mantenimiento", total: contarPorEstado(equipos.value, "MANTENIMIENTO") },
]);

const alquileresActivos = computed(() => contarPorEstado(alquileres.value, "ACTIVO"));
const alquileresVencidos = computed(() => contarPorEstado(alquileres.value, "VENCIDO"));

const formatoFecha = (fecha) => new Date(fecha).toLocaleString("es-AR");

const estaVencido = (fecha) => new Date(fecha) < new Date();
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <span class="page-eyebrow">Inicio</span>
        <h1>Panel</h1>
      </div>
    </div>

    <p v-if="cargando" class="field-hint">Cargando panel...</p>

    <div v-else-if="error" class="form-alert">
      {{ error }}
      <button type="button" class="link-btn" @click="cargar">Reintentar</button>
    </div>

    <div v-else>
      <section class="stats-grid">
        <article v-for="stat in equiposStats" :key="stat.label" class="stat-card">
          <span class="estado-badge" :class="stat.clase">{{ stat.label }}</span>
          <strong class="stat-number">{{ stat.total }}</strong>
          <span class="stat-caption">equipos</span>
        </article>

        <article class="stat-card">
          <span class="estado-badge alquilado">Alquileres activos</span>
          <strong class="stat-number">{{ alquileresActivos }}</strong>
          <span class="stat-caption">en curso</span>
        </article>

        <article class="stat-card">
          <span class="estado-badge mantenimiento">Vencidos</span>
          <strong class="stat-number">{{ alquileresVencidos }}</strong>
          <span class="stat-caption">sin devolver</span>
        </article>
      </section>

      <section class="panel-section">
        <h2>Próximos a vencer</h2>

        <div v-if="vencimientos.length" class="vencimientos-list">
          <div
            v-for="alquiler in vencimientos"
            :key="alquiler.id"
            class="vencimiento-item"
            :class="{ 'es-vencido': estaVencido(alquiler.fechaVencimiento) }"
          >
            <div class="vencimiento-main">
              <strong>{{ alquiler.equipo.nombre }}</strong>
              <span class="table-subtext">{{ alquiler.equipo.numeroSerie }}</span>
            </div>
            <div class="vencimiento-cliente">{{ alquiler.cliente.nombre }}</div>
            <div class="vencimiento-fecha">
              {{ formatoFecha(alquiler.fechaVencimiento) }}
            </div>
            <span class="estado-badge" :class="alquiler.estado.toLowerCase()">
              {{ alquiler.estado }}
            </span>
          </div>
        </div>

        <p v-else class="field-hint">No hay alquileres próximos a vencer.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 18px;
  background: var(--color-paper-raised);
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
}

.stat-number {
  font-family: var(--font-display);
  font-size: 32px;
  line-height: 1;
}

.stat-caption {
  color: var(--color-ink-soft);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.panel-section h2 {
  margin-bottom: 14px;
  font-size: 16px;
}

.vencimientos-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--color-paper-raised);
}

.vencimiento-item {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-line);
}

.vencimiento-item:last-child {
  border-bottom: 0;
}

.vencimiento-item.es-vencido {
  background: var(--color-red-tint);
}

.vencimiento-cliente {
  color: var(--color-ink-soft);
  font-size: 13px;
}

.vencimiento-fecha {
  font-family: var(--font-mono);
  font-size: 13px;
}

.table-subtext {
  display: block;
  margin-top: 2px;
  color: var(--color-ink-soft);
  font-family: var(--font-mono);
  font-size: 11px;
}

.form-alert {
  margin: 0 0 16px;
  padding: 10px 12px;
  border-radius: var(--radius);
  background: var(--color-red-tint);
  color: var(--color-red-dark);
  font-size: 13px;
}

.link-btn {
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-red);
  cursor: pointer;
  font-size: 12px;
}

@media (max-width: 640px) {
  .vencimiento-item {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
