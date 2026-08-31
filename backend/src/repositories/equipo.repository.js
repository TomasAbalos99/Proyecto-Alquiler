import { prisma } from "../config/prisma.js";

const crear = async (datos) => {
  return prisma.equipo.create({
    data: datos,
    include: { categoria: true },
  });
};

const listar = async (filtros = {}) => {
  const where = {};

  if (filtros.categoriaId) where.categoriaId = Number(filtros.categoriaId);
  if (filtros.numeroSerie) {
    where.numeroSerie = { contains: filtros.numeroSerie, mode: "insensitive" };
  }
  if (filtros.estado) where.estado = filtros.estado;

  return prisma.equipo.findMany({
    where,
    include: { categoria: true },
    orderBy: { creadoEn: "desc" },
  });
};

const buscarPorId = async (id) => {
  return prisma.equipo.findUnique({
    where: { id },
    include: { categoria: true, alquileres: { include: { cliente: true } } },
  });
};

const buscarPorNumeroSerie = async (numeroSerie) => {
  return prisma.equipo.findUnique({ where: { numeroSerie } });
};

const actualizarEstado = async (id, estado) => {
  return prisma.equipo.update({ where: { id }, data: { estado } });
};

const actualizar = async (id, datos) => {
  return prisma.equipo.update({ where: { id }, data: datos, include: { categoria: true } });
};

const eliminar = async (id) => {
  return prisma.equipo.delete({ where: { id }, include: { categoria: true } });
};

export const equipoRepository = {
  crear,
  listar,
  buscarPorId,
  buscarPorNumeroSerie,
  actualizarEstado,
  actualizar,
  eliminar,
};
