-- Cuestionario v2 (oferta Hormozi): datos que necesitan los entregables.
-- - resultadoSonado / obstaculos: resultado soñado y obstáculos (ecuación de valor)
-- - horarioEntrenamiento: ubica las tomas pre y post entreno
-- - comeAfuera / lugaresComeAfuera: dispara la Guía para comer afuera
-- - sesionesCocina: dimensiona la guía de meal prep (1 o 2 sesiones)
-- - supermercado: nivel "Lo hago por vos" de la escalera de servicio
-- - suplementosActuales: punto de partida de la guía de suplementación
-- Solo agrega columnas con default: no toca datos existentes.

ALTER TABLE "NutritionalProfile"
  ADD COLUMN IF NOT EXISTS "resultadoSonado" TEXT,
  ADD COLUMN IF NOT EXISTS "obstaculos" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "horarioEntrenamiento" TEXT,
  ADD COLUMN IF NOT EXISTS "comeAfuera" TEXT NOT NULL DEFAULT 'nunca',
  ADD COLUMN IF NOT EXISTS "lugaresComeAfuera" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "sesionesCocina" TEXT,
  ADD COLUMN IF NOT EXISTS "supermercado" TEXT,
  ADD COLUMN IF NOT EXISTS "suplementosActuales" TEXT[] DEFAULT ARRAY[]::TEXT[];
