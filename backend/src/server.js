import "dotenv/config";
import express from "express";
import cors from "cors";

import categoriaRoutes from "./routes/categoria.routes.js";
import equipoRoutes from "./routes/equipo.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";
import alquilerRoutes from "./routes/alquiler.routes.js";

import { requestLogger } from "./middlewares/requestLogger.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";
// import { verificarApiKey } from "./middlewares/auth.js"; // ver middlewares/auth.js para activarlo

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// app.use("/api", verificarApiKey); // opt-in: requiere definir API_KEY en .env y que el frontend mande x-api-key

// Capa de presentación: cada módulo de rutas delega en su controlador
app.use("/api/categorias", categoriaRoutes);
app.use("/api/equipos", equipoRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/alquileres", alquilerRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Estos dos van al final, en este orden: primero captura rutas
// inexistentes, y el errorHandler (4 args) siempre último.
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
