import { Router } from "express";
import { alquilerController } from "../controllers/alquiler.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  crearAlquilerSchema,
  actualizarAlquilerSchema,
  listarAlquileresQuerySchema,
} from "../schemas/alquiler.schema.js";
import { idParamSchema } from "../schemas/common.schema.js";

const router = Router();

// POST  /api/alquileres                    - HU-07: crear alquiler
router.post("/", validate(crearAlquilerSchema), alquilerController.crear);

// GET   /api/alquileres?estado=&clienteId=&numeroSerie=  - HU-09 / HU-11
router.get("/", validate(listarAlquileresQuerySchema, "query"), alquilerController.listar);

router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(actualizarAlquilerSchema),
  alquilerController.actualizar
);

router.delete("/:id", validate(idParamSchema, "params"), alquilerController.eliminar);

// GET   /api/alquileres/vencimientos        - HU-10: panel de vencimientos
router.get("/vencimientos", alquilerController.vencimientos);

// PATCH /api/alquileres/:id/devolucion      - HU-08: marcar devuelto
router.patch(
	"/:id/devolucion",
	validate(idParamSchema, "params"),
	alquilerController.marcarDevuelto
);

export default router;
