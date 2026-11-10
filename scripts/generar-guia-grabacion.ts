// Genera la guía de grabación de ejercicios, ordenada por estación:
//   docs/Guia-Grabacion-Ejercicios.docx
//
// Uso:  npx tsx scripts/generar-guia-grabacion.ts
//
// Sale del mismo catálogo que la biblioteca web (src/lib/ejercicios/catalogo.ts):
// si se agrega un ejercicio ahí, se regenera la guía y queda en el mismo orden
// que /admin/ejercicios.

import { writeFileSync } from 'node:fs'
import path from 'node:path'
import {
  AlignmentType, BorderStyle, Document, Footer, PageNumber, PageOrientation, Packer,
  Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType, convertInchesToTwip,
} from 'docx'
import { EJERCICIOS, ESTACIONES, nombreArchivo } from '../src/lib/ejercicios/catalogo'

const C = { gold: 'C9A84C', goldLight: 'F6EFD9', dark: '0A0A08', green: '1B3D2F', gray: '6F6F66' }
const TITULOS = 'Georgia'
const CUERPO = 'Calibri'

const t = (text: string, o: { bold?: boolean; color?: string; size?: number; italics?: boolean; font?: string } = {}) =>
  new TextRun({ text, font: o.font ?? CUERPO, size: o.size ?? 21, color: o.color ?? C.dark, bold: o.bold, italics: o.italics })

const p = (...hijos: TextRun[]) => new Paragraph({ spacing: { after: 110 }, children: hijos })
const vineta = (...hijos: TextRun[]) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 50 }, children: hijos })
const h1 = (texto: string, saltoAntes = false) => new Paragraph({
  pageBreakBefore: saltoAntes,
  keepNext: true,
  spacing: { before: 200, after: 120 },
  border: { bottom: { color: C.gold, size: 6, style: BorderStyle.SINGLE, space: 4 } },
  children: [t(texto, { bold: true, color: C.green, size: 30, font: TITULOS })],
})

// Anchos en DXA sobre 14.400 de ancho útil (carta apaisada con márgenes de 0,5")
const ANCHOS = [520, 760, 3200, 4420, 3500, 2000]
const ENCABEZADOS = ['✓', 'Cód.', 'Ejercicio', 'Decí en cámara', 'Mostrá el error', 'Tomas']

function celda(hijos: TextRun[], ancho: number, header = false, centrado = false): TableCell {
  return new TableCell({
    width: { size: ancho, type: WidthType.DXA },
    shading: header ? { type: ShadingType.CLEAR, color: 'auto', fill: C.goldLight } : undefined,
    margins: { top: 70, bottom: 70, left: 90, right: 90 },
    children: [new Paragraph({ alignment: centrado ? AlignmentType.CENTER : AlignmentType.LEFT, children: hijos })],
  })
}

function tablaEstacion(numero: number): Table {
  const estacion = ESTACIONES[numero - 1]
  return new Table({
    width: { size: ANCHOS.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: ANCHOS,
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: ENCABEZADOS.map((e, i) => celda([t(e, { bold: true, size: 19 })], ANCHOS[i], true, i < 2 || i === 5)),
      }),
      ...estacion.ejercicios.map(e => new TableRow({
        cantSplit: true,
        children: [
          celda([t('☐', { size: 28 })], ANCHOS[0], false, true),
          celda([t(e.codigo, { bold: true, color: C.green, size: 20 })], ANCHOS[1], false, true),
          celda([t(e.nombre, { bold: true, size: 20 })], ANCHOS[2]),
          celda([t(e.clave, { size: 19 })], ANCHOS[3]),
          celda([t(e.error, { size: 19, color: C.gray })], ANCHOS[4]),
          celda([t('Frente ☐  Perfil ☐', { size: 17, color: C.gray })], ANCHOS[5], false, true),
        ],
      })),
    ],
  })
}

