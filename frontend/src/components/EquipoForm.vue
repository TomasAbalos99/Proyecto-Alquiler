<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { crearEquipo, actualizarEquipo } from "../services/equipos.service";
import { crearCategoria, listarCategorias } from "../services/categorias.service";

const props = defineProps({
  modo: { type: String, default: "crear" },
  equipoInicial: { type: Object, default: null },
});

const emit = defineEmits(["creado", "cancelar"]);

const categorias = ref([]);
const cargandoCategorias = ref(true);
const errorCategorias = ref("");
const mostrarNuevaCategoria = ref(false);
const nombreNuevaCategoria = ref("");
const creandoCategoria = ref(false);
const enviando = ref(false);
const errores = reactive({});
const errorGeneral = ref("");

const form = reactive({
  nombre: "",
  numeroSerie: "",
  categoriaId: "",
  descripcion: "",
  fotoUrl: "",
});

const tagSerie = computed(() => form.numeroSerie.trim() || "— — —");

const cargarCategorias = async () => {
  cargandoCategorias.value = true;
  errorCategorias.value = "";
  try {
    categorias.value = await listarCategorias();
  } catch (error) {
    errorCategorias.value = error.response?.data?.error || "No se pudieron cargar las categorías.";
  } finally {
    cargandoCategorias.value = false;
  }
};

onMounted(cargarCategorias);

const validar = () => {
  Object.keys(errores).forEach((clave) => delete errores[clave]);

  if (!form.nombre.trim()) errores.nombre = "El nombre es obligatorio";
  if (!form.numeroSerie.trim()) errores.numeroSerie = "El número de serie es obligatorio";
  if (!form.categoriaId) errores.categoriaId = "Elegí una categoría";

  if (form.fotoUrl.trim()) {
    try {
      const url = new URL(form.fotoUrl.trim());
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      errores.fotoUrl = "Tiene que ser una URL válida (http:// o https://)";
    }
  }

  return Object.keys(errores).length === 0;
};

const cargarDatosIniciales = () => {
  if (!props.equipoInicial) {
    form.nombre = "";
    form.numeroSerie = "";
    form.categoriaId = "";
    form.descripcion = "";
    form.fotoUrl = "";
    return;
  }

  form.nombre = props.equipoInicial.nombre || "";
  form.numeroSerie = props.equipoInicial.numeroSerie || "";
  form.categoriaId = props.equipoInicial.categoriaId ? String(props.equipoInicial.categoriaId) : "";
  form.descripcion = props.equipoInicial.descripcion || "";
  form.fotoUrl = props.equipoInicial.fotoUrl || "";
};

watch(
  () => props.equipoInicial,
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
      numeroSerie: form.numeroSerie.trim(),
      categoriaId: Number(form.categoriaId),
      descripcion: form.descripcion.trim() || undefined,
      fotoUrl: form.fotoUrl.trim() || undefined,
    };

    const equipo =
      props.modo === "editar"
        ? await actualizarEquipo(props.equipoInicial.id, payload)
        : await crearEquipo(payload);

    emit("creado", equipo);
  } catch (error) {
    errorGeneral.value =
      error.response?.data?.error ||
      (props.modo === "editar"
        ? "No se pudieron guardar los cambios. Probá de nuevo."
        : "No se pudo dar de alta el equipo. Probá de nuevo.");
  } finally {
    enviando.value = false;
  }
};

const onCrearCategoria = async () => {
  const nombre = nombreNuevaCategoria.value.trim();
  if (!nombre) return;

  creandoCategoria.value = true;
  errorGeneral.value = "";
  try {
    const categoria = await crearCategoria({ nombre });
    categorias.value = [...categorias.value, categoria].sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
    form.categoriaId = String(categoria.id);
    nombreNuevaCategoria.value = "";
    mostrarNuevaCategoria.value = false;
  } catch (error) {
    errorGeneral.value = error.response?.data?.error || "No se pudo crear la categoría.";
  } finally {
    creandoCategoria.value = false;
  }
};
</script>

