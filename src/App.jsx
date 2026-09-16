import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Search from './pages/Search'
import CreateStory from './pages/CreateStory'
import EditStory from './pages/EditStory'
import StoryDetail from './pages/StoryDetail'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import Settings from './pages/Settings'
import Terms from './pages/Terms'
import Contact from './pages/Contact'
import Notifications from './pages/Notifications'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './components/MainLayout'

function NotFound() {
  return (
    <MainLayout>
      <div className="text-center py-24">
        <h1 className="font-display text-display-mobile font-bold mb-4">404</h1>
        <p className="text-on-surface-variant">This page isn't in the archive.</p>
      </div>
    </MainLayout>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/search" element={<Search />} />
      <Route path="/story/:id" element={<StoryDetail />} />
      <Route path="/profile/:username" element={<Profile />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/contact" element={<Contact />} />

      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreateStory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-story/:id"
        element={
          <ProtectedRoute>
            <EditStory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
