import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster, ToastBar } from 'react-hot-toast'
import LoginScreen from './screens/LoginScreen'
import DashboardScreen from './screens/DashboardScreen'
import AdminDashboardScreen from './screens/AdminDashboardScreen'
import AdminUsersScreen from './screens/AdminUsersScreen'
import AdminJobsScreen from './screens/AdminJobsScreen'
import AdminSettingsScreen from './screens/AdminSettingsScreen'
import JobsScreen from './screens/JobsScreen'
import JobDetailScreen from './screens/JobDetailScreen'
import NotificationListScreen from './screens/NotificationListScreen'
import ProfileScreen from './screens/ProfileScreen'
import ProfileViewScreen from './screens/ProfileViewScreen'
import AuthVerifyScreen from './screens/AuthVerifyScreen'
import NetworkScreen from './screens/NetworkScreen'
import InterviewPrepScreen from './screens/InterviewPrepScreen'
import EventsScreen from './screens/EventsScreen'
import MentorshipScreen from './screens/MentorshipScreen'
import SuccessStoriesScreen from './screens/SuccessStoriesScreen'
import SettingsScreen from './screens/SettingsScreen'
import MessagingScreen from './screens/MessagingScreen'
import FreelanceProjectsScreen from './screens/FreelanceProjectsScreen'

function App() {
  // Uygulama başlarken ayarları yükle
  useEffect(() => {
    const savedSettings = localStorage.getItem('uphera_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      // Tema ayarını uygula
      if (settings.theme) {
        document.documentElement.setAttribute('data-theme', settings.theme);
      }
      // Dil ayarını uygula
      if (settings.language) {
        document.documentElement.setAttribute('lang', settings.language);
      }
    } else {
      // Varsayılanlar
      if (!document.documentElement.getAttribute('data-theme')) {
        document.documentElement.setAttribute('data-theme', 'light');
      }
      if (!document.documentElement.getAttribute('lang')) {
        document.documentElement.setAttribute('lang', 'tr');
      }
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--up-bg)', color: 'var(--up-text)' }}>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/login" element={<LoginScreen />} />
                <Route path="/auth/verify" element={<AuthVerifyScreen />} />

        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/admin" element={<AdminDashboardScreen />} />
        <Route path="/admin/users" element={<AdminUsersScreen />} />
        <Route path="/admin/jobs" element={<AdminJobsScreen />} />
        <Route path="/admin/settings" element={<AdminSettingsScreen />} />
        {/* Jobs page with dedicated functionality */}
        <Route path="/jobs" element={<JobsScreen />} />
        <Route path="/freelance-projects" element={<FreelanceProjectsScreen />} />
        <Route path="/jobs/:jobId" element={<JobDetailScreen />} />
        <Route path="/profile/view" element={<ProfileViewScreen />} />
        <Route path="/profile/edit" element={<ProfileScreen />} />
        <Route path="/notifications" element={<NotificationListScreen />} />
        <Route path="/network" element={<NetworkScreen />} />
        <Route path="/mentorship" element={<MentorshipScreen />} />
        <Route path="/messages/:mentorId" element={<MessagingScreen />} />
        <Route path="/success-stories" element={<SuccessStoriesScreen />} />
        <Route path="/interview-prep" element={<InterviewPrepScreen />} />
        <Route path="/events" element={<EventsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
      <Toaster position="top-right">
        {(t) => (t.type === 'error' ? null : <ToastBar toast={t} />)}
      </Toaster>
    </div>
  )
}

export default App 