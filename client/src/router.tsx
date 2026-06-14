import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import ProtectedRoute from './shared/routing/ProtectedRoute/ProtectedRoute';
import AuthPage from './features/auth/pages/AuthPage';
import HomePage from './features/home/pages/HomePage';
import PadletPage from './features/padlet/pages/PadletPage';
import { AuthProvider } from './features/auth/context/AuthProvider';

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
