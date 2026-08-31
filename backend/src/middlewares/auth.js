import { AppError } from "./AppError.js";

// Auth mínima para una app de un solo usuario (el propietario): compara
// un header contra una clave fija en variables de entorno. No es el auth
// definitivo — el README ya deja reservadas SUPABASE_URL/SERVICE_ROLE_KEY
// para cuando se integre Supabase Auth (login real, JWT, etc.) — pero
// sirve como piso mínimo mientras tanto para no dejar la API 100% abierta.
//
// Uso en server.js (después de express.json(), antes de las rutas):
//   import { verificarApiKey } from "./middlewares/auth.js";
//   app.use("/api", verificarApiKey);
//
// El frontend tendría que mandar el header en cada request:
//   headers: { "x-api-key": import.meta.env.VITE_API_KEY }
//
// Deliberadamente NO está enchufado en server.js todavía: activarlo sin
// que el frontend mande el header rompe la app actual. Ver README para
// los pasos de activación.
export const verificarApiKey = (req, res, next) => {
  const clave = process.env.API_KEY;

  // Si no se configuró API_KEY en .env, no bloquea (comportamiento actual).
  // Al definirla, empieza a exigirse.
  if (!clave) return next();

  const claveRecibida = req.header("x-api-key");

  if (claveRecibida !== clave) {
    return next(new AppError("No autorizado", 401));
  }

  next();
};
