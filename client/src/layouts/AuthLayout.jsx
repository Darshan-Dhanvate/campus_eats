import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Outlet />
    </main>
  );
};

export default AuthLayout;
