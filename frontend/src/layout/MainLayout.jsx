import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Menu
} from 'lucide-react';
import GlobalSearch from '../components/GlobalSearch';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { doctor, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/patients', label: 'Patients', icon: Users },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 bg-slate-950 border-b border-slate-800 shrink-0 px-4">
          <div className="bg-white p-1 rounded-lg mr-3 shadow-sm">
            <img src="/favicon-removebg-preview.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <span className="text-white font-bold text-lg tracking-wider">CMS</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-colors
                  ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 bg-slate-950 shrink-0">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center flex-1">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 mr-4 text-slate-500 rounded-lg hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden lg:block lg:flex-1 max-w-md mr-4">
              <h2 className="text-xl font-bold text-slate-800 truncate">{doctor?.clinicName}</h2>
            </div>
            
            <div className="flex-1 flex justify-center lg:justify-start lg:max-w-md">
              <GlobalSearch />
            </div>
          </div>
          
          <div className="flex items-center space-x-4 ml-4 shrink-0">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-700">{doctor?.doctorName}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 shadow-sm">
              {doctor?.doctorName?.charAt(0) || 'D'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
