# Suplementos — base de evidencia

> Documento fuente del motor de elección de suplementos.
> Última revisión: 2026-10-09.
>
> Esto no es una lista de productos para vender. Es el criterio con el que
> Re-Viva decide qué recomendar, qué recomendar solo a veces, y qué no
> recomendar nunca. El catálogo ejecutable vive en `src/lib/suplementos/catalogo.ts`.

---

## Principio rector

**El suplemento es el último 5%.** Si el cliente no duerme, no come suficiente proteína y no sostiene el plan tres semanas seguidas, ningún producto de esta lista le cambia el resultado. El motor tiene que decirlo explícitamente, no insinuarlo: recomendar creatina a alguien que duerme 5 horas es venderle humo caro.

Orden de prioridad real, en este orden:

1. Adherencia al plan
2. Proteína total del día
3. Sueño
4. Déficit o superávit calórico sostenido
5. **Recién acá**, suplementos

De ahí sale una regla dura del motor: **si el cliente no tiene balanza de cocina, esa es la primera recomendación, antes que cualquier suplemento.** Los planes de Re-Viva trabajan con gramajes exactos. Sin balanza, el plan es una estimación y los suplementos están tapando un agujero que no se tapa comprando.

---

## Niveles de evidencia

| Nivel | Qué significa | Cómo lo trata el motor |
|---|---|---|
| **1** | Respaldo sólido y consistente. Múltiples ensayos, position stands de sociedades científicas. | Se recomienda cuando el perfil lo justifica. |
| **2** | Contextual. Funciona en situaciones puntuales, o la evidencia es preliminar. | Solo si el perfil cumple la condición específica. Nunca por defecto. |
| **3** | Sin respaldo para lo que promete. | **No se recomienda nunca.** Se usa como contenido educativo. |

---

## Regla de seguridad: RNPA verificable

Antes de hablar de evidencia, hay que hablar de qué hay adentro del pote. En Argentina, ANMAT viene prohibiendo productos de creatina con números de RNE y RNPA **falsos o vencidos**: la marca NP en 2022, Wolf Nutrition por Disposición 6195/2025, y un lote de 18 suplementos retirados en noviembre de 2025.

Esto no es un detalle burocrático: un producto sin registro real es un polvo del que nadie controló ni la pureza ni la dosis.

**Regla del catálogo:** solo entran productos con RNPA vigente y verificable en el rótulo. Y el motor se lo enseña al cliente — "fijate que el pote tenga RNPA y que el número exista" es, por sí solo, contenido que lo diferencia de cualquier tienda de suplementos.

> **Pendiente de verificación:** no encontré registros oficiales confirmados de ENA, Star Nutrition, Gentech ni Xtrenght. Las marcas listadas abajo son las disponibles en el mercado argentino, **no marcas auditadas por nosotros**. Antes de poner un link de afiliado hay que chequear el RNPA de ese producto puntual.

---

## NIVEL 1 — Respaldo sólido

### Creatina monohidrato

Lo más costo-efectivo que existe. Si el cliente va a comprar una sola cosa, es esta.

- **Dosis:** 3–5 g por día, todos los días. Carga opcional de 0.3 g/kg/día durante 5–7 días si se quiere saturar rápido; sin carga llega al mismo lugar en 3–4 semanas.
- **Cuándo:** indistinto. Lo que importa es la constancia diaria, no la hora.
- **Evidencia:** el position stand de la ISSN la respalda en eficacia y seguridad, con ensayos de hasta 30 g/día por 5 años en poblaciones sanas y clínicas. La EFSA considera segura la toma diaria de 3 g de monohidrato de alta pureza en adultos sanos. No hay límite superior establecido.
- **Advertencias:** enfermedad renal o hepática, medicación crónica o menores de edad → consulta médica antes. El aumento de peso de la primera semana es agua intracelular, no grasa: hay que avisarlo o el cliente abandona.
- **Formato:** monohidrato y nada más. Las versiones "HCL", "kre-alkalyn" y demás cuestan más y no mostraron ser mejores.
- **Marcas en AR:** ENA, Star Nutrition, Gentech, Xtrenght.

### Proteína de suero (whey)

No es un suplemento mágico: es comida práctica. Sirve para llegar al número de proteína del día cuando la comida sola no alcanza.

