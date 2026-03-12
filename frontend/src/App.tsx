import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SessionListPage from './pages/SessionListPage'
import WorkspacePage from './pages/WorkspacePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/sessions" element={<SessionListPage />} />
      <Route path="/session/:sessionId" element={<WorkspacePage />} />
    </Routes>
  )
}

export default App
