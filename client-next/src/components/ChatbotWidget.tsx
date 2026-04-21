"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { chatApi } from '@/services/api';

const RobotIcon = ({ className = 'w-full h-full' }: { className?: string }) => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Nền tròn xanh rêu đậm */}
        <circle cx="100" cy="100" r="95" fill="#18271d" />
        {/* Tai nghe trái */}
        <path d="M 40 85 L 20 92 C 10 98, 10 122, 20 128 L 40 135 Z" fill="#5ebf73" />
        <ellipse cx="23" cy="110" rx="4" ry="13" fill="#111" />
        {/* Tai nghe phải */}
        <path d="M 160 85 L 180 92 C 190 98, 190 122, 180 128 L 160 135 Z" fill="#5ebf73" />
        <ellipse cx="177" cy="110" rx="4" ry="13" fill="#111" />
        {/* Bóng cổ */}
        <ellipse cx="100" cy="168" rx="45" ry="12" fill="#111" opacity="0.3" />
        {/* Đầu robot - bóng */}
        <path d="M 28 100 C 28 20, 172 20, 172 100 C 172 165, 145 178, 100 178 C 55 178, 28 165, 28 100 Z" fill="#d5dbd7" />
        {/* Đầu robot - trắng */}
        <path d="M 28 100 C 28 20, 172 20, 172 100 C 172 158, 145 168, 100 168 C 55 168, 28 158, 28 100 Z" fill="#ffffff" />
        {/* Chân ăng-ten */}
        <ellipse cx="100" cy="46" rx="14" ry="4" fill="#e2e8e5" />
        <rect x="96" y="18" width="8" height="30" rx="4" fill="#151a17" />
        {/* Quả cầu ăng-ten */}
        <circle cx="100" cy="16" r="11" fill="#5ebf73" />
        <ellipse cx="96" cy="12" rx="4" ry="2.5" fill="#fff" opacity="0.8" transform="rotate(-30 96 12)" />
        {/* Viền màn hình mặt */}
        <rect x="44" y="80" width="112" height="74" rx="34" fill="#242a26" />
        <rect x="52" y="87" width="96" height="60" rx="28" fill="#0d110f" />
        {/* Mắt trái */}
        <ellipse cx="76" cy="115" rx="11" ry="16" fill="#5ebf73" />
        <ellipse cx="72" cy="106" rx="3.5" ry="6" fill="#fff" opacity="0.9" transform="rotate(-15 72 106)" />
        <circle cx="81" cy="125" r="2" fill="#fff" opacity="0.6" />
        {/* Mắt phải */}
        <ellipse cx="124" cy="115" rx="11" ry="16" fill="#5ebf73" />
        <ellipse cx="120" cy="106" rx="3.5" ry="6" fill="#fff" opacity="0.9" transform="rotate(-15 120 106)" />
        <circle cx="129" cy="125" r="2" fill="#fff" opacity="0.6" />
        {/* Miệng cười */}
        <path d="M 88 135 Q 100 145 112 135" fill="none" stroke="#5ebf73" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
);

interface ChatMsg {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    quickReplies?: string[];
    timestamp: Date;
}

