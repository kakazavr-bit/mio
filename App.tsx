import React, { useEffect, useState } from 'react';
import { getCurrentUser, logoutUser, getAppointments } from './services/storage';
import { Login } from './components/Login';
import { Scheduler } from './components/Scheduler';
import { DashboardView } from './components/DashboardView';
import { AppointmentModal } from './components/AppointmentModal';
import { Appointment, User, ViewMode } from './types';
import { Calendar, LayoutDashboard, LogOut, Plus } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewMode>('calendar');
  const [date, setDate] = useState(new Date());
  
  // Data state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Partial<Appointment> | null>(null);

  useEffect(() => {
    // Check auth
    const storedUser = getCurrentUser();
    if (storedUser) setUser(storedUser);
  }, []);

  useEffect(() => {
    // Load data when user exists
    if (user) {
      refreshData();
    }
  }, [user]);

  const refreshData = () => {
    setAppointments(getAppointments());
  };

  const handleLogin = () => {
    setUser(getCurrentUser());
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  const handleSlotClick = (masterId: string, time: Date) => {
    setEditingAppointment({
      masterId,
      startTime: time.toISOString(),
      // Default duration is handled in modal
    });
    setIsModalOpen(true);
  };

  const handleAppointmentClick = (app: Appointment) => {
    setEditingAppointment(app);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mobile-friendly Navigation */}
      <nav className="bg-white shadow-sm border-b z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
               <span className="font-bold text-xl text-primary hidden sm:block">MiO Studio</span>
               <span className="font-bold text-xl text-primary sm:hidden">MiO</span>
            </div>
            <div className="flex space-x-4 items-center">
              <button
                onClick={() => setView('calendar')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'calendar' ? 'bg-purple-50 text-purple-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar size={18} className="mr-2" />
                Календар
              </button>
              
              <button
                onClick={() => setView('dashboard')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'dashboard' ? 'bg-purple-50 text-purple-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutDashboard size={18} className="mr-2" />
                Огляд
              </button>

              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 ml-4">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {view === 'calendar' ? (
          <Scheduler 
            date={date}
            onDateChange={setDate}
            appointments={appointments}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        ) : (
          <DashboardView 
            appointments={appointments}
            onEdit={handleAppointmentClick}
          />
        )}
      </main>

      {/* Floating Action Button for Adding Appointments */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => {
            setEditingAppointment(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center w-14 h-14 bg-gray-900 text-white rounded-full shadow-xl hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          title="Додати запис"
        >
          <Plus size={28} />
        </button>
      </div>

      <AppointmentModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={refreshData}
        initialData={editingAppointment}
      />
    </div>
  );
}