import { clienteService } from "../services/cliente.service.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const crear = asyncHandler(async (req, res) => {
  const cliente = await clienteService.crearCliente(req.body);
  res.status(201).json(cliente);
});

const listar = asyncHandler(async (req, res) => {
  const clientes = await clienteService.listarClientes(req.query);
  res.json(clientes);
});

const obtener = asyncHandler(async (req, res) => {
  const cliente = await clienteService.obtenerCliente(req.params.id);
  res.json(cliente);
});

const actualizar = asyncHandler(async (req, res) => {
  const cliente = await clienteService.actualizarCliente(req.params.id, req.body);
  res.json(cliente);
});

const eliminar = asyncHandler(async (req, res) => {
  await clienteService.eliminarCliente(req.params.id);
  res.status(204).send();
});

export const clienteController = {
  crear,
  listar,
  obtener,
  actualizar,
  eliminar,
};
