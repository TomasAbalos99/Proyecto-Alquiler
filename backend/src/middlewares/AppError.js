// Error "de negocio" con status HTTP explícito, para no tener que adivinar
// el código en cada controller. Los services/repositories deberían lanzar
// esto (en vez de `new Error(...)`) cuando el caso lo amerite:
//
//   throw new AppError("Equipo no encontrado", 404);
//   throw new AppError("El equipo no está disponible para alquilar", 409);
//
// Si en algún punto se lanza un Error común, el errorHandler lo trata
// igual pero cae por defecto en 500 (ver middlewares/errorHandler.js).
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    // Distingue errores esperados (de negocio) de bugs no controlados.
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
