// One-shot: repara TemplateMealItem cuyo Food es 'unidad' pero la cantidad
// fue cargada como gramos (ej: 100 huevos enteros). Convierte dividiendo /100
// y redondeando al entero más cercano (mínimo 1).
//
// Uso: npx tsx scripts/fix-template-units.ts

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool as never)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('▸ Buscando items con cantidad sospechosa…\n')

  const sospechosos = await prisma.templateMealItem.findMany({
    where: {
      gramos: { gt: 20 },
      food: { unidad: 'unidad' },
    },
    include: {
      food: { select: { nombre: true, unidad: true, kcal: true } },
      meal: { select: { nombre: true, template: { select: { nombre: true } } } },
    },
    orderBy: { gramos: 'desc' },
  })

  if (sospechosos.length === 0) {
    console.log('✓ No hay items para reparar. Datos ya correctos.')
    return
  }

  console.log(`Encontrados ${sospechosos.length} items para reparar:\n`)
  console.log('Template'.padEnd(35), 'Comida'.padEnd(15), 'Alimento'.padEnd(20), 'Antes'.padEnd(8), '→ Después')
  console.log('─'.repeat(95))

  for (const it of sospechosos) {
    const propuesta = Math.max(1, Math.round(it.gramos / 100))
    console.log(
      it.meal.template.nombre.padEnd(35).slice(0, 35),
      it.meal.nombre.padEnd(15).slice(0, 15),
      it.food.nombre.padEnd(20).slice(0, 20),
      String(it.gramos).padEnd(8),
      `→ ${propuesta}`,
    )
  }

  console.log('\n▸ Aplicando correcciones…')

  let reparados = 0
  for (const it of sospechosos) {
    const nuevoGramos = Math.max(1, Math.round(it.gramos / 100))
    await prisma.templateMealItem.update({
      where: { id: it.id },
      data: { gramos: nuevoGramos },
    })
    reparados++
  }

  console.log(`\n✓ ${reparados} items reparados con éxito.`)
}

main()
  .catch(e => { console.error('✗ Error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
