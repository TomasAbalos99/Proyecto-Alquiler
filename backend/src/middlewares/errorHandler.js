import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "./AppError.js";

// Traduce errores conocidos de Prisma a algo entendible + status HTTP correcto,
// sin que cada repository tenga que hacer ese mapeo a mano.
const desdeErrorDePrisma = (error) => {
  switch (error.code) {
    case "P2002": {
      // Violación de constraint único (ej: numeroSerie o documento duplicado)
      const campo = error.meta?.target?.join(", ") ?? "campo";
      return new AppError(`Ya existe un registro con ese valor en "${campo}"`, 409);
    }
    case "P2025":
      // Registro no encontrado (update/delete sobre algo inexistente)
      return new AppError("El registro indicado no existe", 404);
    case "P2003":
      // Violación de foreign key (ej: categoriaId que no existe)
      return new AppError("La referencia indicada no existe o está en uso", 409);
    default:
      return null;
  }
};

// Middleware de error de Express: se reconoce por tener 4 parámetros.
// Debe registrarse DESPUÉS de todas las rutas en server.js.
export const errorHandler = (error, req, res, next) => {
  let resuelto = error;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    resuelto = desdeErrorDePrisma(error) ?? resuelto;
  } else if (error instanceof ZodError) {
    // Lo maneja normalmente el middleware validate.js antes de llegar acá,
    // pero se cubre por las dudas de que un schema se valide "a mano".
    resuelto = new AppError(
      error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" | "),
      400
    );
  }

  const statusCode = resuelto.statusCode ?? 500;
  const esperado = resuelto.isOperational ?? false;

  if (!esperado) {
    // Error no anticipado (bug, falla de conexión, etc.): se loguea completo.
    console.error(error);
  }

  res.status(statusCode).json({
    error: esperado ? resuelto.message : "Error interno del servidor",
  });
};