export const ChatbotWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Show welcome on first open
    const handleOpen = () => {
        setIsOpen(true);
        setHasNewMessage(false);
        if (messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: 'Xin chào! 👋 Tôi là **Trợ lý AI** của CredBack.\n\nHỏi tôi bất kỳ điều gì về thẻ tín dụng nhé!',
                quickReplies: [
                    'Top thẻ hoàn tiền cao nhất',
                    'Tư vấn thẻ cho lương 15 triệu',
                    'Thẻ miễn phí thường niên',
                    'Hệ thống có bao nhiêu thẻ?'
                ],
                timestamp: new Date()
            }]);
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: ChatMsg = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const history = messages.slice(-6).map(m => ({
                role: m.role,
                content: m.content
            }));

            // Track time to ensure minimum reading/typing delay for UX
            const startTime = Date.now();

            const result = await chatApi.sendMessage(text.trim(), history);

            // Enforce at least 800ms typing indicator visible
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < 800) {
                await new Promise(resolve => setTimeout(resolve, 800 - elapsedTime));
            }

            const botMsg: ChatMsg = {
                id: `bot-${Date.now()}`,
                role: 'assistant',
                content: result.reply,
                quickReplies: result.quickReplies,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMsg]);

            if (!isOpen) {
                setHasNewMessage(true);
            }
        } catch {
            setMessages(prev => [...prev, {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau! 🔧',
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleQuickReply = (text: string) => {
        sendMessage(text);
    };

    const handleNewChat = () => {
        setMessages([{
            id: 'welcome-new',
            role: 'assistant',
            content: 'Cuộc trò chuyện mới! 🔄\n\nTôi sẵn sàng tư vấn cho bạn. Hãy hỏi bất cứ điều gì!',
            quickReplies: [
                'Top thẻ hoàn tiền cao nhất',
                'Tư vấn thẻ cho lương 15 triệu',
                'Thẻ miễn phí thường niên',
                'Hướng dẫn sử dụng'
            ],
            timestamp: new Date()
        }]);
    };

    // Render markdown-like formatting
    const renderContent = (content: string) => {
        return content.split('\n').map((line, i) => {
            // Bold
            let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Italic
            formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
            // Table row
            if (formatted.startsWith('|') && formatted.endsWith('|')) {
                const cells = formatted.split('|').filter(c => c.trim());
                if (cells.every(c => c.trim().match(/^-+$/))) {
                    return null; // Skip separator row
                }
                return (
                    <div key={i} className="flex gap-1 text-[11px] font-medium py-0.5">
                        {cells.map((cell, ci) => (
                            <span key={ci} className={`flex-1 ${ci === 0 ? 'text-slate-400 w-28 shrink-0 flex-initial' : 'font-bold text-slate-200'}`}
                                dangerouslySetInnerHTML={{ __html: cell.trim() }} />
                        ))}
                    </div>
                );
            }
            // Bullet points
            if (formatted.startsWith('•') || formatted.startsWith('  •') || formatted.startsWith('  ✅') || formatted.startsWith('  🔥')) {
                return <div key={i} className="pl-1 py-0.5 text-[12px]" dangerouslySetInnerHTML={{ __html: formatted }} />;
            }
            // Empty line
            if (formatted.trim() === '') return <div key={i} className="h-2" />;

            return <div key={i} className="py-0.5" dangerouslySetInnerHTML={{ __html: formatted }} />;
        });
    };

    return (
        <>
            {/* Floating Chat Container */}
            <div className={`fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-2.5 transition-all duration-500 ${isOpen ? 'pointer-events-none' : 'pointer-events-auto'}`}
                style={!isOpen ? { animation: 'float 3s ease-in-out infinite' } : undefined}>
                {/* Tooltip */}
                {!isOpen && (
                    <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 animate-pulse whitespace-nowrap pointer-events-none select-none">
                        Trợ lý AI sẵn sàng hỗ trợ! 🤖
                    </div>
                )}
                {/* Button */}
                <button
                    onClick={isOpen ? () => setIsOpen(false) : handleOpen}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl group overflow-hidden pointer-events-auto ${isOpen
                        ? 'bg-slate-800 hover:bg-slate-700 scale-100'
                        : 'ring-[3px] ring-white dark:ring-slate-700 hover:scale-110 shadow-black/20'
                        }`}
                    aria-label="Chat AI"
                >
                    {isOpen ? (
                        <span className="material-symbols-outlined text-white text-2xl transition-transform duration-300">close</span>
                    ) : (
                        <RobotIcon className="w-13 h-13" />
                    )}
                    {/* New message badge */}
                    {hasNewMessage && !isOpen && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-black text-white flex items-center justify-center animate-bounce shadow-lg z-10">
                            1
                        </span>
                    )}
                </button>
            </div>

            {/* Chat Panel */}
            <div className={`fixed bottom-24 right-6 z-[199] w-[400px] max-w-[calc(100vw-2rem)] transition-all duration-500 ${isOpen
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                }`}>
                <div className="bg-white dark:bg-[#0c1222] rounded-[1.5rem] shadow-2xl shadow-black/20 dark:shadow-black/40 overflow-hidden flex flex-col h-[560px] border border-slate-200 dark:border-slate-800/80 ring-1 ring-slate-100 dark:ring-primary-500/10">
                    {/* Header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white dark:from-[#0c1222] dark:to-[#111b2e] border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden shadow-lg shadow-primary-500/20 animate-float-avatar bg-[#18271d]">
                                <RobotIcon />
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                                    <span className="text-primary-500 dark:text-primary-400">✦</span> Trợ Lý AI
                                </h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                                    <span className="text-[10px] text-slate-500 font-bold">Đang hoạt động</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleNewChat}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-primary-400 hover:bg-slate-800/80 transition-all"
                                title="Cuộc trò chuyện mới"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/80 transition-all"
                                title="Thu nhỏ"
                            >
                                <span className="material-symbols-outlined text-lg">remove</span>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={chatBodyRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up-chat`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-1 animate-float-avatar bg-[#18271d]">
                                        <RobotIcon />
                                    </div>
                                )}
                                <div className={`max-w-[82%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                                    <div className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${msg.role === 'user'
                                        ? 'bg-primary-600 text-white rounded-br-md ml-auto'
                                        : 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 rounded-bl-md border border-slate-200 dark:border-slate-700/40'
                                        }`}>
                                        <div className="space-y-0.5 [&_strong]:text-primary-600 dark:[&_strong]:text-primary-300 [&_strong]:font-extrabold [&_em]:text-slate-500 dark:[&_em]:text-slate-400 [&_em]:not-italic [&_em]:text-[11px]">
                                            {renderContent(msg.content)}
                                        </div>
                                    </div>
                                    {/* Quick Replies */}
                                    {msg.role === 'assistant' && msg.quickReplies && msg.quickReplies.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2.5 pl-0.5">
                                            {msg.quickReplies.map((qr, qi) => (
                                                <button
                                                    key={qi}
                                                    onClick={() => handleQuickReply(qr)}
                                                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-500/50 hover:bg-primary-50 dark:hover:bg-primary-500/5 transition-all active:scale-95 truncate max-w-[180px]"
                                                >
                                                    {qr}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <p className={`text-[9px] font-medium mt-1.5 ${msg.role === 'user' ? 'text-right text-slate-600' : 'text-slate-600 pl-0.5'}`}>
                                        {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex gap-2.5 animate-fade-in-up-chat">
                                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 animate-float-avatar bg-[#18271d]">
                                    <RobotIcon />
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-800/70 rounded-2xl rounded-bl-md px-4 py-3.5 border border-slate-200 dark:border-slate-700/40 flex items-center gap-1.5 shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2 shrink-0 border-t border-slate-200 dark:border-slate-800/40 bg-slate-50 dark:bg-transparent">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800/60 rounded-2xl px-4 py-1 ring-1 ring-slate-200 dark:ring-slate-700/50 focus-within:ring-primary-500/50 transition-all shadow-sm dark:shadow-none">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Bạn cần tư vấn điều gì?"
                                className="flex-1 bg-transparent border-0 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 py-3 outline-none font-medium"
                                disabled={isTyping}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${input.trim() && !isTyping
                                    ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20 scale-100'
                                    : 'bg-primary-100 dark:bg-primary-900/40 text-primary-400 dark:text-primary-500/60 scale-90'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">arrow_upward</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
