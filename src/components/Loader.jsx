export default function Loader({ label = 'Loading archive...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-on-surface-variant">
      <div className="w-10 h-10 border-2 border-on-surface border-t-transparent rounded-full animate-spin" />
      <p className="label-caps">{label}</p>
    </div>
  )
}
