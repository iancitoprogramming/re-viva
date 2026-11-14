'use client'

// Formulario de ingreso público — un paso por pantalla, siete en total.
// Pensado para completar desde el celular (la mayoría entra por un link de
// WhatsApp). El estado vive en un único objeto en memoria: no hay guardado
// parcial ni borrador en localStorage en esta versión.
//
// La redacción de las preguntas, los hints y los mensajes de error son los del
// prototipo aprobado. No reescribir: están calibrados para que el cliente
// entienda por qué se pregunta sin que se le muestre la justificación interna.

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CAMPOS_POR_PASO,
  COMIDAS,
  DIAS,
  formVacio,
  OPCIONES,
  validarPaso,
  type Errores,
  type IngresoForm,
} from '@/lib/ingreso'

const PASOS = [
  'Antes de empezar',
  'Quién sos',
  'Tus horarios',
  'Cómo comés',
  'Salud',
  'Entrenamiento',
  'Cómo seguimos',
]

// ─── Estilos compartidos ─────────────────────────────────────────────────────

const inputBase =
  'w-full px-4 py-3 rounded-xl border text-base text-ink bg-surface-warm focus:bg-surface focus:outline-none focus:ring-1 transition-colors placeholder:text-ink-muted'
const inputOk  = 'border-edge focus:border-primary focus:ring-primary/20'
const inputBad = 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-200'

const cls = (error?: string) => `${inputBase} ${error ? inputBad : inputOk}`

// ─── Piezas de formulario ────────────────────────────────────────────────────

function Campo({
  id, label, hint, obligatorio, error, para, children,
}: {
  id: string
  label: string
  hint?: string
  obligatorio?: boolean
  error?: string
  para?: string
  children: React.ReactNode
}) {
  const titulo = (
    <>
      {label}
      {obligatorio && (
        <span className="ml-1.5 align-super text-[10px] font-bold uppercase tracking-widest text-gold">
          obligatorio
        </span>
      )}
    </>
  )
  return (
    <div id={`campo-${id}`} className="flex flex-col gap-1.5 scroll-mt-28">
      {para
        ? <label htmlFor={para} className="text-[15px] font-bold leading-snug text-ink">{titulo}</label>
        : <span className="text-[15px] font-bold leading-snug text-ink">{titulo}</span>}
      {hint && <p className="text-[13px] leading-relaxed text-ink-secondary">{hint}</p>}
      {children}
      {error && <p className="text-[13px] font-bold text-red-600">{error}</p>}
    </div>
  )
}

function Chips({
  opciones, valor, onPick, etiquetas,
}: {
  opciones: readonly string[]
  valor: string | string[]
  onPick: (v: string) => void
  etiquetas?: Record<string, string>
}) {
  const activo = (v: string) => (Array.isArray(valor) ? valor.includes(v) : valor === v)
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map(v => (
        <button
          key={v}
          type="button"
          aria-pressed={activo(v)}
          onClick={() => onPick(v)}
          className={`px-4 py-2.5 rounded-full text-sm border transition-all ${
            activo(v)
              ? 'bg-gold text-[#0a0a08] border-gold font-bold'
              : 'bg-surface border-edge text-ink-secondary hover:border-gold/50'
          }`}
        >
          {etiquetas?.[v] ?? v}
        </button>
      ))}
    </div>
  )
}

