-- Formulario público de ingreso (/ingreso): una fila por envío.
-- Las respuestas de texto libre van como columnas propias, no dentro de un JSON
-- suelto, para poder consultarlas y filtrarlas.
-- La derivación peri-entreno NO se guarda: se recalcula siempre desde los horarios.

CREATE TABLE IF NOT EXISTS "altas" (
  "id"                       UUID         NOT NULL DEFAULT gen_random_uuid(),
  "creado_en"                TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "estado"                   TEXT         NOT NULL DEFAULT 'nuevo',

  -- Paso 1 — Quién sos
  "nombre"                   TEXT         NOT NULL,
  "email"                    TEXT         NOT NULL,
  "whatsapp"                 TEXT         NOT NULL,
  "edad"                     INTEGER      NOT NULL,
  "sexo"                     TEXT         NOT NULL,
  "peso_kg"                  NUMERIC(5,2) NOT NULL,
  "altura_cm"                INTEGER      NOT NULL,
  "objetivo"                 TEXT         NOT NULL,
  "experiencia"              TEXT,
  "duracion_ciclo"           TEXT,

  -- Paso 2 — Tus horarios
  "dias_entrenamiento"       TEXT[]       NOT NULL,
  "horarios_entrenamiento"   JSONB        NOT NULL,
  "horarios_comidas"         JSONB        NOT NULL,
  "comidas_sostenibles"      INTEGER      NOT NULL,
  "ayunas"                   TEXT         NOT NULL,
  "jornada_variable"         BOOLEAN      NOT NULL,
  "jornada_detalle"          TEXT,
  "domingo"                  TEXT,

  -- Paso 3 — Cómo comés
  "cae_mal"                  TEXT         NOT NULL,
  "alergias"                 TEXT         NOT NULL,
  "no_gusta"                 TEXT         NOT NULL,
  "cocina"                   TEXT,
  "comidas_afuera"           TEXT,
  "balanza"                  TEXT         NOT NULL,
  "fin_de_semana"            TEXT,
  "agua"                     TEXT,

  -- Paso 4 — Salud
  "lesion"                   BOOLEAN      NOT NULL,
  "lesion_detalle"           TEXT,
  "lesion_estado"            TEXT,
  "laboratorio"              TEXT         NOT NULL,
  "medicacion"               TEXT         NOT NULL,
  "sueno"                    TEXT,
  "estres"                   TEXT,
  "seguimiento"              TEXT,

  -- Paso 5 — Cómo vas a entrenar
  "lugar"                    TEXT         NOT NULL,
  "equipamiento"             TEXT,
  "sesiones_con_entrenador"  INTEGER,
  "sesiones_solo"            INTEGER,
  "duracion_sesion"          TEXT,
  "otros_deportes"           TEXT,
  "ejercicios_evitar"        TEXT,
  "pasos"                    TEXT,

  -- Paso 6 — Cómo seguimos
  "presupuesto_suplementos"  TEXT         NOT NULL,
  "revision"                 TEXT,
  "comunicacion"             TEXT,
  "intentos_previos"         TEXT,
  "fecha_motivadora"         TEXT,
  "consentimiento"           BOOLEAN      NOT NULL,

  -- Interno
  "notas_internas"           TEXT,

  CONSTRAINT "altas_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "altas_estado_check" CHECK ("estado" IN ('nuevo','en_armado','armado','descartado')),
  CONSTRAINT "altas_sexo_check" CHECK ("sexo" IN ('Femenino','Masculino')),
  CONSTRAINT "altas_edad_check" CHECK ("edad" BETWEEN 14 AND 95),
  CONSTRAINT "altas_comidas_sostenibles_check" CHECK ("comidas_sostenibles" BETWEEN 2 AND 6),
  CONSTRAINT "altas_consentimiento_check" CHECK ("consentimiento" = true)
);

CREATE INDEX IF NOT EXISTS "altas_creado_en_idx" ON "altas"("creado_en" DESC);
CREATE INDEX IF NOT EXISTS "altas_estado_idx"    ON "altas"("estado");

-- RLS activada y SIN políticas: el rol anónimo no puede leer ni escribir nada,
-- ni con la clave pública en la mano. El insert lo hace el endpoint del servidor
-- con la conexión privilegiada (DATABASE_URL, que nunca llega al bundle del cliente),
-- y la vista interna lee por la misma vía.
-- Sin FORCE: el dueño de la tabla (la conexión del servidor) queda exento y puede
-- insertar y leer; cualquier otro rol, sin política, no ve ni una fila.
ALTER TABLE "altas" ENABLE ROW LEVEL SECURITY;

-- Defensa en profundidad: además de RLS, se le quitan los permisos a los roles
-- públicos de Supabase. Guardado en un DO porque esos roles no existen en una
-- base Postgres común (dev local).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "altas" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "altas" FROM authenticated;
  END IF;
END
$$;
