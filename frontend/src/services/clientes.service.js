import { api } from "./api";

export const listarClientes = (filtros = {}) => {
  return api.get("/clientes", { params: filtros }).then((res) => res.data);
};

export const crearCliente = (datos) => {
  return api.post("/clientes", datos).then((res) => res.data);
};

export const actualizarCliente = (id, datos) => {
  return api.patch(`/clientes/${id}`, datos).then((res) => res.data);
};

export const eliminarCliente = (id) => {
  return api.delete(`/clientes/${id}`).then((res) => res.data);
};

export const obtenerCliente = (id) => {
  return api.get(`/clientes/${id}`).then((res) => res.data);
};