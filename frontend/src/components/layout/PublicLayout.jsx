import React from 'react';
import PublicNavbar from './PublicNavbar';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <PublicNavbar />
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;
