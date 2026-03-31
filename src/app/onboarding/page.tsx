'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormInput, { FormSelect } from '@/components/FormInput'
import Button from '@/components/Button'

const opcionesGenero     = [{ value: 'MASCULINO', label: 'Masculino' }, { value: 'FEMENINO', label: 'Femenino' }]
const opcionesObjetivo   = [{ value: 'VOLUMEN', label: 'Ganar músculo (Volumen)' }, { value: 'DEFINICION', label: 'Perder grasa (Definición)' }, { value: 'RECOMPOSICION', label: 'Mejorar composición (Recomposición)' }]
const opcionesEstres     = [{ value: 'BAJO', label: 'Bajo — Estoy tranquilo la mayor parte del tiempo' }, { value: 'MEDIO', label: 'Medio — Tengo estrés manejable' }, { value: 'ALTO', label: 'Alto — Estoy muy estresado frecuentemente' }]
const opcionesAdherencia = [{ value: 'BAJA', label: 'Baja — Me cuesta sostener hábitos' }, { value: 'MEDIA', label: 'Media — A veces me desvío del plan' }, { value: 'ALTA', label: 'Alta — Sigo el plan con consistencia' }]

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    genero: '',
    edad: '',
    altura: '',
    peso: '',
    objetivo: '',
    diasEntrenamiento: '',
    nivelEstres: '',
    horasSueno: '',
    adherencia: '',
    preferenciasAlimentarias: '',
    lesiones: '',
    fechaNacimiento: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        edad: Number(form.edad),
        altura: Number(form.altura),
        peso: Number(form.peso),
        diasEntrenamiento: Number(form.diasEntrenamiento),
        horasSueno: Number(form.horasSueno),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Ocurrió un error. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push('/pendiente')
  }

  return (
    <main className="min-h-screen bg-ivory px-4 py-10">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="font-serif font-bold text-xl text-primary">REVIVA</span>
          <h1 className="text-2xl font-bold text-ink mt-4 mb-2">
            Tu perfil nutricional
          </h1>
          <p className="text-ink-muted text-sm">
            Completá el formulario para que tu trainer pueda armar tu plan personalizado.
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-surface rounded-3xl shadow-sm border border-edge p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <FormSelect
              label="Género"
              name="genero"
              options={opcionesGenero}
              value={form.genero}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Edad (años)"
                name="edad"
                type="number"
                placeholder="25"
                min="14"
                max="80"
                value={form.edad}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Peso (kg)"
                name="peso"
                type="number"
                placeholder="70"
                min="30"
                max="250"
                step="0.1"
                value={form.peso}
                onChange={handleChange}
                required
              />
            </div>

            <FormInput
              label="Altura (cm)"
              name="altura"
              type="number"
              placeholder="170"
              min="130"
              max="230"
              value={form.altura}
              onChange={handleChange}
              required
            />

            <FormSelect
              label="¿Cuál es tu objetivo principal?"
              name="objetivo"
              options={opcionesObjetivo}
              value={form.objetivo}
              onChange={handleChange}
              required
            />

            <FormInput
              label="¿Cuántos días por semana entrenás?"
              name="diasEntrenamiento"
              type="number"
              placeholder="3"
              min="0"
              max="7"
              value={form.diasEntrenamiento}
              onChange={handleChange}
              required
            />

            <FormSelect
              label="¿Cómo es tu nivel de estrés habitual?"
              name="nivelEstres"
              options={opcionesEstres}
              value={form.nivelEstres}
              onChange={handleChange}
              required
            />

            <FormInput
              label="¿Cuántas horas dormís por noche?"
              name="horasSueno"
              type="number"
              placeholder="7"
              min="3"
              max="12"
              step="0.5"
              value={form.horasSueno}
              onChange={handleChange}
              required
            />

            <FormSelect
              label="¿Cómo es tu adherencia a los hábitos saludables?"
              name="adherencia"
              options={opcionesAdherencia}
              value={form.adherencia}
              onChange={handleChange}
              required
            />

            <div className="flex flex-col gap-1.5 border-t border-edge pt-5 mt-2">
              <label className="text-sm font-medium text-ink-secondary">
                Fecha de nacimiento <span className="text-ink-muted font-normal">(opcional)</span>
              </label>
              <p className="text-xs text-ink-muted mb-1">
                La usamos para enviarte un saludo en tu cumpleaños.
              </p>
              <input
                type="date"
                name="fechaNacimiento"
                value={form.fechaNacimiento}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-edge text-sm text-ink bg-surface-warm focus:bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-secondary">
                Preferencias o restricciones alimentarias
              </label>
              <p className="text-xs text-ink-muted mb-1">
                Ej: Soy vegetariano, no como pescado, soy celíaco, no me gusta el brócoli.
              </p>
              <textarea
                name="preferenciasAlimentarias"
                value={form.preferenciasAlimentarias}
                onChange={handleChange}
                placeholder="Escribí acá todo lo que el trainer deba saber sobre tu alimentación..."
                className="w-full px-4 py-3 rounded-xl border border-edge text-sm text-ink bg-surface-warm focus:bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none min-h-[100px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-secondary">
                Lesiones o condiciones médicas
              </label>
              <p className="text-xs text-ink-muted mb-1">
                Ej: Me duele la rodilla al correr, operado de hernia, tengo hipertensión.
              </p>
              <textarea
                name="lesiones"
                value={form.lesiones}
                onChange={handleChange}
                placeholder="Detallá cualquier dolor, lesión pasada/actual o condición médica..."
                className="w-full px-4 py-3 rounded-xl border border-edge text-sm text-ink bg-surface-warm focus:bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none min-h-[100px]"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2">
              Enviar mi perfil
            </Button>

          </form>
        </div>

      </div>
    </main>
  )
}
