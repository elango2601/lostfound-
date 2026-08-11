import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      const userObj = res.data.user;
      login(userObj);
      toast.success('Account created successfully!');
      
      // Role-based redirect
      if (userObj.role === 'admin') navigate('/admin');
      else if (userObj.role === 'moderator') navigate('/moderator');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex bg-white">
      {/* Right side - Image/Graphic */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-tl from-purple-50 via-white to-indigo-50 overflow-hidden">
          <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-3xl"></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute inset-0 flex items-center justify-center p-24"
          >
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-12 rounded-3xl shadow-2xl text-center">
              <h3 className="text-3xl font-bold text-indigo-900 mb-4">Join LostFound+</h3>
              <p className="text-indigo-800/80 text-lg">Create an account to start reporting and recovering items in seconds.</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mx-auto w-full max-w-sm lg:w-96"
        >
          <div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Create account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                  {error}
                </motion.div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Full name</label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full rounded-xl border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="email"
                      required
                      className="block w-full rounded-xl border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Password</label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength="6"
                      className="block w-full rounded-xl border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-indigo-600 px-3 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all disabled:opacity-70"
                >
                  {loading ? 'Creating account...' : (
                    <>Sign up <ArrowRight size={18} /></>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
