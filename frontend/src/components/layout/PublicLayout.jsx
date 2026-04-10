import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <PublicNavbar />
      <main className="pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;