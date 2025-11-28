import React from 'react';
import { useState } from 'react';
import { FiX, FiChevronDown, FiUser, FiMessageCircle, FiSend} from 'react-icons/fi';
import { RiRobot2Fill } from 'react-icons/ri';
import PropTypes from 'prop-types';

const TypingAnimation = () => (
    <div className="flex gap-2 px-3 py-5">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
);

const Chatbot = ({ 
    isOpen, 
    onClose, 
    minimized, 
    onMinimize,
    onOpen
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            content: 'Hello! How can I help you today?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = React.useRef(null);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const newMessage = {
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setIsLoading(true); 

        try {
            const response = await fetch("http://localhost:5000/api/chatbot", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userMessage: inputMessage, sessionId: 'user123' })
            });

            const data = await response.json();
            const botResponse = {
                type: 'bot',
                content: data.reply,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            const botResponse = {
                type: 'bot',
                content: "Sorry, I couldn't reach the server.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botResponse]);
        } finally {
            setIsLoading(false); // Stop loading
        }
    };


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!isOpen) {
        return (
            <button
                onClick={onOpen}
                className="fixed bottom-4 right-4 w-14 h-14 bg-yellow-400 rounded-full shadow-lg flex items-center justify-center hover:bg-yellow-500 transition-colors z-50"
                aria-label="Open chat"
            >
                <FiMessageCircle size={24} className="text-white" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl z-50">
            {/* Header */}
            <div className="bg-yellow-400 p-4 rounded-t-lg flex justify-between items-center">
                <h3 className="text-white font-semibold">TigerRoutes Assistant</h3>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onMinimize}
                        className="text-white hover:bg-yellow-500 p-1 rounded"
                    >
                        <FiChevronDown size={20} />
                    </button>
                    <button 
                        onClick={onClose}
                        className="text-white hover:bg-yellow-500 p-1 rounded"
                    >
                        <FiX size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            {!minimized && (
            <>
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                        <div 
                            key={index} 
                            className={`flex ${
                                message.type === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            <div className={`flex items-start gap-2 max-w-[80%] ${
                                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                            }`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    message.type === 'user' 
                                        ? 'bg-yellow-100' 
                                        : 'bg-gray-100'
                                }`}>
                                    {message.type === 'user' 
                                        ? <FiUser className="text-yellow-600" /> 
                                        : <RiRobot2Fill className="text-gray-600" />
                                    }
                                </div>

                                {/* Message Bubble */}
                                <div className={`p-3 rounded-lg ${
                                    message.type === 'user'
                                        ? 'bg-yellow-400 text-white'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    <p className="text-sm">{message.content}</p>
                                    <span className="text-xs opacity-75 mt-1 block">
                                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex items-start gap-2 max-w-[80%]">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                                    <RiRobot2Fill className="text-gray-600" />
                                </div>
                                <div className="bg-gray-100 rounded-lg">
                                    <TypingAnimation />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form 
                    onSubmit={handleSendMessage}
                    className="border-t p-4 flex gap-2 items-center"
                >
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <button
                        type="submit"
                        disabled={!inputMessage.trim()}
                        className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiSend size={20} />
                    </button>
                </form>
            </>
            )}
        </div>
    );
};

Chatbot.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    minimized: PropTypes.bool.isRequired,
    onMinimize: PropTypes.func.isRequired,
    onOpen: PropTypes.func.isRequired
};

export default Chatbot;