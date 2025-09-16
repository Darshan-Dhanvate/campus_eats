import React from 'react';

// Icons for the chat panel
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const AiChatPanel = ({ isOpen, onClose }) => {
    // Dummy messages for layout purposes
    const messages = [
        { from: 'ai', text: "Hi! I'm your campus food assistant. What are you in the mood for today?" },
        { from: 'user', text: "I want something spicy and vegetarian." },
        { from: 'ai', text: "Great choice! How about a Paneer Tikka Masala from 'Campus Central Cafeteria' or a Spicy Veggie Pizza from 'Pizza Corner'?" },
    ];

    return (
        <div 
            className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center p-4 bg-[#111184] text-white">
                    <h2 className="text-xl font-semibold">AI Food Recommender</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20">
                        <CloseIcon />
                    </button>
                </div>

                {/* Message Area */}
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.from === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Ask for recommendations..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#111184]"
                        />
                        <button className="bg-[#111184] text-white p-3 rounded-full hover:bg-opacity-90 flex-shrink-0">
                            <SendIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiChatPanel;
