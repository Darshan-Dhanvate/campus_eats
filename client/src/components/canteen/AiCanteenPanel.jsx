import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

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

const AiCanteenPanel = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const fetchInitialAnalysis = async () => {
                setIsLoading(true);
                try {
                    const { data } = await api.post('/ai/analyze');
                    setMessages([{ from: 'ai', text: data.analysis }]);
                } catch (error) {
                    toast.error("Could not generate AI analysis.");
                    setMessages([{ from: 'ai', text: "I'm having trouble analyzing the data right now. Please try again later." }]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchInitialAnalysis();
        }
    }, [isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { from: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const { data } = await api.post('/ai/follow-up', {
                history: messages,
                question: userMessage.text,
            });
            setMessages(prev => [...prev, { from: 'ai', text: data.answer }]);
        } catch (error) {
            toast.error("Could not get a follow-up answer.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 bg-[#111184] text-white">
                    <h2 className="text-xl font-semibold">AI Performance Analyst</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20">
                        <CloseIcon />
                    </button>
                </div>

                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.from === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                <div className="prose prose-sm">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
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

                <form onSubmit={handleSendMessage} className="p-4 border-t">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Ask a follow-up question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#111184]"
                        />
                        <button type="submit" className="bg-[#111184] text-white p-3 rounded-full hover:bg-opacity-90 flex-shrink-0">
                            <SendIcon />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AiCanteenPanel;
