import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Image as ImageIcon, 
  MapPin, 
  LogOut, 
  Loader2, 
  CheckCircle2, 
  Search,
  MessageSquare,
  History,
  Mic,
  MicOff,
  Menu,
  X,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { mockAuth, mockDb, User, Complaint } from '../lib/mockStore';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useSettings } from '../contexts/SettingsContext';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  image?: string;
  timestamp: Date;
  status?: 'processing' | 'completed' | 'error';
  complaintData?: any;
}

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Complaint[]>([]);
  const [user, setUser] = useState<User | null>(mockAuth.getCurrentUser());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  
  const { theme, toggleTheme, language, setLanguage, t } = useSettings();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isListening, transcript, startListening, stopListening, hasSupport } = useSpeechToText();

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processIssue = async (imgBase64: string, loc: string) => {
    const base64Clean = imgBase64.split(',')[1];
    const response = await fetch('/api/process-issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Clean, locationName: loc }),
    });
    if (!response.ok) throw new Error('AI analysis failed');
    return await response.json();
  };

  const handleSend = async () => {
    if (!input && !selectedImage) return;
    if (!user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input || 'Photo uploaded',
      image: selectedImage || undefined,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      if (selectedImage) {
        const agentThinking: Message = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: t('analyzing'),
          timestamp: new Date(),
          status: 'processing',
        };
        setMessages(prev => [...prev, agentThinking]);

        const aiResult = await processIssue(selectedImage, locationName || input);
        const trackingId = 'AMC-' + Math.random().toString(36).substring(2, 9).toUpperCase();
        const complaint = {
          userId: user.uid,
          issueType: aiResult.issueType,
          description: aiResult.description,
          ward: aiResult.ward,
          department: aiResult.department,
          status: 'Pending',
          trackingId: trackingId,
          createdAt: new Date().toISOString(),
          imageUrl: selectedImage,
          locationName: locationName || input,
        };

        mockDb.addComplaint(complaint);

        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: `${t('identified').replace('{issueType}', aiResult.issueType).replace('{ward}', aiResult.ward)}\n\n${t('filing').replace('{department}', aiResult.department)}\n${t('trackingId').replace('{trackingId}', trackingId)}`,
            status: 'completed',
            complaintData: complaint,
          };
          return updated;
        });
      } else if (input.toLowerCase().includes('status')) {
        const userComplaints = mockDb.getComplaints(user.uid);
        const latest = userComplaints[0];
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: latest 
            ? `${t('latestStatus').replace('{trackingId}', latest.trackingId).replace('{status}', latest.status)} \n${t('handledBy').replace('{department}', latest.department)}`
            : t('noComplaints'),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, agentResponse]);
      } else {
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: "I'm ready. Please upload a photo of the issue or describe it.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, agentResponse]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'agent',
        content: 'Error processing request.',
        timestamp: new Date(),
        status: 'error',
      }]);
    } finally {
      setIsProcessing(false);
      setSelectedImage(null);
      setLocationName('');
    }
  };

  const fetchHistory = async () => {
    if (user) {
      setHistory(mockDb.getComplaints(user.uid));
      setShowHistory(true);
    }
  };

  return (
    <div className={`flex h-screen bg-transparent relative z-10 transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Sliding Sidebar */}
      <motion.div 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed md:relative z-50 h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="w-[280px] flex flex-col h-full">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 font-black text-slate-900 dark:text-white text-xl uppercase tracking-tighter">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              {t('appName')}
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400"><X /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 mt-4">
            <button 
              onClick={() => { setMessages([]); setIsSidebarOpen(false); }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm text-slate-600 dark:text-slate-300 font-bold group"
            >
              <MessageSquare className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              {t('newReport')}
            </button>
            <button 
              onClick={() => { fetchHistory(); setIsSidebarOpen(false); }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm text-slate-600 dark:text-slate-300 font-bold group"
            >
              <History className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
              {t('myComplaints')}
            </button>
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-lg font-black text-emerald-600 dark:text-emerald-400 uppercase">
                {user?.email?.[0]}
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user?.email}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Authenticated</p>
              </div>
            </div>
            <button 
              onClick={() => mockAuth.signOut()}
              className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm font-black group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              {t('signOut')}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Top Header - Image Style */}
        <div className="p-4 md:p-6 flex items-center justify-between z-20 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-emerald-500 transition-all shadow-sm border border-slate-100 dark:border-slate-800"
              title="Menu"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center bg-white/80 dark:bg-slate-800/80 rounded-2xl p-1.5 shadow-sm border border-slate-100 dark:border-slate-700 backdrop-blur-md">
              {(['en', 'hi', 'gu'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all ${
                    language === lang 
                      ? 'bg-emerald-500 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="md:hidden flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
               <CheckCircle2 className="w-4 h-4 text-emerald-500" />
               {t('appName')}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2.5 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 transition-all shadow-sm border border-slate-100 dark:border-slate-700 backdrop-blur-md"
            >
              {theme === 'light' ? <Moon size={20} className="fill-slate-600" /> : <Sun size={20} className="fill-yellow-400 text-yellow-400" />}
            </button>
            <button onClick={() => mockAuth.signOut()} className="md:hidden p-2.5 bg-red-50 text-red-500 rounded-2xl shadow-sm border border-red-100">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Dynamic Center Card - Inspired by the reference image */}
        <div className="flex-1 relative overflow-y-auto custom-scrollbar flex flex-col">
          {messages.length === 0 ? (
            <div className="min-h-full flex items-center justify-center p-4 md:p-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-5xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[32px] md:rounded-[40px] p-8 md:p-16 lg:p-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white dark:border-slate-800 relative overflow-hidden"
              >
                {/* Subtle Skyline Backdrop inside card like the image */}
                <div 
                  className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none grayscale"
                  style={{ 
                    backgroundImage: `url('/src/assets/images/city_skyline_faded_1792847565684.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />

                <div className="relative z-10">
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-black text-[#2e2b61] dark:text-white leading-tight mb-8 md:mb-12 tracking-tighter"
                  >
                    The Evolution of<br />Public Awareness
                  </motion.h1>
                  
                  <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-8 md:mb-10 font-bold ml-1">{t('howCanHelp')}</p>
                  
                  {/* Styled Input Box matching Image */}
                  <div className="relative group max-w-3xl">
                    <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl -z-10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
                    
                    <div className="relative bg-white dark:bg-slate-900 rounded-none border-[2px] md:border-[3px] border-slate-300 dark:border-slate-700 p-1 flex items-center gap-2 transition-all duration-300 focus-within:border-emerald-500">
                      <div className="flex items-center gap-1 pl-1 md:pl-2">
                         <button onClick={() => fileInputRef.current?.click()} className="p-2 md:p-3 text-slate-400 hover:text-emerald-500 transition-all"><ImageIcon size={24} /></button>
                         {hasSupport && (
                            <button 
                              onClick={isListening ? stopListening : startListening}
                              className={`p-2 md:p-3 transition-all ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-emerald-500'}`}
                            >
                              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>
                         )}
                      </div>
                      
                      <textarea 
                        placeholder={t('placeholder')} 
                        className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 md:py-4 text-base md:text-xl text-slate-900 dark:text-white placeholder:text-slate-300 font-bold h-auto min-h-[48px] md:min-h-[64px]"
                        rows={1}
                        value={input}
                        onChange={(e) => {
                           setInput(e.target.value);
                           e.target.style.height = 'auto';
                           e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      />
                      
                      <button onClick={handleSend} className="p-3 md:p-5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                        <Search size={32} strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  {/* Suggestions as pill badges at the bottom of the card */}
                  <div className="flex flex-wrap gap-2 md:gap-3 mt-8 md:mt-10 text-[10px] md:text-xs">
                    {[t('reportPothole'), t('garbageCollection'), t('streetLight')].map((s, i) => (
                      <button 
                        key={i} 
                        onClick={() => setInput(s)}
                        className="px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest border border-slate-100 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-12 space-y-8 pb-32">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[70%] rounded-[32px] p-6 md:p-8 shadow-2xl ${
                      msg.type === 'user' 
                        ? 'bg-[#2e2b61] text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-tl-none'
                    }`}>
                      {msg.image && <img src={msg.image} alt="" className="w-full max-h-80 object-cover rounded-2xl mb-6 shadow-lg border-2 border-white/10" />}
                      <div className="whitespace-pre-wrap text-lg leading-relaxed font-bold tracking-tight">{msg.content}</div>
                      {msg.status === 'processing' && (
                        <div className="flex items-center gap-3 mt-6 text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
                          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                          {t('analyzing')}
                        </div>
                      )}
                      <div className={`text-[10px] mt-6 font-black uppercase tracking-[0.2em] opacity-40 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Bottom Floating Input when messaging */}
          {messages.length > 0 && (
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white via-white/80 dark:from-slate-950 dark:via-slate-950/80 to-transparent">
               <div className="max-w-4xl mx-auto flex items-end gap-3 bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-2xl border border-slate-100 dark:border-slate-800">
                  <button onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-emerald-500"><ImageIcon size={24} /></button>
                  <textarea 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('placeholder')}
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 text-slate-900 dark:text-white font-bold"
                    rows={1}
                  />
                  <button onClick={handleSend} className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"><Send size={24} /></button>
               </div>
            </div>
          )}
        </div>
      </div>


      {/* Invisible inputs */}
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      {/* History Modal - Same enhanced style */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="bg-white dark:bg-slate-950 rounded-[40px] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{t('myComplaints')}</h3>
                 <button onClick={() => setShowHistory(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white dark:hover:bg-slate-800 text-slate-400 transition-colors"><X size={28} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center py-20 opacity-20"><History size={80} className="mx-auto" /></div>
                ) : (
                  history.map((item) => (
                    <motion.div 
                      key={item.id} 
                      layout
                      onClick={() => setSelectedComplaintId(selectedComplaintId === item.id ? null : item.id)}
                      className={`p-6 rounded-[32px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col gap-4 hover:shadow-xl transition-all cursor-pointer ${selectedComplaintId === item.id ? 'ring-2 ring-emerald-500 shadow-xl' : ''}`}
                    >
                      <div className="flex items-start gap-6">
                        {item.imageUrl && <img src={item.imageUrl} alt="" className="w-24 h-24 object-cover rounded-2xl" />}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{item.trackingId}</span>
                            <span className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase ${item.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.status}</span>
                          </div>
                          <p className="text-xl font-black text-slate-900 dark:text-white mb-2">{item.issueType}</p>
                          <p className="text-sm text-slate-400 font-medium line-clamp-1">{item.description}</p>
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedComplaintId === item.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-2">
                              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                                 <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                    <CheckCircle2 size={16} />
                                    {t('statusByWard').replace('{ward}', item.ward)}
                                 </p>
                                 <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1 ml-6">
                                    {item.department} department is actively managing this issue.
                                 </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex items-center gap-3 mt-auto pt-2 text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                           <MapPin size={10} className="text-blue-500" />
                           {item.ward}
                        </div>
                        <span>•</span>
                        <div className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                           {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
