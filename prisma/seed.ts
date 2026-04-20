// Seed inicial: 50 alimentos típicos + templates base de planes alimentarios.
// Macros expresados por 100 g (o 100 ml en líquidos).
//
// Uso:  npx prisma db seed
// Requiere en package.json:  "prisma": { "seed": "tsx prisma/seed.ts" }

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type FoodSeed = {
  nombre: string
  categoria:
    | 'PROTEINA_ANIMAL'
    | 'PROTEINA_VEGETAL'
    | 'LACTEO'
    | 'CARBOHIDRATO'
    | 'VEGETAL'
    | 'FRUTA'
    | 'GRASA'
    | 'BEBIDA'
    | 'CONDIMENTO'
    | 'SUPLEMENTO'
  unidad?: string
  kcal: number
  proteina: number
  hidratos: number
  grasas: number
  unidadCompra?: string
}

const FOODS: FoodSeed[] = [
  // ── Proteínas animales ──
  { nombre: 'Pechuga de pollo', categoria: 'PROTEINA_ANIMAL', kcal: 165, proteina: 31, hidratos: 0, grasas: 3.6, unidadCompra: 'kg' },
  { nombre: 'Carne magra (peceto)', categoria: 'PROTEINA_ANIMAL', kcal: 175, proteina: 27, hidratos: 0, grasas: 7, unidadCompra: 'kg' },
  { nombre: 'Carne picada magra', categoria: 'PROTEINA_ANIMAL', kcal: 200, proteina: 26, hidratos: 0, grasas: 10, unidadCompra: 'kg' },
  { nombre: 'Bife de lomo', categoria: 'PROTEINA_ANIMAL', kcal: 190, proteina: 28, hidratos: 0, grasas: 8, unidadCompra: 'kg' },
  { nombre: 'Merluza', categoria: 'PROTEINA_ANIMAL', kcal: 90, proteina: 18, hidratos: 0, grasas: 1.5, unidadCompra: 'kg' },
  { nombre: 'Atún al natural', categoria: 'PROTEINA_ANIMAL', kcal: 116, proteina: 26, hidratos: 0, grasas: 1, unidadCompra: 'lata' },
  { nombre: 'Salmón', categoria: 'PROTEINA_ANIMAL', kcal: 208, proteina: 20, hidratos: 0, grasas: 13, unidadCompra: 'kg' },
  { nombre: 'Huevo entero', categoria: 'PROTEINA_ANIMAL', unidad: 'unidad', kcal: 72, proteina: 6.3, hidratos: 0.4, grasas: 5, unidadCompra: 'docena' },
  { nombre: 'Clara de huevo', categoria: 'PROTEINA_ANIMAL', unidad: 'unidad', kcal: 17, proteina: 3.6, hidratos: 0.2, grasas: 0.1, unidadCompra: 'docena' },
  { nombre: 'Cerdo magro (lomo)', categoria: 'PROTEINA_ANIMAL', kcal: 143, proteina: 26, hidratos: 0, grasas: 4, unidadCompra: 'kg' },

  // ── Lácteos ──
  { nombre: 'Yogur natural descremado', categoria: 'LACTEO', kcal: 56, proteina: 5.3, hidratos: 7.5, grasas: 0.2, unidadCompra: 'pote' },
  { nombre: 'Queso port salut light', categoria: 'LACTEO', kcal: 245, proteina: 24, hidratos: 2, grasas: 16, unidadCompra: 'kg' },
  { nombre: 'Queso cottage', categoria: 'LACTEO', kcal: 98, proteina: 11, hidratos: 3.4, grasas: 4.3, unidadCompra: 'pote' },
  { nombre: 'Leche descremada', categoria: 'LACTEO', unidad: 'ml', kcal: 35, proteina: 3.4, hidratos: 5, grasas: 0.1, unidadCompra: 'litro' },
  { nombre: 'Ricota descremada', categoria: 'LACTEO', kcal: 138, proteina: 11, hidratos: 3, grasas: 8, unidadCompra: 'kg' },

  // ── Proteínas vegetales / suplementos ──
  { nombre: 'Lentejas cocidas', categoria: 'PROTEINA_VEGETAL', kcal: 116, proteina: 9, hidratos: 20, grasas: 0.4, unidadCompra: 'kg' },
  { nombre: 'Garbanzos cocidos', categoria: 'PROTEINA_VEGETAL', kcal: 164, proteina: 8.9, hidratos: 27, grasas: 2.6, unidadCompra: 'kg' },
  { nombre: 'Tofu firme', categoria: 'PROTEINA_VEGETAL', kcal: 144, proteina: 17, hidratos: 3, grasas: 9, unidadCompra: 'unidad' },
  { nombre: 'Whey protein', categoria: 'SUPLEMENTO', kcal: 380, proteina: 80, hidratos: 8, grasas: 5, unidadCompra: 'pote' },

  // ── Carbohidratos ──
  { nombre: 'Arroz integral cocido', categoria: 'CARBOHIDRATO', kcal: 123, proteina: 2.7, hidratos: 26, grasas: 1, unidadCompra: 'kg' },
  { nombre: 'Arroz blanco cocido', categoria: 'CARBOHIDRATO', kcal: 130, proteina: 2.4, hidratos: 28, grasas: 0.3, unidadCompra: 'kg' },
  { nombre: 'Avena', categoria: 'CARBOHIDRATO', kcal: 389, proteina: 16.9, hidratos: 66, grasas: 6.9, unidadCompra: 'kg' },
  { nombre: 'Pan integral', categoria: 'CARBOHIDRATO', kcal: 247, proteina: 13, hidratos: 41, grasas: 4.2, unidadCompra: 'unidad' },
  { nombre: 'Fideos integrales cocidos', categoria: 'CARBOHIDRATO', kcal: 124, proteina: 5, hidratos: 25, grasas: 0.9, unidadCompra: 'kg' },
  { nombre: 'Papa hervida', categoria: 'CARBOHIDRATO', kcal: 87, proteina: 1.9, hidratos: 20, grasas: 0.1, unidadCompra: 'kg' },
  { nombre: 'Batata hervida', categoria: 'CARBOHIDRATO', kcal: 86, proteina: 1.6, hidratos: 20, grasas: 0.1, unidadCompra: 'kg' },
  { nombre: 'Quinoa cocida', categoria: 'CARBOHIDRATO', kcal: 120, proteina: 4.4, hidratos: 21, grasas: 1.9, unidadCompra: 'kg' },
  { nombre: 'Galletas de arroz', categoria: 'CARBOHIDRATO', kcal: 387, proteina: 8, hidratos: 81, grasas: 2.8, unidadCompra: 'paquete' },

  // ── Vegetales ──
  { nombre: 'Brócoli', categoria: 'VEGETAL', kcal: 34, proteina: 2.8, hidratos: 7, grasas: 0.4, unidadCompra: 'atado' },
  { nombre: 'Espinaca', categoria: 'VEGETAL', kcal: 23, proteina: 2.9, hidratos: 3.6, grasas: 0.4, unidadCompra: 'atado' },
  { nombre: 'Lechuga', categoria: 'VEGETAL', kcal: 15, proteina: 1.4, hidratos: 2.9, grasas: 0.2, unidadCompra: 'unidad' },
  { nombre: 'Tomate', categoria: 'VEGETAL', kcal: 18, proteina: 0.9, hidratos: 3.9, grasas: 0.2, unidadCompra: 'kg' },
  { nombre: 'Zanahoria', categoria: 'VEGETAL', kcal: 41, proteina: 0.9, hidratos: 9.6, grasas: 0.2, unidadCompra: 'kg' },
  { nombre: 'Zapallito', categoria: 'VEGETAL', kcal: 17, proteina: 1.2, hidratos: 3.1, grasas: 0.3, unidadCompra: 'kg' },
  { nombre: 'Pepino', categoria: 'VEGETAL', kcal: 16, proteina: 0.7, hidratos: 3.6, grasas: 0.1, unidadCompra: 'kg' },
  { nombre: 'Cebolla', categoria: 'VEGETAL', kcal: 40, proteina: 1.1, hidratos: 9.3, grasas: 0.1, unidadCompra: 'kg' },
  { nombre: 'Morrón', categoria: 'VEGETAL', kcal: 31, proteina: 1, hidratos: 6, grasas: 0.3, unidadCompra: 'kg' },

  // ── Frutas ──
  { nombre: 'Banana', categoria: 'FRUTA', kcal: 89, proteina: 1.1, hidratos: 23, grasas: 0.3, unidadCompra: 'kg' },
  { nombre: 'Manzana', categoria: 'FRUTA', kcal: 52, proteina: 0.3, hidratos: 14, grasas: 0.2, unidadCompra: 'kg' },
  { nombre: 'Naranja', categoria: 'FRUTA', kcal: 47, proteina: 0.9, hidratos: 12, grasas: 0.1, unidadCompra: 'kg' },
  { nombre: 'Frutillas', categoria: 'FRUTA', kcal: 32, proteina: 0.7, hidratos: 7.7, grasas: 0.3, unidadCompra: 'kg' },
  { nombre: 'Arándanos', categoria: 'FRUTA', kcal: 57, proteina: 0.7, hidratos: 14, grasas: 0.3, unidadCompra: 'pote' },
  { nombre: 'Pera', categoria: 'FRUTA', kcal: 57, proteina: 0.4, hidratos: 15, grasas: 0.1, unidadCompra: 'kg' },

  // ── Grasas ──
  { nombre: 'Palta', categoria: 'GRASA', kcal: 160, proteina: 2, hidratos: 9, grasas: 15, unidadCompra: 'unidad' },
  { nombre: 'Aceite de oliva', categoria: 'GRASA', unidad: 'ml', kcal: 884, proteina: 0, hidratos: 0, grasas: 100, unidadCompra: 'litro' },
  { nombre: 'Almendras', categoria: 'GRASA', kcal: 579, proteina: 21, hidratos: 22, grasas: 50, unidadCompra: 'kg' },
  { nombre: 'Nueces', categoria: 'GRASA', kcal: 654, proteina: 15, hidratos: 14, grasas: 65, unidadCompra: 'kg' },
  { nombre: 'Maní natural', categoria: 'GRASA', kcal: 567, proteina: 26, hidratos: 16, grasas: 49, unidadCompra: 'kg' },
  { nombre: 'Mantequilla de maní', categoria: 'GRASA', kcal: 588, proteina: 25, hidratos: 20, grasas: 50, unidadCompra: 'pote' },
  { nombre: 'Semillas de chía', categoria: 'GRASA', kcal: 486, proteina: 17, hidratos: 42, grasas: 31, unidadCompra: 'paquete' },
]

