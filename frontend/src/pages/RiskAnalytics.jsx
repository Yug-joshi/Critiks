import React, { useState, useEffect } from 'react';
import { Activity, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value / 1000;
    if (start === end) return;
    
    let totalMilSecDur = 1000;
    let incrementTime = (totalMilSecDur / end) * 0.1;
    
    let timer = setInterval(() => {
      start += 0.1;
      setCount(start);
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toFixed(1)}</span>;
};

const RiskAnalytics = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [analytics, setAnalytics] = useState({
    totalScored: 12400,
    riskCategories: [65, 25, 10],
    probabilityDistribution: [1200, 3000, 4500, 2200, 1000, 550],
    featureImportance: []
  });

  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/_/backend/api/risk-analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch risk analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Listen for file upload events to re-fetch stats
    const handleUpload = () => fetchAnalytics();
    window.addEventListener('csvUploaded', handleUpload);
    return () => window.removeEventListener('csvUploaded', handleUpload);
  }, []);

  const barData = {
    labels: ['< 10%', '10-20%', '20-30%', '30-40%', '40-50%', '> 50%'],
    datasets: [
      {
        label: 'Number of Applications',
        data: analytics.probabilityDistribution,
        backgroundColor: '#3B82F6',
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#9CA3AF' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9CA3AF' }
      }
    }
  };

  const doughnutData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        data: analytics.riskCategories,
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    cutout: '75%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#334155', padding: 20, usePointStyle: true }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Risk Analytics</h2>
          <p className="text-slate-700 mt-1">Deep dive into portfolio risk distribution and explore the underlying risk factors driving our models.</p>
        </div>
        
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-300">
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'portfolio' ? 'bg-primary text-slate-900 shadow-sm' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'}`}
            onClick={() => setActiveTab('portfolio')}
          >
            Portfolio View
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'factors' ? 'bg-primary text-slate-900 shadow-sm' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'}`}
            onClick={() => setActiveTab('factors')}
          >
            Key Factors
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Bar Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 relative">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Probability of Default Distribution</h3>
          <p className="text-xs text-slate-600 mb-6">Distribution of loan applications across various default probability buckets based on predictive models.</p>
          <div className="h-72 relative">
            {loading && (
              <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <div className="flex flex-col items-center gap-2">
                  <Activity className="animate-pulse text-primary" size={32} />
                  <span className="text-sm font-medium text-slate-700">Analyzing Distribution...</span>
                </div>
              </div>
            )}
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Risk Categories Doughnut Chart */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col relative">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Risk Categories</h3>
          <p className="text-xs text-slate-600 mb-2">Breakdown of the portfolio by high, medium, and low risk tiers.</p>
          <div className="flex-1 flex items-center justify-center relative">
            {loading && (
              <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl">
                <Activity className="animate-pulse text-primary" size={32} />
              </div>
            )}
            <div className="h-64 w-full z-10 flex justify-center">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
            {/* Added pb-12 to offset the bottom legend and center the text exactly in the doughnut hole */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-12 z-0">
              <div className="text-center animate-fade-in-up">
                <span className="text-3xl font-bold text-slate-900 drop-shadow-sm">
                  <AnimatedCounter value={analytics.totalScored} />k
                </span>
                <p className="text-xs text-slate-700 font-medium mt-1">Total Scored</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SHAP Explanations Overview */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="text-primary" size={20} />
          Global Feature Importance (Explainable AI)
        </h3>
        <p className="text-slate-700 text-sm mb-6">Aggregate view of factors driving model predictions across the entire portfolio, calculated via SHAP values.</p>
        
        <div className="space-y-4">
          {analytics.featureImportance && analytics.featureImportance.length > 0 ? (
            analytics.featureImportance.map((item, index) => {
              const colors = ['bg-danger', 'bg-warning', 'bg-secondary', 'bg-primary', 'bg-emerald-500'];
              const colorClass = colors[index % colors.length];
              const percentage = Math.round(item.importance * 100);
              
              return (
                <div key={index} className="flex items-center">
                  <div className="w-48 text-sm font-medium text-slate-800">{item.feature}</div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="h-2 bg-slate-50 rounded-full flex-1 overflow-hidden">
                      <div className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className="text-xs text-slate-600 w-12 text-right">{item.importance.toFixed(2)}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-slate-500 py-4 text-sm">Waiting for Machine Learning model to calculate feature importance...</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default RiskAnalytics;
