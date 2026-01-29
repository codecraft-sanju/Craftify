import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, Search, X, Star, ArrowRight, Heart, 
  Send, Image as ImageIcon, Check, Trash2, 
  Sparkles, MessageSquare, Paperclip, User, ShieldCheck,
  LayoutDashboard, Users, Settings, Bell, Package, 
  ChevronRight, MoreVertical, FileText, Menu, LogOut,
  Truck, CheckCircle, Clock, Filter, Plus
} from 'lucide-react';

// --- UTILS & MOCK DATA ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const CATEGORIES = ["All", "Office", "Apparel", "Gifting", "Tech", "Accessories"];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Matte Black Metal Pen",
    category: "Office",
    price: 499,
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    stock: true,
    activeRequests: 12
  },
  {
    id: 2,
    name: "Heavyweight Oversized Tee",
    category: "Apparel",
    price: 899,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    stock: true,
    activeRequests: 24
  },
  {
    id: 3,
    name: "Eco-Canvas Tote",
    category: "Apparel",
    price: 349,
    image: "https://images.unsplash.com/photo-1597484662317-9bd7bdda2907?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    stock: true,
    activeRequests: 5
  },
  {
    id: 4,
    name: "Neon Desk Sign",
    category: "Tech",
    price: 2499,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=600",
    rating: 5.0,
    stock: false,
    activeRequests: 8
  },
  {
    id: 5,
    name: "Custom Water Bottle",
    category: "Gifting",
    price: 799,
    image: "https://images.unsplash.com/photo-1602143407151-011141950038?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    stock: true,
    activeRequests: 15
  },
  {
    id: 6,
    name: "Leather Journal",
    category: "Office",
    price: 1299,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    stock: true,
    activeRequests: 7
  }
];

// --- HOOKS ---

