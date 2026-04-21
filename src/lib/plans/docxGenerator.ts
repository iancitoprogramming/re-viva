import {
  AlignmentType,
  BorderStyle,
  Document,
  type FileChild,
  Footer,
  Header,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  convertInchesToTwip,
} from 'docx';
import { TEXTOS_LEGALES, getProteccionDatos } from '../legal/textosObligatorios';

// ─── Paleta Re-Viva ───────────────────────────────────────────────────────────
const C = {
  gold: 'C9A84C',
  dark: '0A0A08',
  legal: '3D3D3D',
  gray: '888888',
};

const FONT_HEADING = 'Georgia';
const FONT_BODY = 'Calibri';

// ─── Márgenes A4 ──────────────────────────────────────────────────────────────
const PAGE_MARGINS = {
  top: convertInchesToTwip(1),
  right: convertInchesToTwip(1.25),
  bottom: convertInchesToTwip(1),
  left: convertInchesToTwip(1.25),
};

// ─── Helpers de párrafos ──────────────────────────────────────────────────────
function p(
  texto: string,
  opts: {
    bold?: boolean;
    color?: string;
    size?: number; // half-points (22 = 11pt)
    font?: string;
    spacingAfter?: number;
    spacingBefore?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    italics?: boolean;
    allCaps?: boolean;
  } = {},
): Paragraph {
  return new Paragraph({
    spacing: {
      after: opts.spacingAfter ?? 160,
      before: opts.spacingBefore ?? 0,
    },
    alignment: opts.alignment ?? AlignmentType.JUSTIFIED,
    children: [
      new TextRun({
        text: texto,
        bold: opts.bold,
        italics: opts.italics,
        color: opts.color ?? C.dark,
        size: opts.size ?? 22,
        font: opts.font ?? FONT_BODY,
        allCaps: opts.allCaps,
      }),
    ],
  });
}

function encabezado(texto: string, nivel: 1 | 2 | 3 = 1): Paragraph {
  const cfg = {
    1: { size: 40, spacingBefore: 480, spacingAfter: 200 }, // 20pt
    2: { size: 30, spacingBefore: 320, spacingAfter: 160 }, // 15pt
    3: { size: 24, spacingBefore: 240, spacingAfter: 120 }, // 12pt
  }[nivel];

  return new Paragraph({
    spacing: { before: cfg.spacingBefore, after: cfg.spacingAfter },
    children: [
      new TextRun({
        text: texto,
        bold: true,
        color: C.gold,
        size: cfg.size,
        font: FONT_HEADING,
      }),
    ],
  });
}

function lineaDorada(): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 240 },
    border: {
      bottom: { color: C.gold, size: 6, style: BorderStyle.SINGLE, space: 1 },
    },
    children: [],
  });
}

function saltoPagina(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

function espaciado(twips = 320): Paragraph {
  return new Paragraph({ spacing: { after: twips }, children: [] });
}

// ─── Bloques legales ─────────────────────────────────────────────────────────
function bloqueTextoLegal(titulo: string, texto: string): Paragraph[] {
  const resultado: Paragraph[] = [
    new Paragraph({
      spacing: { before: 400, after: 180 },
      children: [
        new TextRun({
          text: titulo,
          bold: true,
          color: C.dark,
          size: 18, // 9pt
          font: FONT_BODY,
          allCaps: true,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 80 },
      border: {
        bottom: { color: C.gray, size: 2, style: BorderStyle.SINGLE, space: 1 },
      },
      children: [],
    }),
  ];

  for (const bloque of texto.split('\n\n')) {
    const linea = bloque.trim();
    if (!linea) continue;
    resultado.push(
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: linea,
            color: C.legal,
            size: 18, // 9pt
            font: FONT_BODY,
          }),
        ],
      }),
    );
  }

  return resultado;
}

// ─── Tabla genérica ───────────────────────────────────────────────────────────
export interface FilaTabla {
  celdas: string[];
  esEncabezado?: boolean;
}

export function crearTabla(filas: FilaTabla[], anchosPct?: number[]): Table {
  const columnWidths =
    anchosPct ??
    Array(filas[0]?.celdas.length ?? 1).fill(
      Math.floor(100 / (filas[0]?.celdas.length ?? 1)),
    );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: filas.map(
      (fila) =>
        new TableRow({
          tableHeader: fila.esEncabezado,
          children: fila.celdas.map(
            (texto, i) =>
              new TableCell({
                width: {
                  size: columnWidths[i] ?? 20,
                  type: WidthType.PERCENTAGE,
                },
                shading: fila.esEncabezado
                  ? { fill: 'F5F0E8' }
                  : undefined,
                children: [
                  new Paragraph({
                    spacing: { before: 80, after: 80 },
                    children: [
                      new TextRun({
                        text: texto,
                        bold: fila.esEncabezado,
                        color: fila.esEncabezado ? C.dark : C.legal,
                        size: 20, // 10pt
                        font: FONT_BODY,
                      }),
                    ],
                  }),
                ],
              }),
          ),
        }),
    ),
  });
}

// ─── Tipos públicos ───────────────────────────────────────────────────────────
export interface SeccionDocx {
  titulo: string;
  nivel?: 1 | 2 | 3;
  esNutricional?: boolean;
  paragrafos?: Array<{
    texto: string;
    esSubtitulo?: boolean;
    nivelSubtitulo?: 2 | 3;
  }>;
  tablas?: Array<{ filas: FilaTabla[]; anchosPct?: number[] }>;
}

