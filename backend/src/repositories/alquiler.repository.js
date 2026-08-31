import { prisma } from "../config/prisma.js";
import { AppError } from "../middlewares/AppError.js";

// crearConTransaccion: crea el alquiler y marca el equipo como ALQUILADO
// dentro de una misma transacción de base de datos.
//
// La exclusividad NO se logra con el find+update simple: bajo el nivel de
// aislamiento por defecto de Postgres (READ COMMITTED), dos transacciones
// concurrentes podrían leer el equipo como DISPONIBLE antes de que ninguna
// haga commit. Por eso el "cierre" real es el updateMany condicional de
// abajo: Postgres, al ejecutar un UPDATE, bloquea la fila si otra
// transacción la está tocando, espera, y vuelve a evaluar el WHERE con los
// datos ya actualizados. Si la primera transacción ya puso ALQUILADO, la
// segunda encuentra count: 0 y falla correctamente en vez de pisarla.
const crearConTransaccion = async (datos) => {
  return prisma.$transaction(async (tx) => {
    const equipo = await tx.equipo.findUnique({ where: { id: datos.equipoId } });
    if (!equipo) throw new AppError("El equipo indicado no existe", 404);

    const resultado = await tx.equipo.updateMany({
      where: { id: datos.equipoId, estado: "DISPONIBLE" },
      data: { estado: "ALQUILADO" },
    });

    if (resultado.count === 0) {
      throw new AppError("El equipo no está disponible para alquilar", 409);
    }

    return tx.alquiler.create({
      data: datos,
      include: { equipo: true, cliente: true },
    });
  });
};

const marcarDevuelto = async (id) => {
  return prisma.$transaction(async (tx) => {
    const alquiler = await tx.alquiler.findUnique({ where: { id } });
    if (!alquiler) throw new AppError("Alquiler no encontrado", 404);
    if (alquiler.estado === "FINALIZADO") {
      throw new AppError("El alquiler ya fue devuelto", 409);
    }

    const alquilerActualizado = await tx.alquiler.update({
      where: { id },
      data: { estado: "FINALIZADO", fechaDevolucionReal: new Date() },
    });

    await tx.equipo.update({
      where: { id: alquiler.equipoId },
      data: { estado: "DISPONIBLE" },
    });

    return alquilerActualizado;
  });
};

const listar = async (filtros = {}) => {
  const where = {};
  if (filtros.estado) where.estado = filtros.estado;
  if (filtros.clienteId) where.clienteId = Number(filtros.clienteId);
  if (filtros.numeroSerie) {
    where.equipo = { numeroSerie: { contains: filtros.numeroSerie, mode: "insensitive" } };
  }

  return prisma.alquiler.findMany({
    where,
    include: { equipo: true, cliente: true },
    orderBy: { fechaVencimiento: "asc" },
  });
};

// Alquileres vencidos o próximos a vencer (HU-10: panel de vencimientos)
const listarProximosAVencer = async (diasAntelacion = 3) => {
  const limite = new Date();
  limite.setDate(limite.getDate() + diasAntelacion);

  return prisma.alquiler.findMany({
    where: {
      estado: { in: ["ACTIVO", "VENCIDO"] },
      fechaVencimiento: { lte: limite },
    },
    include: { equipo: true, cliente: true },
    orderBy: { fechaVencimiento: "asc" },
  });
};

const actualizarEstado = async (id, estado) => {
  return prisma.alquiler.update({ where: { id }, data: { estado } });
};

const actualizar = async (id, datos) => {
  return prisma.alquiler.update({
    where: { id },
    data: datos,
    include: { equipo: true, cliente: true },
  });
};

const eliminar = async (id) => {
  return prisma.alquiler.delete({
    where: { id },
    include: { equipo: true, cliente: true },
  });
};

export const alquilerRepository = {
  crearConTransaccion,
  marcarDevuelto,
  listar,
  listarProximosAVencer,
  actualizarEstado,
  actualizar,
  eliminar,
};
