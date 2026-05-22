import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserPlus, ArrowRight, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'founder',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-[500px] p-8 md:p-12"
      >
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-sensai-secondary/10">
            <UserPlus className="text-sensai-secondary" size={30} />
          </div>
          <h2 className="mb-2 text-3xl font-bold text-white">Join Startup Sensai</h2>
          <p className="text-sensai-muted">Start your journey from concept to market entry</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-sensai-muted">I am a...</label>
            <div className="grid grid-cols-3 gap-3">
              {['founder', 'mentor', 'investor'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`rounded-xl border py-3 text-xs font-bold uppercase tracking-wider transition-all
                    ${formData.role === r 
                      ? 'border-sensai-primary bg-sensai-primary/20 text-sensai-primary' 
                      : 'border-white/10 bg-white/5 text-sensai-muted hover:bg-white/10'}`}
                >
                  {r === 'mentor' ? 'expert' : r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-sensai-muted">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sensai-muted" />
              <input 
                name="name"
                type="text" 
                className="input-field pl-12"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-sensai-muted">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sensai-muted" />
              <input 
                name="email"
                type="email" 
                className="input-field pl-12"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-sensai-muted">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sensai-muted" />
              <input 
                name="password"
                type="password" 
                className="input-field pl-12"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary mt-4 w-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-sensai-muted">
          Already have an account? <Link to="/login" className="font-bold text-sensai-secondary no-underline transition-opacity hover:opacity-80">Sign in here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