- **Dosis:** la que falte para llegar al objetivo diario. El position stand de la ISSN ubica el rango en 1.4–2.0 g/kg/día para construir y mantener masa muscular; en déficit calórico y con entrenamiento de fuerza, el requerimiento sube.
- **Cuándo:** cuando convenga logísticamente. La "ventana anabólica" de 30 minutos no existe como se vendió.
- **Evidencia:** sólida, pero dirigida al total proteico del día — no al polvo en sí. Un cliente que ya llega a su proteína comiendo **no necesita whey**.
- **Advertencias:** intolerancia a la lactosa → aislado en vez de concentrado.
- **Marcas en AR:** ENA, Star Nutrition, Gentech.

### Cafeína

- **Dosis:** 3–6 mg/kg de peso corporal. Dosis cercanas a 9 mg/kg traen efectos adversos sin beneficio adicional.
- **Cuándo:** la práctica más usada es 60 minutos antes del entrenamiento. El position stand aclara que es lo habitual, no un óptimo demostrado, y que depende de la fuente (una goma de mascar actúa más rápido que una cápsula).
- **Evidencia:** ISSN 2021, uno de los ergogénicos mejor documentados.
- **Advertencia crítica, y esto el motor la tiene que aplicar sí o sí:** la vida media de la cafeína es de ~5 horas. **Si el cliente entrena de noche, no se recomienda cafeína.** Arruinarle el sueño para ganar un 2% de rendimiento es un pésimo negocio — el sueño es uno de los cuatro factores que están arriba del suplemento en la lista de prioridades. Por eso la pregunta del horario de entrenamiento es obligatoria en el quiz.
- **Nota:** el café sirve. No hace falta comprar cápsulas.

### Vitamina D

- **Dosis:** depende del valor en sangre. No se suplementa a ciegas.
- **Cuándo:** con una comida que tenga grasa.
- **Evidencia:** sólida para corregir déficit. El déficit es muy común en personas que trabajan puertas adentro y entrenan en gimnasio.
- **Cómo lo maneja el motor:** no recomienda una dosis. Recomienda **medir 25(OH)D** y, si está bajo, que la dosis la indique un profesional. Es la única postura defendible: la vitamina D es liposoluble y se acumula.

### Omega-3 (EPA + DHA)

- **Dosis:** 1–2 g/día de EPA + DHA combinados (ojo: es la suma de EPA y DHA, no los gramos totales de aceite del pote — muchos productos tienen bastante menos de lo que aparenta).
- **Cuándo:** con comida.
- **Evidencia:** sólida en salud cardiovascular y perfil inflamatorio; modesta en rendimiento.
- **A quién:** a quien no come pescado graso al menos dos veces por semana. Que en Argentina es casi todo el mundo.

---

## NIVEL 2 — Contextual

### Colágeno hidrolizado + vitamina C

Acá hay que ser honestos, porque es el suplemento donde más se exagera la evidencia.

- **Dosis:** 15 g + ~50 mg de vitamina C.
- **Cuándo:** 30–60 minutos antes de entrenar, idealmente antes de trabajo de carga sobre el tejido afectado.
- **Evidencia real:** el estudio de referencia es Shaw et al. 2017 (*Am J Clin Nutr*), el del protocolo Shaw & Baar. **Detalles que importan:** fueron **8 hombres**, usaron **gelatina** (no colágeno hidrolizado), y midieron un marcador sanguíneo de síntesis de colágeno más ligamentos cultivados en laboratorio. **No midieron tendones humanos.** El mecanismo es plausible y el protocolo es barato e inofensivo, pero llamarlo "evidencia moderada en tendón y ligamento" es estirarlo. Es preliminar.
- **Cómo lo comunica el motor:** "puede ayudar, es barato y no tiene contra; la carga progresiva bien dosificada es el tratamiento, esto es el accesorio".

### Magnesio

- **Dosis:** 200–400 mg/día, en citrato o bisglicinato (el óxido se absorbe mal y suele dar efecto laxante).
- **Cuándo:** noche.
- **Evidencia:** sólida para corregir una ingesta baja. Débil para la promesa con la que se vende — dormir mejor y menos calambres — en gente que ya tiene magnesio suficiente.
- **A quién:** dieta pobre en verduras de hoja, frutos secos y legumbres.

### Electrolitos

- **A quién:** sesiones largas, calor, o gente que suda mucho. Nada más.
- **Evidencia:** sólida en ese contexto, irrelevante fuera de él. Una sesión de pesas de 60 minutos en un gimnasio con aire acondicionado no necesita electrolitos.

