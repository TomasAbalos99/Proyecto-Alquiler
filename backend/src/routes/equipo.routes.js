import { Router } from "express";
import { equipoController } from "../controllers/equipo.controller.js";
import { validate } from "../middlewares/validate.js";
import {
	crearEquipoSchema,
	actualizarEquipoSchema,
	cambiarEstadoSchema,
	listarEquiposQuerySchema,
} from "../schemas/equipo.schema.js";
import { idParamSchema } from "../schemas/common.schema.js";

const router = Router();

// POST /api/equipos                      - HU-01: alta de equipo
router.post("/", validate(crearEquipoSchema), equipoController.crear);

// GET  /api/equipos?categoriaId=&numeroSerie=&estado=  - HU-02 / HU-11: listado y filtros
router.get("/", validate(listarEquiposQuerySchema, "query"), equipoController.listar);

// GET  /api/equipos/:id                  - HU-13: detalle con historial
router.get("/:id", validate(idParamSchema, "params"), equipoController.obtener);

router.patch(
	"/:id",
	validate(idParamSchema, "params"),
	validate(actualizarEquipoSchema),
	equipoController.actualizar
);

router.delete("/:id", validate(idParamSchema, "params"), equipoController.eliminar);

// PATCH /api/equipos/:id/mantenimiento   - HU-04: enviar a mantenimiento
router.patch(
	"/:id/mantenimiento",
	validate(idParamSchema, "params"),
	equipoController.enviarAMantenimiento
);

// PATCH /api/equipos/:id/estado          - HU-04b: cambio manual con advertencia
router.patch(
	"/:id/estado",
	validate(idParamSchema, "params"),
	validate(cambiarEstadoSchema),
	equipoController.cambiarEstado
);

export default router;
