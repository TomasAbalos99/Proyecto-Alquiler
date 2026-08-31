import { prisma } from "../config/prisma.js";

const normalizarDocumento = (documento = "") => String(documento).trim().replace(/[ -]/g, "");

const crear = async (datos) => {
  const documento = normalizarDocumento(datos.documento);
  return prisma.cliente.create({ data: { ...datos, documento } });
};

const listar = async (filtros = {}) => {
  const where = {};
  if (filtros.nombre) where.nombre = { contains: filtros.nombre, mode: "insensitive" };

  return prisma.cliente.findMany({ where, orderBy: { nombre: "asc" } });
};

const buscarPorId = async (id) => {
  return prisma.cliente.findUnique({
    where: { id },
    include: { alquileres: { include: { equipo: true } } },
  });
};

const buscarPorDocumento = async (documento) => {
  const documentoNormalizado = normalizarDocumento(documento);
  return prisma.cliente.findUnique({ where: { documento: documentoNormalizado } });
};

const actualizar = async (id, datos) => {
  return prisma.cliente.update({ where: { id }, data: datos });
};

const eliminar = async (id) => {
  return prisma.cliente.delete({ where: { id } });
};

export const clienteRepository = {
  crear,
  listar,
  buscarPorId,
  buscarPorDocumento,
  actualizar,
  eliminar,
};