// ── Templates base ──
// Cada template define comidas con items en gramos. Los macros target son
// indicativos; el trainer los ajusta al instanciar para un cliente concreto.
type TemplateSeed = {
  nombre: string
  descripcion: string
  genero: 'MASCULINO' | 'FEMENINO' | null
  objetivo: 'VOLUMEN' | 'DEFINICION' | 'RECOMPOSICION' | null
  edadMin: number | null
  edadMax: number | null
  adherencia: 'BAJA' | 'MEDIA' | 'ALTA' | null
  kcalTarget: number
  proteinaTarget: number
  hidratosTarget: number
  grasasTarget: number
  comidas: {
    nombre: string
    horaSugerida?: string
    items: { food: string; gramos: number }[]
  }[]
}

const TEMPLATES: TemplateSeed[] = [
  {
    nombre: 'Hombre joven — Hipertrofia',
    descripcion: 'Plan de volumen para hombres 18-35, alta adherencia, foco en ganancia de masa muscular.',
    genero: 'MASCULINO',
    objetivo: 'VOLUMEN',
    edadMin: 18,
    edadMax: 35,
    adherencia: 'ALTA',
    kcalTarget: 3000,
    proteinaTarget: 200,
    hidratosTarget: 380,
    grasasTarget: 80,
    comidas: [
      {
        nombre: 'Desayuno',
        horaSugerida: '08:00',
        items: [
          { food: 'Avena', gramos: 100 },
          { food: 'Leche descremada', gramos: 250 },
          { food: 'Banana', gramos: 120 },
          { food: 'Whey protein', gramos: 30 },
          { food: 'Mantequilla de maní', gramos: 20 },
        ],
      },
      {
        nombre: 'Almuerzo',
        horaSugerida: '13:00',
        items: [
          { food: 'Pechuga de pollo', gramos: 200 },
          { food: 'Arroz integral cocido', gramos: 250 },
          { food: 'Brócoli', gramos: 150 },
          { food: 'Aceite de oliva', gramos: 10 },
        ],
      },
      {
        nombre: 'Merienda',
        horaSugerida: '17:00',
        items: [
          { food: 'Pan integral', gramos: 80 },
          { food: 'Queso port salut light', gramos: 60 },
          { food: 'Manzana', gramos: 150 },
        ],
      },
      {
        nombre: 'Cena',
        horaSugerida: '21:00',
        items: [
          { food: 'Carne magra (peceto)', gramos: 200 },
          { food: 'Batata hervida', gramos: 250 },
          { food: 'Espinaca', gramos: 100 },
          { food: 'Aceite de oliva', gramos: 10 },
        ],
      },
    ],
  },
  {
    nombre: 'Hombre adulto — Definición',
    descripcion: 'Plan de definición para hombres 35-55, foco en pérdida de grasa preservando masa muscular.',
    genero: 'MASCULINO',
    objetivo: 'DEFINICION',
    edadMin: 35,
    edadMax: 55,
    adherencia: 'MEDIA',
    kcalTarget: 2100,
    proteinaTarget: 180,
    hidratosTarget: 180,
    grasasTarget: 65,
    comidas: [
      {
        nombre: 'Desayuno',
        horaSugerida: '08:00',
        items: [
          { food: 'Huevo entero', gramos: 100 },
          { food: 'Clara de huevo', gramos: 100 },
          { food: 'Pan integral', gramos: 60 },
          { food: 'Palta', gramos: 50 },
        ],
      },
      {
        nombre: 'Almuerzo',
        horaSugerida: '13:00',
        items: [
          { food: 'Pechuga de pollo', gramos: 200 },
          { food: 'Quinoa cocida', gramos: 150 },
          { food: 'Lechuga', gramos: 80 },
          { food: 'Tomate', gramos: 100 },
          { food: 'Aceite de oliva', gramos: 10 },
        ],
      },
      {
        nombre: 'Merienda',
        horaSugerida: '17:00',
        items: [
          { food: 'Yogur natural descremado', gramos: 200 },
          { food: 'Almendras', gramos: 20 },
          { food: 'Frutillas', gramos: 100 },
        ],
      },
      {
        nombre: 'Cena',
        horaSugerida: '21:00',
        items: [
          { food: 'Merluza', gramos: 220 },
          { food: 'Papa hervida', gramos: 200 },
          { food: 'Brócoli', gramos: 150 },
          { food: 'Aceite de oliva', gramos: 10 },
        ],
      },
    ],
  },
  {
    nombre: 'Mujer joven — Recomposición',
    descripcion: 'Plan de recomposición para mujeres 18-35, balance entre pérdida de grasa y tonificación.',
    genero: 'FEMENINO',
    objetivo: 'RECOMPOSICION',
    edadMin: 18,
    edadMax: 35,
    adherencia: 'ALTA',
    kcalTarget: 1800,
    proteinaTarget: 130,
    hidratosTarget: 180,
    grasasTarget: 55,
    comidas: [
      {
        nombre: 'Desayuno',
        horaSugerida: '08:00',
        items: [
          { food: 'Yogur natural descremado', gramos: 200 },
          { food: 'Avena', gramos: 50 },
          { food: 'Arándanos', gramos: 80 },
          { food: 'Almendras', gramos: 15 },
        ],
      },
      {
        nombre: 'Almuerzo',
        horaSugerida: '13:00',
        items: [
          { food: 'Pechuga de pollo', gramos: 150 },
          { food: 'Arroz integral cocido', gramos: 150 },
          { food: 'Zanahoria', gramos: 80 },
          { food: 'Espinaca', gramos: 80 },
          { food: 'Aceite de oliva', gramos: 8 },
        ],
      },
      {
        nombre: 'Merienda',
        horaSugerida: '17:00',
        items: [
          { food: 'Manzana', gramos: 150 },
          { food: 'Mantequilla de maní', gramos: 15 },
        ],
      },
      {
        nombre: 'Cena',
        horaSugerida: '21:00',
        items: [
          { food: 'Salmón', gramos: 130 },
          { food: 'Batata hervida', gramos: 150 },
          { food: 'Zapallito', gramos: 150 },
          { food: 'Aceite de oliva', gramos: 8 },
        ],
      },
    ],
  },
  {
    nombre: 'Mujer adulta — Recomposición',
    descripcion: 'Plan para mujeres 35-55 con foco en salud metabólica y recomposición sostenida.',
    genero: 'FEMENINO',
    objetivo: 'RECOMPOSICION',
    edadMin: 35,
    edadMax: 55,
    adherencia: 'MEDIA',
    kcalTarget: 1700,
    proteinaTarget: 120,
    hidratosTarget: 170,
    grasasTarget: 55,
    comidas: [
      {
        nombre: 'Desayuno',
        horaSugerida: '08:00',
        items: [
          { food: 'Huevo entero', gramos: 100 },
          { food: 'Pan integral', gramos: 50 },
          { food: 'Palta', gramos: 40 },
          { food: 'Tomate', gramos: 80 },
        ],
      },
      {
        nombre: 'Almuerzo',
        horaSugerida: '13:00',
        items: [
          { food: 'Atún al natural', gramos: 120 },
          { food: 'Quinoa cocida', gramos: 130 },
          { food: 'Lechuga', gramos: 80 },
          { food: 'Pepino', gramos: 80 },
          { food: 'Aceite de oliva', gramos: 8 },
        ],
      },
      {
        nombre: 'Merienda',
        horaSugerida: '17:00',
        items: [
          { food: 'Queso cottage', gramos: 120 },
          { food: 'Pera', gramos: 150 },
          { food: 'Nueces', gramos: 15 },
        ],
      },
      {
        nombre: 'Cena',
        horaSugerida: '21:00',
        items: [
          { food: 'Pechuga de pollo', gramos: 150 },
          { food: 'Papa hervida', gramos: 180 },
          { food: 'Brócoli', gramos: 150 },
          { food: 'Aceite de oliva', gramos: 8 },
        ],
      },
    ],
  },
  {
    nombre: 'Volumen agresivo — Hardgainer',
    descripcion: 'Para personas con dificultad para subir de peso. Alta densidad calórica.',
    genero: null,
    objetivo: 'VOLUMEN',
    edadMin: 18,
    edadMax: 40,
    adherencia: 'ALTA',
    kcalTarget: 3500,
    proteinaTarget: 220,
    hidratosTarget: 450,
    grasasTarget: 100,
    comidas: [
      {
        nombre: 'Desayuno',
        items: [
          { food: 'Avena', gramos: 120 },
          { food: 'Leche descremada', gramos: 300 },
          { food: 'Banana', gramos: 150 },
          { food: 'Whey protein', gramos: 40 },
          { food: 'Mantequilla de maní', gramos: 30 },
        ],
      },
      {
        nombre: 'Media mañana',
        items: [
          { food: 'Pan integral', gramos: 100 },
          { food: 'Queso port salut light', gramos: 80 },
          { food: 'Manzana', gramos: 150 },
        ],
      },
      {
        nombre: 'Almuerzo',
        items: [
          { food: 'Carne picada magra', gramos: 220 },
          { food: 'Arroz blanco cocido', gramos: 300 },
          { food: 'Zanahoria', gramos: 100 },
          { food: 'Aceite de oliva', gramos: 12 },
        ],
      },
      {
        nombre: 'Merienda',
        items: [
          { food: 'Yogur natural descremado', gramos: 250 },
          { food: 'Avena', gramos: 60 },
          { food: 'Nueces', gramos: 30 },
        ],
      },
      {
        nombre: 'Cena',
        items: [
          { food: 'Bife de lomo', gramos: 220 },
          { food: 'Batata hervida', gramos: 300 },
          { food: 'Espinaca', gramos: 100 },
          { food: 'Aceite de oliva', gramos: 12 },
        ],
      },
    ],
  },
  {
    nombre: 'Definición estricta — Cutting',
    descripcion: 'Déficit pronunciado para etapas finales de definición. Alta proteína, bajo hidrato.',
    genero: null,
    objetivo: 'DEFINICION',
    edadMin: 18,
    edadMax: 50,
    adherencia: 'ALTA',
    kcalTarget: 1800,
    proteinaTarget: 180,
    hidratosTarget: 130,
    grasasTarget: 55,
    comidas: [
      {
        nombre: 'Desayuno',
        items: [
          { food: 'Clara de huevo', gramos: 200 },
          { food: 'Huevo entero', gramos: 50 },
          { food: 'Avena', gramos: 40 },
        ],
      },
      {
        nombre: 'Almuerzo',
        items: [
          { food: 'Pechuga de pollo', gramos: 220 },
          { food: 'Arroz integral cocido', gramos: 120 },
          { food: 'Brócoli', gramos: 200 },
          { food: 'Aceite de oliva', gramos: 8 },
        ],
      },
      {
        nombre: 'Merienda',
        items: [
          { food: 'Queso cottage', gramos: 150 },
          { food: 'Almendras', gramos: 15 },
        ],
      },
      {
        nombre: 'Cena',
        items: [
          { food: 'Merluza', gramos: 250 },
          { food: 'Zapallito', gramos: 200 },
          { food: 'Lechuga', gramos: 80 },
          { food: 'Aceite de oliva', gramos: 8 },
        ],
      },
    ],
  },
]

