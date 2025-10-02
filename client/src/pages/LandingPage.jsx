import React from 'react';
import { Link } from 'react-router-dom';
import { PiStudent, PiStorefront } from 'react-icons/pi';

// For self-contained styling, we'll add the necessary CSS directly.
// This includes animations and the background image.
const pageStyles = `
  .bg-image {
    background-image: url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop');
    filter: blur(8px);
    transform: scale(1.1);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .animate-fade-in {
    animation: fadeIn 0.8s ease-out forwards;
  }

  .animate-slide-up {
    animation: slideUp 0.6s ease-out forwards;
    opacity: 0; /* Start hidden */
  }

  .animation-delay-200 {
    animation-delay: 0.2s;
  }
  
  .animation-delay-400 {
    animation-delay: 0.4s;
  }
`;

const ChoiceCard = ({ icon, title, description, linkTo, buttonText, buttonColors, hoverBorderColor, animationDelay }) => (
    <div 
        className={`group rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg p-8 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-cyan-500/10 ${hoverBorderColor} ${animationDelay}`}
        style={{ animationFillMode: 'forwards' }} // Ensures style is kept after animation
    >
        <div className="flex flex-col items-center text-center h-full">
            <div className="mb-6 text-6xl text-white transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-lg">
                {icon}
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-3">{title}</h2>
            <p className="text-gray-300 mb-8 flex-grow">{description}</p>
            
            <Link 
                to={linkTo} 
                className={`w-full text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg ${buttonColors}`}
            >
                {buttonText}
            </Link>
        </div>
    </div>
);

const LandingPage = () => {
  return (
    <>
      <style>{pageStyles}</style>
      <main className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-gray-900 p-4 sm:p-6">
        
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0 bg-image"></div>
        <div className="absolute inset-0 bg-black/60 z-0"></div>

        {/* Content Wrapper */}
        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center">
            
            {/* Header */}
            <header className="mb-12 text-center animate-fade-in">
                <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-lg md:text-7xl">
                    Welcome to <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">CampusEats</span>
                </h1>
                <p className="mt-4 max-w-2xl text-xl text-gray-200 drop-shadow-md animate-slide-up animation-delay-200" style={{ animationFillMode: 'forwards' }}>
                    Pre-order your favorite meals and skip the queue.
                </p>
            </header>
            
            {/* Cards Grid */}
            <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
                
                <ChoiceCard 
                    icon={<PiStudent />}
                    title="I'm a Student"
                    description="Browse canteens, place orders, and enjoy your meals hassle-free."
                    linkTo="/login/student"
                    buttonText="Continue as Student"
                    buttonColors="bg-teal-500 hover:bg-teal-400"
                    hoverBorderColor="hover:border-teal-400"
                    animationDelay="animate-slide-up animation-delay-400"
                />

                <ChoiceCard 
                    icon={<PiStorefront />}
                    title="I'm a Canteen Owner"
                    description="Manage your menu, process orders, and grow your business with our tools."
                    linkTo="/login/canteen"
                    buttonText="Continue as Canteen Owner"
                    buttonColors="bg-indigo-600 hover:bg-indigo-500"
                    hoverBorderColor="hover:border-indigo-400"
                    animationDelay="animate-slide-up animation-delay-400"
                />
            </div>
        </div>
      </main>
    </>
  );
};

export default LandingPage;