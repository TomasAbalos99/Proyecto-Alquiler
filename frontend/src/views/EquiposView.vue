<script setup>
import { ref, onMounted } from "vue";
import { listarEquipos, eliminarEquipo } from "../services/equipos.service";
import EquipoForm from "../components/EquipoForm.vue";

const equipos = ref([]);
const cargando = ref(true);
const mostrarForm = ref(false);
const equipoEditando = ref(null);

const cargarEquipos = async () => {
  cargando.value = true;
  try {
    equipos.value = await listarEquipos();
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarEquipos);

const estadoClase = (estado) => estado.toLowerCase();

const abrirFormularioCreacion = () => {
  equipoEditando.value = null;
  mostrarForm.value = true;
};

const abrirFormularioEdicion = (equipo) => {
  equipoEditando.value = equipo;
  mostrarForm.value = true;
};

const cerrarFormulario = () => {
  mostrarForm.value = false;
  equipoEditando.value = null;
};

const onEquipoCreado = async () => {
  cerrarFormulario();
  await cargarEquipos();
};

const eliminar = async (equipo) => {
  const ok = window.confirm(`¿Seguro que querés eliminar ${equipo.nombre}?`);
  if (!ok) return;

  try {
    await eliminarEquipo(equipo.id);
    await cargarEquipos();
  } catch (error) {
    window.alert(error.response?.data?.error || "No se pudo eliminar el equipo.");
  }
};
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <span class="page-eyebrow">Inventario</span>
        <h1>Equipos</h1>
      </div>
      <button v-if="!mostrarForm" class="btn btn-primary" @click="abrirFormularioCreacion">
        + Nuevo equipo
      </button>
    </div>

    <EquipoForm
      v-if="mostrarForm"
      class="form-wrap"
      :modo="equipoEditando ? 'editar' : 'crear'"
      :equipo-inicial="equipoEditando"
      @creado="onEquipoCreado"
      @cancelar="cerrarFormulario"
    />

    <p v-if="cargando" class="field-hint">Cargando equipos...</p>

    <div v-else-if="equipos.length" class="equipos-table-wrap">
      <table class="equipos-table">
        <thead>
          <tr>
            <th>Equipo</th>
            <th>N° de serie</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="equipo in equipos" :key="equipo.id">
            <td>{{ equipo.nombre }}</td>
            <td class="mono-cell">{{ equipo.numeroSerie }}</td>
            <td>{{ equipo.categoria?.nombre }}</td>
            <td>
              <span class="estado-badge" :class="estadoClase(equipo.estado)">
                {{ equipo.estado }}
              </span>
            </td>
            <td class="actions-cell">
              <button type="button" class="btn btn-ghost btn-sm" @click="abrirFormularioEdicion(equipo)">
                Editar
              </button>
              <button type="button" class="btn btn-ghost btn-sm danger" @click="eliminar(equipo)">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="field-hint">Todavía no hay equipos cargados.</p>
  </div>
</template>

<style scoped>
.form-wrap {
  margin-bottom: 28px;
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