<template>
  <form class="equipo-form" @submit.prevent="onSubmit">
    <div class="equipo-form-body">
      <p v-if="errorGeneral" class="form-alert">{{ errorGeneral }}</p>

      <div v-if="errorCategorias" class="form-alert">
        {{ errorCategorias }}
        <button type="button" class="link-btn" @click="cargarCategorias">Reintentar</button>
      </div>

      <div class="field">
        <label for="equipo-nombre">Nombre del equipo</label>
        <input
          id="equipo-nombre"
          v-model="form.nombre"
          type="text"
          placeholder="Ej: Monitor multiparamétrico"
          autocomplete="off"
        />
        <span v-if="errores.nombre" class="field-error">{{ errores.nombre }}</span>
      </div>

      <div class="field-row">
        <div class="field mono">
          <label for="equipo-serie">Número de serie</label>
          <input
            id="equipo-serie"
            v-model="form.numeroSerie"
            type="text"
            placeholder="SN-0000"
            autocomplete="off"
          />
          <span v-if="errores.numeroSerie" class="field-error">{{ errores.numeroSerie }}</span>
        </div>

        <div class="field">
          <label for="equipo-categoria">Categoría</label>
          <select
            id="equipo-categoria"
            v-model="form.categoriaId"
            :disabled="cargandoCategorias || !categorias.length"
          >
            <option value="" disabled>
              {{ cargandoCategorias ? "Cargando..." : "Elegir categoría" }}
            </option>
            <option v-for="categoria in categorias" :key="categoria.id" :value="String(categoria.id)">
              {{ categoria.nombre }}
            </option>
          </select>
          <span v-if="!cargandoCategorias && !categorias.length" class="field-hint">
            No hay categorías cargadas.
          </span>
          <span v-if="errores.categoriaId" class="field-error">{{ errores.categoriaId }}</span>
          <button
            type="button"
            class="link-btn"
            @click="mostrarNuevaCategoria = !mostrarNuevaCategoria"
          >
            {{ mostrarNuevaCategoria ? "Cancelar" : "+ Nueva categoría" }}
          </button>
          <div v-if="mostrarNuevaCategoria" class="field-inline">
            <input
              v-model="nombreNuevaCategoria"
              type="text"
              placeholder="Nombre de la categoría"
              @keydown.enter.prevent="onCrearCategoria"
            />
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              :disabled="creandoCategoria || !nombreNuevaCategoria.trim()"
              @click="onCrearCategoria"
            >
              Crear
            </button>
          </div>
        </div>
      </div>

      <div class="field">
        <label for="equipo-descripcion">Descripción <span class="field-hint">(opcional)</span></label>
        <textarea
          id="equipo-descripcion"
          v-model="form.descripcion"
          placeholder="Marca, modelo, accesorios incluidos..."
        ></textarea>
      </div>

      <div class="field">
        <label for="equipo-foto">Foto <span class="field-hint">(URL, opcional)</span></label>
        <input
          id="equipo-foto"
          v-model="form.fotoUrl"
          type="url"
          placeholder="https://..."
          autocomplete="off"
        />
        <span v-if="errores.fotoUrl" class="field-error">{{ errores.fotoUrl }}</span>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-ghost" @click="emit('cancelar')">Cancelar</button>
        <button type="submit" class="btn btn-primary" :disabled="enviando">
          {{ enviando ? "Guardando..." : props.modo === "editar" ? "Guardar cambios" : "Dar de alta" }}
        </button>
      </div>
    </div>

    <aside class="equipo-tag" aria-label="Vista previa de etiqueta">
      <div class="equipo-tag-inner">
        <span class="equipo-tag-label">Equipo</span>
        <strong class="equipo-tag-serie">{{ tagSerie }}</strong>
        <span class="estado-badge disponible">Disponible</span>
      </div>
    </aside>
  </form>
</template>

<style scoped>
.equipo-form {
  display: grid;
  grid-template-columns: 1fr 168px;
  overflow: hidden;
  background: var(--color-paper-raised);
  border: 1px solid var(--color-line);
  border-top: 4px solid var(--color-red);
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
}

.equipo-form-body {
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

.field-inline {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.field-inline input {
  flex: 1;
  min-width: 0;
  padding: 7px 9px;
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius);
  font-size: 13px;
}

.link-btn {
  align-self: flex-start;
  margin-top: 2px;
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

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
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

.equipo-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 14px;
  border-left: 1px dashed var(--color-line-strong);
  background: var(--color-paper);
}

.equipo-tag-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.equipo-tag-label {
  color: var(--color-ink-soft);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.equipo-tag-serie {
  color: var(--color-ink);
  font-family: var(--font-mono);
  font-size: 15px;
  line-height: 1.3;
  word-break: break-word;
}

@media (max-width: 640px) {
  .equipo-form,
  .field-row {
    grid-template-columns: 1fr;
  }

  .equipo-tag {
    border-top: 1px dashed var(--color-line-strong);
    border-left: 0;
  }
}
</style>