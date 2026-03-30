// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Home      from './pages/Home'
import Login     from './pages/Login'
import Register  from './pages/Register'
import Stories   from './pages/Stories'
import StoryDetail from './pages/StoryDetail'
import Quiz      from './pages/Quiz'
import Dashboard from './pages/Dashboard'
import Submit    from './pages/Submit'
import Admin     from './pages/Admin'
import Navbar    from './components/ui/Navbar'

// Wrapper — redirect to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-center">Loading...</div>
  return user ? children : <Navigate to="/login" />
}

// Wrapper — redirect to home if not admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-center">Loading...</div>
  return user?.role === 'admin' ? children : <Navigate to="/" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/stories"    element={<Stories />} />
        <Route path="/stories/:id" element={<StoryDetail />} />
        <Route path="/quiz"       element={<Quiz />} />

        <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/submit"     element={<ProtectedRoute><Submit /></ProtectedRoute>} />
        <Route path="/admin"      element={<AdminRoute><Admin /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  )
}