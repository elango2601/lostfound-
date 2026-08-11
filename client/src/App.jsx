import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';

// Lazy load Pages
const Landing = React.lazy(() => import('./pages/Public/Landing'));
const Login = React.lazy(() => import('./pages/Public/Login'));
const Register = React.lazy(() => import('./pages/Public/Register'));
const SearchDatabase = React.lazy(() => import('./pages/Public/SearchDatabase'));

const Dashboard = React.lazy(() => import('./pages/User/Dashboard'));
const ReportLost = React.lazy(() => import('./pages/User/ReportLost'));
const ReportFound = React.lazy(() => import('./pages/User/ReportFound'));
const MyReports = React.lazy(() => import('./pages/User/MyReports'));
const MyClaims = React.lazy(() => import('./pages/User/MyClaims'));
const Profile = React.lazy(() => import('./pages/User/Profile'));
const RecoveryHistory = React.lazy(() => import('./pages/User/RecoveryHistory'));
const Matches = React.lazy(() => import('./pages/User/Matches'));

const Moderator = React.lazy(() => import('./pages/Admin/Moderator'));
const ModReports = React.lazy(() => import('./pages/Moderator/ModReports'));
const ModClaims = React.lazy(() => import('./pages/Moderator/ModClaims'));
const ModSuspicious = React.lazy(() => import('./pages/Moderator/ModSuspicious'));
const ModDuplicates = React.lazy(() => import('./pages/Moderator/ModDuplicates'));
const ModDisputes = React.lazy(() => import('./pages/Moderator/ModDisputes'));
const ModHandover = React.lazy(() => import('./pages/Moderator/ModHandover'));
const ModRecovery = React.lazy(() => import('./pages/Moderator/ModRecovery'));
const Notifications = React.lazy(() => import('./pages/User/Notifications'));

const Analytics = React.lazy(() => import('./pages/Admin/Analytics'));

const AdminDashboard = React.lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminUsers = React.lazy(() => import('./pages/Admin/AdminUsers'));
const AdminModerators = React.lazy(() => import('./pages/Admin/AdminModerators'));
const AdminOrganizations = React.lazy(() => import('./pages/Admin/AdminOrganizations'));
const AdminReports = React.lazy(() => import('./pages/Admin/AdminReports'));
const AdminClaims = React.lazy(() => import('./pages/Admin/AdminClaims'));
const AdminFraud = React.lazy(() => import('./pages/Admin/AdminFraud'));
const AdminInsights = React.lazy(() => import('./pages/Admin/AdminInsights'));
const AdminAuditLogs = React.lazy(() => import('./pages/Admin/AdminAuditLogs'));
const AdminCategories = React.lazy(() => import('./pages/Admin/AdminCategories'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[70vh]">
    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

// Layout wrapper for public pages (Landing, Login, Register) with top Navbar
const PublicLayout = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Toaster position="top-right" />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              
              {/* Public Routes with Navbar */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<SearchDatabase />} />
              </Route>

              {/* Protected Routes with Sidebar Dashboard Layout */}
              <Route element={<DashboardLayout />}>
                
                {/* User Only */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/report-lost" element={<ReportLost />} />
                  <Route path="/report-found" element={<ReportFound />} />
                  <Route path="/search" element={<SearchDatabase />} />
                  <Route path="/matches" element={<Matches />} />
                  <Route path="/my-reports" element={<MyReports />} />
                  <Route path="/my-claims" element={<MyClaims />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/recovery-history" element={<RecoveryHistory />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Moderator Routes */}
                <Route element={<ProtectedRoute allowedRoles={['moderator', 'admin']} />}>
                  <Route path="/moderator" element={<Moderator />} />
                  <Route path="/moderator/reports" element={<ModReports />} />
                  <Route path="/moderator/claims" element={<ModClaims />} />
                  <Route path="/moderator/suspicious" element={<ModSuspicious />} />
                  <Route path="/moderator/duplicates" element={<ModDuplicates />} />
                  <Route path="/moderator/disputes" element={<ModDisputes />} />
                  <Route path="/moderator/handover" element={<ModHandover />} />
                  <Route path="/moderator/recovery" element={<ModRecovery />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/moderators" element={<AdminModerators />} />
                  <Route path="/admin/organizations" element={<AdminOrganizations />} />
                  <Route path="/admin/reports" element={<AdminReports />} />
                  <Route path="/admin/claims" element={<AdminClaims />} />
                  <Route path="/admin/fraud" element={<AdminFraud />} />
                  <Route path="/admin/analytics" element={<Analytics />} />
                  <Route path="/admin/insights" element={<AdminInsights />} />
                  <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
                  <Route path="/admin/categories" element={<AdminCategories />} />
                </Route>

              </Route>

            </Routes>
          </Suspense>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
