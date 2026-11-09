-- Contenido del catálogo según el research de Ian (src/lib/suplementos/catalogo.ts).
-- Reemplaza la carga genérica de 20261102020000 (10 productos inactivos, sin
-- link y sin clics). Los slugs son los mismos ids de catalogo.ts, así el motor
-- de elección puede leer el link de afiliado de la DB por id.
-- Fuera, por no estar en el research: proteína vegetal, psyllium,
-- multivitamínico. Cafeína queda fuera de la web: "el café alcanza".
-- Los 14 quedan activos con su link de afiliado: ver el UPDATE del final.

DELETE FROM "Suplemento"
WHERE "id" IN ('sup_creatina','sup_whey','sup_proteina_vegetal','sup_cafeina','sup_omega3',
               'sup_vitamina_d3','sup_magnesio','sup_electrolitos','sup_psyllium','sup_multivitaminico')
  AND "linkAfiliado" IS NULL;

INSERT INTO "Suplemento" ("id", "slug", "nombre", "objetivos", "paraQueSirve", "aQuienSeRecomienda", "comoSeUsa", "prioridad", "actualizadoEn") VALUES
-- ─── Lo básico (antes que cualquier suplemento) ───
('sup_balanza_cocina', 'balanza-cocina', 'Balanza de cocina',
  ARRAY['ELEMENTOS_BASE']::"ObjetivoSuplemento"[],
  'Lo primero, antes que cualquier suplemento. Los planes de Re-Viva trabajan con gramajes exactos: sin balanza, el plan es una estimación.',
  'Todos los que siguen un plan de nutrición de Re-Viva.',
  'Que mida de a 1 g y tenga función tara. Poné el plato, tara en cero y pesá: proteínas cocidas, hidratos crudos.',
  199, CURRENT_TIMESTAMP),
('sup_balanza_personal', 'balanza-personal', 'Balanza personal',
  ARRAY['ELEMENTOS_BASE','PERDIDA_GRASA']::"ObjetivoSuplemento"[],
  'Para seguir el progreso con datos, no con sensaciones.',
  'Todos. Lo que sirve es la tendencia semanal, no el número de un día suelto.',
  'Pesate 3 veces por semana, en ayunas, y mirá el promedio. No hace falta que mida grasa corporal: esas mediciones son poco confiables.',
  198, CURRENT_TIMESTAMP),
('sup_cinta_metrica', 'cinta-metrica', 'Cinta métrica',
  ARRAY['ELEMENTOS_BASE','PERDIDA_GRASA']::"ObjetivoSuplemento"[],
  'Para cuando la balanza no se mueve pero el cuerpo sí. Es la medición que más importa en recomposición corporal.',
  'Todos, y sobre todo quien está en recomposición.',
  'Medí la cintura a la altura del ombligo, en ayunas, cada 2 semanas. Mejor con traba o retráctil para medirte solo.',
  197, CURRENT_TIMESTAMP),
('sup_shaker', 'shaker', 'Shaker',
  ARRAY['ELEMENTOS_BASE']::"ObjetivoSuplemento"[],
  'Logística pura: sin shaker, el batido se toma menos.',
  'Quien toma proteína en polvo o creatina.',
  'De 600 ml, con resorte o rejilla para que no queden grumos.',
  196, CURRENT_TIMESTAMP),
('sup_botella', 'botella', 'Botella',
  ARRAY['ELEMENTOS_BASE']::"ObjetivoSuplemento"[],
  'Tener el agua a la vista es la forma más barata de tomar más agua.',
  'Todos.',
  'De 1 litro, mejor con marcas de medición. Llevala al trabajo y al gimnasio.',
  195, CURRENT_TIMESTAMP),
