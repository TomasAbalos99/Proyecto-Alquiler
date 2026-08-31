import { categoriaService } from "../services/categoria.service.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

// Capa de presentación (parte controlador): traduce HTTP <-> lógica de negocio.
// No contiene reglas de negocio, solo maneja request/response.

const crear = asyncHandler(async (req, res) => {
  const categoria = await categoriaService.crearCategoria(req.body);
  res.status(201).json(categoria);
});

const listar = asyncHandler(async (req, res) => {
  const categorias = await categoriaService.listarCategorias();
  res.json(categorias);
});

const actualizar = asyncHandler(async (req, res) => {
  const categoria = await categoriaService.actualizarCategoria(req.params.id, req.body);
  res.json(categoria);
});

const eliminar = asyncHandler(async (req, res) => {
  await categoriaService.eliminarCategoria(req.params.id);
  res.status(204).send();
});

export const categoriaController = {
  crear,
  listar,
  actualizar,
  eliminar,
};
