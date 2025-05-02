import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Bell, User, Globe } from 'lucide-react';
import { useSignalR } from "../../hooks/useSignalR";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { AppConfig } from '../../../config';

const serverURL = AppConfig.baseUrl;

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { hasUnreadNotifications } = useSignalR();
  const navigate = useNavigate();
  const location = useLocation();
  const logoImage = "uploads/imgs/logo.png";
  const defaultImageUrl = "uploads/imgs/default.jpg";

  console.log("Navbar Profile Image URL:", user?.profileImageUrl)

  return (
    <nav className="bg-white shadow-sm fixed w-full z-50 top-0">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src={`${serverURL+logoImage}`}
                alt="App Logo"
                className="h-10 transform scale-125"
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/translation"
                  className={`nav-link ${location.pathname === '/translation' ? 'active' : ''}`}
                >
                  <Globe className="h-4 w-4 inline-block mr-1" />
                  Translate
                </Link>
                <Link
                  to="/home"
                  className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}
                >
                  Home
                </Link>
                <Link
                  to="/Brother"
                  className={`nav-link ${location.pathname === '/Brother' ? 'active' : ''}`}
                >
                  Brothers
                </Link>
                <Link
                  to="/history"
                  className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}
                >
                  History
                </Link>
                <Link
                  to="/Profile"
                  className={`nav-link ${location.pathname === '/Profile' ? 'active' : ''}`}
                >
                  Profile
                </Link>
              </>
            ) : (
              <Link
                to="/"
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Home
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/notifications')}
                    className="relative"
                  >
                    <Bell className="h-5 w-5" />
                    {hasUnreadNotifications && (
                      <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                    )}
                  </Button>
                </div>

                <div className="relative group">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage onClick={() => navigate('/profile')}
                      src={user?.profileImageUrl ? `${serverURL}${user.profileImageUrl}` : `${serverURL}${defaultImageUrl}`}
                      alt={user?.fullName || 'User'}
                    
                    />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                <Button
                  variant="ghost"
                  className="text-red-700 hover:text-red-500"
                  onClick={logout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
