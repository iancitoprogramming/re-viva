// Genera las plantillas DOCX de los dos entregables con marca Re-Viva:
//   docs/plantillas/Plantilla-Entrenamiento.docx
//   docs/plantillas/Plantilla-Nutricion.docx
//
// Uso:  npx tsx scripts/generar-plantillas-docx.ts
//
// Las plantillas traen la estructura de secciones lista para completar con los
// datos de cada cliente. Convenciones:
//   {{campo}}      → dato del cliente / del plan (reemplazar)
//   ✎ texto gris   → instrucción para quien arma el documento (borrar al final)
// Lo que NO depende del cliente (cómo pesar, conservación, comer afuera,
// escalera de servicio, legales) ya viene escrito.

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import {
  AlignmentType, BorderStyle, Document, ExternalHyperlink, Footer, Packer, PageBreak,
  Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType, convertInchesToTwip,
} from 'docx'
import { TEXTOS_LEGALES, getProteccionDatos } from '../src/lib/legal/textosObligatorios'
import {
  PRECIO_GESTION_COMPRA, SITE_URL, WHATSAPP_COMPRA_DFY, WHATSAPP_VIDEOLLAMADA,
} from '../src/lib/constants'

// ─── Marca ────────────────────────────────────────────────────────────────────
const C = { gold: 'C9A84C', goldLight: 'F6EFD9', dark: '0A0A08', green: '1B3D2F', gray: '8A8A80' }
const FONT_HEADING = 'Georgia'
const FONT_BODY = 'Calibri'

// ─── Helpers ──────────────────────────────────────────────────────────────────
type Run = string | TextRun | ExternalHyperlink

function runs(partes: Run[]): (TextRun | ExternalHyperlink)[] {
  return partes.map(r => (typeof r === 'string' ? textoConCampos(r) : [r])).flat()
}

// Resalta {{campos}} en dorado para que se vean al completar
function textoConCampos(t: string): TextRun[] {
  return t.split(/(\{\{[^}]+\}\})/g).filter(Boolean).map(parte =>
    parte.startsWith('{{')
      ? new TextRun({ text: parte, bold: true, color: C.gold, font: FONT_BODY, size: 22 })
      : new TextRun({ text: parte, font: FONT_BODY, size: 22, color: C.dark }))
}

const p = (...partes: Run[]) => new Paragraph({ spacing: { after: 120 }, children: runs(partes) })
const vineta = (...partes: Run[]) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: runs(partes) })
const negrita = (t: string) => new TextRun({ text: t, bold: true, font: FONT_BODY, size: 22, color: C.dark })
const link = (texto: string, href: string) => new ExternalHyperlink({
  link: href,
  children: [new TextRun({ text: texto, style: 'Hyperlink', font: FONT_BODY, size: 22, color: C.green, underline: {} })],
})

const nota = (t: string) => new Paragraph({
  spacing: { after: 120 },
  children: [new TextRun({ text: `✎ ${t}`, italics: true, color: C.gray, font: FONT_BODY, size: 18 })],
})

const h1 = (t: string) => new Paragraph({
  spacing: { before: 360, after: 160 },
  border: { bottom: { color: C.gold, size: 6, style: BorderStyle.SINGLE, space: 4 } },
  children: [new TextRun({ text: t, bold: true, color: C.gold, font: FONT_HEADING, size: 32 })],
})
const h2 = (t: string) => new Paragraph({
  spacing: { before: 240, after: 100 },
  children: [new TextRun({ text: t, bold: true, color: C.green, font: FONT_HEADING, size: 24 })],
})

const salto = () => new Paragraph({ children: [new PageBreak()] })

function tabla(encabezados: string[], filas: string[][]): Table {
  const celda = (t: string, header = false) => new TableCell({
    shading: header ? { type: ShadingType.CLEAR, color: 'auto', fill: C.goldLight } : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [new Paragraph({
      children: header
        ? [new TextRun({ text: t, bold: true, font: FONT_BODY, size: 20, color: C.dark })]
        : textoConCampos(t).map(r => r),
    })],
  })
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: encabezados.map(e => celda(e, true)) }),
      ...filas.map(f => new TableRow({ children: f.map(t => celda(t)) })),
    ],
  })
}