async function main() {
  console.log('🌱 Seeding Foods...')
  for (const food of FOODS) {
    await prisma.food.upsert({
      where: { nombre: food.nombre },
      update: {
        categoria: food.categoria,
        unidad: food.unidad ?? 'g',
        kcal: food.kcal,
        proteina: food.proteina,
        hidratos: food.hidratos,
        grasas: food.grasas,
        unidadCompra: food.unidadCompra,
      },
      create: {
        nombre: food.nombre,
        categoria: food.categoria,
        unidad: food.unidad ?? 'g',
        kcal: food.kcal,
        proteina: food.proteina,
        hidratos: food.hidratos,
        grasas: food.grasas,
        unidadCompra: food.unidadCompra,
      },
    })
  }
  console.log(`   ✓ ${FOODS.length} alimentos`)

  console.log('🌱 Seeding Templates...')
  // Index foods by name para resolver references
  const allFoods = await prisma.food.findMany()
  const foodByName = new Map(allFoods.map((f) => [f.nombre, f]))

  for (const tpl of TEMPLATES) {
    // Eliminar template existente con mismo nombre (idempotente)
    const existing = await prisma.mealPlanTemplate.findFirst({ where: { nombre: tpl.nombre } })
    if (existing) {
      await prisma.mealPlanTemplate.delete({ where: { id: existing.id } })
    }

    await prisma.mealPlanTemplate.create({
      data: {
        nombre: tpl.nombre,
        descripcion: tpl.descripcion,
        genero: tpl.genero ?? undefined,
        objetivo: tpl.objetivo ?? undefined,
        edadMin: tpl.edadMin ?? undefined,
        edadMax: tpl.edadMax ?? undefined,
        adherencia: tpl.adherencia ?? undefined,
        kcalTarget: tpl.kcalTarget,
        proteinaTarget: tpl.proteinaTarget,
        hidratosTarget: tpl.hidratosTarget,
        grasasTarget: tpl.grasasTarget,
        comidas: {
          create: tpl.comidas.map((c, i) => ({
            nombre: c.nombre,
            orden: i,
            horaSugerida: c.horaSugerida,
            items: {
              create: c.items.map((it) => {
                const food = foodByName.get(it.food)
                if (!food) throw new Error(`Food no encontrado en seed: ${it.food}`)
                return { foodId: food.id, gramos: it.gramos }
              }),
            },
          })),
        },
      },
    })
  }
  console.log(`   ✓ ${TEMPLATES.length} templates`)

  console.log('✅ Seed completo')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
