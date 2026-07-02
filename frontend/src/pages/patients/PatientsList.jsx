import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import api from '../../api/axios';

const PatientsList = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['patients', page],
    queryFn: async () => {
      const res = await api.get(`/patients?page=${page}&limit=10`);
      return res.data;
    }
  });

  const patients = data?.patients || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patients Directory</h1>
          <p className="text-slate-500 mt-1">Manage your clinic's registered patients.</p>
        </div>
        <Link 
          to="/patients/new" 
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Add Patient
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient ID</th>
                <th className="px-6 py-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">Age/Gender</th>
                <th className="px-6 py-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Visits</th>
                <th className="px-6 py-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="6" className="px-6 py-4"><div className="h-6 bg-slate-100 animate-pulse rounded"></div></td>
                  </tr>
                ))
              ) : patients.length > 0 ? (
                patients.map(patient => (
                  <tr key={patient._id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/patients/${patient._id}`)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{patient.patientId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{patient.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{patient.mobile}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{patient.age}y / {patient.gender}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-700 bg-blue-100 rounded-full">
                        {patient.totalVisits}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/patients/${patient._id}`); }}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No active patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <span className="text-sm text-slate-500 font-medium">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pagination.page === 1}
                className="p-1 border border-slate-200 bg-white rounded text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={pagination.page === pagination.pages}
                className="p-1 border border-slate-200 bg-white rounded text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsList;
