import React, { useState } from 'react';
import { loginUser } from '../services/storage';
import { Button } from './Button';
import { Input } from './Input';

interface Props {
  onLogin: () => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await loginUser(email, password);
      if (user) {
        onLogin();
      } else {
        setError('Невірний email або пароль');
      }
    } catch (err) {
      setError('Помилка входу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          MiO Studio
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Увійдіть в систему
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input 
              label="Email" 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <Input 
              label="Пароль" 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <Button type="submit" className="w-full" isLoading={loading}>
              Увійти
            </Button>
            
            <div className="text-xs text-gray-400 mt-4 text-center">
               Demo: marina@mio.ua / 1234
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};