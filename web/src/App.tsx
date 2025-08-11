import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginScreen from './screens/LoginScreen'
import JobListScreen from './screens/JobListScreen'
import DashboardScreen from './screens/DashboardScreen'
import JobDetailScreen from './screens/JobDetailScreen'
import NotificationListScreen from './screens/NotificationListScreen'
import ProfileScreen from './screens/ProfileScreen'
import ProfileViewScreen from './screens/ProfileViewScreen'
import AuthVerifyScreen from './screens/AuthVerifyScreen'
import NetworkScreen from './screens/NetworkScreen'
import InterviewPrepScreen from './screens/InterviewPrepScreen'
import EventsScreen from './screens/EventsScreen'
import FreelanceProjectsScreen from './screens/FreelanceProjectsScreen'
import MentorshipScreen from './screens/MentorshipScreen'
import SuccessStoriesScreen from './screens/SuccessStoriesScreen'
import SettingsScreen from './screens/SettingsScreen'
import MessagingScreen from './screens/MessagingScreen'

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
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/login" element={<LoginScreen />} />
                <Route path="/auth/verify" element={<AuthVerifyScreen />} />

        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/jobs" element={<JobListScreen />} />
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
        <Route path="/freelance-projects" element={<FreelanceProjectsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
      <Toaster position="top-right" />
    </div>
  )
}

export default App 