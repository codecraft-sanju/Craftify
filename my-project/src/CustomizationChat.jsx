// src/CustomizationChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Paperclip, ShieldCheck, Zap, Check, AlertTriangle } from 'lucide-react';

// --- CONFIG: QUICK REPLIES ---
const QUICK_REPLIES = [
    { label: "🚚 Delivery Time?", text: "Hi, how many days will it take to deliver this?" },
    { label: "💰 Best Price?", text: "I am interested. Is there any discount on the final price?" },
    { label: "✨ Add Name?", text: "I want to customize this product. Can you add my name on it?" },
];

const CustomizationChat = ({ isOpen, onClose, product, currentUser, socket, API_URL }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(""); // State for Safety Warning
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // --- LOGIC: CHAT SESSION & SOCKET ---
  useEffect(() => {
    if (isOpen && currentUser && product) {
        setLoading(true);
        // Prevent background scrolling on mobile
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

  // Listen for Incoming Messages
  useEffect(() => {
      if(!socket) return;
      const handleMessageReceived = (newMessageReceived) => {
          if (chatId && chatId === newMessageReceived.chatId) {
             const incomingMsg = newMessageReceived.message;
             
             // Check if sender is ME to prevent double messages (Optimistic UI handled locally)
             const isMe = incomingMsg.sender._id === currentUser?._id || incomingMsg.sender === currentUser?._id;

             if (!isMe) {
                 setMessages(prev => [...prev, incomingMsg]);
                 scrollToBottom();
             }
          }
      };
      socket.on("new_message_received", handleMessageReceived);
      return () => { socket.off("new_message_received", handleMessageReceived); }
  }, [socket, chatId, currentUser]);

  const scrollToBottom = () => {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // --- SECURITY CHECK FUNCTION (UPDATED) ---
  const isMessageSafe = (text) => {
      const lowerText = text.toLowerCase();
      
      // 1. Check for Phone Numbers (Indian format mostly)
      // Remove spaces, dashes to catch "9 8 7 6..." patterns
      const cleanText = text.replace(/[\s-]/g, ''); 
      const phoneRegex = /(?:\+?91|0)?[6789]\d{9}/; // Matches 10 digit mobile numbers

      if (phoneRegex.test(cleanText)) return false;

      // 2. Email Check
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
      if (emailRegex.test(text)) return false;

      // 3. Instagram / Social Handles (Strict Check)
      // Detects: @username, ig: username, insta: username, instagram.com/...
      const instaRegex = /(?:@|(?:instagram|insta|ig)(?:\.com)?\/|ig:? ?|insta:? ?)([a-zA-Z0-9_.]+)/i;
      if (instaRegex.test(text)) return false;

      // 4. Forbidden Keywords
      const forbiddenWords = [
          'call me', 'phone number', 'contact number', 'whatsapp', 
          'paytm', 'gpay', 'phonepe', 'upi', 'mobile no', 'number do',
          'instagram', 'insta', 'dm me', 'link in bio', 'facebook', 'snapchat', 'telegram'
      ];

      for (let word of forbiddenWords) {
          if (lowerText.includes(word)) return false;
      }

      return true;
  };

  // --- HANDLE SEND ---
  const handleSend = async (manualText = null) => {
    // Determine content: Button click (manualText) OR Input field (message)
    const contentToSend = manualText || message;
    
    if (!contentToSend.trim() || !chatId) return;

    // --- SECURITY BLOCK ---
    if (!isMessageSafe(contentToSend)) {
        setErrorMsg("Sharing contact, social IDs or payment details is restricted!");
        // Clear error after 3 seconds
        setTimeout(() => setErrorMsg(""), 3000);
        return; // Stop execution
    }
    setErrorMsg(""); // Clear errors if safe

    try {
        let finalMsg = contentToSend;

        // Context Logic: If this is the FIRST message, attach Product Name
        if (messages.length === 0) {
            finalMsg = `Ref: ${product.name}\n\n${contentToSend}`;
        }

        // Optimistic UI Update
        const tempMsg = { 
            text: finalMsg, 
            sender: { _id: currentUser._id }, 
            createdAt: new Date() 
        };
        
        setMessages(prev => [...prev, tempMsg]);
        
        // Clear Input only if typed manually
        if (!manualText) setMessage("");
        inputRef.current?.focus();
        scrollToBottom();
        
        // Backend Request
        await fetch(`${API_URL}/api/chats/message`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ chatId: chatId, content: finalMsg, type: 'text' })
        });
    } catch (error) { console.error("Send Error", error); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* MAIN CONTAINER */}
      <div className="bg-[#F0F2F5] w-full h-[100dvh] md:h-[650px] md:max-w-md md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative transition-all">
        
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
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors active:scale-95">
              <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* 2. MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 relative custom-scrollbar bg-[#E5DDD5]">
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="flex justify-center mb-6 mt-2 relative z-10">
                <div className="bg-[#FFF8C5] border border-[#F2E59A] text-yellow-900 text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm text-center">
                    <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                    <span>Your chat is monitored for safety.</span>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 z-10 relative">
                    <div className="w-8 h-8 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-xs font-medium">Connecting...</p>
                </div>
            ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 z-10 relative px-6">
                    <div className="w-16 h-16 bg-white/50 rounded-2xl shadow-sm flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-indigo-400"/>
                    </div>
                    <p className="text-sm font-bold text-slate-600">Start Chatting</p>
                    <p className="text-xs text-center mt-1 mb-6 text-slate-500">
                        Ask about price, delivery or customization.
                    </p>
                    
                    {/* --- QUICK REPLY CHIPS --- */}
                    <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                        {QUICK_REPLIES.map((reply, index) => (
                            <button 
                                key={index}
                                onClick={() => handleSend(reply.text)}
                                className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-full hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm active:scale-95 flex items-center gap-1"
                            >
                                <Zap className="w-3 h-3" /> {reply.label}
                            </button>
                        ))}
                    </div>

                </div>
            ) : (
                messages.map((msg, index) => {
                    const isMe = msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
                    return (
                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} relative z-10 group`}>
                            <div className={`max-w-[85%] md:max-w-[75%] px-3 py-2 rounded-lg text-sm shadow-sm relative break-words ${
                                isMe 
                                ? 'bg-[#DCF8C6] text-slate-900 rounded-tr-none' 
                                : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
                            }`}>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                <div className="text-[9px] text-right mt-1 opacity-60 flex justify-end gap-1 items-center select-none">
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
            {/* Security Warning Alert */}
            {errorMsg && (
                <div className="absolute bottom-[4.5rem] left-4 right-4 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2 z-30">
                    <AlertTriangle className="w-4 h-4" />
                    {errorMsg}
                </div>
            )}

            <div className="flex items-end gap-2 max-w-full">
                <div className={`flex-1 bg-white rounded-3xl flex items-center px-4 py-2 border transition-all shadow-sm ${errorMsg ? 'border-red-500 ring-1 ring-red-500' : 'border-transparent focus-within:border-slate-300'}`}>
                    <input 
                        ref={inputRef}
                        type="text" 
                        className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400 max-h-32 py-1.5" 
                        placeholder="Type a message..." 
                        value={message} 
                        onChange={(e) => {
                            setMessage(e.target.value);
                            if(errorMsg) setErrorMsg(""); // Clear error when user types
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
                    />
                    <button className="text-slate-400 hover:text-slate-600 ml-2 p-1 rounded-full hover:bg-slate-100 transition-colors">
                       <Paperclip className="w-5 h-5" />
                    </button>
                </div>
                
                <button 
                    onClick={() => handleSend()}
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