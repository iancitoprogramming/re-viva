'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormInput, { FormSelect } from '@/components/FormInput'
import Button from '@/components/Button'
import ChipInput from '@/components/ChipInput'

const opcionesGenero     = [{ value: 'MASCULINO', label: 'Masculino' }, { value: 'FEMENINO', label: 'Femenino' }]
const opcionesObjetivo   = [{ value: 'VOLUMEN', label: 'Ganar músculo (Volumen)' }, { value: 'DEFINICION', label: 'Perder grasa (Definición)' }, { value: 'RECOMPOSICION', label: 'Mejorar composición (Recomposición)' }]
const opcionesEstres     = [{ value: 'BAJO', label: 'Bajo — Estoy tranquilo la mayor parte del tiempo' }, { value: 'MEDIO', label: 'Medio — Tengo estrés manejable' }, { value: 'ALTO', label: 'Alto — Estoy muy estresado frecuentemente' }]
const opcionesAdherencia = [{ value: 'BAJA', label: 'Baja — Me cuesta sostener hábitos' }, { value: 'MEDIA', label: 'Media — A veces me desvío del plan' }, { value: 'ALTA', label: 'Alta — Sigo el plan con consistencia' }]
const opcionesExperiencia = [
  { value: 'ninguna',      label: 'Sin experiencia — es mi primera vez' },
  { value: 'principiante', label: 'Principiante — menos de 1 año' },
  { value: 'intermedio',   label: 'Intermedio — 1 a 3 años' },
  { value: 'avanzado',     label: 'Avanzado — más de 3 años' },
]
const opcionesActividad = [
  { value: 'sedentario', label: 'Sedentario — trabajo de escritorio, poco movimiento' },
  { value: 'activo',     label: 'Activo — algo de movimiento durante el día' },
  { value: 'alto',       label: 'Alto — trabajo físico o muy activo' },
]

const opcionesEquipamiento = [
  { id: 'gym',         label: 'Gimnasio' },
  { id: 'casa',        label: 'Equipo en casa' },
  { id: 'calistenia',  label: 'Calistenia / barra' },
  { id: 'aire_libre',  label: 'Al aire libre' },
  { id: 'sin_equipo',  label: 'Sin equipamiento' },
]

const opcionesMetasFisicas = [
  { id: 'perder_grasa',      label: 'Perder grasa' },
  { id: 'ganar_masa',        label: 'Ganar masa muscular' },
  { id: 'mejorar_resistencia', label: 'Mejorar resistencia' },
  { id: 'mejorar_movilidad', label: 'Mejorar movilidad/flexibilidad' },
  { id: 'mejorar_salud',     label: 'Mejorar salud general' },
  { id: 'mejorar_postura',   label: 'Mejorar postura' },
  { id: 'mejorar_deporte',   label: 'Rendir mejor en mi deporte' },
]

