import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parsearListaTexto, listaATexto, cantidadLegible, agruparPorCategoria } from '../src/lib/compras'

const TEXTO = `PROTEÍNAS
Pechuga de pollo 1400 g
- Huevos 12
Lácteos:
Yogur natural 1,5 kg
ALMACEN
Aceite de oliva 250 ml
Suplementos
Creatina monohidrato 35 g`

describe('compras — parser de lista pegada', () => {
  it('lee categorías con o sin tildes, viñetas y unidades por defecto', () => {
    const { items, errores } = parsearListaTexto(TEXTO)
    assert.deepEqual(errores, [])
    assert.equal(items.length, 5)
    assert.deepEqual(items[0], { nombre: 'Pechuga de pollo', categoria: 'PROTEINA_ANIMAL', cantidad: 1400, unidad: 'g' })
    assert.deepEqual(items[1], { nombre: 'Huevos', categoria: 'PROTEINA_ANIMAL', cantidad: 12, unidad: 'unidad' })
    assert.equal(items[2].cantidad, 1.5)
    assert.equal(items[2].categoria, 'LACTEO')
    assert.equal(items[3].categoria, 'ALMACEN')
    assert.equal(items[4].categoria, 'SUPLEMENTO')
  })

  it('reporta líneas sin categoría o sin cantidad', () => {
    const { items, errores } = parsearListaTexto('Pollo 500 g\nFRUTAS\nBananas muchas\nManzana 6 unidades')
    assert.equal(items.length, 1)
    assert.deepEqual(errores, ['Pollo 500 g', 'Bananas muchas'])
  })

  it('ida y vuelta texto → items → texto es estable', () => {
    const { items } = parsearListaTexto(TEXTO)
    const texto = listaATexto(items)
    assert.deepEqual(parsearListaTexto(texto).items, items)
  })

  it('agrupa en el orden del mail y unifica grasas/condimentos en Almacén', () => {
    const grupos = agruparPorCategoria([
      { categoria: 'CONDIMENTO' as const }, { categoria: 'FRUTA' as const }, { categoria: 'PROTEINA_VEGETAL' as const },
    ])
    assert.deepEqual(grupos.map(g => g.label), ['Proteínas', 'Frutas', 'Almacén'])
  })

  it('muestra cantidades legibles', () => {
    assert.equal(cantidadLegible(1400, 'g'), '1,4 kg')
    assert.equal(cantidadLegible(300, 'g'), '300 g')
    assert.equal(cantidadLegible(1, 'unidad'), '1 unidad')
    assert.equal(cantidadLegible(12, 'unidad'), '12 unidades')
  })
})
