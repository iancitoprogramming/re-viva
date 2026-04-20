'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Food {
  id: string; nombre: string; categoria: string
  kcal: number; proteina: number; hidratos: number; grasas: number; unidad: string
}

interface PlanItem  { foodId: string; gramos: number }
interface PlanMeal  { nombre: string; orden: number; horaSugerida?: string; items: PlanItem[] }

interface Template {
  id: string; nombre: string; descripcion?: string
  genero?: string; objetivo?: string; adherencia?: string
  kcalTarget: number; proteinaTarget: number; hidratosTarget: number; grasasTarget: number
  generadoConIA: boolean
  comidas: {
    nombre: string; orden: number; horaSugerida?: string
    items: { foodId: string; food: Food; gramos: number }[]
  }[]
}

interface MealPlan {
  id: string; version: number; estado: 'BORRADOR' | 'ACTIVO' | 'ARCHIVADO'
  kcalTotal: number; proteinaTotal: number; hidratosTotal: number; grasasTotal: number
  notas?: string; creadoEn: string
  comidas: { nombre: string; orden: number; items: { foodId: string; food: Food; gramos: number }[] }[]
  shoppingList?: { id: string; diasCubiertos: number; items: ShoppingItem[] } | null
}

interface ShoppingItem {
  id: string; nombre: string; categoria: string
  cantidad: number; unidad: string; comprado: boolean
}

