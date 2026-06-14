import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react';
import axios from 'axios';

const FraudMonitoring = () => {
  const [data, setData] = useState({
    alerts: [],
    stats: { critical: 12, investigating: 6, resolved: 24, active: 18 }
  });

  const fetchFraudData = async () => {
    try {
      const response = await axios.get('/_/backend/api/fraud-alerts');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch fraud alerts:', error);
    }
  };

  useEffect(() => {
    fetchFraudData();
    
    const handleUpload = () => fetchFraudData();
    window.addEventListener('csvUploaded', handleUpload);
    return () => window.removeEventListener('csvUploaded', handleUpload);
  }, []);

  const alerts = data.alerts;
  const stats = data.stats;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            Fraud Monitoring
            <span className="text-xs bg-danger/20 text-danger px-2 py-1 rounded-full font-medium border border-danger/30">{stats.active} Active Alerts</span>
          </h2>
          <p className="text-slate-700 mt-1">Real-time isolation forest anomaly detection alerts.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-danger bg-gradient-to-br from-danger/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-danger/20 rounded-xl text-danger">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Critical Alerts</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.critical}</h3>
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-warning bg-gradient-to-br from-warning/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/20 rounded-xl text-warning">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Investigating</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.investigating}</h3>
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-secondary bg-gradient-to-br from-secondary/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/20 rounded-xl text-secondary">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Resolved Today</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.resolved}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-300">
        <div className="p-5 border-b border-slate-300 flex items-center justify-between bg-slate-100/50">
          <h3 className="text-lg font-semibold text-slate-900">Recent Suspicious Applications</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input type="text" placeholder="Search ID..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-400 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-primary transition-colors w-48" />
            </div>
            <button className="p-2 border border-slate-400 rounded-lg text-slate-700 hover:text-slate-900 hover:border-gray-500 transition-colors bg-slate-50">
              <Filter size={16} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 text-xs uppercase tracking-wider text-slate-700 border-b border-slate-300">
                <th className="px-6 py-4 font-medium">App ID</th>
                <th className="px-6 py-4 font-medium">Anomaly Score</th>
                <th className="px-6 py-4 font-medium">Primary Reason</th>
                <th className="px-6 py-4 font-medium">Loan Amount</th>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50/20 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900 group-hover:text-primary transition-colors">{alert.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${alert.score > 0.9 ? 'bg-danger' : 'bg-warning'}`} style={{ width: `${alert.score * 100}%` }}></div>
                      </div>
                      <span className={`text-sm font-bold ${alert.score > 0.9 ? 'text-danger' : 'text-warning'}`}>{alert.score.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-800">{alert.reason}</td>
                  <td className="px-6 py-4 text-sm text-slate-800 font-medium">{alert.amount}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{alert.date}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      alert.status === 'Pending Review' ? 'bg-danger/10 text-danger border-danger/20' : 
                      alert.status === 'Investigating' ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-slate-50 text-slate-700 border-slate-400'
                    }`}>
                      {alert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FraudMonitoring;
