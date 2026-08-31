import { Router } from "express";
import { categoriaController } from "../controllers/categoria.controller.js";
import { validate } from "../middlewares/validate.js";
import { crearCategoriaSchema, actualizarCategoriaSchema } from "../schemas/categoria.schema.js";
import { idParamSchema } from "../schemas/common.schema.js";

const router = Router();

// POST /api/categorias        - HU-00: alta de categoría
router.post("/", validate(crearCategoriaSchema), categoriaController.crear);

// GET  /api/categorias         - HU-00b: listado de categorías
router.get("/", categoriaController.listar);

router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(actualizarCategoriaSchema),
  categoriaController.actualizar
);

router.delete("/:id", validate(idParamSchema, "params"), categoriaController.eliminar);

export default router;