function CheckboxGroup({
  options,
  selected,
  onChange,
}: {
  options: { id: string; label: string }[]
  selected: string[]
  onChange: (vals: string[]) => void
}) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter(v => v !== id) : [...selected, id])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o.id}
          type="button"
          onClick={() => toggle(o.id)}
          className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
            selected.includes(o.id)
              ? 'bg-primary text-ivory border-primary font-semibold'
              : 'bg-surface border-edge text-ink-secondary hover:border-primary/40'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1)

  const [form, setForm] = useState({
    // Paso 1 — básicos
    genero: '', edad: '', altura: '', peso: '', objetivo: '',
    diasEntrenamiento: '', nivelEstres: '', horasSueno: '', adherencia: '',
    preferenciasAlimentarias: '', lesiones: '', fechaNacimiento: '',
    // Paso 1bis — pipeline (entrenamiento + comidas)
    minutosPorSesion: '60', comidasPorDia: '4',
    // Paso 2 — estilo de vida
    experiencia: '', actividadLaboral: '', practicaDeportes: false,
    quiereMejorarDeporte: '', deportes: '' as string,
  })

  const [equipamiento, setEquipamiento] = useState<string[]>([])
  const [metasFisicas, setMetasFisicas]  = useState<string[]>([])

  // Paso 3 — Salud y restricciones (multi-string)
  const [alergias, setAlergias]                                   = useState<string[]>([])
  const [intolerancias, setIntolerancias]                         = useState<string[]>([])
  const [alimentosQueNoConsume, setAlimentosQueNoConsume]         = useState<string[]>([])
  const [condicionesMedicasDeclaradas, setCondicionesMedicas]     = useState<string[]>([])
  const [lesionesActuales, setLesionesActuales]                   = useState<string[]>([])
  const [lesionesPasadas, setLesionesPasadas]                     = useState<string[]>([])
  const [medicacionActual, setMedicacionActual]                   = useState<string[]>([])
  const [flagsEspeciales, setFlagsEspeciales]                     = useState<string[]>([])

  // Paso 4 — Consentimientos
  const [consents, setConsents] = useState({
    aceptaTerminosYCondiciones:           false,
    aceptaPoliticaPrivacidad:             false,
    aceptaDescargoMedicoYResponsabilidad: false,
    confirmaVeracidadDatos:               false,
  })

  function toggleFlag(flag: string) {
    setFlagsEspeciales(curr =>
      curr.includes(flag) ? curr.filter(f => f !== flag) : [...curr, flag],
    )
  }
  function toggleConsent(key: keyof typeof consents) {
    setConsents(c => ({ ...c, [key]: !c[key] }))
  }

  const todosConsentimientos = Object.values(consents).every(Boolean)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setForm(prev => ({ ...prev, [name]: val }))
    setError('')
  }

  // Validación paso 1
  function validarPaso1() {
    const req = ['genero', 'edad', 'altura', 'peso', 'objetivo', 'diasEntrenamiento', 'nivelEstres', 'horasSueno', 'adherencia']
    for (const c of req) {
      if (!form[c as keyof typeof form]) { setError(`Completá el campo "${c}".`); return false }
    }
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!todosConsentimientos) {
      setError('Necesitás aceptar los 4 consentimientos para continuar.')
      return
    }
    setLoading(true)
    setError('')

    const deportesList = form.deportes
      ? form.deportes.split(',').map(s => s.trim()).filter(Boolean)
      : []

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
        comidasPorDia: Number(form.comidasPorDia) || 4,
        minutosPorSesion: Number(form.minutosPorSesion) || 60,
        equipamiento,
        metasFisicas,
        deportes: deportesList,
        // Salud
        alergias, intolerancias, alimentosQueNoConsume,
        condicionesMedicasDeclaradas, lesionesActuales, lesionesPasadas,
        medicacionActual, flagsEspeciales,
        // Consentimientos
        ...consents,
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

  const labelClass = 'text-sm font-medium text-ink-secondary'
  const textareaClass = 'w-full px-4 py-3 rounded-xl border border-edge text-sm text-ink bg-surface-warm focus:bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none min-h-[80px]'
  const sectionLabel = 'text-xs font-bold text-ink-secondary uppercase tracking-widest mb-3'

  return (
    <main className="min-h-screen bg-ivory px-4 py-10">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="font-serif font-bold text-xl text-primary">REVIVA</span>
          <h1 className="text-2xl font-bold text-ink mt-4 mb-2">Tu perfil</h1>
          <p className="text-ink-muted text-sm">
            {paso === 1 && 'Primero lo básico. Rápido y preciso.'}
            {paso === 2 && 'Contanos sobre tu estilo de vida.'}
            {paso === 3 && 'Salud y restricciones — clave para que tu plan sea seguro.'}
            {paso === 4 && 'Último paso: declaraciones legales.'}
          </p>
          {/* Progreso */}
          <div className="flex gap-2 justify-center mt-4">
            {[1, 2, 3, 4].map(n => (
              <div
                key={n}
                className={`h-1.5 rounded-full transition-all duration-300 ${n <= paso ? 'bg-primary w-8' : 'bg-edge w-4'}`}
              />
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-3xl shadow-sm border border-edge p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* ── PASO 1: BÁSICOS ──────────────────────────────── */}
            {paso === 1 && (
              <>
                <FormSelect label="Género" name="genero" options={opcionesGenero}
                  value={form.genero} onChange={handleChange} required />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Edad (años)" name="edad" type="number" placeholder="25"
                    min="14" max="80" value={form.edad} onChange={handleChange} required />
                  <FormInput label="Peso (kg)" name="peso" type="number" placeholder="70"
                    min="30" max="250" step="0.1" value={form.peso} onChange={handleChange} required />
                </div>

                <FormInput label="Altura en centímetros (ej: 170, no 1.70)" name="altura" type="number" placeholder="170"
                  min="130" max="230" step="1" value={form.altura} onChange={handleChange} required />

                <FormSelect label="¿Cuál es tu objetivo principal?" name="objetivo"
                  options={opcionesObjetivo} value={form.objetivo} onChange={handleChange} required />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Días/semana de entrenamiento" name="diasEntrenamiento"
                    type="number" placeholder="3" min="0" max="7"
                    value={form.diasEntrenamiento} onChange={handleChange} required />
                  <FormInput label="Min. por sesión" name="minutosPorSesion"
                    type="number" placeholder="60" min="20" max="180" step="5"
                    value={form.minutosPorSesion} onChange={handleChange} />
                </div>

                <FormInput label="¿Cuántas comidas por día hacés?" name="comidasPorDia"
                  type="number" placeholder="4" min="2" max="6" step="1"
                  value={form.comidasPorDia} onChange={handleChange} />

                <FormSelect label="¿Cómo es tu nivel de estrés habitual?" name="nivelEstres"
                  options={opcionesEstres} value={form.nivelEstres} onChange={handleChange} required />

                <FormInput label="¿Cuántas horas dormís por noche?" name="horasSueno"
                  type="number" placeholder="7" min="3" max="12" step="0.5"
                  value={form.horasSueno} onChange={handleChange} required />

                <FormSelect label="¿Cómo es tu adherencia a los hábitos?" name="adherencia"
                  options={opcionesAdherencia} value={form.adherencia} onChange={handleChange} required />

                <div className="border-t border-edge pt-4 mt-1">
                  <label className={labelClass}>
                    Fecha de nacimiento <span className="text-ink-muted font-normal">(opcional)</span>
                  </label>
                  <p className="text-xs text-ink-muted mb-2 mt-0.5">Para enviarte un saludo en tu cumpleaños.</p>
                  <input type="date" name="fechaNacimiento" value={form.fechaNacimiento}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-edge text-sm text-ink bg-surface-warm focus:bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Preferencias o restricciones alimentarias</label>
                  <p className="text-xs text-ink-muted mb-1">Ej: Soy vegetariano, no como pescado, soy celíaco.</p>
                  <textarea name="preferenciasAlimentarias" value={form.preferenciasAlimentarias}
                    onChange={handleChange} placeholder="Escribí acá lo que el trainer deba saber..."
                    className={textareaClass} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Lesiones o condiciones médicas</label>
                  <p className="text-xs text-ink-muted mb-1">Ej: Me duele la rodilla al correr, operado de hernia.</p>
                  <textarea name="lesiones" value={form.lesiones} onChange={handleChange}
                    placeholder="Detallá cualquier dolor, lesión o condición médica..."
                    className={textareaClass} />
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

                <Button type="button" className="w-full mt-2" onClick={() => {
                  if (validarPaso1()) { setError(''); setPaso(2) }
                }}>
                  Continuar →
                </Button>
              </>
            )}

            {/* ── PASO 2: ESTILO DE VIDA ───────────────────────── */}
            {paso === 2 && (
              <>
                <FormSelect label="Experiencia entrenando" name="experiencia"
                  options={opcionesExperiencia} value={form.experiencia} onChange={handleChange} />

                <FormSelect label="Actividad laboral" name="actividadLaboral"
                  options={opcionesActividad} value={form.actividadLaboral} onChange={handleChange} />

                <div className="flex flex-col gap-2">
                  <p className={sectionLabel}>Equipamiento disponible</p>
                  <CheckboxGroup options={opcionesEquipamiento}
                    selected={equipamiento} onChange={setEquipamiento} />
                </div>

                <div className="flex flex-col gap-2">
                  <p className={sectionLabel}>Metas adicionales</p>
                  <p className="text-xs text-ink-muted -mt-1">Además de tu objetivo principal, ¿qué más buscás?</p>
                  <CheckboxGroup options={opcionesMetasFisicas}
                    selected={metasFisicas} onChange={setMetasFisicas} />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelClass}>
                    ¿Practicás algún deporte? <span className="text-ink-muted font-normal">(opcional)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="practicaDeportes" name="practicaDeportes"
                      checked={form.practicaDeportes}
                      onChange={handleChange}
                      className="w-4 h-4 accent-primary rounded cursor-pointer" />
                    <label htmlFor="practicaDeportes" className="text-sm text-ink cursor-pointer">
                      Sí, practico deportes
                    </label>
                  </div>

                  {form.practicaDeportes && (
                    <div className="flex flex-col gap-2 mt-1 pl-7">
                      <FormInput label="¿Cuáles?" name="deportes" type="text"
                        placeholder="Ej: fútbol, running, crossfit" value={form.deportes}
                        onChange={handleChange} />
                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>¿Querés mejorar en alguno?</label>
                        <textarea name="quiereMejorarDeporte" value={form.quiereMejorarDeporte}
                          onChange={handleChange}
                          placeholder="Ej: quiero mejorar mi velocidad en running"
                          className={textareaClass} style={{ minHeight: '60px' }} />
                      </div>
                    </div>
                  )}
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

                <div className="flex gap-3 mt-2">
                  <Button type="button" variant="secondary" className="flex-1"
                    onClick={() => setPaso(1)}>
                    ← Atrás
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => setPaso(3)}>
                    Continuar →
                  </Button>
                </div>
              </>
            )}

            {/* ── PASO 3: SALUD Y RESTRICCIONES ────────────────── */}
            {paso === 3 && (
              <>
                <ChipInput
                  label="Alergias alimentarias"
                  hint="Ej: maní, frutos secos, mariscos. Escribí y presioná Enter."
                  placeholder="Sin alergias declaradas"
                  values={alergias} onChange={setAlergias}
                  sugerencias={['maní','frutos secos','mariscos','pescado','huevo','soja']}
                />

                <ChipInput
                  label="Intolerancias"
                  hint="Ej: lactosa, gluten, fructosa."
                  placeholder="Sin intolerancias"
                  values={intolerancias} onChange={setIntolerancias}
                  sugerencias={['lactosa','gluten','fructosa']}
                />

                <ChipInput
                  label="Alimentos que NO consumís"
                  hint="Por preferencia, religión o asco. Distinto a alergia/intolerancia."
                  placeholder="Ninguno"
                  values={alimentosQueNoConsume} onChange={setAlimentosQueNoConsume}
                  sugerencias={['cerdo','vísceras','pescado','hongos']}
                />

                <ChipInput
                  label="Condiciones médicas declaradas"
                  hint="Ej: hipertensión, diabetes tipo 2, hipotiroidismo. NO reemplaza la consulta médica."
                  placeholder="Ninguna"
                  values={condicionesMedicasDeclaradas} onChange={setCondicionesMedicas}
                  sugerencias={['hipertensión','diabetes','hipotiroidismo','colesterol alto']}
                />

                <ChipInput
                  label="Lesiones actuales"
                  hint="Algo que te duele HOY o que tu kine te indicó cuidar."
                  placeholder="Sin lesiones activas"
                  values={lesionesActuales} onChange={setLesionesActuales}
                  sugerencias={['rodilla','lumbar','hombro','codo','muñeca']}
                />

                <ChipInput
                  label="Lesiones pasadas"
                  hint="Operaciones, fracturas o lesiones que ya superaste pero conviene tener presentes."
                  placeholder="Sin antecedentes"
                  values={lesionesPasadas} onChange={setLesionesPasadas}
                  sugerencias={['hernia discal','rotura LCA','luxación hombro']}
                />

                <ChipInput
                  label="Medicación actual"
                  hint="Lo que tomás de forma regular (con o sin receta). Ayuda a evitar interacciones."
                  placeholder="Sin medicación"
                  values={medicacionActual} onChange={setMedicacionActual}
                />

                {/* Flags especiales */}
                <div className="border-t border-edge pt-4">
                  <p className={sectionLabel}>Situaciones especiales (opcional)</p>
                  <p className="text-xs text-ink-muted mb-3 -mt-2">
                    Marcalas si aplican. El plan se ajusta automáticamente.
                  </p>
                  <div className="flex flex-col gap-2">
                    {form.genero === 'FEMENINO' && (
                      <>
                        <ConsentCheckbox
                          label="Estoy embarazada"
                          checked={flagsEspeciales.includes('embarazo')}
                          onChange={() => toggleFlag('embarazo')}
                        />
                        <ConsentCheckbox
                          label="Tuve un bebé en los últimos 12 meses (postparto)"
                          checked={flagsEspeciales.includes('postparto')}
                          onChange={() => toggleFlag('postparto')}
                        />
                        <ConsentCheckbox
                          label="Estoy en perimenopausia o menopausia"
                          checked={flagsEspeciales.includes('perimenopausia')}
                          onChange={() => toggleFlag('perimenopausia')}
                        />
                      </>
                    )}
                    <ConsentCheckbox
                      label="Tengo problemas crónicos en la zona lumbar"
                      checked={flagsEspeciales.includes('lumbar_cronico')}
                      onChange={() => toggleFlag('lumbar_cronico')}
                    />
                    <ConsentCheckbox
                      label="Soy deportista competitivo (compito en federaciones / torneos)"
                      checked={flagsEspeciales.includes('deportista_competitivo')}
                      onChange={() => toggleFlag('deportista_competitivo')}
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

                <div className="flex gap-3 mt-2">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setPaso(2)}>
                    ← Atrás
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => setPaso(4)}>
                    Continuar →
                  </Button>
                </div>
              </>
            )}

            {/* ── PASO 4: CONSENTIMIENTOS LEGALES ──────────────── */}
            {paso === 4 && (
              <>
                <div className="bg-surface-warm border border-edge rounded-xl p-4">
                  <p className="text-sm text-ink-secondary leading-relaxed">
                    Antes de generar tu plan, necesitamos que revises y aceptes
                    estas declaraciones. Son obligatorias y protegen tanto a vos
                    como al equipo de Re-Viva.
                  </p>
                </div>

                <ConsentCheckbox
                  label="Acepto los Términos y Condiciones de Re-Viva"
                  hint="Reglas de uso de la plataforma, política de cancelación y pago."
                  checked={consents.aceptaTerminosYCondiciones}
                  onChange={() => toggleConsent('aceptaTerminosYCondiciones')}
                />

                <ConsentCheckbox
                  label="Acepto la Política de Privacidad y el tratamiento de mis datos personales"
                  hint="Ley 25.326 Argentina. Tus datos no se comparten con terceros."
                  checked={consents.aceptaPoliticaPrivacidad}
                  onChange={() => toggleConsent('aceptaPoliticaPrivacidad')}
                />

                <ConsentCheckbox
                  label="Entiendo que este plan no reemplaza la consulta médica profesional"
                  hint="Re-Viva es coaching de entrenamiento y nutrición, no atención médica. Si tenés condiciones de salud, consultá con un profesional antes de empezar."
                  checked={consents.aceptaDescargoMedicoYResponsabilidad}
                  onChange={() => toggleConsent('aceptaDescargoMedicoYResponsabilidad')}
                />

                <ConsentCheckbox
                  label="Confirmo que los datos que cargué son verdaderos y completos"
                  hint="Si hay algo que no declaraste, el plan puede no ser seguro para vos."
                  checked={consents.confirmaVeracidadDatos}
                  onChange={() => toggleConsent('confirmaVeracidadDatos')}
                />

                {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

                <div className="flex gap-3 mt-2">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setPaso(3)}>
                    ← Atrás
                  </Button>
                  <Button type="submit" loading={loading} className="flex-1" disabled={!todosConsentimientos}>
                    Enviar mi perfil
                  </Button>
                </div>
              </>
            )}

          </form>
        </div>

      </div>
    </main>
  )
}

// Checkbox grande para flags y consentimientos
function ConsentCheckbox({
  label, hint, checked, onChange,
}: { label: string; hint?: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`text-left flex items-start gap-3 p-3 rounded-xl border transition-all w-full ${
        checked ? 'border-primary bg-primary/5' : 'border-edge bg-surface-warm hover:border-primary/40'
      }`}
    >
      <span
        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          checked ? 'border-primary bg-primary' : 'border-edge bg-surface'
        }`}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6.5L5 9.5L10 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {hint && <span className="block text-xs text-ink-muted mt-0.5 leading-snug">{hint}</span>}
      </span>
    </button>
  )
}