### Beta-alanina

- **Dosis:** 3.2–6.4 g/día repartidos en varias tomas, sostenido 4 semanas o más. Es un suplemento de saturación: no sirve tomarlo el día que entrenás.
- **Evidencia:** sólida, pero para esfuerzos sostenidos de 1 a 4 minutos.
- **Por qué es nivel 2 acá:** el público de Re-Viva — hombres de más de 35 buscando bajar grasa y mejorar salud, y recomposición en general — casi nunca hace esfuerzos en ese rango. Es un gran suplemento para el deportista equivocado.
- **Advertencia:** la parestesia (hormigueo en cara y manos) es esperable e inofensiva, pero asusta si nadie la avisó.

---

## NIVEL 3 — Lo que NO recomendamos

Esta sección es contenido, no catálogo. Explicar bien por qué algo **no** sirve construye más autoridad que recomendar diez cosas que sí.

### BCAA

El suplemento más vendido con menos razón de ser. Los aminoácidos aislados estimulan la síntesis proteica **menos** que la proteína completa: tras entrenamiento de fuerza, el aumento con BCAA fue cerca de un 50% menor que con whey que aportaba la misma cantidad de BCAA. Agregar BCAA sobre una dosis suficiente de proteína no suma nada.

Buena parte de los estudios favorables comparaban contra grupos sin proteína y ni siquiera reportaban la ingesta proteica total de los participantes.

**Veredicto:** si el cliente llega a su proteína diaria, los BCAA son plata tirada. Esa plata, puesta en creatina, rinde infinitamente más.

### Glutamina

La evidencia buena está en pacientes críticos y postquirúrgicos, no en personas sanas que entrenan. En deportistas no hay respaldo suficiente para las promesas de inmunidad ni de anabolismo.

**Veredicto:** no para este público.

### Tribulus terrestris y "potenciadores de testosterona"

Una revisión sistemática de 2014 concluyó que es inefectivo para aumentar testosterona en humanos y que las afirmaciones de marketing no están sustentadas. Una revisión sistemática de 2025 sobre 10 estudios y 483 hombres encontró que 8 de 10 no mostraron cambios androgénicos significativos. Un metaanálisis del mismo año mostró mejora en función eréctil pero **sin diferencia en testosterona total**.

**Veredicto:** no sube la testosterona. Punto.

### L-carnitina y quemadores de grasa

Metaanálisis de 2016: ~1.3 kg más de pérdida de peso que el control, efecto que se achica cuanto más tiempo pasa. Metaanálisis de 2020 sobre 43 ensayos: baja peso, IMC y masa grasa, pero **sin cambio en porcentaje de grasa corporal ni en cintura**, y solo en personas con sobrepeso y siempre combinado con cambios de estilo de vida.

**Veredicto:** no quema grasa. El déficit calórico quema grasa.

---

## PROHIBIDO — Péptidos

**El motor no recomienda, no menciona y no linkea BPC-157, TB-500 ni ningún otro péptido.** Decisión cerrada por Lucas el 2026-10-07.

Motivos:

- No están aprobados por ANMAT, FDA ni ninguna agencia para uso humano.
- La FDA ubicó al BPC-157 en la categoría 2 de sustancias para formulación magistral, por riesgo de seguridad significativo.
- WADA los prohíbe, dentro y fuera de competencia.
- Lo que se consigue online viene de laboratorios sin control de pureza ni dosis.
- Recomendarlos desde el sitio equivale a indicar un fármaco no aprobado, fuera del alcance profesional de un entrenador en Argentina, con responsabilidad legal directa sobre Lucas.

**Si en una sesión futura aparece la idea de incluirlos bajo cualquier formato — catálogo, blog, FAQ, contenido educativo — la respuesta es no.**

---

## Rama de lesiones — regla de seguridad del motor

Orden obligatorio de preguntas:

1. ¿Tenés alguna lesión?
2. Si sí: **¿está gestionada médicamente?**

**Si NO está gestionada médicamente, el motor no recomienda nada y deriva a consulta profesional.** No hay excepción. Un entrenador recomendando suplementos sobre una lesión sin diagnóstico es exactamente el escenario que hay que evitar.

Si está gestionada y es de tejido conectivo (tendón, ligamento):

