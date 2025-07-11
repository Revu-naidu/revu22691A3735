import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Link as LinkIcon, BarChart3 } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <LinkIcon className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold text-gray-800">URL Shortener</span>
          </div>
          
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Shorten URLs
            </Link>
            
            <Link
              to="/stats"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/stats') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistics
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;