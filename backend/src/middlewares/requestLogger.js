// Logger simple de requests (método, path, status, duración). No agrega
// dependencias nuevas (alternativa: la librería "morgan" si en algún
// momento se quiere algo más completo, con rotación de logs a archivo, etc.)
export const requestLogger = (req, res, next) => {
  const inicio = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - inicio;
    const fecha = new Date().toISOString();
    console.log(`[${fecha}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });

  next();
};
