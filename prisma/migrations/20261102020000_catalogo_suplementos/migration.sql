-- Catálogo de suplementos recomendados (solapa pública /suplementos).
-- Mismo framework de afiliados que el proyecto de skincare: producto + link de
-- afiliado + registro de clics. Un producto se muestra solo si activo = true y
-- tiene linkAfiliado. Los productos se cargan inactivos: se activan desde
-- /admin/suplementos cuando Ian devuelve el link de afiliado con la marca.

CREATE TYPE "ObjetivoSuplemento" AS ENUM ('GANANCIA_MUSCULAR', 'PERDIDA_GRASA', 'RENDIMIENTO', 'SALUD_GENERAL');

CREATE TABLE "Suplemento" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "marca" TEXT,
    "objetivos" "ObjetivoSuplemento"[],
    "paraQueSirve" TEXT NOT NULL,
    "aQuienSeRecomienda" TEXT NOT NULL,
    "comoSeUsa" TEXT NOT NULL,
    "linkAfiliado" TEXT,
    "imagenUrl" TEXT,
    "precioArs" DOUBLE PRECISION,
    "relevadoEn" TIMESTAMP(3),
    "prioridad" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suplemento_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SuplementoClick" (
    "id" TEXT NOT NULL,
    "suplementoId" TEXT NOT NULL,
    "origen" TEXT,
    "referrer" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuplementoClick_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Suplemento_slug_key" ON "Suplemento"("slug");
CREATE INDEX "SuplementoClick_suplementoId_creadoEn_idx" ON "SuplementoClick"("suplementoId", "creadoEn");

ALTER TABLE "SuplementoClick" ADD CONSTRAINT "SuplementoClick_suplementoId_fkey"
  FOREIGN KEY ("suplementoId") REFERENCES "Suplemento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Igual que el resto de las tablas del proyecto: RLS prendido y sin policies.
-- Prisma entra como dueño de las tablas; la API REST pública de Supabase no ve nada.
ALTER TABLE "Suplemento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SuplementoClick" ENABLE ROW LEVEL SECURITY;

-- Catálogo inicial: genérico por tipo de producto, elegido por evidencia y
-- precio-calidad. "comoSeUsa" es la indicación típica de etiqueta: ajustarla a
-- la etiqueta de la marca concreta cuando se cargue el link.
INSERT INTO "Suplemento" ("id", "slug", "nombre", "objetivos", "paraQueSirve", "aQuienSeRecomienda", "comoSeUsa", "prioridad", "actualizadoEn") VALUES
('sup_creatina', 'creatina-monohidrato', 'Creatina monohidrato',
  ARRAY['GANANCIA_MUSCULAR','RENDIMIENTO']::"ObjetivoSuplemento"[],
  'Más fuerza y rendimiento en esfuerzos cortos e intensos. Con el entrenamiento, ayuda a ganar masa muscular. Es el suplemento con más evidencia que existe.',
  'Cualquier persona que entrene fuerza, de cualquier edad. Especialmente útil si comés poca carne o sos vegetariano.',
  '3 a 5 g por día, todos los días (también los que no entrenás), con agua o con una comida. No hace falta fase de carga ni descansos.',
  100, CURRENT_TIMESTAMP),
('sup_whey', 'proteina-whey', 'Proteína de suero (whey)',
  ARRAY['GANANCIA_MUSCULAR','PERDIDA_GRASA']::"ObjetivoSuplemento"[],
  'Completa la proteína del día de forma rápida y práctica. Ayuda a sostener el músculo en déficit y a construirlo en volumen.',
  'Quien no llega a la proteína de su plan solo con comida o necesita una colación rápida. Si tenés intolerancia a la lactosa, elegí whey aislada o la vegetal.',
  '1 medida (unos 30 g) en 200–250 ml de agua o leche, en la comida que indique tu plan (muchas veces el post entreno).',
  90, CURRENT_TIMESTAMP),
('sup_proteina_vegetal', 'proteina-vegetal', 'Proteína vegetal (arveja + arroz)',
  ARRAY['GANANCIA_MUSCULAR','PERDIDA_GRASA']::"ObjetivoSuplemento"[],
  'La misma función que la whey, sin lácteos. La mezcla arveja + arroz da un perfil de aminoácidos completo.',
  'Veganos, vegetarianos o personas que no toleran la whey.',
  '1 medida (unos 30–35 g) en 250 ml de agua o bebida vegetal, en la comida que indique tu plan.',
  70, CURRENT_TIMESTAMP),
