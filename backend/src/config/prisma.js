// Instancia única del cliente de Prisma.
// Solo la capa de repositorios debería importar este archivo.
// Ninguna ruta, controlador o servicio debería hablar con Prisma directamente.

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
