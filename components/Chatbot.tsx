import React, { useState, useRef, useEffect } from 'react';
import { BlogPost, ChatMessage } from '../types';
import { ChatIcon, CloseIcon, SendIcon } from './Icons';
import { askChatbot } from '../services/geminiService';

interface ChatbotProps {
    posts: BlogPost[];
    blogTitle: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ posts, blogTitle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if(isOpen && messages.length === 0) {
            setMessages([
                { role: 'model', content: `Hello! I'm the assistant for the "${blogTitle}" blog. Ask me anything about the posts.` }
            ]);
        }
    }, [isOpen, messages.length, blogTitle]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const blogContext = posts.map(p => `Title: ${p.title}\nContent: ${p.content}`).join('\n\n---\n\n');
            const response = await askChatbot(input, blogContext, blogTitle);
            const modelMessage: ChatMessage = { role: 'model', content: response };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { role: 'model', content: 'Sorry, I ran into a problem. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-rose-500 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-rose-600 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 z-40"
                aria-label="Open chatbot"
            >
                <ChatIcon className="w-8 h-8" />
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[90vw] max-w-md h-[70vh] max-h-[600px] flex flex-col glass-card z-50 animate-fade-in-up">
                    <header className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10">
                        <h3 className="text-xl font-serif font-bold text-gradient">Blog Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </header>
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-teal-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-slate-700 text-gradient rounded-bl-none'}`}>
                                        <p>{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                             {isLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] p-3 rounded-2xl bg-gray-200 dark:bg-slate-700 text-gradient rounded-bl-none">
                                        <div className="flex items-center space-x-2">
                                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-black/10 dark:border-white/10">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="flex-1 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className="p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition"
                                disabled={isLoading}
                                aria-label="Send message"
                            >
                                <SendIcon />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default Chatbot;
