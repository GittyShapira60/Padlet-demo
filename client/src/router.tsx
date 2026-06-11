import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import ProtectedRoute from './components/routing/ProtectedRoute/ProtectedRoute';
import AuthPage from './pages/auth/AuthPage';
import HomePage from './pages/home/HomePage';
import PadletPage from './pages/padlet/PadletPage';
import { AuthProvider } from './providers/AuthProvider';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
          </Route>
          <Route
            path="/padlets/:padletId"
            element={
              <ProtectedRoute>
                <PadletPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
