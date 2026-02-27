import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, UtensilsCrossed, ClipboardList, Shield, LogOut } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../UI/Button';

export default function Header() {
  const { totalItems } = useCart();
  const { email, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Menu', icon: UtensilsCrossed },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: totalItems },
    { to: '/orders', label: 'Orders', icon: ClipboardList },
  ];

  if (isAdmin) {
    navLinks.push({ to: '/admin', label: 'Admin', icon: Shield });
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🍕</span>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              RaftFoodLab
            </span>
          </Link>

          {/* Navigation + User */}
          <div className="flex items-center gap-2">
            {/* Nav Links */}
            <nav className="flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon, badge }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden sm:inline">{label}</span>
                    {badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User Info & Logout */}
            {isAuthenticated && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                <span className="text-xs text-gray-500 hidden md:inline max-w-[120px] truncate">
                  {email}
                </span>
                {isAdmin && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium hidden sm:inline">
                    Admin
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleLogout}
                  className="p-1 text-gray-400 hover:text-red-500"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