function portada(titulo: string, bajada: string, datos: [string, string][]): Paragraph[] {
  return [
    new Paragraph({ spacing: { before: 2400, after: 120 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'REVIVA', bold: true, color: C.gold, font: FONT_HEADING, size: 72 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
      children: [new TextRun({ text: 'by IGZ Trainer', color: C.gray, font: FONT_BODY, size: 20 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
      children: [new TextRun({ text: titulo, bold: true, color: C.dark, font: FONT_HEADING, size: 44 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
      children: [new TextRun({ text: bajada, italics: true, color: C.green, font: FONT_BODY, size: 24 })] }),
    ...datos.map(([k, v]) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
      children: [new TextRun({ text: `${k}: `, color: C.gray, font: FONT_BODY, size: 22 }), ...textoConCampos(v)] })),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 800 },
      children: [new TextRun({ text: 'Controlá tu cuerpo, controlá tu vida.', italics: true, color: C.gold, font: FONT_HEADING, size: 22 })] }),
    salto(),
  ]
}

function legales(bloques: string[]): Paragraph[] {
  return [
    salto(),
    h1('Legales'),
    ...bloques.flatMap(texto => texto.split('\n\n').map(par => new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: par.replace(/\n/g, ' '), font: FONT_BODY, size: 16, color: '3D3D3D' })],
    }))),
  ]
}

function documento(children: (Paragraph | Table)[]): Document {
  return new Document({
    creator: 'Re-Viva · IGZ Trainer',
    styles: { default: { document: { run: { font: FONT_BODY, size: 22 } } } },
    sections: [{
      properties: { page: { margin: {
        top: convertInchesToTwip(0.9), bottom: convertInchesToTwip(0.9),
        left: convertInchesToTwip(1), right: convertInchesToTwip(1),
      } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: TEXTOS_LEGALES.pieDePagina, color: C.gray, font: FONT_BODY, size: 14 })] })] }) },
      children,
    }],
  })
}

