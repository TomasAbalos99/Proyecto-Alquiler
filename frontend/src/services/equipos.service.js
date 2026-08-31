import { api } from "./api";

export const listarEquipos = (filtros = {}) => {
  return api.get("/equipos", { params: filtros }).then((res) => res.data);
};

export const crearEquipo = (datos) => {
  return api.post("/equipos", datos).then((res) => res.data);
};

export const actualizarEquipo = (id, datos) => {
  return api.patch(`/equipos/${id}`, datos).then((res) => res.data);
};

export const eliminarEquipo = (id) => {
  return api.delete(`/equipos/${id}`).then((res) => res.data);
};

export const obtenerEquipo = (id) => {
  return api.get(`/equipos/${id}`).then((res) => res.data);
};
