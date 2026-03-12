interface BadgeProps {
  label: string
  color?: 'gray' | 'indigo' | 'green' | 'red'
}

export default function Badge({ label, color = 'gray' }: BadgeProps) {
  const colors = {
    gray: 'bg-gray-700 text-gray-300',
    indigo: 'bg-indigo-900 text-indigo-300',
    green: 'bg-green-900 text-green-300',
    red: 'bg-red-900 text-red-300',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[color]}`}>
      {label}
    </span>
  )
}
