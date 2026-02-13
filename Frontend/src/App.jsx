import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RegistrationPage from './pages/RegistrationPage'
import AssessmentPage from './pages/AssessmentPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignUpPage'
import EmployeeManagementPage from './pages/EmployeeManagementPage'
import  EvaManagement  from './pages/EvaManagement'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/registration" element={<RegistrationPage />} />
      <Route path="/assessment" element={<AssessmentPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/manage" element={<EmployeeManagementPage />} />
      <Route path="/evaluator" element={<EvaManagement />} />
    </Routes>
  )
}
