import { z } from "zod";

export const crearCategoriaSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
});

export const actualizarCategoriaSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
});
