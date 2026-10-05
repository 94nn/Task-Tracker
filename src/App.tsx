import { HashRouter, Navigate, Route, Routes } from 'react-router'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { AssignmentsProvider } from './context/AssignmentsContext'
import { UIProvider } from './context/UIContext'
import { AppLayout } from './components/layout/AppLayout'
import { RequireAuth } from './components/auth/RequireAuth'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Assignments from './pages/Assignments'
import AssignmentDetails from './pages/AssignmentDetails'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Completed from './pages/Completed'
import Settings from './pages/Settings'

/**
 * HashRouter keeps the route after the "#" (e.g. /Task-Tracker/#/tasks).
 * GitHub Pages only ever serves index.html, so refreshing any page never 404s.
 */
export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <SettingsProvider>
            <AssignmentsProvider>
              <UIProvider>
                <Routes>
                  <Route path="signup" element={<AuthPage mode="signup" />} />
                  <Route path="login" element={<AuthPage mode="login" />} />
                  <Route
                    element={
                      <RequireAuth>
                        <AppLayout />
                      </RequireAuth>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="assignments" element={<Assignments />} />
                    <Route path="assignments/:id" element={<AssignmentDetails />} />
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="completed" element={<Completed />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </UIProvider>
            </AssignmentsProvider>
          </SettingsProvider>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  )
}
