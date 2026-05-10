import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  if (authLoading) return null;
  if (user) return <Navigate to="/admin" replace />;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'admin'
          }
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setSuccess('¡Registro exitoso! Por favor, verifica tu correo electrónico si es necesario.');
        setLoading(false);
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let friendlyMessage = error.message;
        if (error.message.includes('Database error querying schema')) {
          friendlyMessage = 'Error de base de datos. Esto suele ocurrir si el proyecto de Supabase está pausado o hay un problema de conexión. Por favor, revisa tu panel de Supabase.';
        } else if (error.message === 'Invalid login credentials') {
          friendlyMessage = 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.';
        }
        setError(friendlyMessage);
        setLoading(false);
      } else {
        navigate('/admin');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-serif text-black">
            {isRegistering ? 'Registro de Administrador' : 'Acceso Administrativo'}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {isRegistering 
              ? 'Crea una nueva cuenta para gestionar la tienda.' 
              : 'Ingresa tus credenciales para gestionar la tienda.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}
          
          {isRegistering && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-semibold">Nombre Completo</label>
              <div className="relative">
                <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Pérez" 
                  className="w-full border border-gray-200 pl-10 pr-4 py-3 rounded-lg outline-none focus:border-black transition-colors" 
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-semibold">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@floreriaricardo.com" 
                className="w-full border border-gray-200 pl-10 pr-4 py-3 rounded-lg outline-none focus:border-black transition-colors" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-semibold">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full border border-gray-200 pl-10 pr-12 py-3 rounded-lg outline-none focus:border-black transition-colors" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-semibold">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full border border-gray-200 pl-10 pr-12 py-3 rounded-lg outline-none focus:border-black transition-colors" 
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <span>{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</span>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setSuccess(null);
            }}
            className="text-sm text-black hover:underline font-medium"
          >
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate como admin'}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">Florería Ricardo &copy; {new Date().getFullYear()}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