-- ─── Nivel 1 — respaldo sólido ───
('sup_creatina', 'creatina', 'Creatina monohidrato',
  ARRAY['GANANCIA_MUSCULAR','RENDIMIENTO']::"ObjetivoSuplemento"[],
  'Más fuerza y más músculo con el mismo entrenamiento. Lo más costo-efectivo que existe: si vas a comprar una sola cosa, es esta.',
  'Cualquiera que entrene fuerza. Monohidrato sin sabor: HCL o kre-alkalyn cuestan más y no son mejores. Con enfermedad renal o hepática, medicación crónica o si sos menor de edad, consultá antes con un médico.',
  '3 a 5 g por día, todos los días. La carga es opcional y la hora da igual: lo que importa es la constancia. El aumento de peso de la primera semana es agua dentro del músculo, no grasa.',
  99, CURRENT_TIMESTAMP),
('sup_whey', 'whey', 'Proteína de suero (whey)',
  ARRAY['GANANCIA_MUSCULAR','PERDIDA_GRASA']::"ObjetivoSuplemento"[],
  'No es magia: es comida práctica para llegar a tu proteína del día. Si ya llegás comiendo, no la necesitás.',
  'Quien no llega a la proteína de su plan solo con comida. Si sos intolerante a la lactosa, aislado en vez de concentrado.',
  'La cantidad que te falte para llegar a tu proteína diaria (tu plan te la marca), cuando te convenga: la ventana anabólica de 30 minutos no existe como se vendió.',
  98, CURRENT_TIMESTAMP),
('sup_vitamina_d', 'vitamina-d', 'Vitamina D3',
  ARRAY['SALUD_GENERAL']::"ObjetivoSuplemento"[],
  'Corrige un déficit muy común en quien trabaja puertas adentro y entrena en gimnasio. Sin déficit, el beneficio no está demostrado.',
  'Quien tiene la vitamina D baja en un análisis. Primero medí 25(OH)D: no se suplementa a ciegas.',
  'La dosis la indica un profesional según tu valor en sangre: es liposoluble y se acumula. Con una comida que tenga grasa.',
  95, CURRENT_TIMESTAMP),
('sup_omega_3', 'omega-3', 'Omega-3 (EPA + DHA)',
  ARRAY['SALUD_GENERAL']::"ObjetivoSuplemento"[],
  'Salud cardiovascular y perfil inflamatorio. Para quien no come pescado graso dos veces por semana: o sea, casi todos.',
  'Quien no come salmón, caballa o sardinas dos veces por semana. Si tomás anticoagulantes, consultá antes con tu médico.',
  '1 a 2 g por día de EPA + DHA combinados, con comida. Mirá los gramos de EPA + DHA en la etiqueta, no los de aceite total: muchos tienen bastante menos de lo que aparentan.',
  94, CURRENT_TIMESTAMP),
-- ─── Nivel 2 — contextual ───
('sup_colageno', 'colageno', 'Colágeno hidrolizado',
  ARRAY['SALUD_GENERAL']::"ObjetivoSuplemento"[],
  'Accesorio para tendones y ligamentos: barato, sin contraindicaciones y con evidencia preliminar.',
  'Quien carga mucho las articulaciones o vuelve de una lesión ya tratada. La carga progresiva bien dosificada es el tratamiento; el suplemento es el accesorio.',
  '15 g de colágeno hidrolizado sin sabor + unos 50 mg de vitamina C, 30 a 60 minutos antes de entrenar.',
  93, CURRENT_TIMESTAMP),
('sup_vitamina_c', 'vitamina-c', 'Vitamina C',
  ARRAY['SALUD_GENERAL']::"ObjetivoSuplemento"[],
  'Va junto al colágeno: el cuerpo la necesita para formar colágeno.',
  'Quien toma colágeno antes de entrenar.',
  'Junto con el colágeno. Con 50 mg alcanza; un comprimido de 500 mg también sirve.',
  92, CURRENT_TIMESTAMP),
('sup_magnesio', 'magnesio', 'Magnesio (citrato o bisglicinato)',
  ARRAY['SALUD_GENERAL']::"ObjetivoSuplemento"[],
  'Corrige una ingesta baja. Para dormir mejor o los calambres, en quien ya tiene suficiente, la evidencia es débil.',
  'Quien come pocas verduras de hoja, frutos secos y legumbres. Si tenés problemas renales, consultá antes.',
  '200 a 400 mg por día, a la noche. Evitá el óxido de magnesio: se absorbe mal y suele dar efecto laxante.',
  91, CURRENT_TIMESTAMP),
