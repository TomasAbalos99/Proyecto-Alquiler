import { clienteRepository } from "../repositories/cliente.repository.js";
import { AppError } from "../middlewares/AppError.js";

const normalizarDocumento = (documento = "") => String(documento).trim().replace(/[ -]/g, "");

const crearCliente = async (datos) => {
  const documento = normalizarDocumento(datos.documento);
  const existente = await clienteRepository.buscarPorDocumento(documento);
  if (existente) {
    throw new AppError(`Ya existe un cliente con el documento "${documento}"`, 409);
  }
  return clienteRepository.crear({ ...datos, documento });
};

const listarClientes = async (filtros) => {
  return clienteRepository.listar(filtros);
};

const obtenerCliente = async (id) => {
  const cliente = await clienteRepository.buscarPorId(id);
  if (!cliente) throw new AppError("Cliente no encontrado", 404);
  return cliente;
};

const actualizarCliente = async (id, datos) => {
  const cliente = await clienteRepository.buscarPorId(id);
  if (!cliente) throw new AppError("Cliente no encontrado", 404);

  const payload = { ...datos };
  if (payload.documento) {
    payload.documento = normalizarDocumento(payload.documento);
    const existente = await clienteRepository.buscarPorDocumento(payload.documento);
    if (existente && existente.id !== Number(id)) {
      throw new AppError(`Ya existe un cliente con el documento "${payload.documento}"`, 409);
    }
  }

  return clienteRepository.actualizar(id, payload);
};

const eliminarCliente = async (id) => {
  const cliente = await clienteRepository.buscarPorId(id);
  if (!cliente) throw new AppError("Cliente no encontrado", 404);

  const alquileresActivos = cliente.alquileres?.some((a) => a.estado === "ACTIVO");
  if (alquileresActivos) {
    throw new AppError("No se puede eliminar un cliente con alquileres activos", 409);
  }

  return clienteRepository.eliminar(id);
};

export const clienteService = {
  crearCliente,
  listarClientes,
  obtenerCliente,
  actualizarCliente,
  eliminarCliente,
};
