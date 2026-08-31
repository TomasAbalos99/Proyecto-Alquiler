import { z } from "zod";

const normalizarDocumento = (documento = "") => documento.trim().replace(/[ -]/g, "");

export const crearClienteSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .regex(/^[\p{L}]+(?:[ .'-][\p{L}]+)*$/u, "El nombre solo puede contener letras"),
  documento: z
    .string()
    .trim()
    .transform(normalizarDocumento)
    .refine(
      (documento) => /^\d{7,8}$/.test(documento) || /^\d{11}$/.test(documento),
      "El documento debe tener entre 7 y 8 dígitos (DNI) o 11 dígitos (CUIT)"
    )
    .refine((documento) => documento.length > 0, "El documento es obligatorio"),
  telefono: z.string().trim().optional(),
  direccion: z.string().trim().optional(),
});

export const actualizarClienteSchema = crearClienteSchema.partial();

export const listarClientesQuerySchema = z.object({
  nombre: z.string().trim().min(1, "nombre no puede estar vacío").optional(),
});
