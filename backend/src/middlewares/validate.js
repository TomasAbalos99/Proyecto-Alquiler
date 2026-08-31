// Factory de middleware de validación con Zod. Se usa por ruta, pasándole
// el schema correspondiente:
//
//   import { validate } from "../middlewares/validate.js";
//   import { crearEquipoSchema } from "./equipo.schema.js";
//
//   router.post("/", validate(crearEquipoSchema), equipoController.crear);
//
// Si la validación falla, corta acá con 400 y nunca llega al controller
// (evita que datos incompletos/mal tipados lleguen a la capa de servicios).
// `location` indica qué parte del request validar: "body" (default),
// "query" o "params".
export const validate = (schema, location = "body") => {
  return (req, res, next) => {
    const resultado = schema.safeParse(req[location]);

    if (!resultado.success) {
      const detalle = resultado.error.issues
        .map((i) => `${i.path.join(".") || location}: ${i.message}`)
        .join(" | ");
      return res.status(400).json({ error: `Datos inválidos: ${detalle}` });
    }

    // Reemplaza por los datos ya parseados/coercionados (ej: strings de
    // query params convertidos a number según el schema).
    req[location] = resultado.data;
    next();
  };
};
