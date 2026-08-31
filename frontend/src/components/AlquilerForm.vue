<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { listarClientes } from "../services/clientes.service";
import { crearAlquiler, actualizarAlquiler } from "../services/alquileres.service";
import { listarEquipos } from "../services/equipos.service";

const props = defineProps({
  modo: { type: String, default: "crear" },
  alquilerInicial: { type: Object, default: null },
});

const emit = defineEmits(["creado", "cancelar"]);

const equipos = ref([]);
const clientes = ref([]);
const cargandoOpciones = ref(true);
const errorOpciones = ref("");
const enviando = ref(false);
const errores = reactive({});
const errorGeneral = ref("");
const form = reactive({
  equipoId: "",
  clienteId: "",
  fechaVencimiento: "",
  monto: "",
});

const cargarOpciones = async () => {
  cargandoOpciones.value = true;
  errorOpciones.value = "";
  try {
    [equipos.value, clientes.value] = await Promise.all([
      listarEquipos({ estado: "DISPONIBLE" }),
      listarClientes(),
    ]);
  } catch (error) {
    errorOpciones.value = error.response?.data?.error || "No se pudieron cargar equipos y clientes.";
  } finally {
    cargandoOpciones.value = false;
  }
};

onMounted(cargarOpciones);

const validar = () => {
  Object.keys(errores).forEach((clave) => delete errores[clave]);

  if (!form.equipoId) errores.equipoId = "Elegí un equipo";
  if (!form.clienteId) errores.clienteId = "Elegí un cliente";
  if (!form.fechaVencimiento) {
    errores.fechaVencimiento = "La fecha de vencimiento es obligatoria";
  } else if (new Date(form.fechaVencimiento) <= new Date()) {
    errores.fechaVencimiento = "La fecha debe ser futura";
  }
  if (!form.monto || Number(form.monto) <= 0) errores.monto = "El monto debe ser mayor a cero";

  return Object.keys(errores).length === 0;
};

const formatDateTimeLocal = (value) => {
  if (!value) return "";
  const fecha = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
};

const cargarDatosIniciales = () => {
  if (!props.alquilerInicial) {
    form.equipoId = "";
    form.clienteId = "";
    form.fechaVencimiento = "";
    form.monto = "";
    return;
  }

  form.equipoId = props.alquilerInicial.equipoId ? String(props.alquilerInicial.equipoId) : "";
  form.clienteId = props.alquilerInicial.clienteId ? String(props.alquilerInicial.clienteId) : "";
  form.fechaVencimiento = formatDateTimeLocal(props.alquilerInicial.fechaVencimiento);
  form.monto = props.alquilerInicial.monto ? Number(props.alquilerInicial.monto).toString() : "";
};

watch(
  () => props.alquilerInicial,
  () => {
    cargarDatosIniciales();
  },
  { immediate: true }
);

const onSubmit = async () => {
  errorGeneral.value = "";
  if (!validar()) return;

  enviando.value = true;
  try {
    const payload = {
      equipoId: Number(form.equipoId),
      clienteId: Number(form.clienteId),
      fechaVencimiento: new Date(form.fechaVencimiento).toISOString(),
      monto: Number(form.monto),
    };

    const alquiler =
      props.modo === "editar"
        ? await actualizarAlquiler(props.alquilerInicial.id, payload)
        : await crearAlquiler(payload);

    emit("creado", alquiler);
  } catch (error) {
    errorGeneral.value =
      error.response?.data?.error ||
      (props.modo === "editar"
        ? "No se pudieron guardar los cambios. Probá de nuevo."
        : "No se pudo crear el alquiler. Probá de nuevo.");
    await cargarOpciones();
  } finally {
    enviando.value = false;
  }
};
</script>

<template>
  <form class="alquiler-form" @submit.prevent="onSubmit">
    <div class="alquiler-form-body">
      <p v-if="errorGeneral" class="form-alert">{{ errorGeneral }}</p>
      <div v-if="errorOpciones" class="form-alert">
        {{ errorOpciones }}
        <button type="button" class="link-btn" @click="cargarOpciones">Reintentar</button>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="alquiler-equipo">Equipo disponible</label>
          <select id="alquiler-equipo" v-model="form.equipoId" :disabled="cargandoOpciones">
            <option value="" disabled>
              {{ cargandoOpciones ? "Cargando..." : "Elegir equipo" }}
            </option>
            <option v-for="equipo in equipos" :key="equipo.id" :value="String(equipo.id)">
              {{ equipo.nombre }} · {{ equipo.numeroSerie }}
            </option>
          </select>
          <span v-if="!cargandoOpciones && !equipos.length" class="field-hint">
            No hay equipos disponibles.
          </span>
          <span v-if="errores.equipoId" class="field-error">{{ errores.equipoId }}</span>
        </div>

        <div class="field">
          <label for="alquiler-cliente">Cliente</label>
          <select id="alquiler-cliente" v-model="form.clienteId" :disabled="cargandoOpciones">
            <option value="" disabled>
              {{ cargandoOpciones ? "Cargando..." : "Elegir cliente" }}
            </option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="String(cliente.id)">
              {{ cliente.nombre }} · {{ cliente.documento }}
            </option>
          </select>
          <span v-if="!cargandoOpciones && !clientes.length" class="field-hint">
            Primero cargá un cliente.
          </span>
          <span v-if="errores.clienteId" class="field-error">{{ errores.clienteId }}</span>
        </div>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="alquiler-vencimiento">Fecha de vencimiento</label>
          <input id="alquiler-vencimiento" v-model="form.fechaVencimiento" type="datetime-local" />
          <span v-if="errores.fechaVencimiento" class="field-error">
            {{ errores.fechaVencimiento }}
          </span>
        </div>

        <div class="field">
          <label for="alquiler-monto">Monto</label>
          <input
            id="alquiler-monto"
            v-model="form.monto"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Ej: 25000"
            inputmode="decimal"
          />
          <span v-if="errores.monto" class="field-error">{{ errores.monto }}</span>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-ghost" @click="emit('cancelar')">Cancelar</button>
        <button type="submit" class="btn btn-primary" :disabled="enviando || cargandoOpciones">
          {{ enviando ? "Guardando..." : props.modo === "editar" ? "Guardar cambios" : "Crear alquiler" }}
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.alquiler-form {
  margin-bottom: 28px;
  overflow: hidden;
  background: var(--color-paper-raised);
  border: 1px solid var(--color-line);
  border-top: 4px solid var(--color-red);
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
}

.alquiler-form-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-alert {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--radius);
  background: var(--color-red-tint);
  color: var(--color-red-dark);
  font-size: 13px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.link-btn {
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-red);
  cursor: pointer;
  font-size: 12px;
}

.link-btn:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .field-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .alquiler-form-body {
    padding: 20px;
  }
}
</style>