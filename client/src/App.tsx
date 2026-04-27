import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layout & Guards
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleRoute } from './components/auth/RoleRoute';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Dashboard
import { EntrepreneurDashboard } from './pages/dashboard/EntrepreneurDashboard';
import { InvestorDashboard } from './pages/dashboard/InvestorDashboard';

// Core Pages
import { MessagesPage } from './pages/messages/MessagesPage';
import { ChatPage } from './pages/chat/ChatPage';
import { MeetingsPage } from './pages/meetings/MeetingsPage';
import { VideoCallPage } from './pages/video-call/VideoCallPage';

// Feature Pages
import { InvestorsPage } from './pages/investors/InvestorsPage';
import { EntrepreneursPage } from './pages/entrepreneurs/EntrepreneursPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { DocumentsPage } from './pages/documents/DocumentsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { HelpPage } from './pages/help/HelpPage';
import { DealsPage } from './pages/deals/DealsPage';
import { PaymentsPage } from './pages/payments/PaymentsPage';

// Profile
import { EntrepreneurProfile } from './pages/profile/EntrepreneurProfile';
import { InvestorProfile } from './pages/profile/InvestorProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />

        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>

              {/* DASHBOARD */}
              <Route path="/dashboard">
                <Route element={<RoleRoute allowedRole="entrepreneur" />}>
                  <Route path="entrepreneur" element={<EntrepreneurDashboard />} />
                </Route>
                <Route element={<RoleRoute allowedRole="investor" />}>
                  <Route path="investor" element={<InvestorDashboard />} />
                </Route>
              </Route>

              {/* PROFILE */}
              <Route path="/profile">
                <Route path="entrepreneur/:id" element={<EntrepreneurProfile />} />
                <Route path="investor/:id" element={<InvestorProfile />} />
              </Route>

              {/* DISCOVERY */}
              <Route path="/investors">
                <Route element={<RoleRoute allowedRole="entrepreneur" />}>
                  <Route index element={<InvestorsPage />} />
                </Route>
              </Route>

              <Route path="/entrepreneurs">
                <Route element={<RoleRoute allowedRole="investor" />}>
                  <Route index element={<EntrepreneursPage />} />
                </Route>
              </Route>

              {/* MESSAGING */}
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/chat">
                <Route index element={<ChatPage />} />
                <Route path=":userId" element={<ChatPage />} />
              </Route>

              {/* MEETINGS */}
              <Route path="/meetings" element={<MeetingsPage />} />

              {/* VIDEO CALL */}
              <Route path="/video-call/:roomId" element={<VideoCallPage />} />

              {/* OTHER FEATURES */}
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/deals" element={<DealsPage />} />

            </Route>
          </Route>

          {/* DEFAULT */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
