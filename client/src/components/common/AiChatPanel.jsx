import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

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
    const [messages, setMessages] = useState([
        { from: 'ai', text: "Hi! I'm your campus food assistant. What are you in the mood for today?" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const userQuery = inputValue.trim();
        if (!userQuery) return;

        // Add user's message to the chat
        const newUserMessage = { from: 'user', text: userQuery };
        const newMessages = [...messages, newUserMessage];
        setMessages(newMessages);
        setInputValue('');
        setIsLoading(true);

        try {
            // Send the query and history to the backend
            const { data } = await api.post('/ai/recommend', {
                query: userQuery,
                chatHistory: messages // Send the conversation history for context
            });

            // Add AI's response to the chat
            const aiResponseMessage = { from: 'ai', text: data.recommendation };
            setMessages([...newMessages, aiResponseMessage]);

        } catch (error) {
            toast.error("Sorry, I couldn't get a recommendation right now.");
            // Optionally add an error message to the chat
            setMessages([...newMessages, { from: 'ai', text: "I'm having a little trouble thinking. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };


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
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-200 text-gray-800">
                                Thinking...
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask for recommendations..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#111184]"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading} className="bg-[#111184] text-white p-3 rounded-full hover:bg-opacity-90 flex-shrink-0 disabled:bg-gray-400">
                            <SendIcon />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AiChatPanel;

