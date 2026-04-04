import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/BaseComponents';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-800 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-amber-50 rounded-full">
            <AlertTriangle className="w-12 h-12 text-amber-500" />
          </div>
        </div>
        <h1 className="text-6xl font-black text-surface-900 dark:text-surface-100 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button className="w-full flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
