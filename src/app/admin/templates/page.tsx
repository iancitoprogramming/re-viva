'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface Food {
  id: string
  nombre: string
  categoria: string
  kcal: number
  proteina: number
  hidratos: number
  grasas: number
  unidad: string
}

interface TemplateItem {
  id?: string
  foodId: string
  food?: Food
  gramos: number
}

interface TemplateMeal {
  id?: string
  nombre: string
  orden: number
  horaSugerida?: string
  items: TemplateItem[]
}

interface Template {
  id: string
  nombre: string
  descripcion?: string
  genero?: string
  objetivo?: string
  adherencia?: string
  edadMin?: number
  edadMax?: number
  kcalTarget: number
  proteinaTarget: number
  hidratosTarget: number
  grasasTarget: number
  generadoConIA: boolean
  activo: boolean
  comidas: TemplateMeal[]
}

const OBJETIVOS = ['VOLUMEN', 'DEFINICION', 'RECOMPOSICION']
const GENEROS   = ['MASCULINO', 'FEMENINO']
const ADHERENCIAS = ['BAJA', 'MEDIA', 'ALTA']

const OBJ_COLORES: Record<string, string> = {
  VOLUMEN:       'bg-blue-100 text-blue-700',
  DEFINICION:    'bg-orange-100 text-orange-700',
  RECOMPOSICION: 'bg-purple-100 text-purple-700',
}

// Devuelve el factor a multiplicar por los macros del Food.
// - 'unidad' (huevo, fruta entera, etc): macros guardados POR UNIDAD → usar cantidad directa
// - 'g' (gramos): macros guardados POR 100g → dividir por 100
function ratioPorUnidad(food: Food, cantidad: number): number {
  return food.unidad === 'unidad' ? cantidad : cantidad / 100
}

function calcularMacrosComidas(comidas: TemplateMeal[], foodMap: Map<string, Food>) {
  let kcal = 0, prot = 0, hc = 0, gras = 0
  for (const c of comidas) {
    for (const it of c.items) {
      const f = foodMap.get(it.foodId)
      if (!f) continue
      const factor = ratioPorUnidad(f, it.gramos)
      kcal += f.kcal * factor
      prot += f.proteina * factor
      hc   += f.hidratos * factor
      gras += f.grasas * factor
    }
  }
  return {
    kcal: Math.round(kcal),
    prot: Math.round(prot * 10) / 10,
    hc:   Math.round(hc * 10) / 10,
    gras: Math.round(gras * 10) / 10,
  }
}

const MEAL_NOMBRES = ['Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena', 'Colación nocturna']

