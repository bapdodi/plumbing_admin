const VARIANTS = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
  gray:    'bg-gray-100 text-gray-600',
}

export default function Badge({ label, variant = 'gray' }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${VARIANTS[variant] ?? VARIANTS.gray}`}>
      {label}
    </span>
  )
}
