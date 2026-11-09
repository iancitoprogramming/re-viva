-- Biblioteca de ejercicios: un video por ejercicio.
-- El catálogo (nombre, estación, clave técnica) vive en el código
-- (src/lib/ejercicios/catalogo.ts); acá solo se guarda el link del video.
-- Idempotente, porque en producción varias migraciones se aplicaron a mano.

CREATE TABLE IF NOT EXISTS "EjercicioVideo" (
    "slug" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "actualizadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EjercicioVideo_pkey" PRIMARY KEY ("slug")
);

-- Sin políticas: el rol anónimo de Supabase no lee ni escribe. Todo va por el servidor.
ALTER TABLE "EjercicioVideo" ENABLE ROW LEVEL SECURITY;
