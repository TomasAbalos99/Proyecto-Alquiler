// Envuelve un controller async para que cualquier excepción (o promesa
// rechazada) caiga automáticamente en next(error) -> errorHandler.js,
// en vez de tener que repetir try/catch en cada función de cada controller.
//
// Antes:
//   export const crear = async (req, res) => {
//     try {
//       const equipo = await equipoService.crearEquipo(req.body);
//       res.status(201).json(equipo);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   }
//
// Después:
//   export const crear = asyncHandler(async (req, res) => {
//     const equipo = await equipoService.crearEquipo(req.body);
//     res.status(201).json(equipo);
//   });
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
