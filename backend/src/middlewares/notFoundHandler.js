// Se registra después de todas las rutas y antes del errorHandler.
// Captura cualquier request a una ruta/verbo que no matcheó nada
// (ej: GET /api/equipos-typo) y responde 404 en vez de que Express
// devuelva su HTML de error por defecto.
export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};
