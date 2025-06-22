import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Plus, User, Clock } from 'lucide-react';

const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg group-hover:scale-105 transition-transform">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BookMySlot
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Events</span>
              </div>
            </Link>
            <Link
              to="/create"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/create') 
                  ? 'bg-green-100 text-green-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Event</span>
              </div>
            </Link>
            <Link
              to="/bookings"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/bookings') 
                  ? 'bg-purple-100 text-purple-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>My Bookings</span>
              </div>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Link
              to="/create"
              className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform"
            >
              <Plus className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="px-4 py-2 flex justify-around">
          <Link
            to="/"
            className={`flex flex-col items-center py-2 px-3 rounded-lg ${
              isActive('/') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span className="text-xs mt-1">Events</span>
          </Link>
          <Link
            to="/create"
            className={`flex flex-col items-center py-2 px-3 rounded-lg ${
              isActive('/create') ? 'text-green-600' : 'text-gray-600'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs mt-1">Create</span>
          </Link>
          <Link
            to="/bookings"
            className={`flex flex-col items-center py-2 px-3 rounded-lg ${
              isActive('/bookings') ? 'text-purple-600' : 'text-gray-600'
            }`}
          >
            <User className="h-4 w-4" />
            <span className="text-xs mt-1">Bookings</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;