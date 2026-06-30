import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center space-x-4 transition-transform hover:scale-[1.02] duration-200">
      <div className={`p-4 rounded-full ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {loading ? (
          <div className="h-8 w-16 bg-slate-200 animate-pulse rounded mt-1"></div>
        ) : (
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        )}
      </div>
    </div>
  );
};

export default StatCard;
