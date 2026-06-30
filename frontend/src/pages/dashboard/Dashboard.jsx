import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, UserPlus, RefreshCcw } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';

const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data.data;
    }
  });

  const stats = data || {
    totalPatients: 0,
    todaysVisits: 0,
    newPatientsThisMonth: 0,
    returningPatientsToday: 0,
    recentPatients: [],
    recentVisits: []
  };

  const patientColumns = [
    { header: 'Patient ID', accessor: (row) => row.patientId },
    { header: 'Name', accessor: (row) => <span className="font-medium text-slate-800">{row.name}</span> },
    { header: 'Mobile', accessor: (row) => row.mobile },
    {
      header: 'Visits', accessor: (row) => (
        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-700 bg-blue-100 rounded-full">
          {row.totalVisits}
        </span>
      )
    }
  ];

  const visitColumns = [
    { header: 'Date', accessor: (row) => new Date(row.visitDate).toLocaleDateString() },
    { header: 'Patient ID', accessor: (row) => <span className="text-slate-500 font-mono text-sm">{row.patientId?.patientId || '-'}</span> },
    { header: 'Name', accessor: (row) => <span className="font-medium text-slate-800">{row.patientId?.name || 'Unknown'}</span> },
    { header: 'Mobile', accessor: (row) => row.patientId?.mobile || '-' },
    { header: 'Diagnosis', accessor: (row) => <span className="truncate max-w-[150px] block" title={row.diagnosis}>{row.diagnosis || '-'}</span> },
    { header: 'Treatment', accessor: (row) => <span className="truncate max-w-[150px] block" title={row.treatment}>{row.treatment || '-'}</span> }
  ];

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        Failed to load dashboard statistics. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Here is what's happening at your clinic today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={Users}
          colorClass="bg-blue-100 text-blue-600"
          loading={isLoading}
        />
        <StatCard
          title="Today's Visits"
          value={stats.todaysVisits}
          icon={Calendar}
          colorClass="bg-emerald-100 text-emerald-600"
          loading={isLoading}
        />
        <StatCard
          title="New Patients (Month)"
          value={stats.newPatientsThisMonth}
          icon={UserPlus}
          colorClass="bg-purple-100 text-purple-600"
          loading={isLoading}
        />
        <StatCard
          title="Returning (Today)"
          value={stats.returningPatientsToday}
          icon={RefreshCcw}
          colorClass="bg-amber-100 text-amber-600"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <DataTable
          title="Recent Visits"
          columns={visitColumns}
          data={stats.recentVisits}
          loading={isLoading}
          emptyMessage="No recent visits found."
        />
      </div>
    </div>
  );
};

export default Dashboard;
