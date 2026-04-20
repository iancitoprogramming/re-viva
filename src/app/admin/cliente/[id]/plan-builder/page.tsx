'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Food {
  id: string; nombre: string; categoria: string
  kcal: number; proteina: number; hidratos: number; grasas: number; unidad: string
}

interface PlanItem  { id?: string; foodId: string; food?: Food; gramos: number; notas?: string }
interface PlanMeal  { id?: string; nombre: string; orden: number; horaSugerida?: string; items: PlanItem[] }

interface Template {
  id: string; nombre: string; descripcion?: string
  genero?: string; objetivo?: string; adherencia?: string
  kcalTarget: number; proteinaTarget: number; hidratosTarget: number; grasasTarget: number
  generadoConIA: boolean
  comidas: { nombre: string; orden: number; horaSugerida?: string; items: { foodId: string; food: Food; gramos: number }[] }[]
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
    const f = foodMap.get(it.foodId)
    if (!f) continue
    const factor = it.gramos / 100
    kcal += f.kcal * factor; prot += f.proteina * factor
    hc   += f.hidratos * factor; gras += f.grasas * factor
  }
  return {
    kcal: Math.round(kcal), prot: Math.round(prot * 10) / 10,
    hc:   Math.round(hc * 10) / 10, gras: Math.round(gras * 10) / 10,
  }
}

const MEAL_NOMBRES = ['Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena', 'Colación']

const ESTADO_COLORES = {
  BORRADOR:  'bg-gray-100 text-gray-600',
  ACTIVO:    'bg-emerald-100 text-emerald-700',
  ARCHIVADO: 'bg-gray-50 text-gray-400',
}

