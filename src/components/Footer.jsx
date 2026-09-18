import { Link } from 'react-router-dom'
import MotifOrnament from './MotifOrnament'
import logoFull from '../assets/kissa-logo-full.png'

export default function Footer() {
  return (
    <footer className="w-full mt-auto pb-24 md:pb-0 relative">
      <div className="motif-divider" />
      <div className="bg-surface-container border-t border-outline-variant relative overflow-hidden">
        <MotifOrnament className="motif-corner text-terracotta -right-6 -top-6 w-16 h-16 hidden md:block opacity-60" />

        <div className="max-w-6xl mx-auto px-6 md:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link to="/" className="flex items-center shrink-0">
            <img src={logoFull} alt="KISSA — A Tale of Untold Stories" className="h-8 w-auto object-contain" />
          </Link>

          <p className="text-xs text-on-surface-variant text-center order-3 sm:order-2">
            © {new Date().getFullYear()} KISSA By Arshad Ansari. All stories belong to their authors.
          </p>

          <p className="text-xs text-on-surface-variant text-center sm:text-right max-w-xs order-2 sm:order-3">
            A crowd-sourced archive of local histories, traditions, and forgotten places.
          </p>
        </div>
      </div>
    </footer>
  )
}
