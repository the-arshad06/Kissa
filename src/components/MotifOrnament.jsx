export default function MotifOrnament({ className = '' }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="1.5" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180
        const x1 = 50 + 34 * Math.cos(angle)
        const y1 = 50 + 34 * Math.sin(angle)
        const x2 = 50 + 46 * Math.cos(angle)
        const y2 = 50 + 46 * Math.sin(angle)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" />
      })}
      <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M50 16c8 8 8 16 0 24-8-8-8-16 0-24Z"
        stroke="currentColor"
        strokeWidth="1.2"
        transform="rotate(0 50 50)"
      />
    </svg>
  )
}
