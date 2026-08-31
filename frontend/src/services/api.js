import axios from "axios";

// Cliente HTTP centralizado. Todos los servicios del frontend
// (equipos, clientes, alquileres) usan esta instancia para
// hablar con la API de Express.
export const api = axios.create({
  baseURL: "/api",
});