interface ClienteData {
  id: string; nombre: string; email: string
  perfil: {
    genero: string; edad: number; altura: number; peso: number
    objetivo: string; diasEntrenamiento: number; nivelEstres: string
    horasSueno: number; adherencia: string
  } | null
  plan: {
    igzClasificacion?: string; igzCalorias?: number
    igzProteina?: number; igzHidratos?: number; igzGrasas?: number
  } | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcMacros(comidas: PlanMeal[], foodMap: Map<string, Food>) {
  let kcal = 0, prot = 0, hc = 0, gras = 0
  for (const c of comidas) for (const it of c.items) {
    const f = foodMap.get(it.foodId); if (!f) continue
    const r = it.gramos / 100
    kcal += f.kcal * r; prot += f.proteina * r; hc += f.hidratos * r; gras += f.grasas * r
  }
  return { kcal: Math.round(kcal), prot: Math.round(prot*10)/10, hc: Math.round(hc*10)/10, gras: Math.round(gras*10)/10 }
}

const MEAL_NOMBRES = ['Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena', 'Colación']

const CAT_LABELS: Record<string, string> = {
  PROTEINA_ANIMAL:'Prot. Animal', PROTEINA_VEGETAL:'Prot. Vegetal',
  LACTEO:'Lácteo', CARBOHIDRATO:'Carbohidrato', VEGETAL:'Vegetal',
  FRUTA:'Fruta', GRASA:'Grasa', BEBIDA:'Bebida', CONDIMENTO:'Condimento', SUPLEMENTO:'Suplemento',
}

const ESTADO_PILL: Record<string, string> = {
  BORRADOR:  'bg-gray-100 text-gray-600',
  ACTIVO:    'bg-emerald-100 text-emerald-700',
  ARCHIVADO: 'bg-gray-50 text-gray-400',
}

// ─── FoodCombobox: buscador de alimentos con autocomplete ─────────────────────

function FoodCombobox({
  foods, value, onChange,
}: { foods: Food[]; value: string; onChange: (id: string) => void }) {
  const selected = foods.find(f => f.id === value)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  // Cerrar al hacer click afuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = query.trim()
    ? foods.filter(f => f.nombre.toLowerCase().includes(query.toLowerCase()) || CAT_LABELS[f.categoria]?.toLowerCase().includes(query.toLowerCase()))
    : foods

  // Agrupar por categoría
  const grupos = new Map<string, Food[]>()
  for (const f of filtered.slice(0, 40)) {
    const cat = CAT_LABELS[f.categoria] ?? f.categoria
    if (!grupos.has(cat)) grupos.set(cat, [])
    grupos.get(cat)!.push(f)
  }

  function select(f: Food) {
    onChange(f.id)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setQuery('') }}
        className="w-full text-left border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white hover:border-emerald-400 focus:outline-none focus:border-emerald-400 transition-colors flex items-center justify-between gap-1 min-w-0"
      >
        <span className={`truncate ${selected ? 'text-gray-900' : 'text-gray-400'}`}>
          {selected ? selected.nombre : 'Elegir alimento…'}
        </span>
        <span className="text-gray-400 flex-shrink-0 text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {/* Buscador */}
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar alimento…"
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Lista */}
          <div className="overflow-y-auto max-h-64">
            {grupos.size === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Sin resultados</p>
            )}
            {Array.from(grupos).map(([cat, items]) => (
              <div key={cat}>
                <p className="px-3 py-1 text-xs font-semibold text-gray-400 bg-gray-50 sticky top-0">{cat}</p>
                {items.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => select(f)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 flex items-center justify-between gap-2 transition-colors ${f.id === value ? 'bg-emerald-50 text-emerald-700' : 'text-gray-800'}`}
                  >
                    <span className="truncate">{f.nombre}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums">{f.kcal} kcal</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TemplateCard: muestra template con preview de ingredientes ───────────────

function TemplateCard({ t, onCargar, foodMap }: { t: Template; onCargar: () => void; foodMap: Map<string, Food> }) {
  const [expandido, setExpandido] = useState(false)
  const macros = calcMacros(
    t.comidas.map(c => ({ nombre: c.nombre, orden: c.orden, items: c.items.map(it => ({ foodId: it.foodId, gramos: it.gramos })) })),
    foodMap,
  )

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-start justify-between gap-2 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpandido(e => !e)}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            {t.objetivo && (
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{t.objetivo}</span>
            )}
            {t.generadoConIA && (
              <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">IA</span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900 leading-tight">{t.nombre}</p>
          <p className="text-xs text-gray-400 mt-0.5 tabular-nums">{macros.kcal} kcal · {macros.prot}g prot</p>
        </div>
        <span className="text-gray-400 text-xs mt-1 flex-shrink-0">{expandido ? '▲' : '▼'}</span>
      </div>

      {/* Ingredientes expandidos */}
      {expandido && (
        <div className="border-t border-gray-100 px-3 pb-3">
          <div className="mt-2 space-y-2">
            {t.comidas.map(c => (
              <div key={c.nombre}>
                <p className="text-xs font-semibold text-gray-500 mb-1">{c.nombre}</p>
                <div className="space-y-0.5">
                  {c.items.map((it, i) => {
                    const food = foodMap.get(it.foodId) ?? it.food
                    return (
                      <div key={i} className="flex items-center justify-between text-xs text-gray-600">
                        <span className="truncate">{food?.nombre ?? it.foodId}</span>
                        <span className="text-gray-400 flex-shrink-0 ml-2">{it.gramos}g</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={e => { e.stopPropagation(); onCargar() }}
            className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
          >
            Usar este template →
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PlanBuilderPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [nombreAdmin, setNombreAdmin] = useState('')
  const [cliente, setCliente] = useState<ClienteData | null>(null)
  const [foods, setFoods] = useState<Food[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [historial, setHistorial] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [dataError, setDataError] = useState('')

  // Editor
  const [comidas, setComidas] = useState<PlanMeal[]>([])
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [activando, setActivando] = useState(false)
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'ok' | 'error' } | null>(null)
  const [planEditandoId, setPlanEditandoId] = useState<string | null>(null)

  // Shopping list
  const [generandoLista, setGenerandoLista] = useState(false)
  const [shoppingList, setShoppingList] = useState<MealPlan['shoppingList']>(null)
  const [diasLista, setDiasLista] = useState(7)
  const [copiadoWA, setCopiadoWA] = useState(false)

  const foodMap = new Map(foods.map(f => [f.id, f]))
  const macros = calcMacros(comidas, foodMap)

  const cargarDatos = useCallback(async () => {
    try {
      const [clienteData, foodsData, templatesData, historialData] = await Promise.all([
        fetch(`/api/admin/cliente/${id}`).then(r => r.json()),
        fetch('/api/admin/foods').then(r => r.json()),
        fetch('/api/admin/templates').then(r => r.json()),
        fetch(`/api/admin/meal-plans?userId=${id}`).then(r => r.json()),
      ])
      setCliente(clienteData)

      const loadedFoods: Food[] = foodsData.foods ?? []
      const loadedTemplates: Template[] = templatesData.templates ?? []
      setFoods(loadedFoods)
      setTemplates(loadedTemplates)

      if (loadedFoods.length === 0) {
        setDataError('No hay alimentos en la base de datos. Corré npm run db:seed en la terminal.')
      }

      const planes: MealPlan[] = historialData.plans ?? []
      setHistorial(planes)

      // Cargar borrador si existe
      const borrador = planes.find(p => p.estado === 'BORRADOR')
      if (borrador && borrador.comidas.length > 0) {
        setPlanEditandoId(borrador.id)
        setComidas(borrador.comidas.map(c => ({
          nombre: c.nombre, orden: c.orden,
          items: c.items.map(it => ({ foodId: it.foodId, gramos: it.gramos })),
        })))
        setNotas(borrador.notas ?? '')
        if (borrador.shoppingList) setShoppingList(borrador.shoppingList)
      }
    } catch {
      setDataError('Error al cargar datos.')
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.esAdmin) { router.push('/dashboard'); return }
      setNombreAdmin(d.nombre)
    })
    cargarDatos()
  }, [id, router, cargarDatos])

  // ── Templates sugeridos por perfil ──
  const templatesSugeridos = cliente?.perfil ? templates.filter(t =>
    (!t.genero || t.genero === cliente.perfil!.genero) &&
    (!t.objetivo || t.objetivo === cliente.perfil!.objetivo)
  ) : []
  const templatesOtros = templates.filter(t => !templatesSugeridos.includes(t))

  // ── Cargar template ──
  function cargarTemplate(t: Template) {
    if (comidas.length > 0 && !confirm(`¿Reemplazar el plan actual con "${t.nombre}"?`)) return
    setComidas(t.comidas.map(c => ({
      nombre: c.nombre, orden: c.orden, horaSugerida: c.horaSugerida,
      items: c.items.map(it => ({ foodId: it.foodId, gramos: it.gramos })),
    })))
    setPlanEditandoId(null)
    setShoppingList(null)
    setMensaje({ texto: `Template "${t.nombre}" cargado. Ajustá los gramajes y guardá.`, tipo: 'ok' })
    // Scroll al editor
    setTimeout(() => document.getElementById('editor-comidas')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  // ── Manejo de comidas ──
  function agregarComida() {
    setComidas(prev => [...prev, { nombre: MEAL_NOMBRES[prev.length] ?? 'Comida', orden: prev.length, items: [] }])
    setTimeout(() => document.getElementById('editor-comidas')?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100)
  }
  function eliminarComida(idx: number) {
    setComidas(prev => prev.filter((_, i) => i !== idx).map((c, i) => ({ ...c, orden: i })))
  }
  function actualizarNombreComida(idx: number, v: string) {
    setComidas(prev => prev.map((c, i) => i === idx ? { ...c, nombre: v } : c))
  }
  function actualizarHoraComida(idx: number, v: string) {
    setComidas(prev => prev.map((c, i) => i === idx ? { ...c, horaSugerida: v } : c))
  }
  function agregarItem(mIdx: number) {
    if (!foods.length) return
    setComidas(prev => prev.map((c, i) => i === mIdx
      ? { ...c, items: [...c.items, { foodId: foods[0].id, gramos: 100 }] }
      : c))
  }
  function eliminarItem(mIdx: number, iIdx: number) {
    setComidas(prev => prev.map((c, i) => i === mIdx
      ? { ...c, items: c.items.filter((_, j) => j !== iIdx) }
      : c))
  }
  function cambiarFood(mIdx: number, iIdx: number, foodId: string) {
    setComidas(prev => prev.map((c, i) => i === mIdx
      ? { ...c, items: c.items.map((it, j) => j === iIdx ? { ...it, foodId } : it) }
      : c))
  }
  function cambiarGramos(mIdx: number, iIdx: number, val: string) {
    const g = Math.max(0, Number(val) || 0)
    setComidas(prev => prev.map((c, i) => i === mIdx
      ? { ...c, items: c.items.map((it, j) => j === iIdx ? { ...it, gramos: g } : it) }
      : c))
  }

  // ── Guardar borrador ──
  async function guardarBorrador() {
    if (!comidas.length) { setMensaje({ texto: 'Agregá al menos una comida.', tipo: 'error' }); return }
    const itemsVacios = comidas.some(c => c.items.length === 0)
    if (itemsVacios) { setMensaje({ texto: 'Hay comidas sin alimentos. Agregá al menos 1 alimento por comida.', tipo: 'error' }); return }
    setGuardando(true); setMensaje(null)

    if (planEditandoId) {
      await fetch(`/api/admin/meal-plans/${planEditandoId}`, { method: 'DELETE' })
    }

    const res = await fetch('/api/admin/meal-plans', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: id, notas,
        comidas: comidas.map(c => ({
          nombre: c.nombre, orden: c.orden, horaSugerida: c.horaSugerida || null,
          items: c.items.map(it => ({ foodId: it.foodId, gramos: it.gramos })),
        })),
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setPlanEditandoId(data.plan.id)
      setMensaje({ texto: '✅ Borrador guardado.', tipo: 'ok' })
      await cargarDatos()
    } else {
      setMensaje({ texto: '❌ Error al guardar.', tipo: 'error' })
    }
    setGuardando(false)
  }

  // ── Activar plan ──
  async function activarPlan() {
    if (!planEditandoId) { await guardarBorrador(); return }
    if (!confirm('¿Activar este plan? El plan activo anterior quedará archivado.')) return
    setActivando(true); setMensaje(null)
    const res = await fetch(`/api/admin/meal-plans/${planEditandoId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'ACTIVO' }),
    })
    if (res.ok) {
      setMensaje({ texto: '✅ Plan activado correctamente.', tipo: 'ok' })
      await cargarDatos()
    } else {
      setMensaje({ texto: '❌ Error al activar.', tipo: 'error' })
    }
    setActivando(false)
  }

  // ── Cargar desde historial ──
  function editarDesdeHistorial(plan: MealPlan) {
    if (comidas.length > 0 && !confirm('¿Reemplazar el editor con este plan?')) return
    setPlanEditandoId(null)
    setComidas(plan.comidas.map(c => ({
      nombre: c.nombre, orden: c.orden,
      items: c.items.map(it => ({ foodId: it.foodId, gramos: it.gramos })),
    })))
    setNotas(plan.notas ?? '')
    setShoppingList(null)
    setMensaje({ texto: `v${plan.version} cargado. Guardá para crear una nueva versión.`, tipo: 'ok' })
  }

  // ── Lista de compras ──
  async function generarListaCompras() {
    if (!planEditandoId) {
      setMensaje({ texto: 'Guardá el borrador primero.', tipo: 'error' }); return
    }
    setGenerandoLista(true)
    const res = await fetch(`/api/admin/meal-plans/${planEditandoId}/shopping-list`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diasCubiertos: diasLista }),
    })
    if (res.ok) {
      const data = await res.json()
      setShoppingList(data.lista)
      setMensaje({ texto: '✅ Lista generada.', tipo: 'ok' })
    } else {
      setMensaje({ texto: '❌ Error al generar lista.', tipo: 'error' })
    }
    setGenerandoLista(false)
  }

  function copiarParaWhatsApp() {
    if (!shoppingList) return
    const porCat = new Map<string, ShoppingItem[]>()
    for (const it of shoppingList.items) {
      const cat = CAT_LABELS[it.categoria] ?? it.categoria
      if (!porCat.has(cat)) porCat.set(cat, [])
      porCat.get(cat)!.push(it)
    }
    let txt = `🛒 *Lista de compras — ${shoppingList.diasCubiertos} días*\n📋 Plan de ${cliente?.nombre}\n\n`
    for (const [cat, items] of porCat) {
      txt += `*${cat}*\n`
      for (const it of items) txt += `• ${it.nombre}: ${it.cantidad} ${it.unidad}\n`
      txt += '\n'
    }
    txt += `_Re-Viva by IGZ Trainer_`
    navigator.clipboard.writeText(txt)
    setCopiadoWA(true)
    setTimeout(() => setCopiadoWA(false), 2500)
  }

  async function toggleComprado(itemId: string, comprado: boolean) {
    if (!planEditandoId) return
    await fetch(`/api/admin/meal-plans/${planEditandoId}/shopping-list`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, comprado: !comprado }),
    })
    setShoppingList(prev => prev ? {
      ...prev,
      items: prev.items.map(it => it.id === itemId ? { ...it, comprado: !comprado } : it),
    } : prev)
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
    </div>
  )

  if (!cliente) return null

  const planActivo = historial.find(p => p.estado === 'ACTIVO')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar nombreUsuario={nombreAdmin} esAdmin />

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <Link href={`/admin/cliente/${id}`} className="text-sm text-gray-400 hover:text-gray-600 mb-1 block">
            ← {cliente.nombre}
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Plan Builder</h1>
          <p className="text-sm text-gray-400">Armá el plan alimentario y generá la lista de compras.</p>
        </div>

        {/* Aviso de DB vacía */}
        {dataError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
            ⚠️ {dataError}
          </div>
        )}

        <div className="grid lg:grid-cols-[300px_1fr] gap-6">

          {/* ── Columna izquierda ── */}
          <div className="space-y-4">

            {/* Perfil */}
            {cliente.perfil && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 text-sm mb-3">Perfil del cliente</h2>
                <div className="space-y-1.5 text-sm">
                  {[
                    ['Género',    cliente.perfil.genero === 'MASCULINO' ? '♂ Masculino' : '♀ Femenino'],
                    ['Edad',      `${cliente.perfil.edad} años`],
                    ['Peso',      `${cliente.perfil.peso} kg`],
                    ['Altura',    `${cliente.perfil.altura} cm`],
                    ['Objetivo',  cliente.perfil.objetivo],
                    ['Adherencia',cliente.perfil.adherencia],
                    ['Días/sem',  `${cliente.perfil.diasEntrenamiento}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-400">{k}</span>
                      <span className="font-medium text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
                {cliente.plan?.igzCalorias && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-emerald-600 font-semibold mb-2">Motor IGZ sugiere:</p>
                    <div className="grid grid-cols-4 gap-1 text-center">
                      {[
                        ['kcal', cliente.plan.igzCalorias],
                        ['prot', `${cliente.plan.igzProteina}g`],
                        ['HC',   `${cliente.plan.igzHidratos}g`],
                        ['gras', `${cliente.plan.igzGrasas}g`],
                      ].map(([l, v]) => (
                        <div key={l} className="bg-emerald-50 rounded-lg p-1.5">
                          <p className="text-xs text-emerald-500">{l}</p>
                          <p className="text-xs font-bold text-emerald-700">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Templates sugeridos */}
            {templatesSugeridos.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h2 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  Sugeridos para este cliente
                </h2>
                <div className="space-y-2">
                  {templatesSugeridos.map(t => (
                    <TemplateCard key={t.id} t={t} foodMap={foodMap} onCargar={() => cargarTemplate(t)} />
                  ))}
                </div>
              </div>
            )}

            {/* Otros templates */}
            {templatesOtros.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h2 className="text-sm font-semibold text-gray-500 mb-3">Otros templates</h2>
                <div className="space-y-2">
                  {templatesOtros.map(t => (
                    <TemplateCard key={t.id} t={t} foodMap={foodMap} onCargar={() => cargarTemplate(t)} />
                  ))}
                </div>
              </div>
            )}

            {templates.length === 0 && !dataError && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-sm text-gray-400 text-center">
                No hay templates. Creá uno en{' '}
                <Link href="/admin/templates" className="text-emerald-600 underline">Admin → Templates</Link>.
              </div>
            )}

            {/* Historial */}
            {historial.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h2 className="font-semibold text-gray-900 text-sm mb-3">Historial de versiones</h2>
                <div className="space-y-2">
                  {historial.map(plan => (
                    <div key={plan.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gray-50">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-bold text-gray-700">v{plan.version}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ESTADO_PILL[plan.estado]}`}>{plan.estado}</span>
                        </div>
                        <p className="text-xs text-gray-400">{plan.kcalTotal} kcal · {new Date(plan.creadoEn).toLocaleDateString('es-AR')}</p>
                      </div>
                      {plan.estado !== 'ACTIVO' && (
                        <button onClick={() => editarDesdeHistorial(plan)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex-shrink-0">
                          Cargar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Columna derecha: editor ── */}
          <div className="space-y-4">

            {/* Barra de macros + acciones */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <div className="text-sm font-semibold text-gray-700">
                  {planEditandoId ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-amber-400 rounded-full" /> Borrador
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-gray-300 rounded-full" /> Plan nuevo
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={guardarBorrador} disabled={guardando || !comidas.length}
                    className="text-sm border border-gray-200 hover:border-gray-300 text-gray-700 disabled:opacity-40 px-3 py-1.5 rounded-xl transition-colors font-medium">
                    {guardando ? 'Guardando…' : '💾 Guardar'}
                  </button>
                  <button onClick={activarPlan} disabled={activando || !comidas.length}
                    className="text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-xl transition-colors font-semibold">
                    {activando ? 'Activando…' : '✅ Activar'}
                  </button>
                </div>
              </div>

              {/* Macros en vivo */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'kcal',     val: macros.kcal, ref: planActivo?.kcalTotal,      unit: ''  },
                  { label: 'Proteína', val: macros.prot, ref: planActivo?.proteinaTotal,  unit: 'g' },
                  { label: 'Hidratos', val: macros.hc,   ref: planActivo?.hidratosTotal,  unit: 'g' },
                  { label: 'Grasas',   val: macros.gras, ref: planActivo?.grasasTotal,    unit: 'g' },
                ].map(m => (
                  <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 mb-0.5">{m.label}</p>
                    <p className="text-lg font-bold text-gray-900 tabular-nums leading-none">
                      {m.val}<span className="text-xs font-normal">{m.unit}</span>
                    </p>
                    {m.ref != null && (
                      <p className="text-xs text-gray-400 mt-0.5">obj {m.ref}{m.unit}</p>
                    )}
                  </div>
                ))}
              </div>

              {mensaje && (
                <p className={`text-sm mt-3 font-medium ${mensaje.tipo === 'ok' ? 'text-emerald-700' : 'text-red-600'}`}>
                  {mensaje.texto}
                </p>
              )}
            </div>

            {/* Editor de comidas */}
            <div id="editor-comidas" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 text-sm">
                  Comidas {comidas.length > 0 && <span className="text-gray-400 font-normal">({comidas.length})</span>}
                </h2>
                <button onClick={agregarComida} disabled={foods.length === 0}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
                  + Agregar comida
                </button>
              </div>

              {comidas.length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <p className="text-gray-400 text-sm">
                    {foods.length === 0
                      ? '⚠️ No hay alimentos cargados. Corré el seed.'
                      : 'Seleccioná un template a la izquierda o agregá comidas manualmente.'}
                  </p>
                  {foods.length > 0 && (
                    <button onClick={agregarComida}
                      className="text-sm text-emerald-600 hover:text-emerald-700 underline font-medium">
                      Crear plan desde cero →
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {comidas.map((comida, mIdx) => {
                  const macrosComida = calcMacros([comida], foodMap)
                  return (
                    <div key={mIdx} className="border border-gray-200 rounded-xl overflow-hidden">
                      {/* Header comida */}
                      <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2">
                        <input
                          value={comida.nombre}
                          onChange={e => actualizarNombreComida(mIdx, e.target.value)}
                          className="flex-1 bg-transparent font-semibold text-sm text-gray-900 focus:outline-none min-w-0"
                        />
                        <input
                          value={comida.horaSugerida ?? ''}
                          onChange={e => actualizarHoraComida(mIdx, e.target.value)}
                          placeholder="00:00"
                          className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                        <span className="text-xs text-gray-400 tabular-nums w-14 text-right flex-shrink-0">
                          {macrosComida.kcal} kcal
                        </span>
                        <button onClick={() => eliminarComida(mIdx)}
                          className="text-gray-300 hover:text-red-400 text-xl leading-none flex-shrink-0">×</button>
                      </div>

                      {/* Items */}
                      <div className="p-3 space-y-2">
                        {comida.items.length === 0 && (
                          <p className="text-xs text-gray-400 italic">Sin alimentos — usá el botón de abajo.</p>
                        )}
                        {comida.items.map((item, iIdx) => {
                          const food = foodMap.get(item.foodId)
                          const kcalItem = food ? Math.round(food.kcal * item.gramos / 100) : 0
                          return (
                            <div key={iIdx} className="flex items-center gap-2">
                              <FoodCombobox
                                foods={foods}
                                value={item.foodId}
                                onChange={fid => cambiarFood(mIdx, iIdx, fid)}
                              />
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <input
                                  type="number" min="0" step="5"
                                  value={item.gramos === 0 ? '' : item.gramos}
                                  onChange={e => cambiarGramos(mIdx, iIdx, e.target.value)}
                                  className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-emerald-400 tabular-nums"
                                />
                                <span className="text-xs text-gray-400">{food?.unidad ?? 'g'}</span>
                              </div>
                              <span className="text-xs text-gray-400 w-14 text-right flex-shrink-0 tabular-nums">
                                {kcalItem} kcal
                              </span>
                              <button onClick={() => eliminarItem(mIdx, iIdx)}
                                className="text-gray-300 hover:text-red-400 text-xl leading-none flex-shrink-0">×</button>
                            </div>
                          )
                        })}
                        <button onClick={() => agregarItem(mIdx)}
                          disabled={foods.length === 0}
                          className="text-xs text-gray-400 hover:text-emerald-600 font-medium transition-colors disabled:opacity-40 flex items-center gap-1">
                          + alimento
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Notas */}
              {comidas.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Notas del plan</label>
                  <textarea
                    value={notas}
                    onChange={e => setNotas(e.target.value)}
                    rows={2}
                    placeholder="Instrucciones adicionales para el cliente…"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                  />
                </div>
              )}
            </div>

            {/* Lista de compras */}
            {planEditandoId && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h2 className="font-semibold text-gray-900 text-sm">🛒 Lista de compras</h2>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">Días:</span>
                      <input type="number" min="1" max="30" value={diasLista}
                        onChange={e => setDiasLista(Number(e.target.value))}
                        className="w-12 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                    <button onClick={generarListaCompras} disabled={generandoLista}
                      className="text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold px-3 py-1.5 rounded-xl transition-colors">
                      {generandoLista ? 'Generando…' : shoppingList ? 'Regenerar' : 'Generar'}
                    </button>
                  </div>
                </div>

                {shoppingList ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-gray-400">
                        {shoppingList.items.length} items · {shoppingList.diasCubiertos} días
                        {' · '}{shoppingList.items.filter(i => i.comprado).length} comprados
                      </p>
                      <button onClick={copiarParaWhatsApp}
                        className={`text-sm font-semibold px-3 py-1.5 rounded-xl transition-all ${copiadoWA ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                        {copiadoWA ? '✅ Copiado' : '📱 Copiar para WhatsApp'}
                      </button>
                    </div>

                    {(() => {
                      const porCat = new Map<string, ShoppingItem[]>()
                      for (const it of shoppingList.items) {
                        const cat = CAT_LABELS[it.categoria] ?? it.categoria
                        if (!porCat.has(cat)) porCat.set(cat, [])
                        porCat.get(cat)!.push(it)
                      }
                      return Array.from(porCat).map(([cat, items]) => (
                        <div key={cat} className="mb-4">
                          <p className="text-xs font-semibold text-gray-500 mb-2">{cat}</p>
                          <div className="space-y-1.5">
                            {items.map(it => (
                              <label key={it.id} className="flex items-center gap-2.5 cursor-pointer group">
                                <input type="checkbox" checked={it.comprado}
                                  onChange={() => toggleComprado(it.id, it.comprado)}
                                  className="rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                                />
                                <span className={`text-sm flex-1 transition-colors ${it.comprado ? 'line-through text-gray-300' : 'text-gray-700'}`}>
                                  {it.nombre}
                                </span>
                                <span className="text-xs text-gray-400 tabular-nums">{it.cantidad} {it.unidad}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))
                    })()}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Configurá los días y generá la lista de compras semanal.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
