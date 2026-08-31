import { alquilerService } from "../services/alquiler.service.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

// Con asyncHandler ya no hace falta try/catch acá: cualquier error que
// tire el service (AppError con su statusCode, o uno inesperado) viaja
// solo hasta el errorHandler centralizado (ver src/server.js).

const crear = asyncHandler(async (req, res) => {
  const alquiler = await alquilerService.crearAlquiler(req.body);
  res.status(201).json(alquiler);
});

const marcarDevuelto = asyncHandler(async (req, res) => {
  const alquiler = await alquilerService.marcarDevuelto(req.params.id);
  res.json(alquiler);
});

const listar = asyncHandler(async (req, res) => {
  const alquileres = await alquilerService.listarAlquileres(req.query);
  res.json(alquileres);
});

const actualizar = asyncHandler(async (req, res) => {
  const alquiler = await alquilerService.actualizarAlquiler(req.params.id, req.body);
  res.json(alquiler);
});

const eliminar = asyncHandler(async (req, res) => {
  await alquilerService.eliminarAlquiler(req.params.id);
  res.status(204).send();
});

// HU-10: panel de vencimientos
const vencimientos = asyncHandler(async (req, res) => {
  const alquileres = await alquilerService.revisarVencimientos();
  res.json(alquileres);
});

export const alquilerController = {
  crear,
  marcarDevuelto,
  listar,
  actualizar,
  eliminar,
  vencimientos,
};