function guia(): Document {
  const total = EJERCICIOS.length
  const ejemplo = ESTACIONES[2].ejercicios[1]

  const intro: (Paragraph | Table)[] = [
    new Paragraph({ spacing: { before: 200, after: 40 }, children: [t('REVIVA', { bold: true, color: C.gold, size: 52, font: TITULOS })] }),
    new Paragraph({ spacing: { after: 60 }, children: [t('Guía de grabación de ejercicios', { bold: true, size: 36, font: TITULOS })] }),
    new Paragraph({ spacing: { after: 260 }, children: [
      t(`${total} ejercicios en ${ESTACIONES.length} estaciones. Grabás todo lo de una estación y pasás a la siguiente.`, { color: C.green, size: 24, italics: true }),
    ] }),

    h1('Cómo grabar cada ejercicio'),
    vineta(t('Formato: ', { bold: true }), t('vertical (9:16), a 1080p y 30 cuadros. Teléfono en trípode, a la altura de la cadera, cuerpo entero en cuadro.')),
    vineta(t('Dos tomas por ejercicio: ', { bold: true }), t('una de frente y una de perfil. En las de espalda (remos, jalones, dominadas), cambiá "frente" por "de atrás".')),
    vineta(t('Estructura de cada toma (20 a 40 segundos): ', { bold: true }), t('decís el nombre del ejercicio, hacés 3 o 4 repeticiones lentas diciendo la clave, mostrás el error una vez y lo corregís.')),
    vineta(t('Sin música. ', { bold: true }), t('Si hay ruido en el gimnasio no importa: después se le pone la voz encima.')),
    vineta(t('Carga liviana. ', { bold: true }), t('Lo que se tiene que ver es la técnica, no el peso.')),
    vineta(t('Misma ropa y mismo encuadre ', { bold: true }), t('en toda la sesión, así la biblioteca se ve pareja.')),

    h1('Cómo nombrar los archivos'),
    p(t('Cada ejercicio tiene un código: el primer número es la estación y el segundo el orden. Nombrá el archivo con el código, el nombre y la toma:')),
    p(t(`${nombreArchivo(ejemplo)}-frente.mp4`, { bold: true, color: C.green }), t('   y   '), t(`${nombreArchivo(ejemplo)}-perfil.mp4`, { bold: true, color: C.green })),
    p(t('Si no querés renombrar en el momento, antes de cada ejercicio mostrale a la cámara el código con los dedos o decilo en voz alta. Con eso alcanza para ordenarlos después.')),

    h1('Después de grabar'),
    vineta(t('Subí cada video a YouTube como '), t('No listado', { bold: true }), t('. Con una sola toma por ejercicio alcanza para la biblioteca: usá la que mejor muestre la clave.')),
    vineta(t('Pegá el link en '), t('/admin/ejercicios', { bold: true }), t(', que está en este mismo orden.')),
    vineta(t('El link de cada ejercicio para los documentos de los clientes sale de ahí, con el botón "Copiar link".')),
    vineta(t('La segunda toma y los descartes quedan como material para Instagram y TikTok.')),

    h1('Recorrido', true),
    new Table({
      width: { size: 9000, type: WidthType.DXA },
      columnWidths: [700, 4300, 1400, 2600],
      rows: [
        new TableRow({ tableHeader: true, children: [
          celda([t('N.º', { bold: true, size: 19 })], 700, true, true),
          celda([t('Estación', { bold: true, size: 19 })], 4300, true),
          celda([t('Ejercicios', { bold: true, size: 19 })], 1400, true, true),
          celda([t('Tiempo estimado', { bold: true, size: 19 })], 2600, true, true),
        ] }),
        ...ESTACIONES.map(e => new TableRow({ cantSplit: true, children: [
          celda([t(String(e.numero), { bold: true, color: C.green })], 700, false, true),
          celda([t(e.nombre)], 4300),
          celda([t(String(e.ejercicios.length))], 1400, false, true),
          celda([t(`${Math.ceil(e.ejercicios.length * 2.5 / 5) * 5} min`)], 2600, false, true),
        ] })),
        new TableRow({ children: [
          celda([t('')], 700),
          celda([t('Total', { bold: true })], 4300),
          celda([t(String(total), { bold: true })], 1400, false, true),
          celda([t(`${Math.round(total * 2.5 / 60 * 2) / 2} h aprox.`, { bold: true })], 2600, false, true),
        ] }),
      ],
    }),
    p(t('')),
    p(t('Tiempo calculado a 2 minutos y medio por ejercicio, con las dos tomas. Conviene partirlo en dos o tres sesiones.', { color: C.gray, size: 19, italics: true })),
  ]

  const estaciones = ESTACIONES.flatMap(e => [
    h1(`Estación ${e.numero} · ${e.nombre}`, true),
    new Paragraph({ keepNext: true, spacing: { after: 140 }, children: [
      t('Tené a mano: ', { bold: true, size: 20 }), t(e.equipo, { size: 20 }),
      t(`     ${e.ejercicios.length} ejercicios`, { size: 20, color: C.gray }),
    ] }),
    tablaEstacion(e.numero),
  ])

  return new Document({
    creator: 'Re-Viva · IGZ Trainer',
    title: 'Guía de grabación de ejercicios',
    styles: { default: { document: { run: { font: CUERPO, size: 21 } } } },
    sections: [{
      properties: { page: {
        size: { width: convertInchesToTwip(8.5), height: convertInchesToTwip(11), orientation: PageOrientation.LANDSCAPE },
        margin: { top: convertInchesToTwip(0.5), bottom: convertInchesToTwip(0.6), left: convertInchesToTwip(0.5), right: convertInchesToTwip(0.5) },
      } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        t('Re-Viva · Guía de grabación · página ', { size: 15, color: C.gray }),
        new TextRun({ children: [PageNumber.CURRENT], font: CUERPO, size: 15, color: C.gray }),
      ] })] }) },
      children: [...intro, ...estaciones],
    }],
  })
}

async function main() {
  const destino = path.join(process.cwd(), 'docs', 'Guia-Grabacion-Ejercicios.docx')
  writeFileSync(destino, await Packer.toBuffer(guia()))
  console.log(`✓ ${destino} (${EJERCICIOS.length} ejercicios, ${ESTACIONES.length} estaciones)`)
}

main()
