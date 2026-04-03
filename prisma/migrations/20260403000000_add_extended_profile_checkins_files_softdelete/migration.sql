-- Migración: Extended onboarding, CheckIn, Archivo, soft delete
-- Ejecutar en Supabase SQL Editor

-- 1. Soft delete en User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- 2. Campos extendidos en NutritionalProfile
ALTER TABLE "NutritionalProfile"
  ADD COLUMN IF NOT EXISTS "experiencia"          TEXT,
  ADD COLUMN IF NOT EXISTS "equipamiento"         TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "actividadLaboral"      TEXT,
  ADD COLUMN IF NOT EXISTS "practicaDeportes"      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "deportes"              TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "quiereMejorarDeporte"  TEXT,
  ADD COLUMN IF NOT EXISTS "metasFisicas"          TEXT[] NOT NULL DEFAULT '{}';

-- 3. Tabla CheckIn
CREATE TABLE IF NOT EXISTS "CheckIn" (
  "id"         TEXT NOT NULL,
  "userId"     TEXT NOT NULL,
  "tipo"       TEXT NOT NULL,
  "fecha"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "nota"       TEXT,
  "confirmado" BOOLEAN NOT NULL DEFAULT true,
  "creadoEn"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CheckIn_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CheckIn_userId_fecha_idx" ON "CheckIn"("userId", "fecha");
CREATE INDEX IF NOT EXISTS "CheckIn_userId_tipo_idx"  ON "CheckIn"("userId", "tipo");

-- 4. Tabla Archivo
CREATE TABLE IF NOT EXISTS "Archivo" (
  "id"             TEXT NOT NULL,
  "userId"         TEXT NOT NULL,
  "nombre"         TEXT NOT NULL,
  "tipo"           TEXT NOT NULL,
  "url"            TEXT NOT NULL,
  "nombreOriginal" TEXT NOT NULL,
  "tamano"         INTEGER NOT NULL,
  "subidoEn"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "subidoPor"      TEXT NOT NULL,

  CONSTRAINT "Archivo_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Archivo_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Archivo_userId_idx" ON "Archivo"("userId");
