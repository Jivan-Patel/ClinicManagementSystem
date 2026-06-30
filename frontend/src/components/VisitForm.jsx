import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';

const visitSchema = z.object({
  diagnosis: z.string().min(2, "Diagnosis must be at least 2 characters"),
  treatment: z.string().min(2, "Treatment must be at least 2 characters")
});

const VisitForm = ({ patientId }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(visitSchema)
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/visits', { ...data, patientId }),
    onSuccess: () => {
      toast.success('Consultation recorded successfully');
      reset();
      queryClient.invalidateQueries({ queryKey: ['patientVisits', patientId] });
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to record consultation');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden mb-6">
      <div className="bg-blue-50/80 px-6 py-4 border-b border-blue-100">
        <h3 className="font-bold text-blue-900 tracking-wide">New Consultation</h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Diagnosis</label>
          <input 
            {...register('diagnosis')}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="e.g. Viral Fever"
          />
          {errors.diagnosis && <p className="text-red-500 text-xs mt-1 font-medium">{errors.diagnosis.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Treatment / Prescription</label>
          <textarea 
            {...register('treatment')}
            rows="3"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
            placeholder="e.g. Paracetamol 500mg, rest for 3 days"
          />
          {errors.treatment && <p className="text-red-500 text-xs mt-1 font-medium">{errors.treatment.message}</p>}
        </div>
        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="flex items-center bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-70 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            {mutation.isPending ? 'Saving...' : 'Record Visit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitForm;
