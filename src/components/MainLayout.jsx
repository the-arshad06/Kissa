import Navbar from './Navbar'
import Footer from './Footer'

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col font-body text-on-surface">
      <Navbar />
      <main className="flex-grow pt-28 pb-24 md:pb-16 px-4 md:px-16 max-w-[1024px] mx-auto w-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}
