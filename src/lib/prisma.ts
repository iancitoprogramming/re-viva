// Conexión a la base de datos (Prisma 7 + adapter-pg + Supabase SSL)
// Supabase requiere SSL. Usamos Pool con rejectUnauthorized: false para desarrollo.

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function crearCliente() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false }, // Necesario para conectar a Supabase
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

// En desarrollo Next.js recarga módulos frecuentemente.
// Guardamos la instancia en globalThis para reutilizarla y no abrir múltiples conexiones.
export const prisma = globalForPrisma.prisma ?? crearCliente()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
