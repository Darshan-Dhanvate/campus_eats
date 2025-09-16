import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AiButton from '../components/common/AiButton';
import AiChatPanel from '../components/common/AiChatPanel';
import AiCanteenPanel from '../components/canteen/AiCanteenPanel';

// Hamburger Menu Icon
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

// Close Icon for Mobile Menu
const CloseIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const MainLayout = () => {
  const { user, logout } = useAuth();
  const [isStudentAiOpen, setIsStudentAiOpen] = useState(false);
  const [isCanteenAiOpen, setIsCanteenAiOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

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

  const openAiPanel = () => {
    if (user?.role === 'student') setIsStudentAiOpen(true);
    else if (user?.role === 'canteen') setIsCanteenAiOpen(true);
  };

  return (
    <div className="min-h-screen bg-brand-light-gray">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl sm:text-2xl font-bold text-brand-dark-blue">
                CampusEats
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              {navLinks.map((link) => (
                <NavLink key={link.name} to={link.path}
                  className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-green-600 text-white' : 'text-brand-text-light hover:bg-gray-100'}`}
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center">
               <div className="mr-4 text-sm text-brand-text-dark hidden sm:block">
                Welcome, {user?.name.split(' ')[0]}
              </div>
              <button onClick={logout} className="hidden md:block ml-4 px-3 py-2 rounded-md text-sm font-medium text-brand-text-light hover:bg-gray-100">
                Logout
              </button>
              
              {/* Hamburger Menu Button */}
              <div className="md:hidden ml-2">
                  <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                      {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                  </button>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                     {navLinks.map((link) => (
                        <NavLink key={link.name} to={link.path} onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-green-600 text-white' : 'text-brand-text-light hover:bg-gray-100'}`}
                        >
                            {link.name}
                        </NavLink>
                    ))}
                    <div className="border-t pt-2">
                         <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-brand-text-light hover:bg-gray-100">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        )}
      </header>
      <main>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {user && (
        <>
          <AiButton onClick={openAiPanel} />
          <AiChatPanel isOpen={isStudentAiOpen} onClose={() => setIsStudentAiOpen(false)} />
          <AiCanteenPanel isOpen={isCanteenAiOpen} onClose={() => setIsCanteenAiOpen(false)} />
        </>
      )}
    </div>
  );
};

export default MainLayout;

