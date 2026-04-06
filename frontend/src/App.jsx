import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Generator from './pages/Generator'
import Scorer from './pages/Scorer'
import History from './pages/History'
import Trending from './pages/Trending'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="generator" element={<Generator />} />
          <Route path="scorer" element={<Scorer />} />
          <Route path="history" element={<History />} />
          <Route path="trending" element={<Trending />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
