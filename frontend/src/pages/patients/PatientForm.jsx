import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, AlertTriangle, ExternalLink, X } from 'lucide-react';

const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number({ invalid_type_error: "Age must be a number" }).min(0, "Age cannot be negative"),
  gender: z.enum(['Male', 'Female', 'Other'], { errorMap: () => ({ message: "Please select a gender" }) }),
  address: z.string().min(5, "Address must be at least 5 characters"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits")
});

const PatientForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  const [pendingData, setPendingData] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(patientSchema)
  });

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const res = await api.get(`/patients/${id}`);
      return res.data.data;
    },
    enabled: isEdit
  });

  useEffect(() => {
    if (patient) {
      reset({
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        address: patient.address,
        mobile: patient.mobile
      });
    }
  }, [patient, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? api.put(`/patients/${id}`, data) : api.post('/patients', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['patient', id] });
      }
      toast.success(isEdit ? 'Patient updated successfully' : 'Patient registered successfully');
      navigate(`/patients/${res.data.data._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  });

  const checkDuplicateMutation = useMutation({
    mutationFn: (data) => api.post('/patients/check-duplicate', data),
    onSuccess: (res, variables) => {
      if (res.data.duplicate) {
        setDuplicateMatches(res.data.matches);
        setPendingData(variables);
        setShowDuplicateModal(true);
      } else {
        mutation.mutate(variables);
      }
    },
    onError: () => {
      // If duplicate check fails, just proceed with normal creation
      mutation.mutate(pendingData || data);
    }
  });

  const onSubmit = (data) => {
    if (isEdit) {
      mutation.mutate(data);
    } else {
      checkDuplicateMutation.mutate(data);
    }
  };

  const handleRegisterAnyway = () => {
    setShowDuplicateModal(false);
    if (pendingData) {
      mutation.mutate(pendingData);
    }
  };

  if (isEdit && isLoading) return <div className="p-8 text-center text-slate-500">Loading patient data...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Patient' : 'Register New Patient'}</h1>
          <p className="text-slate-500 text-sm mt-1">{isEdit ? 'Update patient details below.' : 'Enter details for the new patient.'}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                {...register('name')}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
              <input 
                {...register('mobile')}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="9876543210"
              />
              {errors.mobile && <p className="text-red-500 text-xs mt-1 font-medium">{errors.mobile.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
              <input 
                type="number"
                {...register('age', { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="30"
              />
              {errors.age && <p className="text-red-500 text-xs mt-1 font-medium">{errors.age.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select 
                {...register('gender')}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                defaultValue=""
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1 font-medium">{errors.gender.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <textarea 
                {...register('address')}
                rows="3"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                placeholder="123 Main St, City"
              />
              {errors.address && <p className="text-red-500 text-xs mt-1 font-medium">{errors.address.message}</p>}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={mutation.isPending || checkDuplicateMutation.isPending}
              className="flex items-center bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-sm"
            >
              <Save className="w-5 h-5 mr-2" />
              {mutation.isPending || checkDuplicateMutation.isPending ? 'Saving...' : 'Save Patient'}
            </button>
          </div>
        </form>
      </div>

      {showDuplicateModal && duplicateMatches.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-amber-50 p-6 flex items-start border-b border-amber-100">
              <div className="bg-amber-100 p-2 rounded-full mr-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800">Possible Existing Patient Found</h3>
                <p className="text-slate-600 text-sm mt-1">
                  We found {duplicateMatches.length} patient(s) with similar details. Please check if this is the same patient.
                </p>
              </div>
              <button 
                onClick={() => setShowDuplicateModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 bg-slate-50">
              {duplicateMatches.map((match, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-slate-800 text-lg">{match.name} <span className="text-sm font-normal text-slate-500 ml-2">{match.patientId}</span></div>
                    <div className="text-sm text-slate-600 mt-1">
                      {match.gender} • {match.age} Years • 📱 {match.mobile}
                    </div>
                    {match.lastVisit && (
                      <div className="text-xs text-slate-500 mt-1">
                        Last Visit: {new Date(match.lastVisit).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/patients/${match._id}`)}
                    className="flex items-center justify-center bg-white border border-blue-200 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 font-medium text-sm transition-colors whitespace-nowrap"
                  >
                    Open Patient <ExternalLink className="w-4 h-4 ml-2" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-slate-200 bg-white flex justify-between items-center">
              <button 
                onClick={() => setShowDuplicateModal(false)}
                className="text-slate-600 font-medium px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleRegisterAnyway}
                className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Register Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientForm;