const CAT_LABELS: Record<string, string> = {
  PROTEINA_ANIMAL: 'Prot. Animal', PROTEINA_VEGETAL: 'Prot. Vegetal',
  LACTEO: 'Lácteo', CARBOHIDRATO: 'Carbohidrato', VEGETAL: 'Vegetal',
  FRUTA: 'Fruta', GRASA: 'Grasa', BEBIDA: 'Bebida',
  CONDIMENTO: 'Condimento', SUPLEMENTO: 'Suplemento',
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PlanBuilderPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [nombreAdmin, setNombreAdmin] = useState('')
  const [cliente, setCliente] = useState<ClienteData | null>(null)
  const [foods, setFoods] = useState<Food[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [historial, setHistorial] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)

  // Editor
  const [comidas, setComidas] = useState<PlanMeal[]>([])
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [activando, setActivando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  // Shopping list
  const [generandoLista, setGenerandoLista] = useState(false)
  const [planConLista, setPlanConLista] = useState<MealPlan | null>(null)
  const [diasLista, setDiasLista] = useState(7)
  const [copiadoWA, setCopiadoWA] = useState(false)

  // Plan en edición (si se edita uno ya guardado)
  const [planEditandoId, setPlanEditandoId] = useState<string | null>(null)

  const foodMap = new Map(foods.map(f => [f.id, f]))
  const macros = calcMacros(comidas, foodMap)

  const cargarDatos = useCallback(async () => {
    const [clienteData, foodsData, templatesData, historialData] = await Promise.all([
      fetch(`/api/admin/cliente/${id}`).then(r => r.json()),
      fetch('/api/admin/foods').then(r => r.json()),
      fetch('/api/admin/templates').then(r => r.json()),
      fetch(`/api/admin/meal-plans?userId=${id}`).then(r => r.json()),
    ])
    setCliente(clienteData)
    setFoods(foodsData.foods ?? [])
    setTemplates(templatesData.templates ?? [])
    const planes: MealPlan[] = historialData.plans ?? []
    setHistorial(planes)
    // Si hay un BORRADOR activo, cargarlo en el editor
    const borrador = planes.find(p => p.estado === 'BORRADOR')
    if (borrador) {
      setPlanEditandoId(borrador.id)
      setComidas(borrador.comidas.map(c => ({
        nombre: c.nombre, orden: c.orden,
        items: c.items.map(it => ({ foodId: it.foodId, gramos: it.gramos })),
      })))
      setNotas(borrador.notas ?? '')
      // Si tiene lista, mostrarla
      if (borrador.shoppingList) setPlanConLista(borrador)
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

  // ── Cargar template ──
  function cargarTemplate(t: Template) {
    if (comidas.length > 0 && !confirm('¿Reemplazar el plan actual con este template?')) return
    setComidas(t.comidas.map(c => ({
      nombre: c.nombre, orden: c.orden, horaSugerida: c.horaSugerida,
      items: c.items.map(it => ({ foodId: it.foodId, gramos: it.gramos })),
    })))
    setPlanEditandoId(null)
    setMensaje('')
    setPlanConLista(null)
  }

  // ── Templates sugeridos según perfil del cliente ──
  const templatesSugeridos = cliente?.perfil ? templates.filter(t =>
    (!t.genero || t.genero === cliente.perfil!.genero) &&
    (!t.objetivo || t.objetivo === cliente.perfil!.objetivo) &&
    (!t.adherencia || t.adherencia === cliente.perfil!.adherencia)
  ) : []

  const templatesOtros = templates.filter(t => !templatesSugeridos.includes(t))

  // ── Manejo de comidas ──
  function agregarComida() {
    setComidas(prev => [...prev, { nombre: MEAL_NOMBRES[prev.length] ?? 'Comida', orden: prev.length, items: [] }])
  }
  function eliminarComida(idx: number) {
    setComidas(prev => prev.filter((_, i) => i !== idx).map((c, i) => ({ ...c, orden: i })))
  }
  function actualizarComida(idx: number, key: string, value: string) {
    setComidas(prev => prev.map((c, i) => i === idx ? { ...c, [key]: value } : c))
  }
  function agregarItem(mIdx: number) {
    setComidas(prev => prev.map((c, i) => i === mIdx
      ? { ...c, items: [...c.items, { foodId: foods[0]?.id ?? '', gramos: 100 }] }
      : c))
  }
  function eliminarItem(mIdx: number, iIdx: number) {
    setComidas(prev => prev.map((c, i) => i === mIdx
      ? { ...c, items: c.items.filter((_, j) => j !== iIdx) }
      : c))
  }
  function actualizarItem(mIdx: number, iIdx: number, key: string, value: string | number) {
    setComidas(prev => prev.map((c, i) => i === mIdx
      ? { ...c, items: c.items.map((it, j) => j === iIdx ? { ...it, [key]: key === 'gramos' ? Number(value) : value } : it) }
      : c))
  }

  // ── Guardar borrador ──
  async function guardarBorrador() {
    if (!comidas.length) { setMensaje('❌ Agregá al menos una comida.'); return }
    setGuardando(true); setMensaje('')

    const payload = {
      userId: id,
      notas,
      comidas: comidas.map(c => ({
        nombre: c.nombre, orden: c.orden, horaSugerida: c.horaSugerida || null,
        items: c.items.map(it => ({ foodId: it.foodId, gramos: it.gramos })),
      })),
    }

    if (planEditandoId) {
      // Guardar sobre el borrador existente: eliminar y recrear
      await fetch(`/api/admin/meal-plans/${planEditandoId}`, { method: 'DELETE' })
    }

    const res = await fetch('/api/admin/meal-plans', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    if (res.ok) {
      const data = await res.json()
      setPlanEditandoId(data.plan.id)
      setMensaje('✅ Borrador guardado.')
      await cargarDatos()
    } else {
      setMensaje('❌ Error al guardar.')
    }
    setGuardando(false)
  }

  // ── Activar plan ──
  async function activarPlan() {
    if (!planEditandoId) { setMensaje('❌ Guardá el borrador primero.'); return }
    if (!confirm('¿Activar este plan? El plan activo anterior quedará archivado.')) return
    setActivando(true); setMensaje('')
    const res = await fetch(`/api/admin/meal-plans/${planEditandoId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'ACTIVO' }),
    })
    if (res.ok) {
      setMensaje('✅ Plan activado.')
      await cargarDatos()
    } else {
      setMensaje('❌ Error al activar.')
    }
    setActivando(false)
  }

  // ── Cargar plan del historial en editor ──
  function editarDesdeHistorial(plan: MealPlan) {
    if (comidas.length > 0 && !confirm('¿Reemplazar el editor con este plan?')) return
    setPlanEditandoId(null) // Crear nueva versión basada en éste
    setComidas(plan.comidas.map(c => ({
      nombre: c.nombre, orden: c.orden,
      items: c.items.map(it => ({ foodId: it.foodId, gramos: it.gramos })),
    })))
    setNotas(plan.notas ?? '')
    setPlanConLista(null)
    setMensaje('Plan cargado en el editor. Guardá para crear una nueva versión.')
  }

  // ── Generar lista de compras ──
  async function generarListaCompras() {
    if (!planEditandoId) { setMensaje('❌ Guardá el plan primero.'); return }
    setGenerandoLista(true)
    const res = await fetch(`/api/admin/meal-plans/${planEditandoId}/shopping-list`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diasCubiertos: diasLista }),
    })
    if (res.ok) {
      await cargarDatos()
      // Buscar el plan con la lista actualizada
      const planes: MealPlan[] = await fetch(`/api/admin/meal-plans?userId=${id}`).then(r => r.json()).then(d => d.plans ?? [])
      const planActual = planes.find(p => p.id === planEditandoId)
      if (planActual) setPlanConLista(planActual)
      setMensaje('✅ Lista generada.')
    } else {
      setMensaje('❌ Error al generar lista.')
    }
    setGenerandoLista(false)
  }

  // ── Copiar lista para WhatsApp ──
  function copiarParaWhatsApp() {
    const lista = planConLista?.shoppingList
    if (!lista) return
    const porCategoria = new Map<string, ShoppingItem[]>()
    for (const item of lista.items) {
      const cat = CAT_LABELS[item.categoria] ?? item.categoria
      if (!porCategoria.has(cat)) porCategoria.set(cat, [])
      porCategoria.get(cat)!.push(item)
    }
    let texto = `🛒 *Lista de compras — ${lista.diasCubiertos} días*\n`
    texto += `📋 Plan de ${cliente?.nombre}\n\n`
    for (const [cat, items] of porCategoria) {
      texto += `*${cat}*\n`
      for (const it of items) texto += `• ${it.nombre}: ${it.cantidad} ${it.unidad}\n`
      texto += '\n'
    }
    texto += `_Generado con Re-Viva by IGZ Trainer_`
    navigator.clipboard.writeText(texto)
    setCopiadoWA(true)
    setTimeout(() => setCopiadoWA(false), 2500)
  }

  // ── Marcar item comprado ──
  async function toggleComprado(itemId: string, comprado: boolean) {
    if (!planEditandoId) return
    await fetch(`/api/admin/meal-plans/${planEditandoId}/shopping-list`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, comprado: !comprado }),
    })
    // Actualizar local
    setPlanConLista(prev => {
      if (!prev?.shoppingList) return prev
      return {
        ...prev,
        shoppingList: {
          ...prev.shoppingList,
          items: prev.shoppingList.items.map(it => it.id === itemId ? { ...it, comprado: !comprado } : it),
        },
      }
    })
  }

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

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">

          {/* ── Columna izquierda: perfil + templates ── */}
          <div className="space-y-4">

            {/* Perfil del cliente */}
            {cliente.perfil && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 text-sm mb-3">Perfil del cliente</h2>
                <div className="space-y-1.5 text-sm">
                  {[
                    ['Género', cliente.perfil.genero === 'MASCULINO' ? '♂ Masculino' : '♀ Femenino'],
                    ['Edad', `${cliente.perfil.edad} años`],
                    ['Peso', `${cliente.perfil.peso} kg`],
                    ['Altura', `${cliente.perfil.altura} cm`],
                    ['Objetivo', cliente.perfil.objetivo],
                    ['Adherencia', cliente.perfil.adherencia],
                    ['Días entrena', `${cliente.perfil.diasEntrenamiento}/semana`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-400">{k}</span>
                      <span className="font-medium text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
                {cliente.plan?.igzCalorias && (
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <p className="text-xs text-emerald-600 font-semibold mb-1.5">Motor IGZ sugiere:</p>
                    <div className="grid grid-cols-4 gap-1 text-center">
                      {[
                        { label: 'kcal', val: cliente.plan.igzCalorias },
                        { label: 'prot', val: `${cliente.plan.igzProteina}g` },
                        { label: 'HC', val: `${cliente.plan.igzHidratos}g` },
                        { label: 'gras', val: `${cliente.plan.igzGrasas}g` },
                      ].map(m => (
                        <div key={m.label} className="bg-emerald-50 rounded-lg p-1.5">
                          <p className="text-xs text-emerald-500">{m.label}</p>
                          <p className="text-xs font-bold text-emerald-700">{m.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Templates sugeridos */}
            {templatesSugeridos.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Templates sugeridos
                </h2>
                <div className="space-y-2">
                  {templatesSugeridos.map(t => (
                    <button key={t.id} onClick={() => cargarTemplate(t)}
                      className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all">
                      <div className="flex items-center gap-1.5 mb-1">
                        {t.generadoConIA && <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">IA</span>}
                        <p className="text-sm font-semibold text-gray-900 truncate">{t.nombre}</p>
                      </div>
                      <p className="text-xs text-gray-400">{t.kcalTarget} kcal · {t.proteinaTarget}g prot</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Otros templates */}
            {templatesOtros.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 text-sm mb-3 text-gray-500">Otros templates</h2>
                <div className="space-y-2">
                  {templatesOtros.map(t => (
                    <button key={t.id} onClick={() => cargarTemplate(t)}
                      className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all">
                      <p className="text-sm font-medium text-gray-700 truncate">{t.nombre}</p>
                      <p className="text-xs text-gray-400">{t.kcalTarget} kcal · {t.objetivo ?? '—'}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Historial de versiones */}
            {historial.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 text-sm mb-3">Historial</h2>
                <div className="space-y-2">
                  {historial.map(plan => (
                    <div key={plan.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gray-50">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-bold text-gray-700">v{plan.version}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ESTADO_COLORES[plan.estado]}`}>{plan.estado}</span>
                        </div>
                        <p className="text-xs text-gray-400">{plan.kcalTotal} kcal · {new Date(plan.creadoEn).toLocaleDateString('es-AR')}</p>
                      </div>
                      {plan.estado !== 'ACTIVO' && (
                        <button onClick={() => editarDesdeHistorial(plan)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex-shrink-0">
                          Cargar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Columna derecha: editor + lista ── */}
          <div className="space-y-4">

            {/* Barra de macros en vivo */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 text-sm">
                  {planEditandoId ? `Editando borrador` : 'Plan nuevo'}
                </h2>
                <div className="flex gap-2">
                  <button onClick={guardarBorrador} disabled={guardando || !comidas.length}
                    className="text-sm border border-gray-200 hover:border-gray-300 text-gray-700 disabled:opacity-40 px-3 py-1.5 rounded-xl transition-colors font-medium">
                    {guardando ? 'Guardando...' : '💾 Guardar borrador'}
                  </button>
                  <button onClick={activarPlan} disabled={activando || !planEditandoId}
                    className="text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-xl transition-colors font-semibold">
                    {activando ? 'Activando...' : '✅ Activar'}
                  </button>
                </div>
              </div>

              {/* Macros en vivo */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'kcal', val: macros.kcal, ref: planActivo?.kcalTotal, unit: '' },
                  { label: 'Proteína', val: macros.prot, ref: planActivo?.proteinaTotal, unit: 'g' },
                  { label: 'Hidratos', val: macros.hc,   ref: planActivo?.hidratosTotal, unit: 'g' },
                  { label: 'Grasas',   val: macros.gras, ref: planActivo?.grasasTotal,   unit: 'g' },
                ].map(m => (
                  <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 mb-0.5">{m.label}</p>
                    <p className="text-lg font-bold text-gray-900">{m.val}<span className="text-xs font-normal">{m.unit}</span></p>
                    {m.ref != null && (
                      <p className="text-xs text-gray-400 mt-0.5">ref {m.ref}{m.unit}</p>
                    )}
                  </div>
                ))}
              </div>

              {mensaje && (
                <p className="text-sm mt-3 font-medium text-gray-700">{mensaje}</p>
              )}
            </div>

            {/* Editor de comidas */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 text-sm">Comidas ({comidas.length})</h2>
                <button onClick={agregarComida}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold">
                  + Agregar comida
                </button>
              </div>

              {comidas.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">
                  Elegí un template de la izquierda o agregá comidas manualmente.
                </div>
              )}

              <div className="space-y-5">
                {comidas.map((comida, mIdx) => {
                  const macrosComida = calcMacros([comida], foodMap)
                  return (
                    <div key={mIdx} className="border border-gray-200 rounded-xl overflow-hidden">
                      {/* Header comida */}
                      <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2">
                        <input value={comida.nombre}
                          onChange={e => actualizarComida(mIdx, 'nombre', e.target.value)}
                          className="flex-1 bg-transparent font-semibold text-sm text-gray-900 focus:outline-none" />
                        <input value={comida.horaSugerida ?? ''}
                          onChange={e => actualizarComida(mIdx, 'horaSugerida', e.target.value)}
                          placeholder="00:00" className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                        <span className="text-xs text-gray-400">{macrosComida.kcal} kcal</span>
                        <button onClick={() => eliminarComida(mIdx)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
                      </div>

                      {/* Items */}
                      <div className="p-3 space-y-2">
                        {comida.items.map((item, iIdx) => {
                          const food = foodMap.get(item.foodId)
                          const kcalItem = food ? Math.round(food.kcal * item.gramos / 100) : 0
                          return (
                            <div key={iIdx} className="flex items-center gap-2">
                              <select value={item.foodId}
                                onChange={e => actualizarItem(mIdx, iIdx, 'foodId', e.target.value)}
                                className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white">
                                {foods.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                              </select>
                              <input type="number" min="0" step="5"
                                value={item.gramos}
                                onChange={e => actualizarItem(mIdx, iIdx, 'gramos', e.target.value)}
                                className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                              <span className="text-xs text-gray-400 w-8 flex-shrink-0">{food?.unidad ?? 'g'}</span>
                              <span className="text-xs text-gray-400 w-14 text-right flex-shrink-0">{kcalItem} kcal</span>
                              <button onClick={() => eliminarItem(mIdx, iIdx)}
                                className="text-gray-300 hover:text-red-400 text-lg flex-shrink-0">×</button>
                            </div>
                          )
                        })}
                        <button onClick={() => agregarItem(mIdx)}
                          className="text-xs text-gray-400 hover:text-emerald-600 font-medium transition-colors">
                          + alimento
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Notas */}
              {comidas.length > 0 && (
                <div className="mt-4">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Notas del plan</label>
                  <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
                    placeholder="Instrucciones adicionales para el cliente..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
                </div>
              )}
            </div>

            {/* Lista de compras */}
            {planEditandoId && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 text-sm">🛒 Lista de compras</h2>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">Días:</span>
                      <input type="number" min="1" max="30" value={diasLista}
                        onChange={e => setDiasLista(Number(e.target.value))}
                        className="w-12 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                    </div>
                    <button onClick={generarListaCompras} disabled={generandoLista}
                      className="text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold px-3 py-1.5 rounded-xl transition-colors">
                      {generandoLista ? 'Generando...' : planConLista?.shoppingList ? 'Regenerar' : 'Generar'}
                    </button>
                  </div>
                </div>

                {planConLista?.shoppingList ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-400">
                        {planConLista.shoppingList.items.length} items · {planConLista.shoppingList.diasCubiertos} días
                      </p>
                      <button onClick={copiarParaWhatsApp}
                        className={`text-sm font-semibold px-3 py-1.5 rounded-xl transition-all ${copiadoWA ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                        {copiadoWA ? '✅ Copiado' : '📱 Copiar para WhatsApp'}
                      </button>
                    </div>

                    {/* Lista agrupada por categoría */}
                    {(() => {
                      const porCat = new Map<string, ShoppingItem[]>()
                      for (const it of planConLista.shoppingList!.items) {
                        const cat = CAT_LABELS[it.categoria] ?? it.categoria
                        if (!porCat.has(cat)) porCat.set(cat, [])
                        porCat.get(cat)!.push(it)
                      }
                      return Array.from(porCat).map(([cat, items]) => (
                        <div key={cat} className="mb-3">
                          <p className="text-xs font-semibold text-gray-500 mb-1.5">{cat}</p>
                          <div className="space-y-1">
                            {items.map(it => (
                              <label key={it.id} className="flex items-center gap-2.5 cursor-pointer group">
                                <input type="checkbox" checked={it.comprado}
                                  onChange={() => toggleComprado(it.id, it.comprado)}
                                  className="rounded text-emerald-500 focus:ring-emerald-400" />
                                <span className={`text-sm flex-1 ${it.comprado ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                  {it.nombre}
                                </span>
                                <span className="text-xs text-gray-400">{it.cantidad} {it.unidad}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))
                    })()}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Guardá el borrador y generá la lista de compras semanal.
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
