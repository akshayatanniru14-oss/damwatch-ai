import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import IntakeForm from './components/IntakeForm';
import ReportLog from './components/ReportLog';
import MapView from './components/MapView';
import ComparePanel from './components/ComparePanel';
import DemoModeToggle from './components/DemoModeToggle';
import RawAnalysisPanel from './components/RawAnalysisPanel';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-shell">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<IntakeForm />} />
            <Route path="/reports" element={<ReportLog />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/compare" element={<ComparePanel />} />
            <Route path="/raw-analysis" element={<RawAnalysisPanel />} />
          </Routes>
        </main>
        <DemoModeToggle onToggle={() => undefined} />
      </div>
    </Router>
  );
};

export default App;