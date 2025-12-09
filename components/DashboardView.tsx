import React, { useState } from 'react';
import { Appointment } from '../types';
import { MASTERS, SERVICES } from '../constants';
import { Phone, Clock, User } from 'lucide-react';

interface Props {
  appointments: Appointment[];
  onEdit: (app: Appointment) => void;
}

type Filter = 'today' | 'tomorrow' | 'yesterday' | 'all';

export const DashboardView: React.FC<Props> = ({ appointments, onEdit }) => {
  const [filter, setFilter] = useState<Filter>('today');

  const filteredAppointments = appointments.filter(app => {
    const appDate = new Date(app.startTime);
    const now = new Date();
    
    // Reset hours for pure date comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const checkDate = new Date(appDate.getFullYear(), appDate.getMonth(), appDate.getDate());

    if (filter === 'today') return checkDate.getTime() === today.getTime();
    if (filter === 'tomorrow') return checkDate.getTime() === tomorrow.getTime();
    if (filter === 'yesterday') return checkDate.getTime() === yesterday.getTime();
    return true;
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="p-4 max-w-2xl mx-auto h-full overflow-y-auto pb-20">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Огляд Записів</h2>
      
      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'yesterday', label: 'Вчора' },
          { id: 'today', label: 'Сьогодні' },
          { id: 'tomorrow', label: 'Завтра' },
          { id: 'all', label: 'Всі' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as Filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.id 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            Немає записів на цей період
          </div>
        ) : (
          filteredAppointments.map(app => {
            const master = MASTERS.find(m => m.id === app.masterId);
            const service = SERVICES.find(s => s.id === app.serviceType);
            const startDate = new Date(app.startTime);
            
            return (
              <div 
                key={app.id}
                onClick={() => onEdit(app)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3 active:scale-[0.99] transition-transform cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{app.clientName}</h3>
                    <a href={`tel:${app.clientPhone}`} onClick={(e) => e.stopPropagation()} className="flex items-center text-gray-500 text-sm mt-1 hover:text-blue-600">
                      <Phone size={14} className="mr-1" />
                      {app.clientPhone}
                    </a>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${master?.color}`}>
                    {master?.name}
                  </div>
                </div>
                
                <div className="w-full h-px bg-gray-50"></div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center text-gray-700 font-medium">
                    <Clock size={16} className="mr-2 text-gray-400" />
                    {startDate.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                    <span className="mx-2 text-gray-300">|</span>
                    {service?.label}
                  </div>
                  
                  {filter === 'all' && (
                     <span className="text-xs text-gray-400">
                       {startDate.toLocaleDateString('uk-UA')}
                     </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};