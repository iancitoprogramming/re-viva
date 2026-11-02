// Listas de compras semanales: categorías, formato texto ↔ items, agrupado.
// El trainer arma la lista fuera de la web (junto al Documento de Nutrición) y la
// pega acá como texto. Formato, una línea por producto bajo cada categoría:
//
//   PROTEÍNAS
//   Pechuga de pollo 1400 g
//   Huevos 12 unidad
//   ALMACÉN
//   Aceite de oliva 250 ml

import type { CategoriaCompra } from '@prisma/client'

// Las 7 categorías que ve el cliente, en el orden del mail y del documento.
export const CATEGORIAS_COMPRA = [
  { key: 'proteinas',     label: 'Proteínas',     guardarComo: 'PROTEINA_ANIMAL', incluye: ['PROTEINA_ANIMAL', 'PROTEINA_VEGETAL'] },
  { key: 'carbohidratos', label: 'Carbohidratos', guardarComo: 'CARBOHIDRATO',    incluye: ['CARBOHIDRATO'] },
  { key: 'verduras',      label: 'Verduras',      guardarComo: 'VEGETAL',         incluye: ['VEGETAL'] },
  { key: 'frutas',        label: 'Frutas',        guardarComo: 'FRUTA',           incluye: ['FRUTA'] },
  { key: 'lacteos',       label: 'Lácteos',       guardarComo: 'LACTEO',          incluye: ['LACTEO'] },
  { key: 'almacen',       label: 'Almacén',       guardarComo: 'ALMACEN',         incluye: ['ALMACEN', 'GRASA', 'BEBIDA', 'CONDIMENTO'] },
  { key: 'suplementos',   label: 'Suplementos',   guardarComo: 'SUPLEMENTO',      incluye: ['SUPLEMENTO'] },
] as const satisfies readonly { key: string; label: string; guardarComo: CategoriaCompra; incluye: readonly CategoriaCompra[] }[]

export type ItemCompra = { nombre: string; categoria: CategoriaCompra; cantidad: number; unidad: string }

const UNIDADES: Record<string, string> = {
  g: 'g', gr: 'g', grs: 'g', gramos: 'g',
  kg: 'kg', kilo: 'kg', kilos: 'kg',
  ml: 'ml', cc: 'ml',
  l: 'l', lt: 'l', litro: 'l', litros: 'l',
  u: 'unidad', un: 'unidad', unidad: 'unidad', unidades: 'unidad',
  paquete: 'paquete', paquetes: 'paquete', lata: 'lata', latas: 'lata',
  docena: 'docena', docenas: 'docena', atado: 'atado', atados: 'atado',
  pote: 'pote', potes: 'pote', sobre: 'sobre', sobres: 'sobre', medida: 'medida', medidas: 'medida',
}

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

function categoriaDeEncabezado(linea: string) {
  const n = normalizar(linea).replace(/[:\-–—]+$/, '').trim()
  return CATEGORIAS_COMPRA.find(c => normalizar(c.label) === n || c.key === n) ?? null
}

export function categoriaVisible(categoria: CategoriaCompra) {
  return CATEGORIAS_COMPRA.find(c => (c.incluye as readonly string[]).includes(categoria)) ?? CATEGORIAS_COMPRA[5]
}

// Texto pegado → items. Devuelve también las líneas que no pudo leer.
export function parsearListaTexto(texto: string): { items: ItemCompra[]; errores: string[] } {
  const items: ItemCompra[] = []
  const errores: string[] = []
  let actual: (typeof CATEGORIAS_COMPRA)[number] | null = null

  for (const cruda of texto.split('\n')) {
    const linea = cruda.replace(/^[\s•\-*·]+/, '').trim()
    if (!linea) continue

    const encabezado = categoriaDeEncabezado(linea)
    if (encabezado) { actual = encabezado; continue }

    // "<nombre> <cantidad> <unidad>"   ej. "Pechuga de pollo 1400 g" · "Huevos 12"
    const m = linea.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*([a-záéíóúñ.]*)$/i)
    if (!m || !actual) { errores.push(cruda.trim()); continue }

    const unidad = UNIDADES[normalizar(m[3]).replace(/\.$/, '')] ?? (m[3] ? null : 'unidad')
    const cantidad = Number(m[2].replace(',', '.'))
    if (!unidad || !(cantidad > 0)) { errores.push(cruda.trim()); continue }

    items.push({ nombre: m[1].trim(), categoria: actual.guardarComo, cantidad, unidad })
  }
  return { items, errores }
}

// Items → texto (para editar una lista ya guardada con el mismo formato).
export function listaATexto(items: ItemCompra[]): string {
  return agruparPorCategoria(items)
    .map(g => [g.label.toUpperCase(), ...g.items.map(i => `${i.nombre} ${formatoNumero(i.cantidad)} ${i.unidad}`)].join('\n'))
    .join('\n\n')
}

export function agruparPorCategoria<T extends { categoria: CategoriaCompra }>(items: T[]) {
  return CATEGORIAS_COMPRA
    .map(c => ({ key: c.key, label: c.label, items: items.filter(i => (c.incluye as readonly string[]).includes(i.categoria)) }))
    .filter(g => g.items.length > 0)
}

function formatoNumero(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toLocaleString('es-AR', { maximumFractionDigits: 2 })
}

// Cantidad legible para el cliente: 1400 g → "1,4 kg"; 12 unidad → "12 unidades"
export function cantidadLegible(cantidad: number, unidad: string): string {
  if (unidad === 'g' && cantidad >= 1000) return `${formatoNumero(cantidad / 1000)} kg`
  if (unidad === 'ml' && cantidad >= 1000) return `${formatoNumero(cantidad / 1000)} l`
  if (unidad === 'unidad') return `${formatoNumero(cantidad)} ${cantidad === 1 ? 'unidad' : 'unidades'}`
  return `${formatoNumero(cantidad)} ${unidad}`
}