// ─── ENTRENAMIENTO ────────────────────────────────────────────────────────────
function plantillaEntrenamiento(): Document {
  return documento([
    ...portada('Plan de Entrenamiento', '{{nombre de la oferta}}', [
      ['Para', '{{nombre}}'], ['Objetivo', '{{objetivo}}'], ['Inicio', '{{fecha de inicio}}'],
      ['Duración', '{{N}} semanas'], ['Días y horario', '{{días}} · {{mañana/mediodía/tarde/noche}}'],
    ]),

    h1('1. Tu objetivo y cuándo lo vas a ver'),
    p(negrita('Lo que querés: '), '{{resultado soñado, con sus palabras del cuestionario}}'),
    p(negrita('Lo que vamos a medir: '), '{{peso promedio semanal / cintura / carga en ejercicio clave}}'),
    tabla(['Cuándo', 'Qué vas a notar'], [
      ['Semana 1–2', 'Más energía y mejor descanso. La rutina ya es parte de tu semana. Aprendés la técnica.'],
      ['Semana 3–4', 'Subís cargas o repeticiones. La ropa empieza a calzar distinto.'],
      ['Semana 8', 'Cambio visible en las fotos.'],
      ['Semana 12', '{{resultado esperado según objetivo: definición −0,5 a −1% del peso por semana · volumen +0,25 a 0,5% · recomposición: mismo peso, menos cintura, más fuerza}}'],
    ]),

    h1('2. Tu semana'),
    nota('3 días → FBEOD con DUP (A Fuerza / B Hipertrofia / C Metabólico). Domingo "siempre" → rotar incluyendo domingo; "a veces" o "no" → Lun/Mié/Vie. Sin gimnasio el domingo → nunca proponer domingo.'),
    tabla(['Día', 'Sesión', 'Foco', 'Duración'], [
      ['{{Lunes}}', 'Día A', 'Fuerza', '{{min}}'],
      ['{{Miércoles}}', 'Día B', 'Hipertrofia', '{{min}}'],
      ['{{Viernes}}', 'Día C', 'Metabólico', '{{min}}'],
    ]),
    p(negrita('Horario: '), '{{horario confirmado}}. Las comidas pre y post entreno están ubicadas en tu Documento de Nutrición según este horario.'),

    h1('3. Cómo leer tu rutina'),
    vineta(negrita('Series × reps: '), '3 × 8 = 3 tandas de 8 repeticiones.'),
    vineta(negrita('RIR: '), 'repeticiones que te quedan "en el tanque" al terminar la serie. RIR 2 = podrías haber hecho 2 más.'),
    vineta(negrita('Descanso: '), 'entre series del mismo ejercicio. Usá el cronómetro del celular.'),
    vineta(negrita('Técnica antes que peso: '), 'si la técnica se rompe, bajá la carga.'),

    h1('4. Entrada en calor (siempre, 6–8 min)'),
    nota('Ajustar a lesiones declaradas.'),
    vineta('{{2–3 min de cardio suave (bici, remo o caminata inclinada)}}'),
    vineta('{{movilidad de cadera, hombros y columna torácica}}'),
    vineta('{{2 series de aproximación del primer ejercicio con poco peso}}'),

    h1('5. Tus sesiones'),
    nota('Cada sesión cubre los 4 patrones: empuje, tracción, bisagra de cadera y sentadilla. En recomposición: máximo 16–20 series totales por sesión. "Cómo" = 1 línea, lo justo para hacerlo bien.'),
    ...['Día A — Fuerza', 'Día B — Hipertrofia', 'Día C — Metabólico'].flatMap(dia => [
      h2(dia),
      tabla(['Ejercicio', 'Series × reps', 'Descanso', 'RIR', 'Cómo'], [
        ['{{ejercicio}}', '{{3 × 5}}', '{{2–3 min}}', '{{2}}', '{{clave técnica en 1 línea + link a video}}'],
        ['{{ejercicio}}', '{{}}', '{{}}', '{{}}', '{{}}'],
        ['{{ejercicio}}', '{{}}', '{{}}', '{{}}', '{{}}'],
        ['{{ejercicio}}', '{{}}', '{{}}', '{{}}', '{{}}'],
        ['{{ejercicio}}', '{{}}', '{{}}', '{{}}', '{{}}'],
      ]),
    ]),

    h1('6. Progresión semana a semana'),
    nota('Bloques de 4 semanas. Repetir el bloque cambiando variantes de ejercicio, o ajustar según check-ins.'),
    tabla(['Semana', 'Qué cambia', 'RIR'], [
      ['1', 'Aprendés la técnica con cargas cómodas. Anotá todos los pesos.', '3'],
      ['2', 'Mismo peso, +1 repetición por serie.', '2'],
      ['3', 'Subí la carga 2,5–5% (o +2 kg en tren inferior).', '1–2'],
      ['4', 'Descarga: mismo peso, la mitad de las series. Recuperás y volvés más fuerte.', '3'],
    ]),
    p(negrita('Regla simple: '), 'si completás todas las series en el tope del rango de reps con buena técnica, la próxima sesión subís el peso.'),

    h1('7. Checkpoints de progreso'),
    p('Pesate 3 veces por semana, en ayunas, después del baño. Lo que vale es el promedio de la semana, no un día.'),
    tabla(['Control', 'Peso promedio', 'Cintura (cm)', '{{ejercicio clave}} (kg × reps)', 'Fotos'], [
      ['Inicio', '', '', '', '☐'], ['Semana 2', '', '', '', ''], ['Semana 4', '', '', '', '☐'],
      ['Semana 8', '', '', '', '☐'], ['Semana 12', '', '', '', '☐'],
    ]),
    p(negrita('Es normal: '), 'que la balanza suba 0,5–1 kg de un día al otro por agua o sal. Si el promedio de 2 semanas no se mueve, lo ajustamos en el check-in.'),

    h1('8. Si pasa algo'),
    vineta(negrita('Te salteaste un día: '), 'seguí con la sesión que tocaba. No dobles.'),
    vineta(negrita('Te duele algo (dolor punzante, no cansancio): '), 'cortá ese ejercicio y avisá en el check-in.'),
    vineta(negrita('No hay una máquina: '), '{{alternativa por patrón: ej. prensa → sentadilla goblet}}'),
    vineta(negrita('Poco tiempo: '), 'hacé los 2 primeros ejercicios completos. Algo siempre es mejor que nada.'),

    h1('9. Tu check-in semanal (2 minutos)'),
    p('Cada {{día}} mandá por WhatsApp: peso promedio, cintura (cada 2 semanas), cómo te sentiste entrenando (1 a 10) y si cumpliste las sesiones.'),

    ...legales([
      TEXTOS_LEGALES.disclaimerProfesional, TEXTOS_LEGALES.descargoResponsabilidad,
      TEXTOS_LEGALES.propiedadIntelectual, getProteccionDatos(),
    ]),
  ])
}

