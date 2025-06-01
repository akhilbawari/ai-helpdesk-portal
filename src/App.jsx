import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChakraProvider } from '@chakra-ui/react';

// Context
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './components/notifications/NotificationProvider';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OAuthCallback from './pages/auth/OAuthCallback';
import GoogleOAuthCallback from './pages/auth/GoogleOAuthCallback';
import Dashboard from './components/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';
import Unauthorized from './pages/Unauthorized';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import UserActivityMonitoring from './pages/admin/UserActivityMonitoring';

// Ticket Pages
import TicketList from './pages/tickets/TicketList';
import TicketDetail from './pages/tickets/TicketDetail';
import CreateTicket from './pages/tickets/CreateTicket';

// Knowledge Pages
import KnowledgeList from './components/knowledge/KnowledgeList';
import KnowledgeDetail from './components/knowledge/KnowledgeDetail';
import KnowledgeForm from './components/knowledge/KnowledgeForm';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
              <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/user-activities" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserActivityMonitoring />
                </ProtectedRoute>
              } />
              
              {/* Unauthorized Route */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Ticket Routes */}
              <Route path="/tickets" element={
                <ProtectedRoute>
                  <TicketList />
                </ProtectedRoute>
              } />
              <Route path="/tickets/create" element={
                <ProtectedRoute>
                  <CreateTicket />
                </ProtectedRoute>
              } />
              <Route path="/tickets/:id" element={
                <ProtectedRoute>
                  <TicketDetail />
                </ProtectedRoute>
              } />
              
              {/* Knowledge Base Routes */}
              <Route path="/knowledge" element={
                <ProtectedRoute>
                  <KnowledgeList />
                </ProtectedRoute>
              } />
              <Route path="/knowledge/new" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPPORT']}>
                  <KnowledgeForm />
                </ProtectedRoute>
              } />
              <Route path="/knowledge/edit/:id" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPPORT']}>
                  <KnowledgeForm isEdit={true} />
                </ProtectedRoute>
              } />
              <Route path="/knowledge/:id" element={
                <ProtectedRoute>
                  <KnowledgeDetail />
                </ProtectedRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={<div className="container mx-auto px-4 py-20 text-center"><h1>Page Not Found</h1></div>} />
            </Routes>
          </main>
          <Footer />
        </div>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;
