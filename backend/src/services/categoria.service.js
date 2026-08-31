import { categoriaRepository } from "../repositories/categoria.repository.js";
import { equipoRepository } from "../repositories/equipo.repository.js";
import { AppError } from "../middlewares/AppError.js";

// Capa de lógica de negocio: no sabe nada de Prisma ni de SQL,
// solo conoce la interfaz del repositorio.

const crearCategoria = async (datos) => {
  const existente = await categoriaRepository.buscarPorNombre(datos.nombre);
  if (existente) {
    throw new AppError(`Ya existe una categoría con el nombre "${datos.nombre}"`, 409);
  }
  return categoriaRepository.crear(datos);
};

const listarCategorias = async () => {
  return categoriaRepository.listar();
};

const actualizarCategoria = async (id, datos) => {
  const categoria = await categoriaRepository.buscarPorId(id);
  if (!categoria) throw new AppError("Categoría no encontrada", 404);

  const nombre = String(datos.nombre ?? categoria.nombre).trim();
  if (!nombre) throw new AppError("El nombre es obligatorio", 400);

  if (nombre !== categoria.nombre) {
    const existente = await categoriaRepository.buscarPorNombre(nombre);
    if (existente) {
      throw new AppError(`Ya existe una categoría con el nombre "${nombre}"`, 409);
    }
  }

  return categoriaRepository.actualizar(id, { nombre });
};

const eliminarCategoria = async (id) => {
  const categoria = await categoriaRepository.buscarPorId(id);
  if (!categoria) throw new AppError("Categoría no encontrada", 404);

  const equipos = await equipoRepository.listar({ categoriaId: id });
  if (equipos.length > 0) {
    throw new AppError("No se puede eliminar una categoría que tiene equipos asociados", 409);
  }

  return categoriaRepository.eliminar(id);
};

export const categoriaService = {
  crearCategoria,
  listarCategorias,
  actualizarCategoria,
  eliminarCategoria,
};
