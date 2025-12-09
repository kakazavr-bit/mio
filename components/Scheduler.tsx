import React, { useMemo } from 'react';
import { Appointment, Master } from '../types';
import { MASTERS, SERVICES, WORK_START_HOUR, WORK_END_HOUR } from '../constants';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface Props {
  date: Date;
  onDateChange: (date: Date) => void;
  appointments: Appointment[];
  onSlotClick: (masterId: string, time: Date) => void;
  onAppointmentClick: (app: Appointment) => void;
}

export const Scheduler: React.FC<Props> = ({ 
  date, 
  onDateChange, 
  appointments, 
  onSlotClick, 
  onAppointmentClick 
}) => {
  
  // Navigation helpers
  const handlePrevDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Grid Generation
  const hours = Array.from({ length: WORK_END_HOUR - WORK_START_HOUR + 1 }, (_, i) => WORK_START_HOUR + i);
  const hourHeight = 80; // px per hour

  // Filter appointments for this day
  const dailyAppointments = useMemo(() => {
    return appointments.filter(app => {
      const appDate = new Date(app.startTime);
      return appDate.getDate() === date.getDate() &&
             appDate.getMonth() === date.getMonth() &&
             appDate.getFullYear() === date.getFullYear();
    });
  }, [appointments, date]);

  // Calculations for positioning
  const getPosition = (isoString: string) => {
    const d = new Date(isoString);
    const hour = d.getHours();
    const minutes = d.getMinutes();
    
    // Minutes from start of day (WORK_START_HOUR)
    const minutesFromStart = (hour - WORK_START_HOUR) * 60 + minutes;
    return (minutesFromStart / 60) * hourHeight;
  };

  const getHeight = (startIso: string, endIso: string) => {
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    const diffMinutes = (end - start) / 60000;
    return (diffMinutes / 60) * hourHeight;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center space-x-4">
          <button onClick={handleToday} className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
            Сьогодні
          </button>
          <div className="flex items-center space-x-1">
            <button onClick={handlePrevDay} className="p-1 rounded hover:bg-gray-100"><ChevronLeft size={20} /></button>
            <button onClick={handleNextDay} className="p-1 rounded hover:bg-gray-100"><ChevronRight size={20} /></button>
          </div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <CalendarIcon size={20} className="text-gray-500" />
            {date.toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
        </div>
      </div>

      {/* Resource Headers */}
      <div className="flex border-b bg-gray-50 sticky top-[73px] z-20">
        <div className="w-16 flex-shrink-0 border-r bg-gray-50"></div> {/* Time axis header */}
        {MASTERS.map(master => (
          <div key={master.id} className="flex-1 p-3 text-center border-r font-bold text-gray-700 flex items-center justify-center gap-2">
            <img src={master.avatar} alt={master.name} className="w-8 h-8 rounded-full border border-gray-300" />
            <span>{master.name}</span>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-y-auto relative no-scrollbar">
        <div className="flex relative" style={{ height: hours.length * hourHeight }}>
          
          {/* Time Axis */}
          <div className="w-16 flex-shrink-0 border-r bg-white sticky left-0 z-10 text-xs text-gray-500">
            {hours.map(h => (
              <div key={h} className="border-b relative" style={{ height: hourHeight }}>
                <span className="absolute -top-2.5 right-2 bg-white px-1">
                  {h}:00
                </span>
              </div>
            ))}
          </div>

          {/* Master Columns */}
          {MASTERS.map(master => (
            <div key={master.id} className="flex-1 border-r relative group bg-white">
              
              {/* Grid Lines for clicks */}
              {hours.map(h => (
                <div 
                  key={h} 
                  className="border-b border-gray-100 h-full w-full absolute box-border hover:bg-gray-50 transition-colors cursor-pointer z-0"
                  style={{ top: (h - WORK_START_HOUR) * hourHeight, height: hourHeight }}
                  onClick={() => {
                    const clickDate = new Date(date);
                    clickDate.setHours(h, 0, 0, 0);
                    onSlotClick(master.id, clickDate);
                  }}
                >
                  {/* Half hour line hint */}
                  <div className="w-full border-t border-dotted border-gray-100 absolute top-1/2 pointer-events-none"></div>
                </div>
              ))}

              {/* Appointments */}
              {dailyAppointments
                .filter(app => app.masterId === master.id)
                .map(app => {
                  const top = getPosition(app.startTime);
                  const height = getHeight(app.startTime, app.endTime);
                  
                  return (
                    <div
                      key={app.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(app);
                      }}
                      className={`absolute left-1 right-1 rounded-md p-2 text-xs border-l-4 shadow-sm cursor-pointer transition-transform hover:scale-[1.02] z-10 overflow-hidden ${master.color} ${master.borderColor}`}
                      style={{ 
                        top: `${top}px`, 
                        height: `${height - 2}px` // -2 for margin
                      }}
                    >
                      <div className="font-bold flex justify-between items-start">
                        <span>{app.clientName}</span>
                        {/* <span className="opacity-70">{new Date(app.startTime).toLocaleTimeString('uk-UA', {hour: '2-digit', minute:'2-digit'})}</span> */}
                      </div>
                      <div className="mt-1 opacity-90 truncate">{app.clientPhone}</div>
                      <div className="mt-0.5 font-medium truncate opacity-75">{SERVICES.find(s=>s.id === app.serviceType)?.label}</div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};