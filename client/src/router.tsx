import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import ProtectedRoute from './shared/routing/ProtectedRoute/ProtectedRoute';
import AuthPage from './features/auth/pages/AuthPage';
import HomePage from './features/home/pages/HomePage';
import PadletPage from './features/padlet/pages/PadletPage';
import { AuthProvider } from './features/auth/context/AuthProvider';
import { NotificationProvider } from './features/notification';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
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
              <Route path="padlets/:padletId" element={<PadletPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
