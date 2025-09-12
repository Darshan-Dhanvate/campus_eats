import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Import Pages
import LandingPage from '../pages/LandingPage';
import StudentLogin from '../pages/StudentLogin';
import StudentSignup from '../pages/StudentSignup';
import CanteenLogin from '../pages/CanteenLogin';
import CanteenRegister from '../pages/CanteenRegister';

// We will create these page components in the next steps
// import BrowseCanteens from '../pages/student/BrowseCanteens';
// import MyOrders from '../pages/student/MyOrders';
// import StudentProfile from '../pages/student/StudentProfile';
// import OrderManagement from '../pages/canteen/OrderManagement';
// import MenuManagement from '../pages/canteen/MenuManagement';
// import CanteenProfile from '../pages/canteen/CanteenProfile';

// A simple loading spinner component
const FullPageSpinner = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-green"></div>
    </div>
);


const AppRouter = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <FullPageSpinner />;
    }

    return (
        <Routes>
            {/* Public and Authentication Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/" element={!user ? <LandingPage /> : <Navigate to={user.role === 'student' ? '/student/browse' : '/canteen/orders'} />} />
                <Route path="/login/student" element={!user ? <StudentLogin /> : <Navigate to="/student/browse" />} />
                <Route path="/signup/student" element={!user ? <StudentSignup /> : <Navigate to="/student/browse" />} />
                <Route path="/login/canteen" element={!user ? <CanteenLogin /> : <Navigate to="/canteen/orders" />} />
                <Route path="/register/canteen" element={!user ? <CanteenRegister /> : <Navigate to="/canteen/orders" />} />
            </Route>

            {/* Protected Student Routes */}
            {/* <Route path="/student" element={user && user.role === 'student' ? <MainLayout /> : <Navigate to="/login/student" />}>
                <Route path="browse" element={<BrowseCanteens />} />
                <Route path="orders" element={<MyOrders />} />
                <Route path="profile" element={<StudentProfile />} />
            </Route> */}

            {/* Protected Canteen Routes */}
            {/* <Route path="/canteen" element={user && user.role === 'canteen' ? <MainLayout /> : <Navigate to="/login/canteen" />}>
                <Route path="orders" element={<OrderManagement />} />
                <Route path="menu" element={<MenuManagement />} />
                <Route path="profile" element={<CanteenProfile />} />
            </Route> */}

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRouter;
