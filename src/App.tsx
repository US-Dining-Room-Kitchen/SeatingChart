import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SeatingPlanner } from './pages/SeatingPlanner';
import { LayoutCreator } from './pages/LayoutCreator';

/**
 * Main application component with routing
 */
function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<SeatingPlanner />} />
        <Route path="/layout-creator" element={<LayoutCreator />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
