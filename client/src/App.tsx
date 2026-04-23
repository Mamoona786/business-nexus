import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleRoute } from './components/auth/RoleRoute';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

import { EntrepreneurDashboard } from './pages/dashboard/EntrepreneurDashboard';
import { InvestorDashboard } from './pages/dashboard/InvestorDashboard';

import { EntrepreneurProfile } from './pages/profile/EntrepreneurProfile';
import { InvestorProfile } from './pages/profile/InvestorProfile';

import { InvestorsPage } from './pages/investors/InvestorsPage';
import { EntrepreneursPage } from './pages/entrepreneurs/EntrepreneursPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { DocumentsPage } from './pages/documents/DocumentsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { HelpPage } from './pages/help/HelpPage';
import { DealsPage } from './pages/deals/DealsPage';
import { ChatPage } from './pages/chat/ChatPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route element={<RoleRoute allowedRole="entrepreneur" />}>
                <Route path="entrepreneur" element={<EntrepreneurDashboard />} />
              </Route>

              <Route element={<RoleRoute allowedRole="investor" />}>
                <Route path="investor" element={<InvestorDashboard />} />
              </Route>
            </Route>

            <Route path="/profile" element={<DashboardLayout />}>
              <Route path="entrepreneur/:id" element={<EntrepreneurProfile />} />
              <Route path="investor/:id" element={<InvestorProfile />} />
            </Route>

            <Route path="/investors" element={<DashboardLayout />}>
              <Route index element={<InvestorsPage />} />
            </Route>

            <Route path="/entrepreneurs" element={<DashboardLayout />}>
              <Route index element={<EntrepreneursPage />} />
            </Route>

            <Route path="/messages" element={<DashboardLayout />}>
              <Route index element={<MessagesPage />} />
            </Route>

            <Route path="/notifications" element={<DashboardLayout />}>
              <Route index element={<NotificationsPage />} />
            </Route>

            <Route path="/documents" element={<DashboardLayout />}>
              <Route index element={<DocumentsPage />} />
            </Route>

            <Route path="/settings" element={<DashboardLayout />}>
              <Route index element={<SettingsPage />} />
            </Route>

            <Route path="/help" element={<DashboardLayout />}>
              <Route index element={<HelpPage />} />
            </Route>

            <Route path="/deals" element={<DashboardLayout />}>
              <Route index element={<DealsPage />} />
            </Route>

            <Route path="/chat" element={<DashboardLayout />}>
              <Route index element={<ChatPage />} />
              <Route path=":userId" element={<ChatPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
