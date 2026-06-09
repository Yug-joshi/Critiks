import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, FileText, Activity, Sliders, Menu } from 'lucide-react';

import PortfolioOverview from './pages/PortfolioOverview';
import RiskAnalytics from './pages/RiskAnalytics';
import FraudMonitoring from './pages/FraudMonitoring';
import AIReports from './pages/AIReports';
import ScenarioSimulator from './pages/ScenarioSimulator';

function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 glass-panel border-r border-slate-300 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <ShieldAlert className="text-primary w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tight">Critiks<span className="text-primary">.ai</span></h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-800 hover:text-slate-900 hover:bg-gray-200/50 rounded-xl transition-colors">
            <LayoutDashboard size={20} />
            <span>Portfolio Overview</span>
          </Link>
          <Link to="/analytics" className="flex items-center gap-3 px-4 py-3 text-slate-800 hover:text-slate-900 hover:bg-gray-200/50 rounded-xl transition-colors">
            <Activity size={20} />
            <span>Risk Analytics</span>
          </Link>
          <Link to="/fraud" className="flex items-center gap-3 px-4 py-3 text-slate-800 hover:text-slate-900 hover:bg-gray-200/50 rounded-xl transition-colors">
            <ShieldAlert size={20} />
            <span>Fraud Monitoring</span>
          </Link>
          <Link to="/reports" className="flex items-center gap-3 px-4 py-3 text-slate-800 hover:text-slate-900 hover:bg-gray-200/50 rounded-xl transition-colors">
            <FileText size={20} />
            <span>AI Reports</span>
          </Link>
          <Link to="/simulate" className="flex items-center gap-3 px-4 py-3 text-slate-800 hover:text-slate-900 hover:bg-gray-200/50 rounded-xl transition-colors">
            <Sliders size={20} />
            <span>Scenario Simulator</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-background to-slate-200">
        <header className="h-16 glass-panel border-b border-slate-300 flex items-center px-6 justify-between">
          <button className="p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-gray-200/50 transition-colors">
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary font-bold">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8 custom-scrollbar">
          <Routes>
            <Route path="/" element={<PortfolioOverview />} />
            <Route path="/analytics" element={<RiskAnalytics />} />
            <Route path="/fraud" element={<FraudMonitoring />} />
            <Route path="/reports" element={<AIReports />} />
            <Route path="/simulate" element={<ScenarioSimulator />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
