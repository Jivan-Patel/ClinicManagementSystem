import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, CalendarPlus, Activity, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import VisitForm from '../../components/VisitForm';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const res = await api.get(`/patients/${id}`);
      return res.data.data;
    }
  });

  const { data: visits, isLoading: loadingVisits } = useQuery({
    queryKey: ['patientVisits', id],
    queryFn: async () => {
      const res = await api.get(`/visits/patient/${id}`);
      return res.data.data;
    }
  });

  const deleteVisitMutation = useMutation({
    mutationFn: (visitId) => api.delete(`/visits/${visitId}`),
    onSuccess: () => {
      toast.success('Consultation deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['patientVisits', id] });
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: () => {
      toast.error('Failed to delete consultation');
    }
  });

  const handleDeleteVisit = (visitId) => {
    if (window.confirm('Are you sure you want to delete this consultation? This action cannot be undone.')) {
      deleteVisitMutation.mutate(visitId);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading patient profile...</div>;
  if (error || !patient) return <div className="p-8 text-center text-red-500">Patient not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-slate-800">{patient.name}</h1>
              <span className="px-2.5 py-1 text-xs font-bold tracking-wide bg-blue-100 text-blue-800 rounded-full">
                {patient.patientId}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">Registered on {new Date(patient.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link 
            to={`/patients/${id}/edit`}
            className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors shadow-sm"
          >
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-fit">
          <div className="p-6 bg-slate-50/80 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-slate-400" />
              Demographics
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Mobile Number</p>
              <p className="font-medium text-slate-800 mt-1">{patient.mobile}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Age / Gender</p>
              <p className="font-medium text-slate-800 mt-1">{patient.age} years / {patient.gender}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Home Address</p>
              <p className="font-medium text-slate-800 mt-1 leading-relaxed">{patient.address}</p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Clinic Visits</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{patient.totalVisits}</p>
            </div>
          </div>
        </div>

        {/* Visit History Area */}
        <div className="lg:col-span-2 space-y-6">
          <VisitForm patientId={id} />

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center">
                <CalendarPlus className="w-5 h-5 mr-2 text-slate-400" />
                Past Consultations
              </h3>
              <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                {visits?.length || 0} visits
              </span>
            </div>
            
            <div className="divide-y divide-slate-100">
              {loadingVisits ? (
                <div className="p-8 text-center text-slate-400 animate-pulse">Loading history...</div>
              ) : visits && visits.length > 0 ? (
                visits.map((visit) => (
                  <div key={visit._id} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                          {new Date(visit.visitDate).toLocaleDateString(undefined, { 
                            weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' 
                          })}
                        </p>
                        <span className="text-xs font-mono text-slate-400">{visit.visitId}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteVisit(visit._id)}
                        disabled={deleteVisitMutation.isPending}
                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                        title="Delete Consultation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Diagnosis</h4>
                        <p className="text-slate-800 font-medium">{visit.diagnosis}</p>
                      </div>
                      <div className="pt-3 border-t border-slate-50">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Treatment</h4>
                        <p className="text-slate-600 whitespace-pre-line leading-relaxed">{visit.treatment}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <CalendarPlus className="w-8 h-8 text-slate-300" />
                  </div>
                  <p>No past consultations found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
