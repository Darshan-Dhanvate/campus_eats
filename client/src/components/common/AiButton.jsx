import React from 'react';

const AiSparkleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-6.857 2.143L12 21l-2.143-6.857L3 12l6.857-2.143L12 3z" />
    </svg>
);

const AiButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-8 right-8 bg-[#111184] text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300 z-50"
            aria-label="Open AI Food Recommender"
        >
            <AiSparkleIcon />
        </button>
    );
};

export default AiButton;
