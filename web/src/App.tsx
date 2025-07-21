import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginScreen from './screens/LoginScreen'
import JobListScreen from './screens/JobListScreen'
import JobDetailScreen from './screens/JobDetailScreen'
import CandidateProfileScreen from './screens/CandidateProfileScreen'
import NotificationListScreen from './screens/NotificationListScreen'
import ProfileScreen from './screens/ProfileScreen'
import AuthVerifyScreen from './screens/AuthVerifyScreen'
import NetworkScreen from './screens/NetworkScreen'
import InterviewPrepScreen from './screens/InterviewPrepScreen'
import EventsScreen from './screens/EventsScreen'
import FreelanceProjectsScreen from './screens/FreelanceProjectsScreen'
import MentorshipScreen from './screens/MentorshipScreen'
import SuccessStoriesScreen from './screens/SuccessStoriesScreen'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/login" element={<LoginScreen />} />
                <Route path="/auth/verify" element={<AuthVerifyScreen />} />

        <Route path="/dashboard" element={<JobListScreen />} />
        <Route path="/jobs/:jobId" element={<JobDetailScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/notifications" element={<NotificationListScreen />} />
        <Route path="/network" element={<NetworkScreen />} />
        <Route path="/mentorship" element={<MentorshipScreen />} />
        <Route path="/success-stories" element={<SuccessStoriesScreen />} />
        <Route path="/interview-prep" element={<InterviewPrepScreen />} />
        <Route path="/events" element={<EventsScreen />} />
        <Route path="/freelance-projects" element={<FreelanceProjectsScreen />} />
      </Routes>
      <Toaster position="top-right" />
    </div>
  )
}

export default App 