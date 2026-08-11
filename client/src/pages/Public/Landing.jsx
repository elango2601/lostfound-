import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.2, delayChildren: 0.1 } 
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const Landing = () => {
  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
        </div>
        
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <motion.div 
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemVariants} className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Lost something? We'll help you <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">find it.</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg leading-8 text-gray-600">
              The centralized, secure and intelligent Lost & Found Management Platform using AI-free smart matching to streamline recovery.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-10 flex items-center justify-center gap-x-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:shadow-indigo-500/50 hover:bg-indigo-500 transition-all">
                  Get Started
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/search" className="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-2 hover:text-indigo-600 transition-colors">
                  <Search size={20} /> Search Database
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-24 sm:py-32 bg-gray-50/50 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Faster Recovery</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to recover items
            </p>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl"
          >
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <motion.div whileHover={{ y: -5 }} className="relative pl-16 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                    <Zap className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Smart Matching Engine
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">Our algorithmic matching compares location, brand, and descriptions to instantly pair lost and found items.</dd>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} className="relative pl-16 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                    <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Verified Ownership
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">Moderator-verified claim submissions ensure items are returned to their rightful owners securely.</dd>
              </motion.div>
            </dl>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
