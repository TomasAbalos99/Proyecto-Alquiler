<script setup>
import { ref, onMounted } from "vue";
import { listarClientes, eliminarCliente } from "../services/clientes.service";
import ClienteForm from "../components/ClienteForm.vue";

const clientes = ref([]);
const cargando = ref(true);
const error = ref("");
const mostrarForm = ref(false);
const clienteEditando = ref(null);

const cargarClientes = async () => {
  cargando.value = true;
  error.value = "";
  try {
    clientes.value = await listarClientes();
  } catch (requestError) {
    error.value = requestError.response?.data?.error || "No se pudieron cargar los clientes.";
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarClientes);

const abrirFormularioCreacion = () => {
  clienteEditando.value = null;
  mostrarForm.value = true;
};

const abrirFormularioEdicion = (cliente) => {
  clienteEditando.value = cliente;
  mostrarForm.value = true;
};

const cerrarFormulario = () => {
  mostrarForm.value = false;
  clienteEditando.value = null;
};

const onClienteCreado = async () => {
  cerrarFormulario();
  await cargarClientes();
};

const eliminar = async (cliente) => {
  const ok = window.confirm(`¿Seguro que querés eliminar a ${cliente.nombre}?`);
  if (!ok) return;

  try {
    await eliminarCliente(cliente.id);
    await cargarClientes();
  } catch (requestError) {
    error.value = requestError.response?.data?.error || "No se pudo eliminar el cliente.";
  }
};
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <span class="page-eyebrow">Cartera</span>
        <h1>Clientes</h1>
      </div>
      <button v-if="!mostrarForm" class="btn btn-primary" @click="abrirFormularioCreacion">
        + Nuevo cliente
      </button>
    </div>

    <ClienteForm
      v-if="mostrarForm"
      :modo="clienteEditando ? 'editar' : 'crear'"
      :cliente-inicial="clienteEditando"
      @creado="onClienteCreado"
      @cancelar="cerrarFormulario"
    />

    <p v-if="cargando" class="field-hint">Cargando clientes...</p>
    <div v-else-if="error" class="form-alert">
      {{ error }}
      <button type="button" class="link-btn" @click="cargarClientes">Reintentar</button>
    </div>

    <div v-else-if="clientes.length" class="clientes-table-wrap">
      <table class="clientes-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Documento</th>
            <th>Teléfono</th>
            <th>Dirección</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in clientes" :key="cliente.id">
            <td>{{ cliente.nombre }}</td>
            <td class="mono-cell">{{ cliente.documento }}</td>
            <td>{{ cliente.telefono || "—" }}</td>
            <td>{{ cliente.direccion || "—" }}</td>
            <td class="actions-cell">
              <button type="button" class="btn btn-ghost btn-sm" @click="abrirFormularioEdicion(cliente)">
                Editar
              </button>
              <button type="button" class="btn btn-ghost btn-sm danger" @click="eliminar(cliente)">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="field-hint">Todavía no hay clientes cargados.</p>
  </div>
</template>

<style scoped>
.clientes-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
}

.clientes-table {
  width: 100%;
  min-width: 680px;
  border-collapse: collapse;
  background: var(--color-paper-raised);
}

.clientes-table th {
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

.clientes-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-line);
  font-size: 14px;
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

.clientes-table tr:last-child td {
  border-bottom: 0;
}

.form-alert {
  margin: 0;
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

.link-btn:hover {
  text-decoration: underline;
}
</style>
