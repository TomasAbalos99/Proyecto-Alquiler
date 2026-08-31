<script setup>
import { ref, onMounted } from "vue";
import {
  listarAlquileres,
  marcarAlquilerDevuelto,
  eliminarAlquiler,
} from "../services/alquileres.service";
import AlquilerForm from "../components/AlquilerForm.vue";

const alquileres = ref([]);
const cargando = ref(true);
const error = ref("");
const errorAccion = ref("");
const mostrarForm = ref(false);
const alquilerEditando = ref(null);

const cargar = async () => {
  cargando.value = true;
  error.value = "";
  try {
    alquileres.value = await listarAlquileres();
  } catch (requestError) {
    error.value = requestError.response?.data?.error || "No se pudieron cargar los alquileres.";
  } finally {
    cargando.value = false;
  }
};

const marcarDevuelto = async (id) => {
  errorAccion.value = "";
  try {
    await marcarAlquilerDevuelto(id);
    await cargar();
  } catch (requestError) {
    errorAccion.value = requestError.response?.data?.error || "No se pudo marcar la devolución.";
  }
};

const abrirFormularioCreacion = () => {
  alquilerEditando.value = null;
  mostrarForm.value = true;
};

const abrirFormularioEdicion = (alquiler) => {
  alquilerEditando.value = alquiler;
  mostrarForm.value = true;
};

const cerrarFormulario = () => {
  mostrarForm.value = false;
  alquilerEditando.value = null;
};

const eliminar = async (alquiler) => {
  const ok = window.confirm(`¿Seguro que querés eliminar el alquiler de ${alquiler.equipo?.nombre}?`);
  if (!ok) return;

  try {
    await eliminarAlquiler(alquiler.id);
    await cargar();
  } catch (requestError) {
    errorAccion.value = requestError.response?.data?.error || "No se pudo eliminar el alquiler.";
  }
};

onMounted(cargar);

const onAlquilerCreado = async () => {
  cerrarFormulario();
  await cargar();
};

const estadoClase = (estado) => estado.toLowerCase();
const formatoFecha = (fecha) => new Date(fecha).toLocaleString("es-AR");
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <span class="page-eyebrow">Operaciones</span>
        <h1>Alquileres</h1>
      </div>
      <button v-if="!mostrarForm" class="btn btn-primary" @click="abrirFormularioCreacion">
        + Nuevo alquiler
      </button>
    </div>

    <AlquilerForm
      v-if="mostrarForm"
      :modo="alquilerEditando ? 'editar' : 'crear'"
      :alquiler-inicial="alquilerEditando"
      @creado="onAlquilerCreado"
      @cancelar="cerrarFormulario"
    />

    <p v-if="cargando" class="field-hint">Cargando alquileres...</p>
    <div v-else-if="error" class="form-alert">
      {{ error }}
      <button type="button" class="link-btn" @click="cargar">Reintentar</button>
    </div>
    <div v-else>
      <p v-if="errorAccion" class="form-alert">{{ errorAccion }}</p>
      <div v-if="alquileres.length" class="alquileres-table-wrap">
        <table class="alquileres-table">
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Cliente</th>
              <th>Vencimiento</th>
              <th>Monto</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="alquiler in alquileres" :key="alquiler.id">
              <td>
                <strong>{{ alquiler.equipo?.nombre }}</strong>
                <span class="table-subtext">{{ alquiler.equipo?.numeroSerie }}</span>
              </td>
              <td>{{ alquiler.cliente?.nombre }}</td>
              <td>{{ formatoFecha(alquiler.fechaVencimiento) }}</td>
              <td class="mono-cell">$ {{ Number(alquiler.monto).toFixed(2) }}</td>
              <td>
                <span class="estado-badge" :class="estadoClase(alquiler.estado)">
                  {{ alquiler.estado }}
                </span>
              </td>
              <td class="actions-cell">
                <button
                  v-if="alquiler.estado !== 'FINALIZADO'"
                  class="btn btn-ghost btn-sm"
                  @click="marcarDevuelto(alquiler.id)"
                >
                  Marcar devuelto
                </button>
                <button type="button" class="btn btn-ghost btn-sm" @click="abrirFormularioEdicion(alquiler)">
                  Editar
                </button>
                <button type="button" class="btn btn-ghost btn-sm danger" @click="eliminar(alquiler)">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="field-hint">Todavía no hay alquileres cargados.</p>
    </div>
  </div>
</template>

<style scoped>
.alquileres-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
}

.alquileres-table {
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
  background: var(--color-paper-raised);
}

.alquileres-table th {
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-line);
  background: var(--color-paper);
  color: var(--color-ink-soft);
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.05em;
  text-align: left;
  text-transform: uppercase;
}

.alquileres-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-line);
  font-size: 14px;
  vertical-align: middle;
}

.alquileres-table tr:last-child td {
  border-bottom: 0;
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

.actions-cell {
  white-space: nowrap;
}

.actions-cell .btn {
  margin-right: 8px;
}

.actions-cell .btn:last-child {
  margin-right: 0;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-ghost.danger {
  border-color: rgba(195, 31, 61, 0.35);
  color: var(--color-red);
}
</style>