// ─── NUTRICIÓN ────────────────────────────────────────────────────────────────
function plantillaNutricion(): Document {
  const precioCompra = `$${PRECIO_GESTION_COMPRA.toLocaleString('es-AR')}`
  return documento([
    ...portada('Plan de Nutrición', '{{nombre de la oferta}}', [
      ['Para', '{{nombre}}'], ['Objetivo', '{{objetivo}}'], ['Inicio', '{{fecha de inicio}}'],
      ['Duración', '{{N}} semanas'], ['Entrena', '{{mañana/mediodía/tarde/noche}}'],
    ]),

    h1('1. Tus números'),
    tabla(['Calorías', 'Proteína', 'Hidratos', 'Grasas', 'Comidas'], [
      ['{{kcal}}', '{{g}} g', '{{g}} g', '{{g}} g', '{{N}} por día'],
    ]),
    p('No tenés que contar nada: las cantidades de cada comida ya están calculadas. Solo pesá.'),

    h1('2. Cómo pesar (regla fija)'),
    tabla(['Alimento', 'Cómo se pesa'], [
      ['Carnes, pollo, pescado', 'COCIDOS, sin hueso ni piel. El peso cambia según la cocción: pesá lo que vas a comer.'],
      ['Arroz, fideos, avena, quinoa, legumbres secas', 'CRUDOS (en seco).'],
      ['Papa, batata, calabaza', 'CRUDAS y peladas.'],
      ['Huevos', 'Por unidad (no se pesan).'],
      ['Atún, legumbres en lata', 'Escurridos.'],
      ['Pan, galletas de arroz, lácteos', 'Tal cual se compran.'],
      ['Fruta', 'Sin cáscara ni carozo, o por unidad si así está indicado.'],
      ['Aceite', 'En la balanza, sobre la comida (tara en cero y volcás). Cuenta siempre.'],
    ]),
    p(negrita('Con meal prep: '), 'pesá el total cocido de cada preparación y dividilo en porciones iguales. Pesás una vez, comés toda la semana.'),
    p('Nada de "un puñado" o "una palma" en casa: balanza de cocina siempre. Las medidas a ojo son solo para cuando comés afuera (sección 7).'),

    h1('3. Tu día tipo'),
    nota('Ubicar pre y post entreno según el horario. Mañana: pre = algo liviano 60–90 min antes (fruta + yogur), post = desayuno completo. Mediodía: pre = colación de media mañana, post = almuerzo. Tarde: pre = merienda 1–2 h antes, post = cena. Noche: pre = merienda reforzada, post = cena con proteína e hidratos (no sacar los hidratos por la hora).'),
    h2('Día de entrenamiento'),
    tabla(['Comida', 'Hora', 'Alimento', 'Gramos', 'Nota'], [
      ['Desayuno', '{{hh:mm}}', '{{alimento}}', '{{g}}', ''],
      ['{{Pre entreno}}', '{{hh:mm}}', '{{alimento}}', '{{g}}', '{{X min antes de entrenar}}'],
      ['{{Post entreno}}', '{{hh:mm}}', '{{alimento}}', '{{g}}', '{{dentro de las 2 h}}'],
      ['{{Comida}}', '{{hh:mm}}', '{{alimento}}', '{{g}}', ''],
    ]),
    h2('Día de descanso'),
    nota('Mismas comidas sin pre/post, o con menos hidratos si el objetivo es definición.'),
    tabla(['Comida', 'Hora', 'Alimento', 'Gramos', 'Nota'], [
      ['{{Comida}}', '{{hh:mm}}', '{{alimento}}', '{{g}}', ''],
    ]),
    h2('Cambios permitidos'),
    tabla(['Si no tenés…', 'Usá…', 'Cantidad'], [
      ['{{pollo 150 g cocido}}', '{{carne magra / pescado}}', '{{g}}'],
      ['{{arroz 70 g crudo}}', '{{fideos / papa}}', '{{g}}'],
    ]),

    h1('4. Suplementación'),
    nota('Antes de cerrar el documento: pedirle a Ian el link de afiliado de cada producto (con el nombre exacto) y cargarlo en /admin/suplementos. Después usar "Copiar link para el documento".'),
    tabla(['Suplemento', 'Para qué', 'Cuándo', 'Cuánto', 'Dónde comprarlo'], [
      ['{{Creatina monohidrato}}', '{{fuerza y masa muscular}}', '{{todos los días, con una comida}}', '{{5 g}}', '{{link del catálogo}}'],
    ]),
    p('Ninguno es obligatorio. Catálogo completo: ', link('revivabyigz.com/suplementos', `${SITE_URL}/suplementos`), '. Algunos links son de afiliado.'),

    h1('5. Lista de compras'),
    p('Una por semana. Cantidades totales de la semana, como se compran (en crudo). Te llega también por mail.'),
    ...[1, 2, 3, 4].flatMap(n => [
      h2(`Semana ${n}`),
      tabla(['Categoría', 'Producto', 'Cantidad'], [
        ['Proteínas', '{{producto}}', '{{g / unidades}}'],
        ['Carbohidratos', '{{producto}}', '{{g}}'],
        ['Verduras', '{{producto}}', '{{g / unidades}}'],
        ['Frutas', '{{producto}}', '{{g / unidades}}'],
        ['Lácteos', '{{producto}}', '{{g / ml}}'],
        ['Almacén', '{{producto}}', '{{g / ml}}'],
        ['Suplementos', '{{producto}}', '{{g / medidas}}'],
      ]),
    ]),
    nota('Agregar una tabla por cada semana del plan. Pegar la misma lista en /admin/cliente/[id]/compras para mandarla por mail.'),

    h1('6. Meal prep: la semana resuelta en {{1 o 2}} sesiones'),
    nota('2 sesiones (ej. domingo y miércoles) si cocina; 1 sesión si eligió "una"; si "no cocino", reducir a lo mínimo y reforzar la sección 7 y el nivel 3 de la escalera.'),
    h2('Sesión 1 — {{domingo}} (≈ {{90}} min)'),
    tabla(['Orden', 'Qué', 'Cantidad', 'Cómo y cuánto tiempo'], [
      ['1', '{{Prender horno 200 °C · papas/batatas en cubos}}', '{{g crudo}}', '{{35–40 min}}'],
      ['2', '{{Arroz}}', '{{g crudo}}', '{{18 min, mientras se hace el horno}}'],
      ['3', '{{Pollo a la plancha}}', '{{g}}', '{{6–7 min por lado}}'],
      ['4', '{{Huevos duros}}', '{{N}}', '{{10 min + agua fría}}'],
      ['5', 'Enfriar y porcionar', '{{N}} táperes', 'Pesar el total cocido y dividir en partes iguales'],
    ]),
    h2('Sesión 2 — {{miércoles}} (≈ {{45}} min)'),
    tabla(['Orden', 'Qué', 'Cantidad', 'Cómo y cuánto tiempo'], [
      ['1', '{{}}', '{{}}', '{{}}'],
    ]),
    h2('Cuánto dura cada cosa'),
    tabla(['Preparación', 'Heladera', 'Freezer', 'Cómo recalentar'], [
      ['Carnes y pollo cocidos', '3–4 días', '2–3 meses', 'Microondas tapado o sartén'],
      ['Pescado cocido', '2–3 días', '1–2 meses', 'Microondas a potencia media'],
      ['Arroz y fideos cocidos', '3–4 días (enfriar rápido, antes de 2 h)', '1–2 meses', 'Microondas con un chorrito de agua'],
      ['Legumbres cocidas', '3–5 días', '3 meses', 'Microondas o en la sartén'],
      ['Verduras asadas o hervidas', '3–4 días', '1–2 meses', 'Horno o sartén'],
      ['Huevos duros (con cáscara)', '7 días', 'No', 'Se comen fríos'],
      ['Papa y batata cocidas', '3–4 días', 'Mejor no (cambian de textura)', 'Horno o airfryer'],
    ]),
    p(negrita('Regla: '), 'lo que vas a comer de jueves en adelante, al freezer el día que cocinás. Pasalo a la heladera la noche anterior.'),

    h1('7. Guía para comer afuera'),
    nota('Incluir solo si come afuera 3 o más veces por semana (o si lo pidió). Dejar solo los lugares que marcó en el cuestionario.'),
    p('Acá sí podés calcular a ojo: ', negrita('proteína = la palma de tu mano'), ' (≈ 120–150 g cocido) · ', negrita('hidratos = tu puño'), ' · ', negrita('verduras = 2 puños'), ' · ', negrita('grasas = tu pulgar'), '.'),
    tabla(['Lugar', 'Pedí', 'Evitá'], [
      ['Parrilla', 'Lomo, bife angosto, peceto o pollo + ensalada o verduras grilladas. Papa o batata si tu plan tiene hidratos en esa comida.', 'Achuras, chorizo, morcilla, provoleta y la panera.'],
      ['Pizzería', '2 porciones de pizza de masa fina con verduras + ensalada, o 2 empanadas al horno de carne o pollo.', 'Fainá, fugazzeta rellena, empanadas fritas.'],
      ['Sushi', '10–12 piezas: sashimi, nigiri y rolls simples (salmón, palta).', 'Rolls con queso crema, tempura y salsas dulces (teriyaki, agridulce).'],
      ['Rotisería', 'Pollo al spiedo sin piel + ensalada o verduras.', 'Papas fritas, milanesas fritas, tartas.'],
      ['Delivery', 'Bowls o ensaladas con proteína (pollo, atún, huevo), wraps. Aderezo aparte.', 'Combos con fritura y gaseosa.'],
      ['Comida rápida', 'Hamburguesa simple sin cheddar ni bacon, papas chicas o sin papas, bebida zero.', 'Doble o triple, combos agrandados.'],
      ['Kiosco / estación de servicio', 'Yogur proteico, barrita con más de 15 g de proteína, fruta, maní sin sal (porción chica), agua.', 'Alfajores, galletitas, bebidas azucaradas.'],
      ['Comedor del trabajo', 'El plato con más proteína visible + verduras; hidratos del tamaño de tu puño.', 'Repetir, y el postre todos los días.'],
    ]),
    h2('Sin cocina: qué comprar en el súper'),
    p('Pollo rostizado, atún al natural, huevos duros, queso magro, yogur, pan integral o galletas de arroz, fruta, ensaladas listas.'),
    h2('Cómo ajustar el día'),
    vineta('Comé afuera esa comida y seguí el plan en las demás. No compenses salteando comidas.'),
    vineta('Si te pasaste, mañana volvés al plan normal. Sin castigo, sin ayuno.'),

    h1('8. ¿Cómo querés resolver la compra?'),
    tabla(['Nivel', 'Qué incluye', 'Costo'], [
      ['1. Hacelo vos', 'Lista de compras, guía de meal prep y guía para comer afuera.', 'Sin costo extra'],
      ['2. Lo hacemos juntos', 'Videollamada para armar la compra o resolver dudas del plan.', 'Sin costo extra'],
      ['3. Lo hago por vos', 'Ian arma y hace tu compra en Coto Digital o el súper online que prefieras.', `${precioCompra} por compra + mercadería y envío`],
    ]),
    p(negrita('Lo hacemos juntos: '), link('agendá tu videollamada', WHATSAPP_VIDEOLLAMADA), '.'),
    p(negrita('Lo hago por vos: '), link('pedí tu compra por WhatsApp', WHATSAPP_COMPRA_DFY), '. Te pido dirección, un horario en el que puedas recibir y los datos de la tarjeta para el pago.'),
    p(negrita('Importante: '), 'al recibir el pedido, el titular de la tarjeta tiene que estar presente y mostrar su DNI junto con la tarjeta física con la que se pagó. Si no, el supermercado no entrega la mercadería.'),

    ...legales([
      TEXTOS_LEGALES.disclaimerProfesional, TEXTOS_LEGALES.disclaimerNutricional,
      TEXTOS_LEGALES.disclaimerAfiliados, TEXTOS_LEGALES.descargoResponsabilidad,
      TEXTOS_LEGALES.propiedadIntelectual, getProteccionDatos(),
    ]),
  ])
}

async function main() {
  const destino = path.join(__dirname, '..', 'docs', 'plantillas')
  mkdirSync(destino, { recursive: true })
  for (const [nombre, doc] of [
    ['Plantilla-Entrenamiento.docx', plantillaEntrenamiento()],
    ['Plantilla-Nutricion.docx', plantillaNutricion()],
  ] as const) {
    writeFileSync(path.join(destino, nombre), await Packer.toBuffer(doc))
    console.log(`✓ docs/plantillas/${nombre}`)
  }
}

main()