export interface PlanDocxOptions {
  cliente: { nombre: string; email: string };
  fechaEmision?: Date;
  secciones?: SeccionDocx[];
  contactEmail?: string;
}

type DocxChild = FileChild;

// ─── Generador principal ──────────────────────────────────────────────────────
export async function generarPlanDOCX(options: PlanDocxOptions): Promise<Buffer> {
  const fecha = options.fechaEmision ?? new Date();
  const fechaStr = fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const headerDefault = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: {
          bottom: { color: C.gold, size: 4, style: BorderStyle.SINGLE, space: 2 },
        },
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: `Re-Viva  ·  ${options.cliente.nombre}  ·  ${fechaStr}`,
            color: C.gold,
            size: 18,
            font: FONT_BODY,
          }),
        ],
      }),
    ],
  });

  const footerDefault = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: {
          top: { color: C.gray, size: 2, style: BorderStyle.SINGLE, space: 2 },
        },
        spacing: { before: 80 },
        children: [
          new TextRun({
            text: TEXTOS_LEGALES.pieDePagina,
            color: C.gray,
            size: 16, // 8pt
            font: FONT_BODY,
          }),
        ],
      }),
    ],
  });

  // ── Página 1: portada + disclaimer profesional ────────────────────────────
  const paginaPortada: DocxChild[] = [
    espaciado(960),
    p('Re-Viva', {
      bold: true,
      color: C.gold,
      size: 64,
      font: FONT_HEADING,
      alignment: AlignmentType.CENTER,
      spacingAfter: 120,
    }),
    p('by Igztrainer', {
      color: C.gray,
      size: 24,
      font: FONT_BODY,
      alignment: AlignmentType.CENTER,
      spacingAfter: 480,
    }),
    lineaDorada(),
    p('Plan personal e intransferible', {
      color: C.dark,
      size: 24,
      alignment: AlignmentType.CENTER,
      spacingAfter: 120,
      spacingBefore: 160,
    }),
    p(`${options.cliente.nombre}`, {
      bold: true,
      color: C.dark,
      size: 28,
      font: FONT_HEADING,
      alignment: AlignmentType.CENTER,
      spacingAfter: 80,
    }),
    p(fechaStr, {
      color: C.gray,
      size: 20,
      alignment: AlignmentType.CENTER,
      spacingAfter: 640,
    }),
    lineaDorada(),
    espaciado(480),
    ...bloqueTextoLegal(
      'AVISO IMPORTANTE — LEER ANTES DE INICIAR',
      TEXTOS_LEGALES.disclaimerProfesional,
    ),
    saltoPagina(),
  ];

  // ── Páginas de contenido ──────────────────────────────────────────────────
  const secciones = options.secciones ?? [];
  const paginasContenido: DocxChild[] = [];

  if (secciones.length === 0) {
    paginasContenido.push(
      encabezado('Resumen Ejecutivo'),
      p('[Plan pendiente de generación y aprobación por el trainer]', {
        italics: true,
        color: C.gray,
      }),
    );
  }

  for (const sec of secciones) {
    if (sec.esNutricional) {
      paginasContenido.push(
        ...bloqueTextoLegal(
          'NOTA SOBRE EL PLAN NUTRICIONAL',
          TEXTOS_LEGALES.disclaimerNutricional,
        ),
        espaciado(400),
      );
    }

    paginasContenido.push(encabezado(sec.titulo, sec.nivel ?? 1));

    for (const item of sec.paragrafos ?? []) {
      if (item.esSubtitulo) {
        paginasContenido.push(encabezado(item.texto, item.nivelSubtitulo ?? 2));
      } else {
        paginasContenido.push(p(item.texto));
      }
    }

    for (const tabla of sec.tablas ?? []) {
      paginasContenido.push(
        espaciado(120),
        crearTabla(tabla.filas, tabla.anchosPct),
        espaciado(240),
      );
    }
  }

  // ── Páginas legales finales ───────────────────────────────────────────────
  const paginasLegales: DocxChild[] = [
    saltoPagina(),
    ...bloqueTextoLegal(
      'DESCARGO DE RESPONSABILIDAD',
      TEXTOS_LEGALES.descargoResponsabilidad,
    ),
    espaciado(480),
    ...bloqueTextoLegal(
      'PROPIEDAD INTELECTUAL Y USO',
      TEXTOS_LEGALES.propiedadIntelectual,
    ),
    espaciado(480),
    ...bloqueTextoLegal(
      'TRATAMIENTO DE DATOS PERSONALES',
      getProteccionDatos(options.contactEmail),
    ),
  ];

  const doc = new Document({
    creator: 'Re-Viva · Igztrainer',
    title: `Plan personal — ${options.cliente.nombre}`,
    description: 'Plan de entrenamiento y nutrición personalizado',
    sections: [
      {
        properties: {
          page: { margin: PAGE_MARGINS },
        },
        headers: { default: headerDefault },
        footers: { default: footerDefault },
        children: [
          ...paginaPortada,
          ...paginasContenido,
          ...paginasLegales,
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

// ─── Utilidad: descarga directa desde una API route ──────────────────────────
export function docxHeaders(nombreArchivo: string): Record<string, string> {
  const safe = nombreArchivo.replace(/[^a-zA-Z0-9._-]/g, '_');
  return {
    'Content-Type':
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'Content-Disposition': `attachment; filename="${safe}"`,
  };
}
