import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import CursorEffect from './components/CursorEffect';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AIAdvisory from './pages/AIAdvisory';
import Mentorship from './pages/Mentorship';
import Chat from './pages/Chat';
import Forum from './pages/Forum';
import Messages from './pages/Messages';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
        <div className="app-container relative min-h-screen">
          {/* Drifting Glassmorphic Ambient Auroras */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Top-Left Violet Aurora */}
            <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-violet-600/10 blur-[130px] animate-float-blob-1" />
            {/* Bottom-Right Teal Aurora */}
            <div className="absolute bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-teal-500/8 blur-[130px] animate-float-blob-2" />
            {/* Center-Left Indigo Aurora */}
            <div className="absolute top-[35%] left-[15%] w-[45vw] h-[45vw] rounded-full bg-indigo-600/6 blur-[110px] animate-float-blob-3" />
          </div>
          
          {/* Subtle Technology Dot Matrix Mesh Layer */}
          <div className="fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.007)_1.5px,transparent_1.5px)] bg-[size:32px_32px] pointer-events-none z-0 opacity-70" />

          {/* Core App Elements inside relative layout */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <CursorEffect />
            <Navbar />
            <main className="main-content flex-grow">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/feasibility" element={<ProtectedRoute><AIAdvisory /></ProtectedRoute>} />
              <Route path="/mentorship" element={<ProtectedRoute><Mentorship /></ProtectedRoute>} />
              <Route path="/chat/:sessionId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/messages/:conversationId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            </Routes>
          </main>
          <WidgetWrapper />
          <Footer />
          </div> {/* End relative z-10 */}
        </div> {/* End app-container */}
      </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

const WidgetWrapper = () => {
  const { user } = useAuth();
  if (user?.role === 'founder') {
    return <ChatWidget />;
  }
  return null;
};

export default App;
