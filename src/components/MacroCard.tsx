// Tarjeta para mostrar un macro nutriente (proteína, hidratos, grasas)

interface MacroCardProps {
  label: string
  value: number
  unit: string
  emoji: string
  color: 'blue' | 'yellow' | 'orange' | 'green'
}

const colorMap = {
  blue:   'bg-blue-50 border-blue-200 text-blue-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  green:  'bg-emerald-50 border-emerald-200 text-emerald-700',
}

export default function MacroCard({ label, value, unit, emoji, color }: MacroCardProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 ${colorMap[color]} text-center`}>
      <span className="text-3xl mb-1">{emoji}</span>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs font-medium opacity-75">{unit}</span>
      <span className="text-sm font-semibold mt-1">{label}</span>
    </div>
  )
}
