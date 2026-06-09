import React, { useEffect, useState, useRef } from 'react';
import { Activity, ShieldAlert, Users, TrendingUp, AlertTriangle, UploadCloud, Loader2 } from 'lucide-react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PortfolioOverview = () => {
  const [stats, setStats] = useState({
    totalLoans: 0,
    highRiskAccounts: 0,
    fraudAlerts: 0,
    avgDti: 0
  });

  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        fill: true,
        label: 'High Risk Accounts',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        tension: 0.4
      },
      {
        fill: true,
        label: 'Total Loans (x10)',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  });
  
  const [news, setNews] = useState([]);
  const [uploadState, setUploadState] = useState(null); // 'uploading', 'processing', 'success', 'error'
  const [uploadError, setUploadError] = useState('');  // exact reason from server
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [missingFields, setMissingFields] = useState([]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/stats');
      const data = response.data;
      setStats({
        totalLoans: data.totalLoans,
        highRiskAccounts: data.highRiskAccounts,
        fraudAlerts: data.fraudAlerts,
        avgDti: data.avgDti
      });
      setMissingFields(data.missingFields || []);
        setChartData({
        labels: data.chartLabels,
        datasets: [
          {
            fill: true,
            label: 'High Risk (DTI > 40%)',
            data: data.chartDataRisk,
            borderColor: '#DC2626',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            tension: 0.4
          },
          {
            fill: true,
            label: 'Total Applications',
            data: data.chartDataLoans,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }
        ]
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/news');
        setNews(response.data);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      }
    };
    fetchNews();
    fetchStats();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadState('uploading');
    
    // Artificial delays so the user can actually perceive the slick animations (reduced)
    const minUploadDelay = new Promise(resolve => setTimeout(resolve, 300));
    const minProcessDelay = new Promise(resolve => setTimeout(resolve, 500));

    try {
      await minUploadDelay;

      await axios.post('http://localhost:8000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (percentCompleted >= 100) {
            // Once the file is fully sent, switch to processing
            setUploadState('processing');
          }
        }
      });
      
      // Ensure processing state is set just in case the upload was instantly complete
      setUploadState('processing');
      await minProcessDelay;
      
      setUploadState('success');
      // Refresh stats after successful upload
      await fetchStats();
      
      // Auto-hide modal after 2 seconds
      setTimeout(() => {
        setUploadState(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      // Extract the exact reason from the server response
      const detail = error?.response?.data?.detail;
      setUploadError(
        typeof detail === 'string'
          ? detail
          : 'An unexpected server error occurred. Check the backend terminal for details.'
      );
      setUploadState('error');
      // Do NOT auto-dismiss — let the user read the reason
    } finally {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#334155'
        }
      }
    },
    scales: {
      y: {
        grid: { color: '#E2E8F0' },
        ticks: { color: '#334155' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#334155' }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Portfolio Overview</h2>
          <p className="text-slate-800 mt-1">Real-time metrics and alerts for your financial portfolio. Monitor active loan processing and automated risk detections.</p>
        </div>
        <div>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploadState !== null}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            {uploadState !== null ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
            {uploadState !== null ? 'Processing Data Pipeline...' : 'Upload Applications CSV'}
          </button>
        </div>
      </div>

      {/* Missing Fields Warning Banner */}
      {missingFields.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in-up">
          <AlertTriangle className="text-red-500 mt-0.5" size={20} />
          <div>
            <h4 className="text-red-800 font-semibold">Caution: Missing Recommended Fields</h4>
            <p className="text-red-600 text-sm mt-1">
              Your uploaded dataset is missing the following fields: <span className="font-medium">{missingFields.join(', ')}</span>. 
              While the system can automatically estimate or fallback for missing data to keep the dashboard running, adding these columns will significantly improve the accuracy of the Risk ML Engine.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="glass-panel rounded-2xl p-6 hover-lift border-l-4 border-l-primary relative overflow-hidden">
          {loading && <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800 font-medium">Total Active Loans</h3>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Users size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalLoans.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <TrendingUp size={16} className="text-secondary" />
            <span className="text-secondary font-medium">+12.5%</span>
            <span className="text-slate-700">vs last month</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 hover-lift border-l-4 border-l-danger relative overflow-hidden">
          {loading && <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center"><Loader2 className="animate-spin text-danger" /></div>}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800 font-medium">High Risk Exposure</h3>
            <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center text-danger">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.highRiskAccounts.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <TrendingUp size={16} className="text-danger" />
            <span className="text-danger font-medium">+4.2%</span>
            <span className="text-slate-700">vs last month</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 hover-lift border-l-4 border-l-warning relative overflow-hidden">
          {loading && <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center"><Loader2 className="animate-spin text-warning" /></div>}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800 font-medium">Active Fraud Alerts</h3>
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center text-warning">
              <ShieldAlert size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.fraudAlerts.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-700">
            <span className="text-warning font-medium">Requires immediate attention</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 hover-lift border-l-4 border-l-secondary relative overflow-hidden">
          {loading && <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center"><Loader2 className="animate-spin text-secondary" /></div>}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800 font-medium">Portfolio Avg DTI</h3>
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
              <Activity size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.avgDti}%</p>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="text-secondary font-medium">Healthy</span>
            <span className="text-slate-700">portfolio range</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col h-[400px] relative">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Age Demographics & Risk Distribution</h3>
          <p className="text-xs text-slate-600 mb-4">Volume of applications and high-risk flags segmented by applicant age group.</p>
          <div className="flex-1 w-full h-full min-h-0 relative">
            {loading && (
              <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <span className="text-sm font-medium text-slate-700">Rendering Analytics...</span>
                </div>
              </div>
            )}
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Audit Log */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center justify-between">
            System Audit Log
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">Live</span>
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {news.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-400 hover:bg-slate-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary">System Notice</span>
                  <span className="text-xs text-slate-700">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1 leading-tight">{item.headline}</h4>
                <p className="text-xs text-slate-800 line-clamp-2">{item.summary}</p>
              </div>
            ))}
            {news.length === 0 && (
              <div className="text-center text-slate-700 py-10">Loading insights...</div>
            )}
          </div>
        </div>
      </div>

      {/* Upload/Processing Modal */}
      {uploadState && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center">
            {uploadState === 'uploading' && (
              <>
                <UploadCloud className="text-primary animate-bounce mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Uploading CSV</h3>
                <p className="text-slate-600 text-sm">Transferring file to secure servers...</p>
              </>
            )}
            {uploadState === 'processing' && (
              <>
                <Loader2 className="text-primary animate-spin mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Processing Data</h3>
                <p className="text-slate-600 text-sm">Running AI risk models and generating analytics...</p>
              </>
            )}
            {uploadState === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Complete</h3>
                <p className="text-slate-600 text-sm">Portfolio data has been successfully updated.</p>
              </>
            )}
            {uploadState === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Failed</h3>
                <p className="text-red-600 text-sm font-medium mb-3 text-left bg-red-50 rounded-lg px-3 py-2 w-full">
                  {uploadError}
                </p>
                <button
                  onClick={() => { setUploadState(null); setUploadError(''); }}
                  className="mt-1 px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioOverview;
