import { z } from "zod";

// HU-01: alta de equipo
export const crearEquipoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  numeroSerie: z.string().trim().min(1, "El número de serie es obligatorio"),
  descripcion: z.string().trim().optional(),
  fotoUrl: z.string().trim().url("Debe ser una URL válida").optional(),
  categoriaId: z.coerce.number().int().positive("categoriaId debe ser un número válido"),
  estado: z.enum(["DISPONIBLE", "ALQUILADO", "MANTENIMIENTO"], {
    message: "estado debe ser DISPONIBLE, ALQUILADO o MANTENIMIENTO",
  }).optional(),
});

export const actualizarEquipoSchema = crearEquipoSchema.partial();

// HU-04b: cambio manual de estado
export const cambiarEstadoSchema = z.object({
  estado: z.enum(["DISPONIBLE", "ALQUILADO", "MANTENIMIENTO"], {
    message: "estado debe ser DISPONIBLE, ALQUILADO o MANTENIMIENTO",
  }),
});

export const listarEquiposQuerySchema = z.object({
  categoriaId: z.coerce.number().int().positive("categoriaId debe ser un número válido").optional(),
  numeroSerie: z.string().trim().min(1, "numeroSerie no puede estar vacío").optional(),
  estado: z.enum(["DISPONIBLE", "ALQUILADO", "MANTENIMIENTO"], {
    message: "estado debe ser DISPONIBLE, ALQUILADO o MANTENIMIENTO",
  }).optional(),
});
