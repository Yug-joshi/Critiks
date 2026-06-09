import React, { useState, useEffect } from 'react';
import { Sliders, Activity, ShieldAlert, CheckCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';

const ScenarioSimulator = () => {
  const [income, setIncome] = useState(50000);
  const [debt, setDebt] = useState(15000);
  const [loanAmount, setLoanAmount] = useState(25000);
  
  const [prediction, setPrediction] = useState({ risk_probability: 0, risk_level: 'LOW' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const simulateRisk = async () => {
      setLoading(true);
      try {
        const response = await axios.post('http://localhost:8000/api/simulate', {
          income: Number(income),
          debt: Number(debt),
          loan_amount: Number(loanAmount)
        });
        setPrediction(response.data);
      } catch (error) {
        console.error("Simulation failed:", error);
      }
      setLoading(false);
    };

    // Debounce to prevent too many API calls while dragging
    const timeoutId = setTimeout(() => {
      simulateRisk();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [income, debt, loanAmount]);

  const dti = income > 0 ? ((debt / income) * 100).toFixed(1) : 0;
  const lti = income > 0 ? ((loanAmount / income) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Sliders className="text-primary" size={28} />
          Scenario Simulator
        </h2>
        <p className="text-slate-700 mt-1">Simulate how changes in applicant financials impact their default probability.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sliders Panel */}
        <div className="glass-panel rounded-2xl p-8 space-y-8">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-4">Adjust Parameters</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-medium text-slate-800">Annual Income</label>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-slate-900">₹</span>
                  <input
                    type="number"
                    min="0"
                    max="100000000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="text-xl font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-primary outline-none w-36 text-right appearance-none"
                  />
                </div>
              </div>
              <input
                type="range"
                min="10000"
                max="100000000"
                step="1000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full h-2 bg-slate-50 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-slate-600 mt-2">
                <span>₹10k</span>
                <span>₹10Cr</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-medium text-slate-800">Total Debt</label>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-slate-900">₹</span>
                  <input
                    type="number"
                    min="0"
                    max="100000000"
                    value={debt}
                    onChange={(e) => setDebt(e.target.value)}
                    className="text-xl font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-primary outline-none w-36 text-right appearance-none"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100000000"
                step="1000"
                value={debt}
                onChange={(e) => setDebt(e.target.value)}
                className="w-full h-2 bg-slate-50 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-slate-600 mt-2">
                <span>₹0</span>
                <span>₹10Cr</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-medium text-slate-800">Requested Loan Amount</label>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-slate-900">₹</span>
                  <input
                    type="number"
                    min="0"
                    max="100000000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="text-xl font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:border-primary outline-none w-36 text-right appearance-none"
                  />
                </div>
              </div>
              <input
                type="range"
                min="1000"
                max="100000000"
                step="1000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full h-2 bg-slate-50 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-slate-600 mt-2">
                <span>₹1k</span>
                <span>₹10Cr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Output Panel */}
        <div className="space-y-6">
          <div className={`glass-panel rounded-2xl p-8 border-t-4 transition-colors duration-500 ${
            prediction.risk_level === 'HIGH' ? 'border-t-danger' : 
            prediction.risk_level === 'MEDIUM' ? 'border-t-warning' : 'border-t-secondary'
          }`}>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Real-Time Risk Prediction</h3>
            
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative flex items-center justify-center w-48 h-48 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    className="stroke-gray-800"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    className={`transition-all duration-1000 ease-out ${
                      prediction.risk_level === 'HIGH' ? 'stroke-danger' : 
                      prediction.risk_level === 'MEDIUM' ? 'stroke-warning' : 'stroke-secondary'
                    }`}
                    strokeWidth="10"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * prediction.risk_probability)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-slate-900">
                    {(prediction.risk_probability * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs text-slate-700 font-medium uppercase tracking-wider mt-1">Default Prob</span>
                </div>
              </div>
              
              <div className="text-center mt-2">
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${
                  prediction.risk_level === 'HIGH' ? 'bg-danger/20 text-danger' : 
                  prediction.risk_level === 'MEDIUM' ? 'bg-warning/20 text-warning' : 'bg-secondary/20 text-secondary'
                }`}>
                  {prediction.risk_level === 'HIGH' && <ShieldAlert size={16} />}
                  {prediction.risk_level === 'MEDIUM' && <Activity size={16} />}
                  {prediction.risk_level === 'LOW' && <CheckCircle size={16} />}
                  {prediction.risk_level} RISK
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel rounded-xl p-5">
              <span className="text-sm text-slate-700 font-medium block mb-1">Debt-to-Income (DTI)</span>
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-bold ${Number(dti) > 40 ? 'text-danger' : 'text-slate-900'}`}>{dti}%</span>
                {Number(dti) > 40 && <TrendingUp className="text-danger mb-1" size={16} />}
              </div>
              <p className="text-xs text-slate-600 mt-2">Ideal is below 36%</p>
            </div>
            
            <div className="glass-panel rounded-xl p-5">
              <span className="text-sm text-slate-700 font-medium block mb-1">Loan-to-Income (LTI)</span>
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-bold ${Number(lti) > 100 ? 'text-warning' : 'text-slate-900'}`}>{lti}%</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">Ratio of loan to annual income</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulator;