- Colágeno hidrolizado 15 g + vitamina C, 30–60 min antes de entrenar
- Omega-3, por el componente inflamatorio
- Creatina y proteína, que sostienen la carga de rehabilitación
- Vitamina D, si está baja

**Mensaje obligatorio en esa rama:** la carga progresiva bien dosificada es el tratamiento. El suplemento es accesorio.

---

## Elementos base

No son suplementos y son más importantes que los suplementos.

| Elemento | Por qué | Prioridad |
|---|---|---|
| **Balanza de cocina** | Los planes de Re-Viva trabajan con gramajes exactos, no con medidas caseras. Sin esto el plan es una estimación. | **1 — antes que cualquier suplemento** |
| Balanza personal | Seguimiento de progreso. Sirve la tendencia semanal, no el número del día. | 2 |
| Cinta métrica | Cuando el peso no se mueve pero el cuerpo sí. Clave en recomposición. | 3 |
| Shaker | Logística. Sin esto el whey se toma menos. | 4 |
| Botella | Hidratación, y es un recordatorio visible. | 5 |

---

## Cómo se conecta con el quiz

| Pregunta del quiz | Qué decide |
|---|---|
| 1. Edad | Vitamina D y proteína cobran más peso después de los 50 |
| 2. Tiempo entrenando | Principiante: creatina y poco más. El resto es ruido |
| 3. Frecuencia semanal | Volumen de entrenamiento |
| 4. Objetivo | Volumen / definición / recomposición |
| 5. **Horario de entrenamiento** | **Si entrena de noche, se bloquea la cafeína** |
| 6. Comidas por día y proteína aproximada | Define si hace falta whey. Si ya llega, no se recomienda |
| 7. **Lesiones → ¿gestionada? → ¿tejido conectivo?** | Rama de seguridad |
| 8. **¿Balanza de cocina?** | Si no tiene, es la recomendación número 1 |
| 9. ¿Balanza personal? | Seguimiento |
| 10. Presupuesto | Ordena por costo-beneficio: creatina primero, siempre |

---

## Pendientes

- [ ] Links de afiliados (Lucas)
- [ ] Verificar RNPA vigente de cada producto puntual antes de publicarlo
- [ ] Definir si el catálogo muestra precios o solo deriva al link

---

## Fuentes

- [ISSN position stand — creatina (Kreider et al., JISSN 2017)](https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0173-z)
- [ISSN position stand — cafeína y rendimiento (Guest et al., JISSN 2021)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7777221/)
- [ISSN position stand — proteína y ejercicio (Jäger et al., JISSN 2017)](https://doi.org/10.1186/s12970-017-0177-8)
- [Shaw et al. 2017 — gelatina + vitamina C y síntesis de colágeno (Am J Clin Nutr)](https://pubmed.ncbi.nlm.nih.gov/27852613/)
- [Metaanálisis BCAA y recuperación (Eur J Nutr, 2021)](https://link.springer.com/article/10.1007/s00394-021-02710-0)
- [Cochrane — glutamina en pacientes críticos](https://www.cochrane.org/CD010050)
- [Revisión sistemática Tribulus terrestris (2014)](https://pubmed.ncbi.nlm.nih.gov/24559105/)
- [Revisión sistemática Tribulus, testosterona y función eréctil (2025)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11990417/)
- [Metaanálisis L-carnitina y pérdida de peso (2016)](https://pubmed.ncbi.nlm.nih.gov/27335245/)
- [Metaanálisis L-carnitina, 43 ECA (2020)](https://pubmed.ncbi.nlm.nih.gov/31743774/)
- [Examine — L-carnitina](https://examine.com/supplements/l-carnitine/)
- [ANMAT prohibió creatina de Wolf Nutrition — Disposición 6195/2025](https://radio3cadenapatagonia.com.ar/anmat-prohibio-un-suplemento-de-creatina-por-irregularidades/)
- [ANMAT prohibió 18 suplementos dietarios (noviembre 2025)](https://www.diariodecuyo.com.ar/argentina/anmat-prohibio-18-suplementos-dietarios-cuales-son-y-por-que-pueden-ser-peligrosos-para-la-salud-1794911.html)
- [ANMAT prohibió suplementos marca NP (2022)](https://www.lanacion.com.ar/sociedad/la-anmat-prohibio-un-suplemento-utilizado-para-el-crecimiento-de-la-masa-muscular-nid14112022/)
