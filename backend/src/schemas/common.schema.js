import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("id debe ser un número entero positivo"),
});