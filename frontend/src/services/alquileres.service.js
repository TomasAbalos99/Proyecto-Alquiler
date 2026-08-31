import { api } from "./api";

export const listarAlquileres = (filtros = {}) => {
  return api.get("/alquileres", { params: filtros }).then((res) => res.data);
};

export const crearAlquiler = (datos) => {
  return api.post("/alquileres", datos).then((res) => res.data);
};

export const actualizarAlquiler = (id, datos) => {
  return api.patch(`/alquileres/${id}`, datos).then((res) => res.data);
};

export const eliminarAlquiler = (id) => {
  return api.delete(`/alquileres/${id}`).then((res) => res.data);
};

export const marcarAlquilerDevuelto = (id) => {
  return api.patch(`/alquileres/${id}/devolucion`).then((res) => res.data);
};