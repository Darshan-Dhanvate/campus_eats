import React from 'react';
import { Link } from 'react-router-dom';

const StudentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.083 12.083 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.083 12.083 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12l11 6 11-6" />
    </svg>
);

const CanteenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-dark-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" />
    </svg>
);


const LandingPage = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-brand-dark-blue mb-2">CampusEats</h1>
            <p className="text-lg text-brand-text-light">Pre-order your favorite meals and skip the queue.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            {/* Student Card */}
            <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center text-center">
                <div className="bg-green-100 rounded-full p-4 mb-4">
                    <StudentIcon />
                </div>
                <h2 className="text-2xl font-semibold text-brand-dark-blue mb-2">I'm a Student</h2>
                <p className="text-brand-text-light mb-6">Browse canteens, place orders, and enjoy your meals.</p>
                <Link to="/login/student" className="w-full bg-[green] text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition duration-300">
                    Continue as Student
                </Link>
            </div>

            {/* Canteen Owner Card */}
            <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center text-center">
                <div className="bg-blue-100 rounded-full p-4 mb-4">
                    <CanteenIcon />
                </div>
                <h2 className="text-2xl font-semibold text-brand-dark-blue mb-2">I'm a Canteen Owner</h2>
                <p className="text-brand-text-light mb-6">Manage your menu, process orders, and grow your business.</p>
                <Link to="/login/canteen" className="w-full bg-[#111184] text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition duration-300">
                    Continue as Canteen Owner
                </Link>
            </div>
        </div>
    </div>
  );
};

export default LandingPage;
