import { Routes, Route } from 'react-router-dom'
import StudioPage from './pages/StudioPage'
import PublicPage from './pages/PublicPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StudioPage />} />
      <Route path="/:slug" element={<PublicPage />} />
    </Routes>
  )
}
