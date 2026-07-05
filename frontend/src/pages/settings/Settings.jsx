import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { User, Lock, Save } from 'lucide-react';

const profileSchema = z.object({
  doctorName: z.string().min(2, "Doctor name must be at least 2 characters"),
  clinicName: z.string().min(2, "Clinic name must be at least 2 characters")
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters")
});

const Settings = () => {
  const { doctor, updateUser } = useAuth();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      doctorName: doctor?.doctorName || '',
      clinicName: doctor?.clinicName || ''
    }
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const profileMutation = useMutation({
    mutationFn: (data) => api.put('/auth/profile', data),
    onSuccess: (res) => {
      updateUser(res.data.data);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => api.put('/auth/password', data),
    onSuccess: () => {
      toast.success('Password changed successfully');
      passwordForm.reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your clinic profile and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-fit">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center">
            <User className="w-5 h-5 text-slate-400 mr-2" />
            <h3 className="font-semibold text-slate-800">Clinic Profile</h3>
          </div>
          <form onSubmit={profileForm.handleSubmit((data) => profileMutation.mutate(data))} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Address (Read-only)</label>
              <input 
                type="email"
                value={doctor?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Doctor Name</label>
              <input 
                {...profileForm.register('doctorName')}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              {profileForm.formState.errors.doctorName && <p className="text-red-500 text-xs mt-1 font-medium">{profileForm.formState.errors.doctorName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Clinic Name</label>
              <input 
                {...profileForm.register('clinicName')}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              {profileForm.formState.errors.clinicName && <p className="text-red-500 text-xs mt-1 font-medium">{profileForm.formState.errors.clinicName.message}</p>}
            </div>
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={profileMutation.isPending}
                className="w-full flex justify-center items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-70 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {profileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-fit">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center">
            <Lock className="w-5 h-5 text-slate-400 mr-2" />
            <h3 className="font-semibold text-slate-800">Security & Password</h3>
          </div>
          <form onSubmit={passwordForm.handleSubmit((data) => passwordMutation.mutate(data))} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Current Password</label>
              <input 
                type="password"
                {...passwordForm.register('currentPassword')}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              {passwordForm.formState.errors.currentPassword && <p className="text-red-500 text-xs mt-1 font-medium">{passwordForm.formState.errors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
              <input 
                type="password"
                {...passwordForm.register('newPassword')}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              {passwordForm.formState.errors.newPassword && <p className="text-red-500 text-xs mt-1 font-medium">{passwordForm.formState.errors.newPassword.message}</p>}
            </div>
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={passwordMutation.isPending}
                className="w-full flex justify-center items-center bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-900 disabled:opacity-70 transition-colors shadow-sm"
              >
                <Lock className="w-4 h-4 mr-2" />
                {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
