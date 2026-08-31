<script setup>
import { computed, reactive, ref, watch } from "vue";
import { crearCliente, actualizarCliente } from "../services/clientes.service";

const props = defineProps({
  modo: { type: String, default: "crear" },
  clienteInicial: { type: Object, default: null },
});

const emit = defineEmits(["creado", "cancelar"]);

const enviando = ref(false);
const errores = reactive({});
const errorGeneral = ref("");
const form = reactive({
  nombre: "",
  documento: "",
  telefono: "",
  direccion: "",
});

const normalizarDocumento = (documento = "") => documento.trim().replace(/[ -]/g, "");

const formatearDocumento = (documento = "") => {
  const limpio = normalizarDocumento(documento);
  if (!limpio) return "";

  if (limpio.length === 11) {
    return `${limpio.slice(0, 2)}-${limpio.slice(2, 10)}-${limpio.slice(10)}`;
  }

  if (limpio.length >= 7 && limpio.length <= 8) {
    return limpio.replace(/(\d{1,3})(\d{3})(\d{3})/, "$1.$2.$3").replace(/\.$/, "");
  }

  return limpio;
};

const iniciales = computed(() => {
  const nombre = form.nombre.trim();
  if (!nombre) return "??";
  const partes = nombre.split(/\s+/);
  const primera = partes[0]?.[0] || "";
  const segunda = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primera + segunda).toUpperCase();
});

const validar = () => {
  Object.keys(errores).forEach((clave) => delete errores[clave]);

  if (!form.nombre.trim()) errores.nombre = "El nombre es obligatorio";
  else if (!/^[\p{L}]+(?:[ .'-][\p{L}]+)*$/u.test(form.nombre.trim())) {
    errores.nombre = "El nombre solo puede contener letras";
  }

  if (!form.documento.trim()) {
    errores.documento = "El documento es obligatorio";
  } else {
    const normalizado = normalizarDocumento(form.documento);
    if (!/^\d{7,8}$/.test(normalizado) && !/^\d{11}$/.test(normalizado)) {
      errores.documento = "Usá entre 7 y 8 dígitos (DNI) o 11 dígitos (CUIT)";
    }
  }

  return Object.keys(errores).length === 0;
};

const cargarDatosIniciales = () => {
  if (!props.clienteInicial) {
    form.nombre = "";
    form.documento = "";
    form.telefono = "";
    form.direccion = "";
    return;
  }

  form.nombre = props.clienteInicial.nombre || "";
  form.documento = props.clienteInicial.documento || "";
  form.telefono = props.clienteInicial.telefono || "";
  form.direccion = props.clienteInicial.direccion || "";
};

watch(
  () => props.clienteInicial,
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
      nombre: form.nombre.trim(),
      documento: normalizarDocumento(form.documento),
      telefono: form.telefono.trim() || undefined,
      direccion: form.direccion.trim() || undefined,
    };

    const cliente =
      props.modo === "editar"
        ? await actualizarCliente(props.clienteInicial.id, payload)
        : await crearCliente(payload);

    emit("creado", cliente);
  } catch (error) {
    errorGeneral.value =
      error.response?.data?.error ||
      (props.modo === "editar"
        ? "No se pudieron guardar los cambios. Probá de nuevo."
        : "No se pudo dar de alta el cliente. Probá de nuevo.");
  } finally {
    enviando.value = false;
  }
};
</script>

<template>
  <form class="cliente-form" @submit.prevent="onSubmit">
    <div class="cliente-form-body">
      <p v-if="errorGeneral" class="form-alert">{{ errorGeneral }}</p>

      <div class="field">
        <label for="cliente-nombre">Nombre y apellido</label>
        <input
          id="cliente-nombre"
          v-model="form.nombre"
          type="text"
          placeholder="Ej: María Gómez"
          autocomplete="off"
        />
        <span v-if="errores.nombre" class="field-error">{{ errores.nombre }}</span>
      </div>

      <div class="field-row">
        <div class="field mono">
          <label for="cliente-documento">Documento</label>
          <input
            id="cliente-documento"
            v-model="form.documento"
            type="text"
            placeholder="DNI / CUIT"
            autocomplete="off"
          />
          <span v-if="errores.documento" class="field-error">{{ errores.documento }}</span>
        </div>

        <div class="field">
          <label for="cliente-telefono">Teléfono <span class="field-hint">(opcional)</span></label>
          <input
            id="cliente-telefono"
            v-model="form.telefono"
            type="text"
            placeholder="Ej: 11 5555-5555"
            autocomplete="off"
          />
        </div>
      </div>

      <div class="field">
        <label for="cliente-direccion">Dirección <span class="field-hint">(opcional)</span></label>
        <input
          id="cliente-direccion"
          v-model="form.direccion"
          type="text"
          placeholder="Calle, número, localidad"
          autocomplete="off"
        />
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-ghost" @click="emit('cancelar')">Cancelar</button>
        <button type="submit" class="btn btn-primary" :disabled="enviando">
          {{ enviando ? "Guardando..." : props.modo === "editar" ? "Guardar cambios" : "Dar de alta" }}
        </button>
      </div>
    </div>

    <aside class="cliente-tag" aria-label="Vista previa de ficha">
      <div class="cliente-tag-inner">
        <span class="cliente-tag-avatar">{{ iniciales }}</span>
        <span class="cliente-tag-label">Cliente</span>
        <strong class="cliente-tag-doc">{{ formatearDocumento(form.documento) || "— — —" }}</strong>
      </div>
    </aside>
  </form>
</template>

<style scoped>
.cliente-form {
  display: grid;
  grid-template-columns: 1fr 168px;
  overflow: hidden;
  background: var(--color-paper-raised);
  border: 1px solid var(--color-line);
  border-top: 4px solid var(--color-red);
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
}

.cliente-form-body {
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

.cliente-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 14px;
  border-left: 1px dashed var(--color-line-strong);
  background: var(--color-paper);
}

.cliente-tag-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.cliente-tag-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-red-tint);
  color: var(--color-red);
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
}

.cliente-tag-label {
  color: var(--color-ink-soft);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.cliente-tag-doc {
  color: var(--color-ink);
  font-family: var(--font-mono);
  font-size: 15px;
  line-height: 1.3;
  word-break: break-word;
}

@media (max-width: 640px) {
  .cliente-form,
  .field-row {
    grid-template-columns: 1fr;
  }

  .cliente-form-body {
    padding: 20px;
  }

  .cliente-tag {
    border-top: 1px dashed var(--color-line-strong);
    border-left: 0;
  }
}
</style>