('sup_cafeina', 'cafeina', 'Cafeína en cápsulas',
  ARRAY['RENDIMIENTO','PERDIDA_GRASA']::"ObjetivoSuplemento"[],
  'Más energía, foco y rendimiento en el entrenamiento. Dosis exacta, sin depender de cuántos cafés tomaste.',
  'Quien llega cansado a entrenar. No recomendada si tenés hipertensión, ansiedad, arritmias, estás embarazada o entrenás de noche.',
  '1 cápsula (100–200 mg) 30 a 60 minutos antes de entrenar. No pasar de 400 mg por día sumando mate y café. Nada en las 8 horas previas a dormir.',
  60, CURRENT_TIMESTAMP),
('sup_omega3', 'omega-3', 'Omega 3 (EPA + DHA)',
  ARRAY['SALUD_GENERAL']::"ObjetivoSuplemento"[],
  'Salud cardiovascular y articular. Cubre lo que no llega por pescado.',
  'Quien come pescado graso (salmón, caballa, sardina) menos de 2 veces por semana. Consultá con tu médico si tomás anticoagulantes.',
  '1 a 2 cápsulas por día con una comida, según etiqueta (objetivo: alrededor de 1 g de EPA + DHA por día).',
  50, CURRENT_TIMESTAMP),
('sup_vitamina_d3', 'vitamina-d3', 'Vitamina D3',
  ARRAY['SALUD_GENERAL']::"ObjetivoSuplemento"[],
  'Huesos, sistema inmune y función muscular. Es muy común tenerla baja, sobre todo en invierno.',
  'Quien toma poco sol, trabaja en interiores o tiene un análisis con vitamina D baja. Lo ideal es confirmarlo con un análisis.',
  '1 cápsula por día con una comida que tenga grasa, en la dosis que indique la etiqueta o tu médico.',
  45, CURRENT_TIMESTAMP),
('sup_magnesio', 'magnesio', 'Magnesio (bisglicinato o citrato)',
  ARRAY['SALUD_GENERAL','RENDIMIENTO']::"ObjetivoSuplemento"[],
  'Descanso, función muscular y menos calambres. Las formas bisglicinato y citrato se absorben bien y caen bien al estómago.',
  'Quien duerme mal, tiene calambres o transpira mucho entrenando. Si tenés problemas renales, consultá antes.',
  '1 dosis por día según etiqueta (habitualmente 200–400 mg), preferentemente a la noche.',
  40, CURRENT_TIMESTAMP),
('sup_electrolitos', 'electrolitos', 'Electrolitos / sales de hidratación',
  ARRAY['RENDIMIENTO']::"ObjetivoSuplemento"[],
  'Reponen sodio, potasio y magnesio que se pierden con el sudor. Menos fatiga y calambres en sesiones largas o con calor.',
  'Quien entrena más de 60 minutos, con calor o transpira mucho. No hace falta en sesiones cortas.',
  '1 sobre o medida en 500 ml de agua, durante o después del entrenamiento.',
  30, CURRENT_TIMESTAMP),
('sup_psyllium', 'psyllium', 'Fibra de psyllium',
  ARRAY['PERDIDA_GRASA','SALUD_GENERAL']::"ObjetivoSuplemento"[],
  'Más saciedad y mejor tránsito intestinal. Ayuda a sostener el déficit sin pasar hambre.',
  'Quien come poca verdura o fruta, tiene tránsito lento o mucha hambre en déficit.',
  '1 cucharadita (unos 5 g) en un vaso grande de agua, tomar enseguida, 1 o 2 veces por día. Siempre con mucha agua. Separarlo 2 horas de cualquier medicación.',
  25, CURRENT_TIMESTAMP),
('sup_multivitaminico', 'multivitaminico', 'Multivitamínico',
  ARRAY['SALUD_GENERAL']::"ObjetivoSuplemento"[],
  'Seguro para cubrir micronutrientes cuando la dieta es acotada.',
  'Quien está en déficit calórico largo, come poca variedad o tiene restricciones (vegano, sin TACC). No reemplaza comer bien.',
  '1 comprimido por día con el desayuno o el almuerzo.',
  20, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
