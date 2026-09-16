import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              border: '2px solid #1b1c19',
              borderRadius: '4px',
              boxShadow: '4px 4px 0 0 #1b1c19',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
