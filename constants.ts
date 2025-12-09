import { Master, ServiceType } from './types';

export const MASTERS: Master[] = [
  {
    id: '1',
    name: 'Марина',
    email: 'marina@mio.ua',
    color: 'bg-pink-100 hover:bg-pink-200 text-pink-800',
    borderColor: 'border-pink-400',
    avatar: 'https://picsum.photos/100/100?random=1'
  },
  {
    id: '2',
    name: 'Оля',
    email: 'olya@mio.ua',
    color: 'bg-teal-100 hover:bg-teal-200 text-teal-800',
    borderColor: 'border-teal-400',
    avatar: 'https://picsum.photos/100/100?random=2'
  }
];

export const SERVICES = [
  { id: ServiceType.MANICURE, label: 'Манікюр', duration: 90 }, // 1.5h
  { id: ServiceType.PEDICURE, label: 'Педикюр', duration: 90 }, // 1.5h
  { id: ServiceType.COMBO, label: 'Манікюр + Педикюр', duration: 150 }, // 2.5h
  { id: ServiceType.REMOVAL, label: 'Зняття', duration: 30 }, // 0.5h
];

export const WORK_START_HOUR = 9;
export const WORK_END_HOUR = 20;

export const DB_KEYS = {
  USER: 'mio_user',
  APPOINTMENTS: 'mio_appointments'
};