export default function AdminTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [nombreAdmin, setNombreAdmin] = useState('')
  const [objetivoFiltro, setObjetivoFiltro] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Template | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [form, setForm] = useState({
    nombre: '', descripcion: '', genero: '', objetivo: '', adherencia: '',
    edadMin: '', edadMax: '', kcalTarget: '', proteinaTarget: '', hidratosTarget: '', grasasTarget: '',
  })
  const [comidas, setComidas] = useState<TemplateMeal[]>([])

  // Modal IA
  const [modalIA, setModalIA] = useState(false)
  const [iaForm, setIaForm] = useState({ restricciones: '', nombre: '' })
  const [generandoIA, setGenerandoIA] = useState(false)
  const [errorIA, setErrorIA] = useState('')

  const foodMap = new Map(foods.map(f => [f.id, f]))

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.esAdmin) { router.push('/dashboard'); return }
      setNombreAdmin(d.nombre)
    })
    Promise.all([
      fetch('/api/admin/templates').then(r => r.json()),
      fetch('/api/admin/foods').then(r => r.json()),
    ]).then(([tData, fData]) => {
      setTemplates(tData.templates ?? [])
      setFoods(fData.foods ?? [])
      setLoading(false)
    })
  }, [router])

  async function cargarTemplates() {
    const data = await fetch('/api/admin/templates').then(r => r.json())
    setTemplates(data.templates ?? [])
  }

  function abrirCrear() {
    setEditando(null)
    setForm({ nombre: '', descripcion: '', genero: '', objetivo: '', adherencia: '', edadMin: '', edadMax: '', kcalTarget: '', proteinaTarget: '', hidratosTarget: '', grasasTarget: '' })
    setComidas([{ nombre: 'Desayuno', orden: 0, items: [] }])
    setError('')
    setModalAbierto(true)
  }

  function abrirEditar(t: Template) {
    setEditando(t)
    setForm({
      nombre: t.nombre, descripcion: t.descripcion ?? '', genero: t.genero ?? '',
      objetivo: t.objetivo ?? '', adherencia: t.adherencia ?? '',
      edadMin: t.edadMin ? String(t.edadMin) : '', edadMax: t.edadMax ? String(t.edadMax) : '',
      kcalTarget: String(t.kcalTarget), proteinaTarget: String(t.proteinaTarget),
      hidratosTarget: String(t.hidratosTarget), grasasTarget: String(t.grasasTarget),
    })
    setComidas(t.comidas.map(c => ({
      nombre: c.nombre, orden: c.orden, horaSugerida: c.horaSugerida,
      items: c.items.map(it => ({ foodId: it.foodId, gramos: it.gramos })),
    })))
    setError('')
    setModalAbierto(true)
  }

  async function guardar() {
    if (!form.nombre || !form.kcalTarget) { setError('Nombre y macros target son obligatorios.'); return }
    setGuardando(true); setError('')
    const payload = {
      ...form,
      edadMin: form.edadMin ? Number(form.edadMin) : null,
      edadMax: form.edadMax ? Number(form.edadMax) : null,
      kcalTarget: Number(form.kcalTarget),
      proteinaTarget: Number(form.proteinaTarget),
      hidratosTarget: Number(form.hidratosTarget),
      grasasTarget: Number(form.grasasTarget),
      genero: form.genero || null,
      objetivo: form.objetivo || null,
      adherencia: form.adherencia || null,
      comidas,
    }
    const res = editando
      ? await fetch(`/api/admin/templates/${editando.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/admin/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) { setError('Error al guardar.'); setGuardando(false); return }
    setModalAbierto(false); setGuardando(false); cargarTemplates()
  }

  async function eliminar(t: Template) {
    if (!confirm(`¿Desactivar template "${t.nombre}"?`)) return
    await fetch(`/api/admin/templates/${t.id}`, { method: 'DELETE' })
    cargarTemplates()
  }

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
  function agregarItem(mealIdx: number) {
    setComidas(prev => prev.map((c, i) => i === mealIdx
      ? { ...c, items: [...c.items, { foodId: foods[0]?.id ?? '', gramos: 100 }] }
      : c))
  }
  function eliminarItem(mealIdx: number, itemIdx: number) {
    setComidas(prev => prev.map((c, i) => i === mealIdx
      ? { ...c, items: c.items.filter((_, j) => j !== itemIdx) }
      : c))
  }
  function actualizarItem(mealIdx: number, itemIdx: number, key: string, value: string | number) {
    setComidas(prev => prev.map((c, i) => i === mealIdx
      ? { ...c, items: c.items.map((it, j) => j === itemIdx ? { ...it, [key]: key === 'gramos' ? Number(value) : value } : it) }
      : c))
  }

  // ── Gemini IA ──
  async function generarConIA() {
    if (!form.kcalTarget || !form.proteinaTarget || !form.hidratosTarget || !form.grasasTarget) {
      setErrorIA('Completá los macros target primero.')
      return
    }
    setGenerandoIA(true); setErrorIA('')
    const res = await fetch('/api/admin/templates/generar-ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: iaForm.nombre || form.nombre,
        genero: form.genero || null,
        objetivo: form.objetivo || null,
        adherencia: form.adherencia || null,
        kcalTarget: Number(form.kcalTarget),
        proteinaTarget: Number(form.proteinaTarget),
        hidratosTarget: Number(form.hidratosTarget),
        grasasTarget: Number(form.grasasTarget),
        restricciones: iaForm.restricciones || null,
        guardar: false,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setErrorIA(data.error ?? 'Error al generar.'); setGenerandoIA(false); return }

    // Cargar el resultado en el form
    const tpl = data.template
    if (!form.nombre) setForm(prev => ({ ...prev, nombre: tpl.nombre }))
    // Mapear nombres de food a IDs
    const foodByName = new Map(foods.map(f => [f.nombre, f]))
    const comidasMapeadas: TemplateMeal[] = tpl.comidas.map((c: { nombre: string; orden: number; horaSugerida?: string; items: { food: string; gramos: number }[] }) => ({
      nombre: c.nombre,
      orden: c.orden,
      horaSugerida: c.horaSugerida,
      items: c.items
        .filter((it: { food: string; gramos: number }) => foodByName.has(it.food))
        .map((it: { food: string; gramos: number }) => ({
          foodId: foodByName.get(it.food)!.id,
          gramos: it.gramos,
        })),
    }))
    setComidas(comidasMapeadas)
    setModalIA(false)
    setGenerandoIA(false)
  }

  const templatesFiltrados = templates.filter(t =>
    objetivoFiltro ? t.objetivo === objetivoFiltro : true
  )

  const macrosPreview = calcularMacrosComidas(comidas, foodMap)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar nombreUsuario={nombreAdmin} esAdmin />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600 mb-1 block">← Panel admin</Link>
            <h1 className="text-xl font-bold text-gray-900">Templates de planes</h1>
            <p className="text-sm text-gray-400 mt-0.5">{templates.length} templates</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/foods" className="text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors">
              Alimentos
            </Link>
            <button onClick={abrirCrear}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              + Nuevo
            </button>
          </div>
        </div>

        {/* Filtro objetivo */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['', ...OBJETIVOS].map(obj => (
            <button key={obj} onClick={() => setObjetivoFiltro(obj)}
              className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${objetivoFiltro === obj ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {obj || 'Todos'}
            </button>
          ))}
        </div>

        {/* Grid de templates */}
        <div className="grid gap-4 sm:grid-cols-2">
          {templatesFiltrados.map(t => {
            const macros = calcularMacrosComidas(t.comidas, foodMap)
            return (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {t.objetivo && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${OBJ_COLORES[t.objetivo] ?? 'bg-gray-100 text-gray-600'}`}>{t.objetivo}</span>}
                      {t.genero && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t.genero === 'MASCULINO' ? '♂' : '♀'}</span>}
                      {t.generadoConIA && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">IA</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{t.nombre}</h3>
                    {t.descripcion && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{t.descripcion}</p>}
                  </div>
                </div>

                {/* Macros calculados */}
                <div className="grid grid-cols-4 gap-2 mb-4 bg-gray-50 rounded-xl p-3">
                  {[
                    { label: 'kcal', val: macros.kcal, unit: '' },
                    { label: 'Prot', val: macros.prot, unit: 'g' },
                    { label: 'HC',   val: macros.hc,   unit: 'g' },
                    { label: 'Gras', val: macros.gras, unit: 'g' },
                  ].map(m => (
                    <div key={m.label} className="text-center">
                      <p className="text-xs text-gray-400">{m.label}</p>
                      <p className="font-bold text-gray-900 text-sm">{m.val}{m.unit}</p>
                    </div>
                  ))}
                </div>

                {/* Comidas */}
                <div className="space-y-1 mb-4">
                  {t.comidas.map(c => (
                    <div key={c.id ?? c.nombre} className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{c.nombre}</span>
                      <span>{c.items.length} alimentos</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-50">
                  <button onClick={() => abrirEditar(t)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Editar</button>
                  <button onClick={() => eliminar(t)} className="text-xs text-red-400 hover:text-red-600 font-medium">Desactivar</button>
                </div>
              </div>
            )
          })}
          {templatesFiltrados.length === 0 && (
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              No hay templates.
            </div>
          )}
        </div>
      </main>

      {/* Modal crear/editar template */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <h2 className="font-bold text-gray-900">{editando ? 'Editar template' : 'Nuevo template'}</h2>
              <div className="flex gap-3">
                <button onClick={() => setModalIA(true)}
                  className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                  ✨ Generar con IA
                </button>
                <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Info básica */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Nombre *</label>
                  <input value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Hombre joven hipertrofia" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Descripción</label>
                  <textarea value={form.descripcion} onChange={e => setForm(f => ({...f, descripcion: e.target.value}))} rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Género</label>
                    <select value={form.genero} onChange={e => setForm(f => ({...f, genero: e.target.value}))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
                      <option value="">Cualquiera</option>
                      {GENEROS.map(g => <option key={g} value={g}>{g === 'MASCULINO' ? 'Masculino' : 'Femenino'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Objetivo</label>
                    <select value={form.objetivo} onChange={e => setForm(f => ({...f, objetivo: e.target.value}))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
                      <option value="">Cualquiera</option>
                      {OBJETIVOS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Adherencia</label>
                    <select value={form.adherencia} onChange={e => setForm(f => ({...f, adherencia: e.target.value}))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
                      <option value="">Cualquiera</option>
                      {ADHERENCIAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Macros target */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Macros target del template</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { key: 'kcalTarget', label: 'kcal *' },
                    { key: 'proteinaTarget', label: 'Prot (g) *' },
                    { key: 'hidratosTarget', label: 'HC (g) *' },
                    { key: 'grasasTarget', label: 'Gras (g) *' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-500 block mb-1">{label}</label>
                      <input type="number" min="0"
                        value={form[key as keyof typeof form]}
                        onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview macros calculados */}
              {comidas.length > 0 && (
                <div className="bg-emerald-50 rounded-xl p-3 flex gap-4 text-sm">
                  <span className="text-emerald-700 font-semibold">Calculado:</span>
                  <span>{macrosPreview.kcal} kcal</span>
                  <span>{macrosPreview.prot}g prot</span>
                  <span>{macrosPreview.hc}g HC</span>
                  <span>{macrosPreview.gras}g gras</span>
                </div>
              )}

              {/* Comidas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-600">Comidas ({comidas.length})</p>
                  <button onClick={agregarComida} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">+ Agregar comida</button>
                </div>
                <div className="space-y-4">
                  {comidas.map((comida, mIdx) => (
                    <div key={mIdx} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <input value={comida.nombre} onChange={e => actualizarComida(mIdx, 'nombre', e.target.value)}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                        <input value={comida.horaSugerida ?? ''} onChange={e => actualizarComida(mIdx, 'horaSugerida', e.target.value)}
                          placeholder="08:00" className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                        <button onClick={() => eliminarComida(mIdx)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {comida.items.map((item, iIdx) => {
                          const food = foodMap.get(item.foodId)
                          return (
                            <div key={iIdx} className="flex items-center gap-2">
                              <select value={item.foodId} onChange={e => actualizarItem(mIdx, iIdx, 'foodId', e.target.value)}
                                className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white min-w-0">
                                {foods.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                              </select>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <input type="number" min="0" step="5"
                                  value={item.gramos} onChange={e => actualizarItem(mIdx, iIdx, 'gramos', e.target.value)}
                                  className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                                <span className="text-xs text-gray-400">{food?.unidad ?? 'g'}</span>
                              </div>
                              {food && (
                                <span className="text-xs text-gray-400 w-16 text-right flex-shrink-0">
                                  {Math.round(food.kcal * item.gramos / 100)} kcal
                                </span>
                              )}
                              <button onClick={() => eliminarItem(mIdx, iIdx)} className="text-gray-300 hover:text-red-400 text-lg leading-none flex-shrink-0">×</button>
                            </div>
                          )
                        })}
                        <button onClick={() => agregarItem(mIdx)} className="text-xs text-gray-400 hover:text-emerald-600 font-medium">+ alimento</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end sticky bottom-0 bg-white rounded-b-2xl">
              <button onClick={() => setModalAbierto(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancelar</button>
              <button onClick={guardar} disabled={guardando}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal IA */}
      {modalIA && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-1">✨ Generar con IA</h3>
            <p className="text-sm text-gray-400 mb-4">
              Gemini va a crear las comidas del template basándose en los macros target y el perfil que configuraste arriba.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Nombre sugerido (opcional)</label>
                <input value={iaForm.nombre} onChange={e => setIaForm(f => ({...f, nombre: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Se usa el nombre del template si está vacío" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Restricciones alimentarias</label>
                <input value={iaForm.restricciones} onChange={e => setIaForm(f => ({...f, restricciones: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="sin lactosa, sin gluten..." />
              </div>
            </div>
            {errorIA && <p className="text-red-500 text-sm mt-3">{errorIA}</p>}
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => setModalIA(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancelar</button>
              <button onClick={generarConIA} disabled={generandoIA}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                {generandoIA ? 'Generando...' : 'Generar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
