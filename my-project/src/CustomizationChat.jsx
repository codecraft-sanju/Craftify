// src/CustomizationChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, RefreshCcw, MessageSquare } from 'lucide-react';

const CustomizationChat = ({ isOpen, onClose, product, currentUser, socket, API_URL }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const chatEndRef = useRef(null);

  // Initialize Chat Session
  useEffect(() => {
    if (isOpen && currentUser && product) {
        setLoading(true);
        // CREDENTIALS: 'include' is a MUST for cookies
        fetch(`${API_URL}/api/chats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', 
            body: JSON.stringify({ productId: product._id })
        })
        .then(res => res.json())
        .then(data => {
            setChatId(data._id);
            setMessages(data.messages || []);
            setLoading(false);
            if(socket) socket.emit("join_chat", data._id); // Join Room
        })
        .catch(err => {
            console.error("Chat Error:", err);
            setLoading(false);
        });
    }
  }, [isOpen, product, currentUser, API_URL, socket]);

  // Listen for Incoming Messages
  useEffect(() => {
      if(!socket) return;
      
      const handleMessageReceived = (newMessageReceived) => {
          if (chatId && chatId === newMessageReceived.chatId) {
             setMessages(prev => [...prev, newMessageReceived.message]);
             scrollToBottom();
          }
      };

      socket.on("new_message_received", handleMessageReceived);
      
      return () => { 
          socket.off("new_message_received", handleMessageReceived); 
      }
  }, [socket, chatId]);

  const scrollToBottom = () => {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSend = async () => {
    if (!message.trim() || !chatId) return;
    try {
        // Optimistic Update
        const tempMsg = { text: message, sender: { _id: currentUser._id }, createdAt: new Date() };
        setMessages(prev => [...prev, tempMsg]);
        const msgToSend = message;
        setMessage("");
        scrollToBottom();
        
        await fetch(`${API_URL}/api/chats/message`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ chatId: chatId, content: msgToSend, type: 'text' })
        });
    } catch (error) { console.error("Send Error", error); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-in">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg p-1 border border-slate-200">
                  <img src={product.image} className="w-full h-full object-cover rounded" alt=""/>
              </div>
              <div>
                  <h3 className="font-bold text-slate-900 text-sm">Chat with Seller</h3>
                  <p className="text-xs text-slate-500">Re: {product.name}</p>
              </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <RefreshCcw className="w-6 h-6 animate-spin mb-2"/>
                  <p className="text-xs">Connecting to seller...</p>
              </div>
          ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <MessageSquare className="w-10 h-10 mb-2 opacity-50"/>
                  <p className="text-sm">Start the conversation!</p>
                  <p className="text-xs">Ask about customization, stock, or shipping.</p>
              </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
              return (
                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                    <p>{msg.text}</p>
                    <span className={`text-[9px] block mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
                type="text" 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                placeholder="Type your message..." 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
            />
            <button onClick={handleSend} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
                <Send className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizationChat;