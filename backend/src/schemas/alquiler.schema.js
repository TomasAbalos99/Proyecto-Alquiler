import { z } from "zod";

export const crearAlquilerSchema = z.object({
  equipoId: z
    .number({ invalid_type_error: "equipoId debe ser un número" })
    .int("equipoId debe ser un entero")
    .positive("equipoId debe ser positivo"),
  clienteId: z
    .number({ invalid_type_error: "clienteId debe ser un número" })
    .int("clienteId debe ser un entero")
    .positive("clienteId debe ser positivo"),
  fechaVencimiento: z.coerce.date({
    invalid_type_error: "fechaVencimiento debe ser una fecha válida",
  }).refine(
    (fecha) => fecha >= new Date(),
    "La fecha de vencimiento no puede estar en el pasado"
  ),
  // .positive() (no .nonnegative()): un alquiler siempre tiene costo,
  // no contemplamos alquileres gratuitos como caso de negocio.
  monto: z
    .number({ invalid_type_error: "monto debe ser un número" })
    .positive("El monto debe ser mayor a cero"),
});

export const actualizarAlquilerSchema = crearAlquilerSchema.partial();

export const listarAlquileresQuerySchema = z.object({
  estado: z.enum(["ACTIVO", "VENCIDO", "FINALIZADO"], {
    message: "estado debe ser ACTIVO, VENCIDO o FINALIZADO",
  }).optional(),
  clienteId: z.coerce.number().int().positive("clienteId debe ser un número válido").optional(),
  numeroSerie: z.string().trim().min(1, "numeroSerie no puede estar vacío").optional(),
});
