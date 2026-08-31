import { Router } from "express";
import { clienteController } from "../controllers/cliente.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  crearClienteSchema,
  actualizarClienteSchema,
  listarClientesQuerySchema,
} from "../schemas/cliente.schema.js";
import { idParamSchema } from "../schemas/common.schema.js";

const router = Router();

// POST /api/clientes          - HU-05: alta de cliente
router.post("/", validate(crearClienteSchema), clienteController.crear);

// GET  /api/clientes?nombre=  - HU-06 / HU-11: listado y filtro
router.get("/", validate(listarClientesQuerySchema, "query"), clienteController.listar);

// GET  /api/clientes/:id      - HU-12: detalle con historial
router.get("/:id", validate(idParamSchema, "params"), clienteController.obtener);

router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(actualizarClienteSchema),
  clienteController.actualizar
);

router.delete("/:id", validate(idParamSchema, "params"), clienteController.eliminar);

export default router;
