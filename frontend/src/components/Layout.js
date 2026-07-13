import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Activity, 
  Bot, 
  ShoppingBag, 
  User, 
  MessageCircle,
  HeartPulse,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/health-analysis', label: 'Analysis', icon: Activity },
    { path: '/metrics/add', label: 'Add Metrics', icon: HeartPulse },
    { path: '/ai-coach', label: 'AI Coach', icon: Bot },
    { path: '/store', label: 'Store', icon: ShoppingBag },
    { path: '/support', label: 'Support', icon: MessageCircle },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#FDFDF9]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FDFDF9]/80 backdrop-blur-xl border-b border-[#E5E7E1]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#8A9A5B] rounded-full flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-outfit font-semibold text-[#1A1F16] tracking-tight">
                MEDIGRAPH
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                      active
                        ? 'bg-[#8A9A5B] text-white'
                        : 'text-[#666] hover:bg-[#F4F5F0] hover:text-[#1A1F16]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="rounded-full text-[#E2725B] hover:bg-[#E2725B]/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[#1A1F16]" />
              ) : (
                <Menu className="w-6 h-6 text-[#1A1F16]" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-[#8A9A5B] text-white'
                        : 'text-[#666] hover:bg-[#F4F5F0] hover:text-[#1A1F16]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#E2725B] hover:bg-[#E2725B]/10 w-full transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#F4F5F0] border-t border-[#E5E7E1] mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#666]">
              © 2026 MEDIGRAPH. Your health, our priority.
            </p>
            <div className="flex gap-6">
              <Link to="/support" className="text-sm text-[#666] hover:text-[#8A9A5B] transition-colors duration-200">
                Support
              </Link>
              <Link to="/privacy" className="text-sm text-[#666] hover:text-[#8A9A5B] transition-colors duration-200">
                Privacy
              </Link>
              <Link to="/terms" className="text-sm text-[#666] hover:text-[#8A9A5B] transition-colors duration-200">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
