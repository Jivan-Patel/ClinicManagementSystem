import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/patients/search?q=${query}`);
        setResults(res.data.data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchResults();
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (patientId) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/patients/${patientId}`);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 sm:text-sm transition-all shadow-inner"
          placeholder="Search by Name, Mobile, or ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 max-h-96 overflow-auto z-50">
          {results.length === 0 && !loading && (
            <div className="p-6 text-center">
              <div className="mx-auto bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 mb-4">No patients found matching "{query}"</p>
              <button 
                onClick={() => { setIsOpen(false); navigate('/patients/new'); }}
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                Register New Patient
              </button>
            </div>
          )}
          {results.map((patient) => (
            <div 
              key={patient._id} 
              onClick={() => handleSelect(patient._id)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="bg-slate-100 p-2 rounded-full mr-3 text-slate-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{patient.name}</p>
                    <p className="text-xs text-slate-500">{patient.patientId} • {patient.mobile}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-600">{patient.age}y, {patient.gender.charAt(0)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {patient.lastVisitDate ? `Last: ${new Date(patient.lastVisitDate).toLocaleDateString()}` : 'No visits'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
