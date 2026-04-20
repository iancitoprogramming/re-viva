'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

type FoodCategoria =
  | 'PROTEINA_ANIMAL' | 'PROTEINA_VEGETAL' | 'LACTEO'
  | 'CARBOHIDRATO' | 'VEGETAL' | 'FRUTA'
  | 'GRASA' | 'BEBIDA' | 'CONDIMENTO' | 'SUPLEMENTO'

interface Food {
  id: string
  nombre: string
  categoria: FoodCategoria
  unidad: string
  kcal: number
  proteina: number
  hidratos: number
  grasas: number
  unidadCompra: string | null
  activo: boolean
}

const CATEGORIAS: { value: FoodCategoria; label: string }[] = [
  { value: 'PROTEINA_ANIMAL',  label: 'Proteína animal'   },
  { value: 'PROTEINA_VEGETAL', label: 'Proteína vegetal'  },
  { value: 'LACTEO',           label: 'Lácteo'            },
  { value: 'CARBOHIDRATO',     label: 'Carbohidrato'      },
  { value: 'VEGETAL',          label: 'Vegetal'           },
  { value: 'FRUTA',            label: 'Fruta'             },
  { value: 'GRASA',            label: 'Grasa'             },
  { value: 'BEBIDA',           label: 'Bebida'            },
  { value: 'CONDIMENTO',       label: 'Condimento'        },
  { value: 'SUPLEMENTO',       label: 'Suplemento'        },
]

const CAT_COLORES: Record<FoodCategoria, string> = {
  PROTEINA_ANIMAL:  'bg-red-100 text-red-700',
  PROTEINA_VEGETAL: 'bg-orange-100 text-orange-700',
  LACTEO:           'bg-blue-100 text-blue-700',
  CARBOHIDRATO:     'bg-yellow-100 text-yellow-700',
  VEGETAL:          'bg-emerald-100 text-emerald-700',
  FRUTA:            'bg-pink-100 text-pink-700',
  GRASA:            'bg-amber-100 text-amber-700',
  BEBIDA:           'bg-cyan-100 text-cyan-700',
  CONDIMENTO:       'bg-purple-100 text-purple-700',
  SUPLEMENTO:       'bg-indigo-100 text-indigo-700',
}

const EMPTY_FORM = {
  nombre: '', categoria: 'PROTEINA_ANIMAL' as FoodCategoria,
  unidad: 'g', kcal: '', proteina: '', hidratos: '', grasas: '', unidadCompra: '',
}

