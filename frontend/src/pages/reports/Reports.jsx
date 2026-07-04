import React, { useState } from 'react';
import { Download, Calendar, FileSpreadsheet, Loader2 } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/DataTable';

const Reports = () => {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [isExporting, setIsExporting] = useState(false);

  const { data: reportData = [], isLoading: isLoadingData } = useQuery({
    queryKey: ['reportData', startDate, endDate],
    queryFn: async () => {
      const res = await api.get(`/reports/data?startDate=${startDate}&endDate=${endDate}`);
      return res.data.data;
    },
    enabled: !!startDate && !!endDate && new Date(startDate) <= new Date(endDate)
  });

  const columns = [
    { header: 'Visit Date', accessor: (row) => new Date(row.visitDate).toLocaleDateString() },
    { header: 'Visit ID', accessor: (row) => <span className="font-mono text-slate-500 text-sm">{row.visitId}</span> },
    { header: 'Patient Name', accessor: (row) => <span className="font-medium text-slate-800">{row.patientId?.name || 'Unknown'}</span> },
    { header: 'Mobile', accessor: (row) => row.patientId?.mobile || '-' },
    { header: 'Diagnosis', accessor: (row) => <span className="truncate max-w-[150px] block" title={row.diagnosis}>{row.diagnosis || '-'}</span> },
    { header: 'Treatment', accessor: (row) => <span className="truncate max-w-[200px] block" title={row.treatment}>{row.treatment || '-'}</span> }
  ];

  const handleQuickFilter = (type) => {
    const today = new Date();
    switch (type) {
      case 'today':
        setStartDate(format(today, 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'thisWeek':
        setStartDate(format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        setEndDate(format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        break;
      case 'thisMonth':
        setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
        break;
      case 'last30Days':
        setStartDate(format(subDays(today, 30), 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'currentFY': {
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth(); // 0 = Jan, 2 = Mar, 3 = Apr
        const startYear = currentMonth < 3 ? currentYear - 1 : currentYear;
        setStartDate(`${startYear}-04-01`);
        setEndDate(`${startYear + 1}-03-31`);
        break;
      }
      case 'lastFY': {
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const startYear = (currentMonth < 3 ? currentYear - 1 : currentYear) - 1;
        setStartDate(`${startYear}-04-01`);
        setEndDate(`${startYear + 1}-03-31`);
        break;
      }
      default:
        break;
    }
  };

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }

    setIsExporting(true);
    try {
      const response = await api.get(`/reports/export?startDate=${startDate}&endDate=${endDate}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Consultations_Report_${startDate}_to_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1">Export your consultation data for external use or accounting.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 flex items-center">
            <FileSpreadsheet className="w-5 h-5 mr-2 text-slate-400" />
            Excel Export Filters
          </h3>
        </div>
        
        <div className="p-6 space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Quick Filters</label>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => handleQuickFilter('today')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">Today</button>
              <button onClick={() => handleQuickFilter('thisWeek')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">This Week</button>
              <button onClick={() => handleQuickFilter('thisMonth')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">This Month</button>
              <button onClick={() => handleQuickFilter('last30Days')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">Last 30 Days</button>
              <button onClick={() => handleQuickFilter('currentFY')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">Current FY</button>
              <button onClick={() => handleQuickFilter('lastFY')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">Last FY</button>
            </div>
          </div>

          <div className="border-t border-slate-100"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-between items-center border-t border-slate-100 mt-6 pt-6">
            <p className="text-sm text-slate-500">Showing {reportData.length} records in this period.</p>
            <button
              onClick={handleExport}
              disabled={isExporting || reportData.length === 0}
              className="flex items-center bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-70 transition-colors shadow-sm"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Excel...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <DataTable 
          title={`Report Data (${startDate} to ${endDate})`}
          columns={columns}
          data={reportData}
          loading={isLoadingData}
          emptyMessage="No consultations found for the selected date range."
        />
      </div>
    </div>
  );
};

export default Reports;
