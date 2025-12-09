import React, { useState, useEffect } from 'react';
import { Appointment, ServiceType } from '../types';
import { MASTERS, SERVICES } from '../constants';
import { Button } from './Button';
import { Input, Select } from './Input';
import { createAppointment, updateAppointment, deleteAppointment } from '../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<Appointment> | null;
}

export const AppointmentModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    masterId: MASTERS[0].id,
    serviceType: SERVICES[0].id,
    date: '',
    time: '10:00',
    duration: SERVICES[0].duration.toString()
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // If editing or creating from slot click
        const startDate = initialData.startTime ? new Date(initialData.startTime) : new Date();
        // Adjust for timezone offset for input[type="date"]
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const day = String(startDate.getDate()).padStart(2, '0');
        const hours = String(startDate.getHours()).padStart(2, '0');
        const minutes = String(startDate.getMinutes()).padStart(2, '0');

        let duration = '90';
        if (initialData.endTime && initialData.startTime) {
          const diff = (new Date(initialData.endTime).getTime() - new Date(initialData.startTime).getTime()) / 60000;
          duration = Math.round(diff).toString();
        }

        setFormData({
          clientName: initialData.clientName || '',
          clientPhone: initialData.clientPhone || '',
          masterId: initialData.masterId || MASTERS[0].id,
          serviceType: initialData.serviceType || SERVICES[0].id,
          date: `${year}-${month}-${day}`,
          time: `${hours}:${minutes}`,
          duration: duration
        });
      } else {
        // Defaults
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        setFormData(prev => ({ ...prev, date: `${year}-${month}-${day}` }));
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Construct ISO strings
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60000);

      const payload = {
        masterId: formData.masterId,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        serviceType: formData.serviceType as ServiceType,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      };

      if (initialData?.id) {
        await updateAppointment({ ...payload, id: initialData.id });
      } else {
        await createAppointment(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Сталася помилка');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id || !confirm('Видалити цей запис?')) return;
    setLoading(true);
    try {
      await deleteAppointment(initialData.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Не вдалося видалити');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = e.target.value as ServiceType;
    const service = SERVICES.find(s => s.id === serviceId);
    setFormData(prev => ({
      ...prev,
      serviceType: serviceId,
      duration: service ? service.duration.toString() : '60'
    }));
  };

  if (!isOpen) return null;

  const isEdit = !!initialData?.id;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <form onSubmit={handleSubmit} className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {isEdit ? 'Редагувати запис' : 'Новий запис'}
            </h3>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <Select 
                  label="Майстер" 
                  name="masterId"
                  value={formData.masterId} 
                  onChange={(e) => setFormData({...formData, masterId: e.target.value})}
                  options={MASTERS.map(m => ({ value: m.id, label: m.name }))}
                />
                 <Select 
                  label="Послуга" 
                  name="serviceType"
                  value={formData.serviceType} 
                  onChange={handleServiceChange}
                  options={SERVICES.map(s => ({ value: s.id, label: s.label }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Дата" 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
                <Input 
                  label="Час" 
                  type="time" 
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>

              <Input 
                label="Тривалість (хв)" 
                type="number" 
                min="15"
                step="15"
                required
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              />

              <Input 
                label="Ім'я Клієнта" 
                required
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              />
              <Input 
                label="Телефон" 
                type="tel"
                placeholder="050 123 45 67"
                required
                value={formData.clientPhone}
                onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
              />
            </div>

            <div className="mt-6 flex justify-between">
              {isEdit && (
                <Button type="button" variant="danger" onClick={handleDelete} disabled={loading}>
                  Видалити
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                  Скасувати
                </Button>
                <Button type="submit" isLoading={loading}>
                  Зберегти
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};