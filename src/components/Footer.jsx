import { Link } from 'react-router-dom'
import MotifOrnament from './MotifOrnament'
import logoFull from '../assets/kissa-logo-full.png'

export default function Footer() {
  return (
    <footer className="w-full mt-auto pb-24 md:pb-0 relative">
      <div className="motif-divider" />
      <div className="bg-surface-container border-t border-outline-variant relative overflow-hidden">
        <MotifOrnament className="motif-corner text-terracotta -right-8 -top-8 hidden md:block" />

        <div className="max-w-6xl mx-auto px-6 md:px-16 py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <Link to="/" className="flex items-center w-fit">
              <img src={logoFull} alt="KISSA — A Tale of Untold Stories" className="h-12 w-auto object-contain" />
            </Link>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm">
              A crowd-sourced archive of local histories, oral traditions, and forgotten places —
              preserved one story at a time.
            </p>
          </div>

          {/* Explore */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h3 className="label-caps text-on-surface">Explore</h3>
            <Link to="/" className="text-sm text-on-surface-variant hover:text-primary transition-colors w-fit">
              Home
            </Link>
            <Link to="/search" className="text-sm text-on-surface-variant hover:text-primary transition-colors w-fit">
              Search the Archive
            </Link>
          </div>

          {/* General */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <h3 className="label-caps text-on-surface">General</h3>
            <Link to="/terms" className="text-sm text-on-surface-variant hover:text-primary transition-colors w-fit">
              Terms &amp; Conditions
            </Link>
            <Link to="/contact" className="text-sm text-on-surface-variant hover:text-primary transition-colors w-fit">
              Contact Us
            </Link>
          </div>
        </div>

        <div className="border-t border-outline-variant">
          <div className="max-w-6xl mx-auto px-6 md:px-16 py-5 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs text-on-surface-variant">© {new Date().getFullYear()} KISSA. All stories belong to their authors.</p>
            <p className="text-xs text-on-surface-variant">Built for the histories that never made it into the books.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