export default function AdminFoodsPage() {
  const router = useRouter()
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [nombreAdmin, setNombreAdmin] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<FoodCategoria | ''>('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Food | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.esAdmin) { router.push('/dashboard'); return }
      setNombreAdmin(d.nombre)
    })
    cargarFoods()
  }, [router])

  async function cargarFoods() {
    const res = await fetch('/api/admin/foods')
    const data = await res.json()
    setFoods(data.foods ?? [])
    setLoading(false)
  }

  function abrirCrear() {
    setEditando(null)
    setForm(EMPTY_FORM)
    setError('')
    setModalAbierto(true)
  }

  function abrirEditar(f: Food) {
    setEditando(f)
    setForm({
      nombre: f.nombre, categoria: f.categoria,
      unidad: f.unidad, kcal: String(f.kcal),
      proteina: String(f.proteina), hidratos: String(f.hidratos),
      grasas: String(f.grasas), unidadCompra: f.unidadCompra ?? '',
    })
    setError('')
    setModalAbierto(true)
  }

  async function guardar() {
    if (!form.nombre || !form.kcal || !form.proteina || !form.hidratos || !form.grasas) {
      setError('Completá todos los campos obligatorios.')
      return
    }
    setGuardando(true)
    setError('')
    const payload = {
      nombre: form.nombre, categoria: form.categoria, unidad: form.unidad,
      kcal: Number(form.kcal), proteina: Number(form.proteina),
      hidratos: Number(form.hidratos), grasas: Number(form.grasas),
      unidadCompra: form.unidadCompra || null,
    }
    const res = editando
      ? await fetch(`/api/admin/foods/${editando.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/admin/foods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })

    if (!res.ok) { setError('Error al guardar.'); setGuardando(false); return }
    setModalAbierto(false)
    setGuardando(false)
    cargarFoods()
  }

  async function eliminar(f: Food) {
    if (!confirm(`¿Eliminar "${f.nombre}"?`)) return
    await fetch(`/api/admin/foods/${f.id}`, { method: 'DELETE' })
    cargarFoods()
  }

  const foodsFiltrados = foods.filter(f => {
    const matchBusqueda = f.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchCategoria = categoriaFiltro ? f.categoria === categoriaFiltro : true
    return matchBusqueda && matchCategoria
  })

  const porCategoria = CATEGORIAS.map(c => ({
    ...c,
    items: foodsFiltrados.filter(f => f.categoria === c.value),
  })).filter(c => c.items.length > 0)

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
            <h1 className="text-xl font-bold text-gray-900">Catálogo de alimentos</h1>
            <p className="text-sm text-gray-400 mt-0.5">{foods.length} alimentos · macros por 100g</p>
          </div>
          <button
            onClick={abrirCrear}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            + Nuevo
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <input
            type="text"
            placeholder="Buscar alimento..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="flex-1 min-w-[180px] text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <select
            value={categoriaFiltro}
            onChange={e => setCategoriaFiltro(e.target.value as FoodCategoria | '')}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {/* Lista agrupada por categoría */}
        <div className="space-y-4">
          {porCategoria.map(cat => (
            <div key={cat.value} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${CAT_COLORES[cat.value]}`}>{cat.label}</span>
                <span className="text-xs text-gray-400">{cat.items.length}</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-5 py-2 font-medium text-gray-500 text-xs">Nombre</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-500 text-xs">kcal</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-500 text-xs">Prot</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-500 text-xs">HC</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-500 text-xs">Gras</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {cat.items.map((f, i) => (
                    <tr key={f.id} className={`border-t border-gray-50 hover:bg-gray-50 transition-colors ${!f.activo ? 'opacity-40' : ''}`}>
                      <td className="px-5 py-3">
                        <span className="font-medium text-gray-900">{f.nombre}</span>
                        {f.unidadCompra && <span className="text-xs text-gray-400 ml-2">({f.unidadCompra})</span>}
                      </td>
                      <td className="px-3 py-3 text-right text-gray-700 tabular-nums">{f.kcal}</td>
                      <td className="px-3 py-3 text-right text-gray-700 tabular-nums">{f.proteina}g</td>
                      <td className="px-3 py-3 text-right text-gray-700 tabular-nums">{f.hidratos}g</td>
                      <td className="px-3 py-3 text-right text-gray-700 tabular-nums">{f.grasas}g</td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => abrirEditar(f)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Editar</button>
                          <button onClick={() => eliminar(f)} className="text-xs text-red-400 hover:text-red-600 font-medium">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {porCategoria.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              No se encontraron alimentos.
            </div>
          )}
        </div>
      </main>

      {/* Modal crear/editar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{editando ? 'Editar alimento' : 'Nuevo alimento'}</h2>
              <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Pechuga de pollo" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Categoría *</label>
                  <select value={form.categoria} onChange={e => setForm(f => ({...f, categoria: e.target.value as FoodCategoria}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
                    {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Unidad base</label>
                  <select value={form.unidad} onChange={e => setForm(f => ({...f, unidad: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
                    <option value="g">gramos (g)</option>
                    <option value="ml">mililitros (ml)</option>
                    <option value="unidad">unidad</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'kcal', label: 'Calorías (kcal) *' },
                  { key: 'proteina', label: 'Proteína (g) *' },
                  { key: 'hidratos', label: 'Hidratos (g) *' },
                  { key: 'grasas', label: 'Grasas (g) *' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
                    <input type="number" min="0" step="0.1"
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Unidad de compra</label>
                <input value={form.unidadCompra} onChange={e => setForm(f => ({...f, unidadCompra: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="kg, lata, pote, docena..." />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setModalAbierto(false)}
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear alimento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
