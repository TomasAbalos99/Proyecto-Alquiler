import { api } from "./api";

export const listarCategorias = () => {
  return api.get("/categorias").then((res) => res.data);
};

export const crearCategoria = (datos) => {
  return api.post("/categorias", datos).then((res) => res.data);
};