function Radios({
  name, opciones, valor, onPick,
}: {
  name: string
  opciones: { v: string; label: string; sub?: string }[]
  valor: string
  onPick: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {opciones.map(o => (
        <label
          key={o.v}
          className={`flex gap-3 items-start rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
            valor === o.v ? 'border-gold bg-gold-light' : 'border-edge bg-surface hover:border-gold/40'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={o.v}
            checked={valor === o.v}
            onChange={() => onPick(o.v)}
            className="mt-1 accent-gold shrink-0"
          />
          <span className="min-w-0 text-[15px] text-ink">
            {o.label}
            {o.sub && <small className="block text-[13px] text-ink-secondary">{o.sub}</small>}
          </span>
        </label>
      ))}
    </div>
  )
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1 flex flex-col gap-4 border-l-2 border-edge pl-3.5">
      {children}
    </div>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function IngresoPage() {
  const [form, setForm]       = useState<IngresoForm>(formVacio)
  const [errores, setErrores] = useState<Errores>({})
  const [paso, setPaso]       = useState(0)
  const [mismaHora, setMismaHora] = useState(true)
  const [enviando, setEnviando]   = useState(false)
  const [enviado, setEnviado]     = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')

  const set = useCallback(<K extends keyof IngresoForm>(k: K, v: IngresoForm[K]) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrores(e => {
      if (!(k in e)) return e
      const resto = { ...e }
      delete resto[k as string]
      return resto
    })
  }, [])

  const limpiarSintetico = useCallback((clave: string) => {
    setErrores(e => {
      if (!(clave in e)) return e
      const resto = { ...e }
      delete resto[clave]
      return resto
    })
  }, [])

  // Días siempre en orden de semana
  function toggleDia(d: string) {
    const elegidos = DIAS.filter(x => (x === d ? !form.dias.includes(d) : form.dias.includes(x)))
    const horas = { ...form.horas }
    for (const k of Object.keys(horas)) if (!elegidos.includes(k as typeof DIAS[number])) delete horas[k]
    // Con "misma hora" tildado, el valor único se replica a los días nuevos.
    if (mismaHora) {
      const unica = Object.values(form.horas).find(Boolean) ?? ''
      if (unica) for (const x of elegidos) horas[x] = unica
    }
    setForm(f => ({ ...f, dias: elegidos as string[], horas }))
    limpiarSintetico('dias')
    limpiarSintetico('_horas')
  }

  function setHoraUnica(v: string) {
    const horas: Record<string, string> = {}
    for (const d of form.dias) horas[d] = v
    setForm(f => ({ ...f, horas }))
    limpiarSintetico('_horas')
  }

  function setHoraDia(d: string, v: string) {
    setForm(f => ({ ...f, horas: { ...f.horas, [d]: v } }))
    limpiarSintetico('_horas')
  }

  function setComida(k: string, v: string | null) {
    setForm(f => ({ ...f, comidas: { ...f.comidas, [k]: v } }))
    limpiarSintetico('_comidas')
  }

  const horaUnica = useMemo(
    () => (form.dias.length ? form.horas[form.dias[0]] ?? '' : ''),
    [form.dias, form.horas],
  )

  function alPrimerError(errs: Errores) {
    const orden = CAMPOS_POR_PASO[paso] ?? []
    const primero = orden.find(c => errs[c])
    if (!primero) return
    const destino = { _horas: 'campo-horas', _comidas: 'campo-comidas', _sesiones: 'campo-sesiones' }[primero]
      ?? `campo-${primero}`
    document.getElementById(destino)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function siguiente() {
    if (paso > 0) {
      const errs = validarPaso(paso, form)
      if (Object.keys(errs).length) {
        setErrores(e => ({ ...e, ...errs }))
        alPrimerError(errs)
        return
      }
    }
    if (paso === PASOS.length - 1) { void enviar(); return }
    setPaso(p => p + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function atras() {
    if (paso === 0) return
    setPaso(p => p - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function enviar() {
    setEnviando(true)
    setErrorEnvio('')
    try {
      const res  = await fetch('/api/ingreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (data?.errores && typeof data.errores === 'object') {
          const errs = data.errores as Errores
          setErrores(errs)
          // Volver al primer paso que tenga algo sin resolver.
          const pasoMalo = Object.keys(CAMPOS_POR_PASO)
            .map(Number)
            .find(p => CAMPOS_POR_PASO[p].some(c => errs[c]))
          if (pasoMalo && pasoMalo !== paso) {
            setPaso(pasoMalo)
            window.scrollTo({ top: 0 })
          } else {
            alPrimerError(errs)
          }
          setErrorEnvio('Falta resolver algo antes de enviar.')
        } else {
          setErrorEnvio('No se pudo enviar. Probá de nuevo en un minuto.')
        }
        return
      }

      setEnviado(true)
      window.scrollTo({ top: 0 })
    } catch {
      setErrorEnvio('No se pudo enviar. Revisá la conexión y probá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  // ── Confirmación: reemplaza el formulario ──
  if (enviado) {
    return (
      <main className="min-h-screen bg-ivory px-4 py-16">
        <div className="mx-auto max-w-[660px] text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
            ✓
          </div>
          <h2 className="font-serif text-3xl text-ink">Listo, lo recibí</h2>
          <p className="mx-auto mt-3 max-w-[58ch] text-ink-secondary">
            Voy a leerlo entero antes de escribirte. Si algo me cierra raro, te pregunto por WhatsApp
            antes de armar nada. El plan sale dentro de las 72 horas hábiles.
          </p>
          <div className="mx-auto mt-8 max-w-[440px] rounded-2xl border border-edge bg-surface p-6">
            <p className="font-semibold text-ink">¿Todavía no elegiste tu plan?</p>
            <p className="mt-1 text-sm text-ink-secondary">
              Elegilo y dejá el pago hecho. Así arrancamos apenas esté armado.
            </p>
            <Link
              href="/#planes"
              className="mt-4 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-ivory"
            >
              Ver planes y precios
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const e = errores

  return (
    <main className="min-h-screen bg-ivory pb-32">
      {/* ── Cabecera + progreso ── */}
      <header className="border-b border-edge bg-surface">
        <div className="mx-auto max-w-[660px] px-4 pt-5">
          <div className="text-[19px] font-bold uppercase tracking-[0.2em] text-ink">
            RE<span className="text-gold">·</span>VIVA
          </div>
          <div className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-secondary">
            Formulario de ingreso
          </div>
          <div className="mt-4 flex gap-1" aria-hidden="true">
            {PASOS.map((_, k) => (
              <i
                key={k}
                className={`h-[3px] flex-1 rounded-sm ${
                  k < paso ? 'bg-gold' : k === paso ? 'bg-ink' : 'bg-edge'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between gap-3 pb-4 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
            <span>{PASOS[paso]}</span>
            <span>{paso + 1} / {PASOS.length}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[660px] px-4 py-7">
        {/* Honeypot: invisible para una persona, tentador para un bot. */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="apodo">Apodo</label>
          <input
            id="apodo" name="apodo" type="text" tabIndex={-1} autoComplete="off"
            value={form.apodo ?? ''} onChange={ev => set('apodo', ev.target.value)}
          />
        </div>

        {/* ── Paso 0 — Antes de empezar ── */}
        {paso === 0 && (
          <section>
            <h1 className="font-serif text-[clamp(26px,6vw,34px)] leading-tight text-ink">
              Esto define tu plan. Nada de lo que respondas es relleno.
            </h1>
            <p className="mt-3 max-w-[58ch] text-ink-secondary">
              Son siete pantallas, entre 8 y 10 minutos. Cada pregunta existe porque su ausencia ya
              obligó a rehacer un plan entero. Contestá por tu día real, no por el día que te gustaría
              tener: un plan que no entra en tu semana no se incumple por falta de ganas, se incumple
              porque no entra.
            </p>
            <div className="mt-6 rounded-r-xl border-l-[3px] border-gold bg-gold-light px-4 py-3 text-sm leading-relaxed text-ink">
              <b>Lo más importante:</b> los horarios. Sin la hora exacta a la que entrenás no se puede
              ubicar ninguna comida, porque esa hora define cuál es tu toma pre-entreno y cuál la post.
              Si no la sabés con certeza, mirá la agenda antes de seguir.
            </div>
            <p className="mt-6 text-[13px] leading-relaxed text-ink-muted">
              Los datos son confidenciales y se usan exclusivamente para diseñar tu plan personalizado.
              Ley 25.326 de Protección de Datos Personales.
            </p>
          </section>
        )}

        {/* ── Paso 1 — Quién sos ── */}
        {paso === 1 && (
          <section>
            <h2 className="font-serif text-[clamp(21px,4.6vw,26px)] text-ink">Quién sos</h2>
            <p className="mb-7 mt-1.5 text-ink-secondary">
              Lo básico para el cálculo metabólico y para poder escribirte.
            </p>
            <div className="flex flex-col gap-5">
              <Campo id="nombre" para="nombre" label="Nombre y apellido" obligatorio error={e.nombre}>
                <input id="nombre" type="text" autoComplete="name" className={cls(e.nombre)}
                  value={form.nombre} onChange={ev => set('nombre', ev.target.value)} />
              </Campo>

              <div className="flex flex-wrap gap-3">
                <div className="min-w-[150px] flex-1">
                  <Campo id="email" para="email" label="Email" obligatorio error={e.email}>
                    <input id="email" type="email" inputMode="email" autoComplete="email" className={cls(e.email)}
                      value={form.email} onChange={ev => set('email', ev.target.value)} />
                  </Campo>
                </div>
                <div className="min-w-[150px] flex-1">
                  <Campo id="whatsapp" para="whatsapp" label="WhatsApp" obligatorio error={e.whatsapp}>
                    <input id="whatsapp" type="tel" inputMode="tel" placeholder="11 5555 5555" className={cls(e.whatsapp)}
                      value={form.whatsapp} onChange={ev => set('whatsapp', ev.target.value)} />
                  </Campo>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="min-w-[110px] flex-1">
                  <Campo id="edad" para="edad" label="Edad" obligatorio error={e.edad}>
                    <input id="edad" type="number" inputMode="numeric" min={14} max={95} className={cls(e.edad)}
                      value={form.edad} onChange={ev => set('edad', ev.target.value)} />
                  </Campo>
                </div>
                <div className="min-w-[110px] flex-1">
                  <Campo id="peso" para="peso" label="Peso hoy (kg)" obligatorio error={e.peso}>
                    <input id="peso" type="number" inputMode="decimal" step="0.1" min={30} max={250} className={cls(e.peso)}
                      value={form.peso} onChange={ev => set('peso', ev.target.value)} />
                  </Campo>
                </div>
                <div className="min-w-[110px] flex-1">
                  <Campo id="altura" para="altura" label="Altura (cm)" obligatorio error={e.altura}>
                    <input id="altura" type="number" inputMode="numeric" min={120} max={230} className={cls(e.altura)}
                      value={form.altura} onChange={ev => set('altura', ev.target.value)} />
                  </Campo>
                </div>
              </div>

              <Campo
                id="sexo" label="Sexo biológico" obligatorio error={e.sexo}
                hint="Entra en la fórmula de Mifflin-St Jeor. No es una pregunta de identidad, es una variable del cálculo."
              >
                <Chips opciones={OPCIONES.sexo} valor={form.sexo} onPick={v => set('sexo', v)} />
              </Campo>

              <Campo
                id="objetivo" para="objetivo" label="¿Qué querés lograr? Con tus palabras." obligatorio error={e.objetivo}
                hint="Escribilo como lo dirías en voz alta. Si lo que pedís y lo que tu cuerpo necesita no coinciden, te lo planteo antes de arrancar, no después."
              >
                <textarea id="objetivo" rows={4} className={`${cls(e.objetivo)} min-h-[88px] resize-y`}
                  value={form.objetivo} onChange={ev => set('objetivo', ev.target.value)} />
              </Campo>

              <Campo id="experiencia" para="experiencia" label="¿Hace cuánto entrenás y fue continuo o cortado?">
                <input id="experiencia" type="text" placeholder="Ej: dos años, con parates de meses" className={cls()}
                  value={form.experiencia} onChange={ev => set('experiencia', ev.target.value)} />
              </Campo>

              <Campo id="duracion_ciclo" label="¿Cuánto querés que dure este ciclo?">
                <Chips
                  opciones={OPCIONES.duracion_ciclo}
                  valor={form.duracion_ciclo}
                  onPick={v => set('duracion_ciclo', form.duracion_ciclo === v ? '' : v)}
                  etiquetas={{ 'No sé': 'No sé todavía' }}
                />
              </Campo>
            </div>
          </section>
        )}

        {/* ── Paso 2 — Tus horarios ── */}
        {paso === 2 && (
          <section>
            <h2 className="font-serif text-[clamp(21px,4.6vw,26px)] text-ink">Tus horarios</h2>
            <p className="mb-7 mt-1.5 text-ink-secondary">
              La pantalla que decide la estructura del plan. Decir &ldquo;tres veces por semana&rdquo; no
              alcanza: hacen falta los días y la hora.
            </p>
            <div className="flex flex-col gap-5">
              <Campo id="dias" label="¿Qué días entrenás?" obligatorio error={e.dias}>
                <Chips
                  opciones={DIAS}
                  valor={form.dias}
                  onPick={toggleDia}
                  etiquetas={{
                    Lunes: 'Lun', Martes: 'Mar', Miércoles: 'Mié', Jueves: 'Jue',
                    Viernes: 'Vie', Sábado: 'Sáb', Domingo: 'Dom',
                  }}
                />
              </Campo>

              {form.dias.length > 0 && (
                <Campo
                  id="horas" label="¿A qué hora entrenás cada día?" obligatorio error={e._horas}
                  hint="Si cambia según el día, cargá cada uno. Esa diferencia puede obligar a dos plantillas de comidas."
                >
                  <label className="mb-1 flex cursor-pointer items-start gap-3 rounded-xl border border-edge bg-surface px-4 py-3">
                    <input
                      type="checkbox" checked={mismaHora} className="mt-1 accent-gold shrink-0"
                      onChange={ev => {
                        setMismaHora(ev.target.checked)
                        if (ev.target.checked) setHoraUnica(horaUnica)
                      }}
                    />
                    <span className="text-[15px] text-ink">Entreno siempre a la misma hora</span>
                  </label>

                  <div className="flex flex-col gap-2">
                    {mismaHora ? (
                      <div className="grid grid-cols-[1fr_auto] items-center gap-2.5 rounded-xl border border-edge bg-surface px-3 py-2.5">
                        <span className="text-[14.5px] text-ink">Todos los días que entreno</span>
                        <input
                          type="time" aria-label="Hora de todos los días que entreno"
                          className={`${cls(e._horas)} w-[120px] px-3 py-2`}
                          value={horaUnica} onChange={ev => setHoraUnica(ev.target.value)}
                        />
                      </div>
                    ) : (
                      form.dias.map(d => (
                        <div key={d} className="grid grid-cols-[1fr_auto] items-center gap-2.5 rounded-xl border border-edge bg-surface px-3 py-2.5">
                          <span className="text-[14.5px] text-ink">{d}</span>
                          <input
                            type="time" aria-label={`Hora de ${d}`}
                            className={`${cls(e._horas)} w-[120px] px-3 py-2`}
                            value={form.horas[d] ?? ''} onChange={ev => setHoraDia(d, ev.target.value)}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </Campo>
              )}

              <Campo
                id="comidas" label="¿A qué hora comés realmente cada comida?" obligatorio error={e._comidas}
                hint={'La hora de verdad, la de un día común. Marcá "no la hago" en las que no hacés.'}
              >
                <div className="flex flex-col gap-2">
                  {COMIDAS.map(c => {
                    const apagada = form.comidas[c.k] === null
                    return (
                      <div key={c.k} className="grid grid-cols-[1fr_auto_auto] items-center gap-2.5 rounded-xl border border-edge bg-surface px-3 py-2.5">
                        <span className="min-w-0 text-[14.5px] text-ink">{c.label}</span>
                        <input
                          type="time" aria-label={`Hora de ${c.label}`} disabled={apagada}
                          className={`${cls(e._comidas)} w-[120px] px-3 py-2 ${apagada ? 'opacity-35' : ''}`}
                          value={form.comidas[c.k] ?? ''}
                          onChange={ev => setComida(c.k, ev.target.value)}
                        />
                        <label className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-xs text-ink-secondary">
                          <input
                            type="checkbox" checked={apagada} className="accent-gold"
                            onChange={ev => setComida(c.k, ev.target.checked ? null : '')}
                          />
                          no la hago
                        </label>
                      </div>
                    )
                  })}
                </div>
              </Campo>

              <Campo
                id="sostiene" label="¿Cuántas comidas podés sostener de verdad en un día laboral?" obligatorio error={e.sostiene}
                hint="Mejor cuatro cumplidas que cinco incumplidas. Esto no es un examen."
              >
                <Chips opciones={OPCIONES.sostiene} valor={form.sostiene} onPick={v => set('sostiene', v)} />
              </Campo>

              <Campo id="ayunas" label="¿Entrenás en ayunas o después de comer?" obligatorio error={e.ayunas}>
                <Radios
                  name="ayunas" valor={form.ayunas} onPick={v => set('ayunas', v)}
                  opciones={OPCIONES.ayunas.map(v => ({ v, label: v }))}
                />
              </Campo>

              <Campo
                id="jornada" label="¿Hay días en que tu jornada cambia?" obligatorio error={e.jornada}
                hint="Entrada temprana, guardia, turno rotativo, viajes. Cada variante puede necesitar su propia plantilla."
              >
                <Radios
                  name="jornada" valor={form.jornada} onPick={v => set('jornada', v)}
                  opciones={[
                    { v: 'No, todos mis días son parecidos', label: 'No, todos mis días son parecidos' },
                    { v: 'Sí', label: 'Sí, hay días distintos' },
                  ]}
                />
                {form.jornada === 'Sí' && (
                  <Sub>
                    <Campo id="jornada_detalle" para="jornada_detalle" label="¿Cuáles y cómo cambian?">
                      <textarea
                        id="jornada_detalle" rows={3} className={`${cls()} min-h-[88px] resize-y`}
                        placeholder="Ej: miércoles y viernes entro 7am, desayuno a las 6"
                        value={form.jornada_detalle} onChange={ev => set('jornada_detalle', ev.target.value)}
                      />
                    </Campo>
                  </Sub>
                )}
              </Campo>

              <Campo
                id="domingo" label="¿Tenés disponibilidad los domingos?"
                hint="Define si el ciclo puede usar el domingo para una sesión o para el meal prep."
              >
                <Chips
                  opciones={OPCIONES.domingo}
                  valor={form.domingo}
                  onPick={v => set('domingo', form.domingo === v ? '' : v)}
                />
              </Campo>
            </div>
          </section>
        )}

        {/* ── Paso 3 — Cómo comés ── */}
        {paso === 3 && (
          <section>
            <h2 className="font-serif text-[clamp(21px,4.6vw,26px)] text-ink">Cómo comés</h2>
            <p className="mb-7 mt-1.5 text-ink-secondary">
              Tres preguntas que parecen la misma y no lo son: lo que te cae mal, lo que te hace mal y
              lo que no te gusta.
            </p>
            <div className="flex flex-col gap-5">
              <Campo
                id="cae_mal" para="cae_mal" obligatorio error={e.cae_mal}
                label="¿Hay algún alimento que te caiga mal, te hinche o te genere molestia digestiva?"
                hint={'Si no hay ninguno, escribí "ninguno". Esto es lo que después reemplazás por tu cuenta sin avisar y descalibra el plan en silencio.'}
              >
                <textarea id="cae_mal" rows={3} className={`${cls(e.cae_mal)} min-h-[88px] resize-y`}
                  value={form.cae_mal} onChange={ev => set('cae_mal', ev.target.value)} />
              </Campo>

              <Campo
                id="alergias" para="alergias" obligatorio error={e.alergias}
                label="¿Tenés alguna alergia o intolerancia diagnosticada?"
                hint={'Si no tenés, escribí "ninguna".'}
              >
                <textarea id="alergias" rows={3} className={`${cls(e.alergias)} min-h-[88px] resize-y`}
                  value={form.alergias} onChange={ev => set('alergias', ev.target.value)} />
              </Campo>

              <Campo
                id="no_gusta" para="no_gusta" obligatorio error={e.no_gusta}
                label="¿Qué alimentos directamente no te gustan y no vas a comer?"
                hint="Sé honesto acá. No tiene sentido armar el plan sobre algo que nunca vas a comprar."
              >
                <textarea id="no_gusta" rows={3} className={`${cls(e.no_gusta)} min-h-[88px] resize-y`}
                  value={form.no_gusta} onChange={ev => set('no_gusta', ev.target.value)} />
              </Campo>

              <Campo id="cocina" label="¿Cocinás y tenés acceso a cocina durante la semana?">
                <Chips
                  opciones={OPCIONES.cocina}
                  valor={form.cocina}
                  onPick={v => set('cocina', form.cocina === v ? '' : v)}
                  etiquetas={{ 'Sí, cocino sin problema': 'Sí, sin problema' }}
                />
              </Campo>

              <Campo
                id="comidas_afuera" para="comidas_afuera"
                label="¿Cuántas comidas hacés fuera de casa y en qué condiciones?"
                hint="Define cuántas tomas tienen que ser portátiles."
              >
                <input
                  id="comidas_afuera" type="text" className={cls()}
                  placeholder="Ej: almuerzo de lunes a viernes, en el trabajo, sin microondas"
                  value={form.comidas_afuera} onChange={ev => set('comidas_afuera', ev.target.value)}
                />
              </Campo>

              <Campo
                id="balanza" label="¿Tenés balanza de cocina?" obligatorio error={e.balanza}
                hint="El plan se entrega en gramajes exactos, no en puñados ni palmas. Sin balanza no se puede ejecutar como fue diseñado."
              >
                <Radios
                  name="balanza" valor={form.balanza} onPick={v => set('balanza', v)}
                  opciones={[
                    { v: 'Sí, tengo', label: 'Sí, tengo' },
                    { v: 'No, pero la compro', label: 'No, pero la compro', sub: 'Cuestan poco y es la herramienta que hace funcionar el plan.' },
                    { v: 'No y no pienso comprarla', label: 'No y no pienso comprarla' },
                  ]}
                />
              </Campo>

              <Campo
                id="fin_de_semana" para="fin_de_semana"
                label="¿Cómo son tus fines de semana? ¿Salís, tomás alcohol, con qué frecuencia?"
                hint="Es donde se rompe la mayoría de los planes. Se planifica, no se prohíbe."
              >
                <textarea id="fin_de_semana" rows={3} className={`${cls()} min-h-[88px] resize-y`}
                  value={form.fin_de_semana} onChange={ev => set('fin_de_semana', ev.target.value)} />
              </Campo>

              <Campo id="agua" para="agua" label="¿Cuánta agua tomás por día, aproximadamente?">
                <input id="agua" type="text" placeholder="Ej: un litro y medio, más mate" className={cls()}
                  value={form.agua} onChange={ev => set('agua', ev.target.value)} />
              </Campo>
            </div>
          </section>
        )}

        {/* ── Paso 4 — Salud ── */}
        {paso === 4 && (
          <section>
            <h2 className="font-serif text-[clamp(21px,4.6vw,26px)] text-ink">Salud</h2>
            <p className="mb-7 mt-1.5 text-ink-secondary">
              Nada de esto reemplaza a tu médico. Define qué ejercicios quedan afuera y qué alertas
              lleva tu plan.
            </p>
            <div className="flex flex-col gap-5">
              <Campo
                id="lesion" label="¿Tenés alguna lesión, condición clínica o diagnóstico vigente?"
                obligatorio error={e.lesion}
              >
                <Radios
                  name="lesion" valor={form.lesion} onPick={v => set('lesion', v)}
                  opciones={[{ v: 'No', label: 'No' }, { v: 'Sí', label: 'Sí' }]}
                />
                {form.lesion === 'Sí' && (
                  <Sub>
                    <Campo id="lesion_detalle" para="lesion_detalle" label="¿Cuál?">
                      <input id="lesion_detalle" type="text" placeholder="Ej: hernia L4-L5" className={cls()}
                        value={form.lesion_detalle} onChange={ev => set('lesion_detalle', ev.target.value)} />
                    </Campo>
                    <Campo
                      id="lesion_estado" label="¿Cómo está hoy?"
                      hint="El estado actual define cuánto se puede progresar, más que el diagnóstico en sí."
                    >
                      <Chips
                        opciones={OPCIONES.lesion_estado}
                        valor={form.lesion_estado}
                        onPick={v => set('lesion_estado', form.lesion_estado === v ? '' : v)}
                        etiquetas={{ 'Asintomática': 'Sin síntomas', Activa: 'Activa, me duele' }}
                      />
                    </Campo>
                  </Sub>
                )}
              </Campo>

              <Campo
                id="laboratorio" label="¿Tenés estudios de laboratorio de los últimos 12 meses?"
                obligatorio error={e.laboratorio}
                hint="Cambian decisiones concretas del plan. Si decís que sí, te los pido por WhatsApp."
              >
                <Radios
                  name="laboratorio" valor={form.laboratorio} onPick={v => set('laboratorio', v)}
                  opciones={OPCIONES.laboratorio.map(v => ({ v, label: v }))}
                />
              </Campo>

              <Campo
                id="medicacion" para="medicacion" label="¿Estás tomando algún medicamento o suplemento?"
                obligatorio error={e.medicacion} hint={'Si no tomás nada, escribí "nada".'}
              >
                <textarea id="medicacion" rows={3} className={`${cls(e.medicacion)} min-h-[88px] resize-y`}
                  value={form.medicacion} onChange={ev => set('medicacion', ev.target.value)} />
              </Campo>

              <div className="flex flex-wrap gap-3">
                <div className="min-w-[150px] flex-1">
                  <Campo id="sueno" para="sueno" label="¿Cuántas horas dormís?">
                    <input id="sueno" type="text" placeholder="Ej: 7" className={cls()}
                      value={form.sueno} onChange={ev => set('sueno', ev.target.value)} />
                  </Campo>
                </div>
                <div className="min-w-[150px] flex-1">
                  <Campo id="estres" label="Nivel de estrés">
                    <Chips
                      opciones={OPCIONES.estres}
                      valor={form.estres}
                      onPick={v => set('estres', form.estres === v ? '' : v)}
                    />
                  </Campo>
                </div>
              </div>

              <Campo
                id="seguimiento" para="seguimiento"
                label="¿Estás en seguimiento con algún médico o nutricionista?"
              >
                <input id="seguimiento" type="text" placeholder="Ej: traumatólogo por la espalda" className={cls()}
                  value={form.seguimiento} onChange={ev => set('seguimiento', ev.target.value)} />
              </Campo>
            </div>
          </section>
        )}

        {/* ── Paso 5 — Cómo vas a entrenar ── */}
        {paso === 5 && (
          <section>
            <h2 className="font-serif text-[clamp(21px,4.6vw,26px)] text-ink">Cómo vas a entrenar</h2>
            <p className="mb-7 mt-1.5 text-ink-secondary">
              Dónde entrenás y con quién cambia el plan entero, no la selección de ejercicios.
            </p>
            <div className="flex flex-col gap-5">
              <Campo id="lugar" label="¿Dónde vas a entrenar?" obligatorio error={e.lugar}>
                <Radios
                  name="lugar" valor={form.lugar} onPick={v => set('lugar', v)}
                  opciones={[
                    { v: 'Gimnasio completo', label: 'Gimnasio completo', sub: 'Máquinas, barras, mancuernas, poleas.' },
                    { v: 'Gimnasio limitado', label: 'Gimnasio chico o limitado', sub: 'Pocas máquinas, equipamiento incompleto.' },
                    { v: 'En casa', label: 'En casa', sub: 'Contame abajo con qué contás.' },
                  ]}
                />
                <div className="mt-1">
                  <Campo id="equipamiento" para="equipamiento" label="¿Con qué equipamiento contás?">
                    <input
                      id="equipamiento" type="text" className={cls()}
                      placeholder="Ej: mancuernas hasta 12 kg, banco y bandas"
                      value={form.equipamiento} onChange={ev => set('equipamiento', ev.target.value)}
                    />
                  </Campo>
                </div>
              </Campo>

              <Campo
                id="sesiones" label="¿Cuántas sesiones van a ser conmigo y cuántas por tu cuenta?"
                obligatorio error={e._sesiones}
                hint="Las sesiones solas se diseñan con menor riesgo técnico: máquina, polea o sentado con respaldo."
              >
                <div className="flex flex-wrap gap-3">
                  <div className="min-w-[150px] flex-1">
                    <Campo id="sesiones_con_entrenador" para="sesiones_con_entrenador" label="Conmigo, por semana">
                      <input
                        id="sesiones_con_entrenador" type="number" inputMode="numeric" min={0} max={7}
                        className={cls(e._sesiones)}
                        value={form.sesiones_con_entrenador}
                        onChange={ev => { set('sesiones_con_entrenador', ev.target.value); limpiarSintetico('_sesiones') }}
                      />
                    </Campo>
                  </div>
                  <div className="min-w-[150px] flex-1">
                    <Campo id="sesiones_solo" para="sesiones_solo" label="Por tu cuenta, por semana">
                      <input
                        id="sesiones_solo" type="number" inputMode="numeric" min={0} max={7}
                        className={cls(e._sesiones)}
                        value={form.sesiones_solo}
                        onChange={ev => { set('sesiones_solo', ev.target.value); limpiarSintetico('_sesiones') }}
                      />
                    </Campo>
                  </div>
                </div>
              </Campo>

              <Campo id="duracion_sesion" label="¿Cuánto tiempo real tenés por sesión?">
                <Chips
                  opciones={OPCIONES.duracion_sesion}
                  valor={form.duracion_sesion}
                  onPick={v => set('duracion_sesion', form.duracion_sesion === v ? '' : v)}
                />
              </Campo>

              <Campo id="otros_deportes" para="otros_deportes" label="¿Hacés otro deporte o actividad fuera del gimnasio?">
                <input id="otros_deportes" type="text" placeholder="Ej: fútbol los jueves" className={cls()}
                  value={form.otros_deportes} onChange={ev => set('otros_deportes', ev.target.value)} />
              </Campo>

              <Campo
                id="ejercicios_evitar" para="ejercicios_evitar"
                label="¿Hay algún ejercicio que te genere dolor o que prefieras no hacer?"
                hint="Se respeta aunque no haya un diagnóstico detrás."
              >
                <textarea id="ejercicios_evitar" rows={3} className={`${cls()} min-h-[88px] resize-y`}
                  value={form.ejercicios_evitar} onChange={ev => set('ejercicios_evitar', ev.target.value)} />
              </Campo>

              <Campo
                id="pasos" para="pasos" label="¿Cuántos pasos hacés por día, aproximadamente?"
                hint="Es la primera variable que toco cuando el peso se estanca, antes que las calorías."
              >
                <input id="pasos" type="text" placeholder="Ej: 6000, o no sé" className={cls()}
                  value={form.pasos} onChange={ev => set('pasos', ev.target.value)} />
              </Campo>
            </div>
          </section>
        )}

        {/* ── Paso 6 — Cómo seguimos ── */}
        {paso === 6 && (
          <section>
            <h2 className="font-serif text-[clamp(21px,4.6vw,26px)] text-ink">Cómo seguimos</h2>
            <p className="mb-7 mt-1.5 text-ink-secondary">
              Lo último. Define el calendario y evita expectativas cruzadas.
            </p>
            <div className="flex flex-col gap-5">
              <Campo
                id="presupuesto" label="¿Tenés presupuesto para suplementos?" obligatorio error={e.presupuesto}
                hint="Un protocolo completo puede ser caro. Prefiero saberlo antes de recomendarte algo que no vas a comprar."
              >
                <Chips
                  opciones={OPCIONES.presupuesto}
                  valor={form.presupuesto}
                  onPick={v => set('presupuesto', v)}
                  etiquetas={{ 'Sí, acotado': 'Sí, pero acotado', 'No, por ahora no': 'Por ahora no' }}
                />
              </Campo>

              <Campo id="revision" label="¿Cada cuánto querés que revisemos el plan?">
                <Chips
                  opciones={OPCIONES.revision}
                  valor={form.revision}
                  onPick={v => set('revision', form.revision === v ? '' : v)}
                />
              </Campo>

              <Campo id="comunicacion" para="comunicacion" label="¿Por qué medio preferís hablar y en qué horarios?">
                <input id="comunicacion" type="text" placeholder="Ej: WhatsApp, después de las 19" className={cls()}
                  value={form.comunicacion} onChange={ev => set('comunicacion', ev.target.value)} />
              </Campo>

              <Campo
                id="intentos_previos" para="intentos_previos"
                label="¿Intentaste algo parecido antes? ¿Qué funcionó y qué no?"
                hint="La causa del fracaso anterior casi siempre es estructural, no nutricional. Saberla cambia cómo armo el plan."
              >
                <textarea id="intentos_previos" rows={3} className={`${cls()} min-h-[88px] resize-y`}
                  value={form.intentos_previos} onChange={ev => set('intentos_previos', ev.target.value)} />
              </Campo>

              <Campo id="fecha_motivadora" para="fecha_motivadora" label="¿Hay alguna fecha o evento que te esté motivando?">
                <input id="fecha_motivadora" type="text" placeholder="Ej: casamiento en marzo" className={cls()}
                  value={form.fecha_motivadora} onChange={ev => set('fecha_motivadora', ev.target.value)} />
              </Campo>

              <div id="campo-consentimiento" className="scroll-mt-28">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 ${
                    e.consentimiento ? 'border-red-400 bg-red-50' : 'border-edge bg-surface'
                  }`}
                >
                  <input
                    type="checkbox" checked={form.consentimiento} className="mt-1 accent-gold shrink-0"
                    onChange={ev => set('consentimiento', ev.target.checked)}
                  />
                  <span className="text-[15px] text-ink">
                    Autorizo el uso de estos datos para el diseño de mi plan personalizado.
                    <small className="block text-[13px] text-ink-secondary">
                      Ley 25.326 de Protección de Datos Personales. No se comparten con terceros.
                    </small>
                  </span>
                </label>
                {e.consentimiento && <p className="mt-1.5 text-[13px] font-bold text-red-600">{e.consentimiento}</p>}
              </div>

              {errorEnvio && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorEnvio}</p>
              )}
            </div>
          </section>
        )}
      </div>

      {/* ── Navegación fija ── */}
      <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-edge bg-surface">
        <div className="mx-auto flex max-w-[660px] items-center justify-between gap-3 px-4 py-3.5">
          <button
            type="button" onClick={atras} disabled={paso === 0}
            className="rounded-xl border border-edge px-5 py-3 text-sm font-bold tracking-wide text-ink-secondary transition-colors hover:text-ink disabled:opacity-40"
          >
            Atrás
          </button>
          <button
            type="button" onClick={siguiente} disabled={enviando}
            className="rounded-xl bg-ink px-6 py-3 text-sm font-bold tracking-wide text-ivory transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {enviando ? 'Enviando…' : paso === 0 ? 'Empezar' : paso === PASOS.length - 1 ? 'Enviar' : 'Siguiente'}
          </button>
        </div>
      </footer>
    </main>
  )
}
