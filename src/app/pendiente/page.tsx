// Página que ve el cliente luego de completar el formulario o cuando entra al dashboard y su plan está pendiente

'use client'

import { useEffect, useState } from 'react'

function QRImage() {
  const [error, setError] = useState(false)
  if (error) {
    return (
      <div className="w-32 h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center p-3 text-center">
        <span className="text-xs text-gray-400 font-medium leading-snug">Subir qr-pago.png a /public</span>
      </div>
    )
  }
  return (
    <img
      src="/qr-pago.png"
      alt="QR de Pago REVIVA.IGZ"
      className="w-32 h-32 rounded-xl object-cover"
      onError={() => setError(true)}
    />
  )
}

export default function PendientePage() {
  const [aliasCopiado, setAliasCopiado] = useState(false)
  const [mostrarQR, setMostrarQR] = useState(false)
  const [nombre, setNombre] = useState('')

  const alias = "REVIVA.IGZ"
  const whatsappNumber = "5491122835621"
  const whatsappMessage = encodeURIComponent("Hola Ian, te envío mi comprobante de pago para comenzar con REVIVA.")
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
  const instagramLink = "https://instagram.com/igztrainer"

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.nombre) setNombre(d.nombre.split(' ')[0]) })
  }, [])

  const copiarAlias = () => {
    navigator.clipboard.writeText(alias)
    setAliasCopiado(true)
    setMostrarQR(true)
    setTimeout(() => setAliasCopiado(false), 3000)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        
        {/* Header Visual */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{nombre ? `${nombre}, ya estás dentro de REVIVA` : 'Ya estás dentro de REVIVA'}</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Pendiente de activación
          </div>
        </div>

        {/* Card de Acción Principal */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
               <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">1</span>
               Realizar pago
            </h2>
            
            <p className="text-sm text-gray-600 mb-4">
              Transferí el valor del plan al siguiente alias para activar tu cuenta.
            </p>

            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between mb-2 border border-gray-100">
              <div className="font-mono font-medium text-gray-900 tracking-wide">{alias}</div>
              <button 
                onClick={copiarAlias}
                className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                {aliasCopiado ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>

            {/* QR Animado (se muestra al copiar el alias) */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden flex flex-col items-center ${mostrarQR ? 'max-h-64 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
               <p className="text-xs text-gray-500 mb-2">O escaneá el código QR:</p>
               <QRImage />
            </div>

            <hr className="my-6 border-gray-100" />

            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
               <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">2</span>
               Enviar comprobante
            </h2>

            <p className="text-sm text-gray-600 mb-5">
              Hacé clic abajo para enviarme el comprobante directamente por WhatsApp.
            </p>

            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-4 rounded-xl font-medium transition-all shadow-sm active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Enviar comprobante
            </a>
          </div>
        </div>

        {/* Paso 3: Esperar activación */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">3</span>
            Esperá el contacto
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Una vez que confirme tu pago, te contacto en las próximas <strong>24 a 72 horas hábiles</strong> para activar tu plan personalizado.
          </p>
        </div>

        {/* Cierre / Espera - Instagram */}
        <div className="bg-emerald-900 text-[#EDE8DF] rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden">
          {/* Decals background */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-800 rounded-full blur-2xl opacity-50"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-800 rounded-full blur-2xl opacity-50"></div>
          
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-2">¿Querés conocer más sobre el proceso?</h3>
            <p className="text-emerald-100 text-sm mb-5">
               Mientras preparo tu plan, mirá mis contenidos y empezá a nutrirte de información clave.
            </p>
            <a 
              href={instagramLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#EDE8DF]/10 hover:bg-[#EDE8DF]/20 border border-[#EDE8DF]/20 text-[#EDE8DF] px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
            >
              Mirá mis contenidos
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </main>
  )
}