// Hook to persist state in localStorage (Simulates a database)
const useStickyState = (defaultValue, key) => {
  const [value, setValue] = useState(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

// --- SHARED COMPONENTS ---

const Toast = ({ message, type = 'success', onClose }) => (
  <div className="fixed top-24 right-4 z-[100] animate-slide-in-right">
    <div className={`bg-white/90 backdrop-blur-md border-l-4 ${type === 'success' ? 'border-green-500' : 'border-indigo-600'} pl-4 pr-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 min-w-[300px]`}>
      <div className={`${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'} rounded-full p-2`}>
        {type === 'success' ? <Check className="w-4 h-4" /> : <Package className="w-4 h-4" />}
      </div>
      <div>
        <h4 className="font-bold text-sm text-gray-900">{type === 'success' ? 'Success' : 'Update'}</h4>
        <p className="text-xs text-gray-500 font-medium">{message}</p>
      </div>
      <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-900 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const Badge = ({ children, color = "indigo" }) => {
  const colors = {
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    green: "bg-green-100 text-green-700 border-green-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    red: "bg-red-100 text-red-700 border-red-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};

// --- ADMIN PANEL ---

const AdminDashboard = ({ onExit, globalChats, setGlobalChats }) => {
  const [activeTab, setActiveTab] = useState('requests');
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const selectedChat = globalChats.find(c => c.id === selectedChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedChat) return;
    
    const newMsg = { id: Date.now(), text: replyText, sender: 'admin', timestamp: new Date() };
    const updatedChats = globalChats.map(chat => {
      if (chat.id === selectedChat.id) {
        return { 
          ...chat, 
          messages: [...chat.messages, newMsg],
          lastMessage: `You: ${replyText}`,
          isReadByAdmin: true
        };
      }
      return chat;
    });

    setGlobalChats(updatedChats);
    setReplyText("");
  };

  const handleStatusChange = (status) => {
    if (!selectedChat) return;
    const updatedChats = globalChats.map(chat => 
      chat.id === selectedChat.id ? { ...chat, status: status } : chat
    );
    setGlobalChats(updatedChats);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] text-white flex flex-col transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800 justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">A</div>
            <span className="font-bold text-lg tracking-tight">Craftify Admin</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveTab('requests')} className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800'}`}>
            <MessageSquare className="w-5 h-5" />
            <span className="ml-3 font-medium">Messages</span>
            {globalChats.filter(c => !c.isReadByAdmin).length > 0 && 
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {globalChats.filter(c => !c.isReadByAdmin).length}
              </span>
            }
          </button>
          <button className="w-full flex items-center p-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
            <Package className="w-5 h-5" />
            <span className="ml-3 font-medium">Orders</span>
          </button>
          <button className="w-full flex items-center p-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
            <Users className="w-5 h-5" />
            <span className="ml-3 font-medium">Customers</span>
          </button>
          <button className="w-full flex items-center p-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-all">
            <Settings className="w-5 h-5" />
            <span className="ml-3 font-medium">Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={onExit} className="w-full flex items-center p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="ml-3 font-medium">Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-100">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex justify-between items-center px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-800">Customization Hub</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 relative hover:bg-slate-50 rounded-full transition-colors">
              <Bell className="w-6 h-6 text-slate-400" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900">Admin User</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 p-4 lg:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
          
          {/* Chat List */}
          <div className={`${selectedChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-col h-full`}>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="text" placeholder="Search requests..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {globalChats.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                    <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm">No active requests yet.</p>
                 </div>
              ) : (
                globalChats.map(chat => (
                  <div 
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 group relative ${selectedChatId === chat.id ? 'bg-indigo-50/60' : ''}`}
                  >
                    {!chat.isReadByAdmin && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full"></div>}
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm ${!chat.isReadByAdmin ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{chat.userName || 'Guest User'}</h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {new Date(chat.messages[chat.messages.length - 1]?.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className={`text-xs mb-2 truncate pr-4 ${!chat.isReadByAdmin ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                      {chat.lastMessage}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {chat.productName}
                      </span>
                      {chat.status === 'pending' && <Badge color="yellow">Pending</Badge>}
                      {chat.status === 'approved' && <Badge color="indigo">Approved</Badge>}
                      {chat.status === 'shipped' && <Badge color="green">Shipped</Badge>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Chat Area */}
          <div className={`${!selectedChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-slate-200 flex-col overflow-hidden relative h-full`}>
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedChatId(null)} className="lg:hidden p-2 hover:bg-white rounded-full text-slate-500">
                        <ArrowRight className="w-5 h-5 rotate-180" />
                    </button>
                    <div>
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        {selectedChat.userName || 'Guest User'}
                        <span className="text-[10px] font-normal text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">ID: {selectedChat.id.slice(-4)}</span>
                      </h3>
                      <p className="text-xs text-slate-500">Interested in <span className="text-indigo-600 font-medium">{selectedChat.productName}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedChat.status === 'pending' && (
                        <button onClick={() => handleStatusChange('approved')} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow hover:bg-indigo-700 transition-colors flex items-center gap-1">
                            <Check className="w-3 h-3" /> Approve Design
                        </button>
                    )}
                     {selectedChat.status === 'approved' && (
                        <button onClick={() => handleStatusChange('shipped')} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg shadow hover:bg-green-700 transition-colors flex items-center gap-1">
                            <Truck className="w-3 h-3" /> Mark Shipped
                        </button>
                    )}
                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F9FC]">
                  {selectedChat.messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl text-sm shadow-sm ${msg.sender === 'admin' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'}`}>
                        {msg.type === 'image' && (
                          <div className="mb-3 rounded-lg overflow-hidden border border-black/10">
                             <img src={msg.imageUrl} alt="upload" className="w-full max-h-48 object-cover" />
                          </div>
                        )}
                        <p className="leading-relaxed">{msg.text}</p>
                        <div className={`text-[10px] mt-2 flex items-center justify-end gap-1 ${msg.sender === 'admin' ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          {msg.sender === 'admin' && <CheckCircle className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                  <div className="flex gap-2 items-end">
                    <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-500 transition-all">
                        <input 
                            type="text" 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                            placeholder="Type a reply..."
                            className="flex-1 bg-transparent border-none outline-none text-sm py-3"
                        />
                    </div>
                    <button 
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className={`p-3 rounded-xl transition-all shadow-sm ${replyText.trim() ? 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <MessageSquare className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-bold text-lg">No Chat Selected</h3>
                <p className="text-sm max-w-xs text-center mt-2">Select a customer request from the sidebar to view details and reply.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

// --- STOREFRONT COMPONENTS ---

const CartDrawer = ({ isOpen, onClose, cart, setCart }) => {
    const total = cart.reduce((acc, item) => acc + item.price, 0);

    const removeItem = (id) => {
        setCart(cart.filter(item => item.cartId !== id));
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white z-[75] shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-indigo-600" /> Your Cart
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                                <p className="font-medium">Your cart is empty</p>
                                <button onClick={onClose} className="mt-4 text-indigo-600 font-bold text-sm hover:underline">Start Shopping</button>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.cartId} className="flex gap-4 animate-fade-in-up">
                                    <div className="w-20 h-24 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{item.name}</h4>
                                                <button onClick={() => removeItem(item.cartId)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{item.customRequest ? 'Customized' : 'Standard'}</p>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-2">
                                                <div className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">Qty: 1</div>
                                            </div>
                                            <span className="font-bold text-indigo-600">₹{item.price}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50/30">
                        <div className="flex justify-between mb-4 text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-bold text-slate-900">₹{total}</span>
                        </div>
                        <div className="flex justify-between mb-6 text-sm">
                            <span className="text-slate-500">Shipping</span>
                            <span className="text-green-600 font-bold">Free</span>
                        </div>
                        <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-600 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={cart.length === 0}>
                            Checkout <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const ConsultationModal = ({ product, onClose, onAddToCart, globalChats, setGlobalChats }) => {
  // Find existing chat or create temporary state
  const existingChat = globalChats.find(c => c.productId === product.id && c.userName === 'You'); // Simulating 'You' as logged in user
  
  const [messages, setMessages] = useState(existingChat ? existingChat.messages : [
    { 
      id: 1, 
      text: `Hi! I'm the Design Expert for the ${product.name}. Upload your logo or tell me what text you need.`, 
      sender: 'admin',
      timestamp: new Date()
    }
  ]);
  
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateGlobalChat = (newMessages, lastMsgText) => {
      const chatId = existingChat ? existingChat.id : generateId();
      const chatData = {
          id: chatId,
          productId: product.id,
          productName: product.name,
          userName: 'You',
          status: existingChat ? existingChat.status : 'pending',
          lastMessage: lastMsgText,
          messages: newMessages,
          isReadByAdmin: false
      };

      if (existingChat) {
          setGlobalChats(globalChats.map(c => c.id === chatId ? chatData : c));
      } else {
          setGlobalChats([...globalChats, chatData]);
      }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      type: 'text',
      timestamp: new Date()
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputText("");
    updateGlobalChat(updatedMessages, inputText);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file); // Create local preview URL
      const newMsg = {
        id: Date.now(),
        text: `Sent an image: ${file.name}`,
        imageUrl: fakeUrl,
        sender: 'user',
        type: 'image',
        timestamp: new Date()
      };
      const updatedMessages = [...messages, newMsg];
      setMessages(updatedMessages);
      updateGlobalChat(updatedMessages, "Sent an image");
    }
  };

  const isApproved = existingChat?.status === 'approved';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full h-[90vh] md:h-[85vh] flex flex-col md:flex-row overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-white/50 backdrop-blur rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
          <X className="w-5 h-5" />
        </button>

        {/* LEFT: Product Context */}
        <div className="hidden md:flex w-5/12 bg-slate-50 p-8 flex-col justify-between border-r border-slate-100">
           <div>
             <div className="flex items-center gap-2 mb-4">
                 <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                   Live Customization
                 </span>
                 {isApproved && <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1"><Check className="w-3 h-3"/> Approved</span>}
             </div>
             
             <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{product.name}</h2>
             <p className="text-slate-500 text-sm mb-6">Chat with our expert to finalize your design before purchase.</p>
             
             <div className="relative group rounded-2xl overflow-hidden shadow-lg border border-white bg-white">
               <img src={product.image} className="w-full object-cover aspect-square" alt="preview" />
             </div>
           </div>
           
           <div className="space-y-3">
             <div className="flex items-center gap-3 text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
               <ShieldCheck className="w-5 h-5 text-green-500" />
               <span>Quality check included</span>
             </div>
           </div>
        </div>

        {/* RIGHT: Chat Interface */}
        <div className="w-full md:w-7/12 flex flex-col bg-white">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 shadow-sm z-10">
            <div className="relative">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Design Expert</h3>
              <p className="text-xs text-slate-500">Typical reply: &lt; 2 mins</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8F9FC]">
             {messages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] space-y-1`}>
                   <div 
                     className={`px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                       msg.sender === 'user' 
                         ? 'bg-indigo-600 text-white rounded-2xl rounded-br-none shadow-indigo-200' 
                         : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-bl-none'
                     }`}
                   >
                     {msg.type === 'image' && (
                       <div className="mb-2 rounded-lg overflow-hidden">
                          <img src={msg.imageUrl} alt="uploaded" className="max-w-full h-auto rounded-lg" />
                       </div>
                     )}
                     {msg.text}
                   </div>
                   <p className={`text-[10px] ${msg.sender === 'user' ? 'text-right' : 'text-left'} text-slate-400`}>
                     {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </p>
                 </div>
               </div>
             ))}
             <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
             {/* Action Bar */}
             {messages.length > 2 && (
               <div className="mb-4 flex justify-center animate-fade-in-up">
                 <button 
                   onClick={() => onAddToCart({ ...product, customRequest: "Chat Customization", cartId: generateId() })}
                   className={`group relative pl-5 pr-12 py-3 rounded-xl font-bold transition-all shadow-xl overflow-hidden ${isApproved ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-900 hover:bg-indigo-600 text-white'}`}
                 >
                   <span className="relative z-10 flex items-center gap-2">
                     {isApproved ? 'Design Approved! Add to Cart' : `Looks Good? Add to Cart — ₹${product.price}`}
                   </span>
                   <div className="absolute right-0 top-0 h-full w-10 bg-white/10 flex items-center justify-center group-hover:w-12 transition-all">
                     <ArrowRight className="w-4 h-4" />
                   </div>
                 </button>
               </div>
             )}

            <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                title="Upload Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              
              <textarea 
                rows="1"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                placeholder="Type details..."
                className="flex-1 bg-transparent border-none outline-none text-slate-900 text-sm py-3 resize-none max-h-24 placeholder:text-slate-400"
              />
              
              <button 
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className={`p-3 rounded-xl transition-all shadow-sm ${inputText.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StoreFront = ({ onSwitchToAdmin, globalChats, setGlobalChats }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useStickyState([], "craftify_cart");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [consultationProduct, setConsultationProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const filteredProducts = activeCategory === "All" ? INITIAL_PRODUCTS : INITIAL_PRODUCTS.filter(p => p.category === activeCategory);

  const addToCart = (item) => {
    setCart([...cart, item]);
    setConsultationProduct(null);
    setToast({ message: `Added ${item.name} to cart`, type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
               <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Craftify.</span>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2.5 w-96 border border-transparent focus-within:border-indigo-300 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-indigo-100/50 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search custom gifts..." className="bg-transparent border-none outline-none ml-3 w-full text-sm font-medium text-slate-600 placeholder:text-slate-400" />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
             {/* Mobile Menu Toggle */}
             <button onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} className="md:hidden p-2 text-slate-600">
                <Menu className="w-6 h-6" />
             </button>

            <button 
              onClick={onSwitchToAdmin}
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-full hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
            >
              <LayoutDashboard className="w-3 h-3" /> Admin View
            </button>
            <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>
            <button className="relative group p-2 hover:bg-slate-100 rounded-full transition-colors" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag className="w-6 h-6 text-slate-700 group-hover:text-indigo-600 transition-colors" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-scale-in">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Nav Dropdown */}
        {isMobileNavOpen && (
             <div className="md:hidden border-t border-slate-100 bg-white p-4 absolute w-full shadow-xl animate-slide-in-top">
                 <input type="text" placeholder="Search..." className="w-full p-3 bg-slate-50 rounded-xl text-sm mb-4 outline-none" />
                 <button onClick={onSwitchToAdmin} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                     <LayoutDashboard className="w-4 h-4" /> Go to Admin
                 </button>
             </div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-white pt-20 pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-down">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Live Design Consultations
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.9]">
            Design.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-300% animate-gradient">
              Consult.
            </span> Create.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium">
            Don't just "Add to Cart". Chat with our real designers, upload your vision, and get it approved instantly.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-indigo-600 hover:scale-105 transition-all shadow-xl shadow-slate-200 flex items-center gap-2">
              Start Browsing <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Category Filter */}
      <div className="sticky top-20 z-30 bg-[#F8F9FC]/90 backdrop-blur-md py-6 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2">
           <div className="bg-white p-2 rounded-full shadow-sm border border-slate-200 hidden md:block">
               <Filter className="w-4 h-4 text-slate-500" />
           </div>
           <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 w-full">
            {CATEGORIES.map(cat => (
                <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                    activeCategory === cat 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-300 transform scale-105' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                >
                {cat}
                </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Product Grid */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] transition-all duration-500 hover:-translate-y-2 relative flex flex-col">
              
              <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-900 shadow-sm flex items-center gap-1">
                   <Users className="w-3 h-3 text-indigo-500" /> {product.activeRequests} chatting
                </div>
                {!product.stock && (
                     <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                         <span className="bg-black text-white px-4 py-2 rounded-full font-bold text-sm">Out of Stock</span>
                     </div>
                )}
                
                {/* Floating Action Button */}
                {product.stock && (
                    <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                    <button 
                        onClick={() => setConsultationProduct(product)}
                        className="w-full py-4 bg-white/90 backdrop-blur-md text-slate-900 rounded-2xl font-bold shadow-lg hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-white/50"
                    >
                        <MessageSquare className="w-4 h-4" /> Discuss Design
                    </button>
                    </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2">{product.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mb-4">{product.category}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                  <span className="text-2xl font-black text-slate-900">₹{product.price}</span>
                  <button onClick={() => addToCart({...product, cartId: generateId()})} className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 5. Footer */}
      <footer className="bg-slate-900 text-white py-20 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-8 opacity-50">
            <Sparkles className="w-6 h-6" />
            <span className="text-2xl font-bold">Craftify.</span>
          </div>
          <p className="text-slate-400 max-w-md mx-auto mb-10">The premium destination for verified custom merchandise. Designed by you, approved by experts.</p>
          <div className="flex justify-center gap-8 text-slate-500 text-sm font-medium">
            <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
            <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
          </div>
          <div className="mt-12 text-xs text-slate-700">
              © 2024 Craftify Inc. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Overlays */}
      {consultationProduct && (
        <ConsultationModal 
          product={consultationProduct} 
          onClose={() => setConsultationProduct(null)}
          onAddToCart={addToCart}
          globalChats={globalChats}
          setGlobalChats={setGlobalChats}
        />
      )}

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

// --- MAIN CONTROLLER ---

export default function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Lifted state to handle "Database" sync between views
  const [globalChats, setGlobalChats] = useStickyState([], "craftify_chats");

  return (
    <>
      {isAdminMode ? (
        <AdminDashboard 
            onExit={() => setIsAdminMode(false)} 
            globalChats={globalChats}
            setGlobalChats={setGlobalChats}
        />
      ) : (
        <StoreFront 
            onSwitchToAdmin={() => setIsAdminMode(true)} 
            globalChats={globalChats}
            setGlobalChats={setGlobalChats}
        />
      )}
    </>
  );
}