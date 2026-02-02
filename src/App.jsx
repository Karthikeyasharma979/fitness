import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import WorkoutPage from './pages/WorkoutPage';
import SpinCyclePage from './pages/SpinCyclePage';
import ShopPage from './pages/ShopPage';
import InventoryPage from './pages/InventoryPage';
import ProgressPage from './pages/ProgressPage';
import { GameProvider } from './context/GameContext';
import BackgroundParticles from './components/ui/BackgroundParticles';

function App() {
  return (
    <Router>
      <GameProvider>
        <div className="relative min-h-screen bg-[#020617] text-white font-sans selection:bg-neon-blue selection:text-black">
          <BackgroundParticles />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workout" element={<WorkoutPage />} />
            <Route path="/spin-cycle" element={<SpinCyclePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/progress" element={<ProgressPage />} />
          </Routes>
        </div>
      </GameProvider>
    </Router>
  );
}

export default App;
