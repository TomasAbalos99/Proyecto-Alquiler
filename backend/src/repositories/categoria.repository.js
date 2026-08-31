import { prisma } from "../config/prisma.js";

// Capa de acceso a datos: único lugar donde se habla con Prisma
// para todo lo referido a Categoria.

const crear = async (datos) => {
  return prisma.categoria.create({ data: datos });
};

const listar = async () => {
  return prisma.categoria.findMany({ orderBy: { nombre: "asc" } });
};

const buscarPorId = async (id) => {
  return prisma.categoria.findUnique({ where: { id } });
};

const buscarPorNombre = async (nombre) => {
  return prisma.categoria.findUnique({ where: { nombre } });
};

const actualizar = async (id, datos) => {
  return prisma.categoria.update({ where: { id }, data: datos });
};

const eliminar = async (id) => {
  return prisma.categoria.delete({ where: { id } });
};

export const categoriaRepository = {
  crear,
  listar,
  buscarPorId,
  buscarPorNombre,
  actualizar,
  eliminar,
};
