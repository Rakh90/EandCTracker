import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/layout/BottomNav'
import Today from './pages/Today'
import CheckInMorning from './pages/CheckInMorning'
import CheckInMidday from './pages/CheckInMidday'
import CheckInEvening from './pages/CheckInEvening'
import Benchmark from './pages/Benchmark'
import Dashboard from './pages/Dashboard'
import Insights from './pages/Insights'
import Settings from './pages/Settings'

export default function App() {
  return (
    <>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/checkin/morning" element={<CheckInMorning />} />
          <Route path="/checkin/midday" element={<CheckInMidday />} />
          <Route path="/checkin/evening" element={<CheckInEvening />} />
          <Route path="/benchmark" element={<Benchmark />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <BottomNav />
    </>
  )
}
