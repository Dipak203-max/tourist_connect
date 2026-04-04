import React from 'react';
import DashboardLayout from './DashboardLayout';

/**
 * AdminLayout
 * A specialized layout for admin pages.
 * Currently wraps DashboardLayout but can be customized for admin-specific sidebars or contexts.
 */
const AdminLayout = () => {
  return <DashboardLayout />;
};

export default AdminLayout;
