import { prisma } from "../config/prisma.js";
import { alquilerRepository } from "../repositories/alquiler.repository.js";
import { vencimientoNotifier } from "../observers/vencimientoNotifier.js";
import { AppError } from "../middlewares/AppError.js";

const crearAlquiler = async (datos) => {
  return alquilerRepository.crearConTransaccion(datos);
};

const marcarDevuelto = async (id) => {
  return alquilerRepository.marcarDevuelto(id);
};

const listarAlquileres = async (filtros) => {
  return alquilerRepository.listar(filtros);
};

const actualizarAlquiler = async (id, datos) => {
  const existente = await prisma.alquiler.findUnique({ where: { id } });
  if (!existente) throw new AppError("Alquiler no encontrado", 404);

  if (datos.fechaVencimiento && new Date(datos.fechaVencimiento) <= new Date()) {
    throw new AppError("La fecha de vencimiento debe ser futura", 400);
  }

  return alquilerRepository.actualizar(id, datos);
};

const eliminarAlquiler = async (id) => {
  const alquiler = await prisma.alquiler.findUnique({ where: { id } });
  if (!alquiler) throw new AppError("Alquiler no encontrado", 404);
  if (alquiler.estado === "ACTIVO") {
    throw new AppError("No se puede eliminar un alquiler activo; primero registrá la devolución", 409);
  }

  return alquilerRepository.eliminar(id);
};

// HU-10: se llama cada vez que el propietario entra al panel de vencimientos.
// Detecta alquileres vencidos, actualiza su estado y dispara el Observer.
const revisarVencimientos = async () => {
  const alquileres = await alquilerRepository.listarProximosAVencer(3);
  const ahora = new Date();

  for (const alquiler of alquileres) {
    const yaVencido = alquiler.fechaVencimiento < ahora;

    if (yaVencido && alquiler.estado !== "VENCIDO") {
      await alquilerRepository.actualizarEstado(alquiler.id, "VENCIDO");
      alquiler.estado = "VENCIDO";
    }

    vencimientoNotifier.notificar(alquiler);
  }

  return alquileres;
};

export const alquilerService = {
  crearAlquiler,
  marcarDevuelto,
  listarAlquileres,
  actualizarAlquiler,
  eliminarAlquiler,
  revisarVencimientos,
};
