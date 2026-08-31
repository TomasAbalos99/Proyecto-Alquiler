import { equipoService } from "../services/equipo.service.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

// Con asyncHandler ya no hace falta try/catch acá: cualquier error que
// tire el service (AppError con su statusCode, o uno inesperado) viaja
// solo hasta el errorHandler centralizado (ver src/server.js).

const crear = asyncHandler(async (req, res) => {
  const equipo = await equipoService.crearEquipo(req.body);
  res.status(201).json(equipo);
});

const listar = asyncHandler(async (req, res) => {
  const equipos = await equipoService.listarEquipos(req.query);
  res.json(equipos);
});

const obtener = asyncHandler(async (req, res) => {
  const equipo = await equipoService.obtenerEquipo(req.params.id);
  res.json(equipo);
});

const enviarAMantenimiento = asyncHandler(async (req, res) => {
  const equipo = await equipoService.cambiarEstadoMantenimiento(req.params.id);
  res.json(equipo);
});

const cambiarEstado = asyncHandler(async (req, res) => {
  const resultado = await equipoService.cambiarEstadoManual(
    req.params.id,
    req.body.estado
  );
  res.json(resultado);
});

const actualizar = asyncHandler(async (req, res) => {
  const equipo = await equipoService.actualizarEquipo(req.params.id, req.body);
  res.json(equipo);
});

const eliminar = asyncHandler(async (req, res) => {
  await equipoService.eliminarEquipo(req.params.id);
  res.status(204).send();
});

export const equipoController = {
  crear,
  listar,
  obtener,
  enviarAMantenimiento,
  cambiarEstado,
  actualizar,
  eliminar,
};
