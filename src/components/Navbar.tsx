import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, Users } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                <CalendarDays className="w-6 h-6" />
                ExpertMeet
              </Link>
            </div>
            <div className="sm:ml-6 flex space-x-8">
              <Link
                to="/"
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                  location.pathname === '/' || location.pathname.startsWith('/experts')
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
              >
                Find Experts
              </Link>
              <Link
                to="/my-bookings"
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                  location.pathname === '/my-bookings'
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
              >
                My Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