('sup_electrolitos', 'electrolitos', 'Electrolitos',
  ARRAY['RENDIMIENTO']::"ObjetivoSuplemento"[],
  'Reponen lo que perdés con el sudor en sesiones largas o con calor.',
  'Solo si entrenás mucho tiempo, con calor o sudás mucho. Una hora de pesas con aire acondicionado no los necesita.',
  'Durante el entrenamiento, según la etiqueta y la duración de la sesión. Mejor sin azúcar.',
  90, CURRENT_TIMESTAMP),
('sup_beta_alanina', 'beta-alanina', 'Beta-alanina',
  ARRAY['RENDIMIENTO']::"ObjetivoSuplemento"[],
  'Mejora el rendimiento en esfuerzos sostenidos de 1 a 4 minutos. Fuera de ese rango, aporta poco.',
  'Quien hace circuitos, intervalos o deportes con esfuerzos de ese tipo. Para el entrenamiento de fuerza típico, baja prioridad.',
  '3,2 a 6,4 g por día repartidos en varias tomas, durante 4 semanas o más: funciona por saturación, no tomándola solo el día que entrenás. El hormigueo en cara y manos es esperable e inofensivo.',
  89, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- ─── Links de afiliado ───────────────────────────────────────────────────────
-- Generados el 4/11/2026 desde la cuenta de afiliado IGZTRAINER de Mercado Libre
-- (etiqueta `goldenwalhalla`). Una opción por slug, elegida con el criterio de
-- content/suplementos/research.md: RNPA, monohidrato sin sabor, Creapure cuando
-- entra en presupuesto, EPA+DHA declarado, bisglicinato y no óxido.
-- El relevamiento completo, con las opciones descartadas, está en
-- content/suplementos/links-afiliados-cargados.md.
--
-- Ojo: los links de ML Argentina caen en el perfil social del afiliado
-- (mercadolibre.com.ar/social/goldenvalhalla) con el producto destacado y un
-- botón "Ir a producto". No hay opción de link directo en el programa.
--
-- Solo se cargan las fichas que todavía no tienen link, así no se pisa nada
-- cargado a mano desde /admin/suplementos.

UPDATE "Suplemento" AS s SET
  "marca"         = v."marca",
  "linkAfiliado"  = v."link",
  "precioArs"     = v."precio",
  "relevadoEn"    = CURRENT_TIMESTAMP,
  "activo"        = TRUE,
  "actualizadoEn" = CURRENT_TIMESTAMP
FROM (VALUES
  -- Lo básico
  ('balanza-cocina',  'Gadnic',         'https://meli.la/1zauWn6', 16999),
  ('balanza-personal','Silfab',         'https://meli.la/1KWJyYi', 26000),
  ('cinta-metrica',    NULL,            'https://meli.la/2tDdiFF', 20790),
  ('shaker',          'ENA Sport',      'https://meli.la/2cg2LnX', 17451),
  ('botella',         'MTL',            'https://meli.la/29c6HHD', 20360),
  -- Nivel 1
  ('creatina',        'ENA Sport',      'https://meli.la/2oZTAt3', 71200),
  ('whey',            'ENA Sport',      'https://meli.la/2FR9owa', 102000),
  ('vitamina-d',      'NOW',            'https://meli.la/1nxa4iA', 33000),
  ('omega-3',         'Vits',           'https://meli.la/2rB7hA5', 31999),
  -- Nivel 2
  ('colageno',        'WPN',            'https://meli.la/2NSpyL7', 30600),
  ('vitamina-c',      'Nature Made',    'https://meli.la/1xu4Jyt', 52283),
  ('magnesio',        'ENA Sport',      'https://meli.la/2aDaTvq', 17460),
  ('electrolitos',    'Vits',           'https://meli.la/2s38CMt', 42680),
  ('beta-alanina',    'Star Nutrition', 'https://meli.la/1FVecYD', 33099)
) AS v("slug", "marca", "link", "precio")
WHERE s."slug" = v."slug" AND s."linkAfiliado" IS NULL;
