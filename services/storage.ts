import { Appointment, Master, User } from '../types';
import { DB_KEYS, MASTERS } from '../constants';

// --- Auth Simulation ---

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  // Simulating auth delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Hardcoded for demo
  const validUsers = [
    { email: 'marina@mio.ua', pass: '1234', name: 'Марина', id: '1' },
    { email: 'olya@mio.ua', pass: '1234', name: 'Оля', id: '2' },
    { email: 'admin@mio.ua', pass: 'admin', name: 'Admin', id: '0' }
  ];

  const user = validUsers.find(u => u.email === email && u.pass === password);
  
  if (user) {
    const userData: User = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem(DB_KEYS.USER, JSON.stringify(userData));
    return userData;
  }
  return null;
};

export const logoutUser = () => {
  localStorage.removeItem(DB_KEYS.USER);
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(DB_KEYS.USER);
  return stored ? JSON.parse(stored) : null;
};

// --- Appointments CRUD ---

const getStoredAppointments = (): Appointment[] => {
  const stored = localStorage.getItem(DB_KEYS.APPOINTMENTS);
  return stored ? JSON.parse(stored) : [];
};

const saveAppointments = (apps: Appointment[]) => {
  localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(apps));
};

export const getAppointments = (): Appointment[] => {
  return getStoredAppointments();
};

export const checkConflict = (newApp: Appointment, allApps: Appointment[]): boolean => {
  const newStart = new Date(newApp.startTime).getTime();
  const newEnd = new Date(newApp.endTime).getTime();

  return allApps.some(app => {
    if (app.id === newApp.id) return false; // Don't check against self
    if (app.masterId !== newApp.masterId) return false; // Different master

    const existStart = new Date(app.startTime).getTime();
    const existEnd = new Date(app.endTime).getTime();

    // Check for overlap
    return (newStart < existEnd && newEnd > existStart);
  });
};

export const createAppointment = (app: Omit<Appointment, 'id'>): Promise<Appointment> => {
  const apps = getStoredAppointments();
  const newApp: Appointment = { ...app, id: Date.now().toString() };
  
  if (checkConflict(newApp, apps)) {
    return Promise.reject(new Error("Цей час вже зайнято у обраного майстра!"));
  }

  apps.push(newApp);
  saveAppointments(apps);
  return Promise.resolve(newApp);
};

export const updateAppointment = (app: Appointment): Promise<Appointment> => {
  const apps = getStoredAppointments();
  
  if (checkConflict(app, apps)) {
    return Promise.reject(new Error("Конфлікт часу! Оберіть інший час."));
  }

  const index = apps.findIndex(a => a.id === app.id);
  if (index === -1) return Promise.reject(new Error("Запис не знайдено"));

  apps[index] = app;
  saveAppointments(apps);
  return Promise.resolve(app);
};

export const deleteAppointment = (id: string): Promise<void> => {
  const apps = getStoredAppointments();
  const filtered = apps.filter(a => a.id !== id);
  saveAppointments(filtered);
  return Promise.resolve();
};

// Seed data if empty
if (!localStorage.getItem(DB_KEYS.APPOINTMENTS)) {
  const today = new Date();
  today.setHours(10, 0, 0, 0);
  const end = new Date(today);
  end.setHours(11, 30, 0, 0);

  const seed: Appointment[] = [
    {
      id: 'seed-1',
      masterId: '1', // Marina
      clientName: 'Тестовий Клієнт',
      clientPhone: '050 123 45 67',
      serviceType: 'Manicure' as any,
      startTime: today.toISOString(),
      endTime: end.toISOString()
    }
  ];
  saveAppointments(seed);
}