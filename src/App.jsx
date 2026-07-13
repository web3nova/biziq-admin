import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Overview from './pages/Overview'
import Tenants from './pages/Tenants'
import TenantDetail from './pages/TenantDetail'
import Admins from './pages/Admins'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="tenants/:id" element={<TenantDetail />} />
            <Route path="admins" element={<Admins />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
