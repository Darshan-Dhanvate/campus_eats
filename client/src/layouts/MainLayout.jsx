import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MainLayout = () => {
  const { user, logout } = useAuth();

  const studentLinks = [
    { name: 'Browse Canteens', path: '/student/browse' },
    { name: 'My Orders', path: '/student/orders' },
    { name: 'Profile', path: '/student/profile' },
  ];

  const canteenLinks = [
    { name: 'Order Management', path: '/canteen/orders' },
    { name: 'Menu', path: '/canteen/menu' },
    { name: 'Analytics', path: '/canteen/analytics' },
    { name: 'Profile', path: '/canteen/profile' },
  ];

  const navLinks = user?.role === 'student' ? studentLinks : canteenLinks;

  return (
    <div className="min-h-screen bg-brand-light-gray">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-brand-dark-blue">
                CampusEats
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium ${
                        isActive
                          ? 'bg-[green] text-white'
                          : 'text-brand-text-light hover:bg-gray-100'
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="flex items-center">
               <div className="mr-4 text-sm text-brand-text-dark hidden sm:block">
                Welcome, {user?.name.split(' ')[0]}
              </div>
              <button
                onClick={logout}
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-brand-text-light hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      </header>
      <main>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
