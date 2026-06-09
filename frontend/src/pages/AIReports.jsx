import React, { useState } from 'react';
import { FileText, Sparkles, RefreshCw, PanelRightClose, PanelRightOpen } from 'lucide-react';
import axios from 'axios';

const AIReports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [reportHistory, setReportHistory] = useState([]);

  React.useEffect(() => {
    fetchReportHistory();
  }, []);

  const fetchReportHistory = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/reports');
      setReportHistory(res.data);
      if (res.data.length > 0) {
        setReport(res.data[0].report_text);
      }
    } catch (e) {
      console.error("Failed to fetch reports");
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const statsRes = await axios.get('http://localhost:8000/api/stats');
      const stats = { 
        total: statsRes.data.totalLoans, 
        high_risk: statsRes.data.highRiskAccounts, 
        fraud: statsRes.data.fraudAlerts 
      };
      const response = await axios.post('http://localhost:8000/api/report', stats);
      setReport(response.data.report_text);
      fetchReportHistory();
    } catch (error) {
      console.error("Failed to generate report:", error);
      setReport("Failed to connect to the AI Report Engine. Ensure the backend is running and the model is loaded.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            AI Executive Reports
            <Sparkles className="text-primary" size={24} />
          </h2>
          <p className="text-slate-700 mt-1">Generative AI summaries of your portfolio's risk profile.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2.5 rounded-xl font-medium transition-colors"
          >
            {isSidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
            {isSidebarOpen ? 'Hide History' : 'Show History'}
          </button>
          <button 
            onClick={generateReport}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {isGenerating ? 'Generating...' : 'Generate New Report'}
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isSidebarOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6 transition-all duration-300`}>
        <div className={`${isSidebarOpen ? 'lg:col-span-2' : 'lg:col-span-1'} glass-panel rounded-2xl p-8 min-h-[500px] flex flex-col relative overflow-hidden transition-all duration-300`}>
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-8 border-b border-slate-300 pb-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="text-primary" />
              Portfolio Executive Summary
            </h3>
            <span className="text-sm text-slate-700">{new Date().toLocaleDateString()}</span>
          </div>

          <div className="flex-1 text-slate-800 leading-relaxed space-y-4">
            {isGenerating ? (
              <div className="space-y-4 w-full max-w-3xl animate-pulse mt-4">
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-6"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="h-5 bg-slate-200 rounded w-1/4 mt-8 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-4/5"></div>
              </div>
            ) : report ? (
              <div className="prose prose-slate max-w-none">
                <p className="whitespace-pre-wrap text-lg font-light text-slate-800">{report}</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <div className="p-4 bg-slate-100 rounded-full mb-4">
                  <Sparkles size={48} className="text-primary/40" />
                </div>
                <p className="text-slate-700 font-medium text-lg">No Report Generated Yet</p>
                <p className="text-sm mt-2 text-slate-500">Click "Generate New Report" to create an AI-powered summary using the DistilGPT-2 LLM.</p>
              </div>
            )}
          </div>
        </div>

        {isSidebarOpen && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Report History</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {reportHistory.length > 0 ? reportHistory.map((item, idx) => (
                  <div 
                    key={item.id} 
                    onClick={() => setReport(item.report_text)}
                    className="p-3 rounded-xl bg-slate-50/40 border border-slate-400/50 hover:border-gray-600 transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors">Risk Summary #{item.id}</span>
                      <span className="text-xs text-slate-600">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-700 line-clamp-2">{item.report_text.substring(0, 80)}...</p>
                  </div>
                )) : (
                  <div className="text-sm text-slate-500 text-center py-4">No past reports saved in database.</div>
                )}
              </div>
            </div>
            
            <div className="glass-panel rounded-2xl p-6 border border-primary/20 bg-primary/5">
              <h3 className="text-sm font-semibold text-primary mb-2">Model Info</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Reports are generated using a locally-hosted <span className="text-slate-800 font-medium">DistilGPT-2</span> transformer model. 
                The model synthesizes your portfolio's high-risk metrics and recent fraud alerts into actionable insights.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIReports;
