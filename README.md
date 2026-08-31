# Alquiler de Equipos Médicos

Web de gestión de alquileres de equipos médicos, para uso del propietario.

## Arquitectura

- **Backend**: Node.js + Express, arquitectura en capas (rutas → controladores → servicios → repositorios → Prisma).
- **Base de datos**: Postgres provisto por Supabase, accedido vía Prisma.
- **Frontend**: Vue 3 + Vite, consumiendo la API REST del backend.
- **Patrón Observer**: usado para las notificaciones de vencimiento (`backend/src/observers/`).

## Setup inicial

### 1. Crear el proyecto en Supabase

1. Andá a https://supabase.com y creá un proyecto nuevo.
2. En **Project Settings → Database → Connection string**, copiá la cadena de conexión (modo "Transaction" si vas a desplegar en serverless, "Session" si es un servidor tradicional).

### 2. Backend

```bash
cd backend
cp .env.example .env
# Completá DATABASE_URL con la cadena de Supabase

npm install
npm run prisma:migrate    # crea las tablas en Supabase según prisma/schema.prisma
npm run dev                # levanta el servidor en http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                # levanta Vite en http://localhost:5173
```

El frontend está configurado para redirigir las llamadas a `/api` hacia `http://localhost:3000` (ver `vite.config.js`), así que con ambos corriendo en paralelo ya podés navegar a http://localhost:5173.

## Estructura de carpetas (backend)

```
backend/src/
├── config/         # cliente de Prisma centralizado
├── routes/         # capa de presentación (definición de endpoints)
├── controllers/     # capa de presentación (traduce HTTP <-> servicios)
├── services/        # capa de lógica de negocio (reglas del dominio)
├── repositories/     # capa de acceso a datos (única que habla con Prisma)
└── observers/        # patrón Observer para notificaciones
```

## Backlog / Sprint 1

Ver historias de usuario HU-00 a HU-09 (dadas de alta en las conversaciones de diseño).
Ya están armados los endpoints para: categorías, equipos, clientes y alquileres,
incluyendo las reglas de negocio de disponibilidad, transacciones atómicas, y
el panel de vencimientos (HU-10).

El frontend ya cuenta con formularios de alta para equipos, clientes y alquileres.

## Validaciones del alta de clientes

- El nombre debe contener únicamente letras y separadores habituales (espacios,
	apóstrofes, guiones o puntos).
- El documento debe tener entre 7 y 8 dígitos (DNI) o 11 dígitos (CUIT); se
	permiten espacios y guiones como separadores.
- Estas reglas se validan tanto en el formulario como en la API.
