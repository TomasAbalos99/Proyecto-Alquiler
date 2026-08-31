import { equipoRepository } from "../repositories/equipo.repository.js";
import { categoriaRepository } from "../repositories/categoria.repository.js";
import { AppError } from "../middlewares/AppError.js";

const crearEquipo = async (datos) => {
  const existente = await equipoRepository.buscarPorNumeroSerie(datos.numeroSerie);
  if (existente) {
    throw new AppError(`Ya existe un equipo con el número de serie "${datos.numeroSerie}"`, 409);
  }

  const categoria = await categoriaRepository.buscarPorId(datos.categoriaId);
  if (!categoria) {
    throw new AppError("La categoría indicada no existe", 404);
  }

  return equipoRepository.crear(datos);
};

const listarEquipos = async (filtros) => {
  return equipoRepository.listar(filtros);
};

const obtenerEquipo = async (id) => {
  const equipo = await equipoRepository.buscarPorId(id);
  if (!equipo) throw new AppError("Equipo no encontrado", 404);
  return equipo;
};

// HU-04: enviar a mantenimiento / dar de baja (acción manual del propietario)
const cambiarEstadoMantenimiento = async (id) => {
  const equipo = await equipoRepository.buscarPorId(id);
  if (!equipo) throw new AppError("Equipo no encontrado", 404);

  if (equipo.estado === "ALQUILADO") {
    throw new AppError(
      "No se puede enviar a mantenimiento un equipo que está actualmente alquilado. Primero registrá la devolución.",
      409
    );
  }

  return equipoRepository.actualizarEstado(id, "MANTENIMIENTO");
};

// HU-04b: cambio manual de estado con advertencia si genera inconsistencia.
// Devuelve una advertencia en vez de bloquear, para que el propietario decida.
const cambiarEstadoManual = async (id, nuevoEstado) => {
  const equipo = await equipoRepository.buscarPorId(id);
  if (!equipo) throw new AppError("Equipo no encontrado", 404);

  const alquilerActivo = equipo.alquileres?.find((a) => a.estado === "ACTIVO");
  if (alquilerActivo && ["DISPONIBLE", "MANTENIMIENTO"].includes(nuevoEstado)) {
    throw new AppError(
      `No se puede cambiar el equipo a ${nuevoEstado} porque tiene un alquiler activo (#${alquilerActivo.id}). Primero registrá la devolución.`,
      409
    );
  }

  const actualizado = await equipoRepository.actualizarEstado(id, nuevoEstado);
  return { equipo: actualizado, advertencia: null };
};

const actualizarEquipo = async (id, datos) => {
  const equipo = await equipoRepository.buscarPorId(id);
  if (!equipo) throw new AppError("Equipo no encontrado", 404);

  const payload = { ...datos };
  if (payload.numeroSerie) {
    payload.numeroSerie = String(payload.numeroSerie).trim();
    const existente = await equipoRepository.buscarPorNumeroSerie(payload.numeroSerie);
    if (existente && existente.id !== Number(id)) {
      throw new AppError(`Ya existe un equipo con el número de serie "${payload.numeroSerie}"`, 409);
    }
  }

  if (payload.categoriaId) {
    const categoria = await categoriaRepository.buscarPorId(Number(payload.categoriaId));
    if (!categoria) throw new AppError("La categoría indicada no existe", 404);
  }

  if (payload.estado && payload.estado !== equipo.estado) {
    const alquilerActivo = equipo.alquileres?.find((a) => a.estado === "ACTIVO");
    if (alquilerActivo && ["DISPONIBLE", "MANTENIMIENTO"].includes(payload.estado)) {
      throw new AppError(
        `No se puede cambiar el equipo a ${payload.estado} porque tiene un alquiler activo (#${alquilerActivo.id}). Primero registrá la devolución.`,
        409
      );
    }
  }

  return equipoRepository.actualizar(id, payload);
};

const eliminarEquipo = async (id) => {
  const equipo = await equipoRepository.buscarPorId(id);
  if (!equipo) throw new AppError("Equipo no encontrado", 404);

  const alquilerActivo = equipo.alquileres?.some((a) => a.estado === "ACTIVO");
  if (alquilerActivo) {
    throw new AppError("No se puede eliminar un equipo con un alquiler activo", 409);
  }

  return equipoRepository.eliminar(id);
};

export const equipoService = {
  crearEquipo,
  listarEquipos,
  obtenerEquipo,
  cambiarEstadoMantenimiento,
  cambiarEstadoManual,
  actualizarEquipo,
  eliminarEquipo,
};
