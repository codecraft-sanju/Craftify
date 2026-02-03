// src/CustomizationChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Paperclip, ShieldCheck, Image as ImageIcon, Check } from 'lucide-react';

const CustomizationChat = ({ isOpen, onClose, product, currentUser, socket, API_URL }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // --- LOGIC: CHAT SESSION & SOCKET ---
  useEffect(() => {
    if (isOpen && currentUser && product) {
        setLoading(true);
        document.body.style.overflow = 'hidden';

        fetch(`${API_URL}/api/chats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', 
            body: JSON.stringify({ productId: product._id })
        })
        .then(res => res.json())
        .then(data => {
            setChatId(data._id);
            setMessages(data.messages || []);
            setLoading(false);
            if(socket) socket.emit("join_chat", data._id);
            scrollToBottom();
        })
        .catch(err => {
            console.error("Chat Error:", err);
            setLoading(false);
        });
    } else {
        document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen, product, currentUser, API_URL, socket]);

  // Listen for Incoming Messages (UPDATED FIX)
  useEffect(() => {
      if(!socket) return;

      const handleMessageReceived = (newMessageReceived) => {
          // Check if message belongs to current chat
          if (chatId && chatId === newMessageReceived.chatId) {
             const incomingMsg = newMessageReceived.message;
             
             // FIX: Check if the sender is ME (Current User)
             // handleSend() already adds the message locally, so we skip it here
             // handling both object populated ID or string ID
             const isMe = incomingMsg.sender._id === currentUser?._id || incomingMsg.sender === currentUser?._id;

             // Only add to state if it's NOT from me
             if (!isMe) {
                 setMessages(prev => [...prev, incomingMsg]);
                 scrollToBottom();
             }
          }
      };

      socket.on("new_message_received", handleMessageReceived);
      
      return () => { socket.off("new_message_received", handleMessageReceived); }
  }, [socket, chatId, currentUser]); // Added currentUser dependency

  const scrollToBottom = () => {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSend = async () => {
    if (!message.trim() || !chatId) return;
    try {
        // Optimistic UI Update: Add message immediately
        const tempMsg = { text: message, sender: { _id: currentUser._id }, createdAt: new Date() };
        setMessages(prev => [...prev, tempMsg]);
        
        const msgToSend = message;
        setMessage("");
        inputRef.current?.focus();
        scrollToBottom();
        
        await fetch(`${API_URL}/api/chats/message`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ chatId: chatId, content: msgToSend, type: 'text' })
        });
    } catch (error) { console.error("Send Error", error); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* MAIN CONTAINER */}
      <div className="bg-[#F0F2F5] w-full h-[100dvh] md:h-[650px] md:max-w-md md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* 1. HEADER */}
        <div className="px-4 py-3 bg-white/90 backdrop-blur-xl border-b border-slate-200 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
              <div className="relative">
                  <div className="w-10 h-10 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <img src={product.image || product.coverImage} className="w-full h-full object-cover" alt="Product"/>
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate max-w-[150px]">{product.shop?.name || 'Seller'}</h3>
                  <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                    Re: {product.name.substring(0, 20)}...
                  </p>
              </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* 2. MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 relative custom-scrollbar bg-[#E5DDD5]">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Safety Notice */}
            <div className="flex justify-center mb-6 mt-2 relative z-10">
                <div className="bg-[#FFF8C5] border border-[#F2E59A] text-yellow-900 text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Never share your password or OTP.</span>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 z-10 relative">
                    <div className="w-8 h-8 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-xs font-medium">Connecting...</p>
                </div>
            ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 z-10 relative">
                    <div className="w-16 h-16 bg-white/50 rounded-2xl shadow-sm flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-indigo-400"/>
                    </div>
                    <p className="text-sm font-bold text-slate-600">Start Chatting</p>
                    <p className="text-xs max-w-[200px] text-center mt-1">Discuss customization details directly with the seller.</p>
                </div>
            ) : (
                messages.map((msg, index) => {
                    const isMe = msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
                    return (
                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} relative z-10 group`}>
                            <div className={`max-w-[80%] px-3 py-1.5 rounded-lg text-sm shadow-sm relative ${
                                isMe 
                                ? 'bg-[#DCF8C6] text-slate-900 rounded-tr-none' 
                                : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
                            }`}>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                <div className="text-[9px] text-right mt-0.5 opacity-60 flex justify-end gap-1 items-center">
                                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    {isMe && <Check className="w-2.5 h-2.5 text-blue-500" />}
                                </div>
                            </div>
                        </div>
                    )
                })
            )}
            <div ref={chatEndRef} />
        </div>

        {/* 3. INPUT AREA */}
        <div className="p-2 bg-[#F0F2F5] sticky bottom-0 z-20 pb-safe">
            <div className="flex items-end gap-2 max-w-full">
                <div className="flex-1 bg-white rounded-3xl flex items-center px-4 py-2 border border-transparent focus-within:border-slate-300 shadow-sm transition-all">
                    <input 
                        ref={inputRef}
                        type="text" 
                        className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400 max-h-32 py-1.5" 
                        placeholder="Type a message..." 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
                    />
                    <button className="text-slate-400 hover:text-slate-600 ml-2">
                       <Paperclip className="w-5 h-5" />
                    </button>
                </div>
                
                <button 
                    onClick={handleSend} 
                    disabled={!message.trim()}
                    className="w-11 h-11 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-md flex items-center justify-center shrink-0"
                >
                    <Send className="w-5 h-5 ml-0.5" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationChat;