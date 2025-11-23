import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, GraduationCap, StopCircle, BookOpen, Paperclip, X, FileText, Image as ImageIcon, Palette, Globe, PenTool, BarChart, Briefcase, FileSpreadsheet, Mail, Languages, Book, Download, Share2, Monitor, Code, Copy, Maximize2, ExternalLink, ArrowRight, Shield, User, Lock, ChevronRight, Heart, Brain, CheckSquare, Bot, MessageCircle } from 'lucide-react';
import { Message, ChatState, Note, Attachment } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import MessageBubble from './MessageBubble';
import Notebook from './Notebook';
import AIAvatar, { AvatarState } from './AIAvatar';

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  role: 'model',
  text: "Hello! I'm **Baosmart**, your AI Companion for School, Work & Wellness. 🎓💼❤️\n\n*   **Students**: Math, Literature, English & Exam Prep.\n*   **Office**: Excel, Emails, Reports & Data.\n*   **Well-being**: Feeling stressed? I can listen and help you **Check Your Pressure** levels.\n\n**Tip:** Highlight text to Explain, or just say 'I'm tired' to chat.\n\nHow can I help you today?",
  timestamp: Date.now(),
};

const SUGGESTIONS = [
  {
    icon: <Heart size={20} className="text-rose-500" />,
    title: "Stress Check",
    subtitle: "Test your pressure level",
    prompt: "I'm feeling overwhelmed. Can you do a 'Pressure Test' to check my stress level and give me advice?"
  },
  {
    icon: <Languages size={20} className="text-orange-500" />,
    title: "English Tutor",
    subtitle: "Fix grammar & explain",
    prompt: "Please check my grammar in this sentence and explain the errors: 'I has went to the store yesterday.'"
  },
  {
    icon: <Book size={20} className="text-pink-600" />,
    title: "Literature Analysis",
    subtitle: "Analyze poems & stories",
    prompt: "Analyze the artistic devices and meaning of the poem 'Truyện Kiều' (excerpt) or a poem of your choice."
  },
  {
    icon: <Brain size={20} className="text-purple-500" />,
    title: "Psychology",
    subtitle: "Understand emotions",
    prompt: "Explain the concept of 'Burnout' from a psychological perspective and how to prevent it."
  },
  {
    icon: <FileSpreadsheet size={20} className="text-green-600" />,
    title: "Excel Formula",
    subtitle: "VLOOKUP & Data",
    prompt: "I need an Excel formula to look up a value in Sheet1 Column A and return the value in Column B, but if it's empty, show 'Not Found'."
  },
  {
    icon: <Globe size={20} className="text-cyan-500" />,
    title: "Search & Explore",
    subtitle: "Real-time info",
    prompt: "Search for the latest scholarship opportunities for Vietnamese students in 2024/2025."
  }
];

const DEV_PASSWORD = "baosmartdev";
const TERMS_URL = "https://github.com/baozhubcommunity-riel/baosmart.AI-rules/blob/main/README.md";

type AuthStage = 'intro' | 'login-dev' | 'authorized';

const ChatInterface: React.FC = () => {
  // Auth State
  const [authStage, setAuthStage] = useState<AuthStage>('intro');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [chatState, setChatState] = useState<ChatState>({
    messages: [INITIAL_MESSAGE],
    isLoading: false,
    error: null,
  });
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  
  // View Mode State
  const [viewMode, setViewMode] = useState<'dev' | 'client'>('dev');
  const [clientStarted, setClientStarted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Notes State
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('baosmart_notes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  useEffect(() => {
    localStorage.setItem('baosmart_notes', JSON.stringify(notes));
  }, [notes]);

  const handleSendMessage = async (text: string = inputText) => {
    if ((!text.trim() && attachments.length === 0) || chatState.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      attachments: attachments,
      timestamp: Date.now(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));
    setInputText('');
    setAttachments([]);
    setAvatarState('thinking');

    try {
      // Small delay for UI smoothness
      await new Promise(resolve => setTimeout(resolve, 600));

      const response = await sendMessageToGemini(chatState.messages, text, userMessage.attachments);
      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        groundingMetadata: response.groundingMetadata,
        timestamp: Date.now(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, modelMessage],
        isLoading: false,
      }));
      setAvatarState('success');
      setTimeout(() => setAvatarState('idle'), 3000);

    } catch (error) {
      console.error(error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: "Failed to send message. Please try again."
      }));
      setAvatarState('error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
           const base64String = (event.target.result as string).split(',')[1];
           const newAttachment: Attachment = {
             id: Date.now().toString(),
             mimeType: file.type,
             fileName: file.name,
             data: base64String
           };
           setAttachments(prev => [...prev, newAttachment]);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const addNote = (text: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: text,
      timestamp: Date.now()
    };
    setNotes(prev => [newNote, ...prev]);
    setIsNotebookOpen(true);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // Auth Handlers
  const handleLogin = () => {
    if (passwordInput === DEV_PASSWORD) {
      setAuthStage('authorized');
      setViewMode('dev');
    } else {
      setLoginError('Incorrect password');
    }
  };

  const startClientMode = () => {
    if (termsAccepted) {
      setAuthStage('authorized');
      setViewMode('client');
      setClientStarted(true);
    }
  };

  // Render Logic
  if (authStage === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
           <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
             <Bot size={40} className="text-indigo-600" />
           </div>
           <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome to Baosmart</h1>
           <p className="text-slate-500 mb-8">Your AI Companion for Education & Work</p>
           
           <div className="flex flex-col gap-3">
             <div className="flex items-start gap-2 text-left bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 mb-4">
               <input 
                 type="checkbox" 
                 id="terms" 
                 checked={termsAccepted} 
                 onChange={e => setTermsAccepted(e.target.checked)}
                 className="mt-0.5"
               />
               <label htmlFor="terms">
                 I agree to the <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Terms & Privacy Policy</a>.
               </label>
             </div>

             <button 
               onClick={startClientMode}
               disabled={!termsAccepted}
               className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
             >
               Start Chatting
               <ArrowRight size={18} />
             </button>
             
             <button 
               onClick={() => setAuthStage('login-dev')}
               className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium transition-colors text-sm"
             >
               Developer Login
             </button>
           </div>
        </div>
      </div>
    );
  }

  if (authStage === 'login-dev') {
     return (
       <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6">
         <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center relative">
           <button onClick={() => setAuthStage('intro')} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600">
             <ArrowRight className="rotate-180" size={20} />
           </button>
           <h2 className="text-xl font-bold text-slate-800 mb-6">Developer Access</h2>
           <input
             type="password"
             value={passwordInput}
             onChange={e => { setPasswordInput(e.target.value); setLoginError(''); }}
             placeholder="Enter Password"
             className="w-full p-3 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
             onKeyDown={e => e.key === 'Enter' && handleLogin()}
           />
           {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
           <button 
             onClick={handleLogin}
             className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
           >
             Unlock
           </button>
         </div>
       </div>
     );
  }

  // Main Chat Interface
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar (Desktop) */}
      <div className={`hidden md:flex flex-col w-64 bg-white border-r border-slate-200 flex-shrink-0 transition-all ${viewMode === 'client' ? 'w-0 opacity-0 overflow-hidden border-0' : ''}`}>
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Bot size={20} />
          </div>
          <span className="font-bold text-slate-800">Baosmart AI</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
           <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Menu</div>
           <button 
             onClick={() => {
                setChatState({ messages: [INITIAL_MESSAGE], isLoading: false, error: null });
                setAttachments([]);
             }}
             className="w-full flex items-center gap-3 px-3 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg font-medium mb-1"
           >
             <MessageCircle size={18} />
             <span>New Chat</span>
           </button>
           <button 
             onClick={() => setIsNotebookOpen(true)}
             className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg mb-1 transition-colors"
           >
             <BookOpen size={18} />
             <span>Notebook</span>
           </button>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2">
             <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">Dev</div>
             <div className="flex-1 min-w-0">
               <div className="text-sm font-medium text-slate-700 truncate">Developer</div>
               <div className="text-xs text-slate-400">Online</div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-10">
           <div className="flex items-center gap-3">
             <AIAvatar state={avatarState} size={40} />
             <div>
               <h1 className="font-bold text-slate-800 leading-tight">Baosmart</h1>
               <div className="flex items-center gap-1.5">
                 <span className={`w-1.5 h-1.5 rounded-full ${chatState.isLoading ? 'bg-purple-500 animate-pulse' : 'bg-green-500'}`} />
                 <span className="text-xs text-slate-500">{chatState.isLoading ? 'Thinking...' : 'Online'}</span>
               </div>
             </div>
           </div>

           <div className="flex items-center gap-2">
             <button 
               onClick={() => setIsNotebookOpen(!isNotebookOpen)}
               className={`p-2 rounded-xl transition-colors ${isNotebookOpen ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}
               title="Notebook"
             >
               <BookOpen size={20} />
             </button>
             {viewMode === 'dev' && (
               <button 
                  onClick={() => setAuthStage('intro')} 
                  className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
                  title="Logout"
               >
                 <ArrowRight className="rotate-180" size={20} />
               </button>
             )}
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth custom-scrollbar bg-[#FAFAFA]">
          <div className="max-w-3xl mx-auto flex flex-col min-h-full">
            
            {/* Messages */}
            {chatState.messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                onSaveToNote={addNote}
              />
            ))}

            {/* Error Message */}
            {chatState.error && (
              <div className="flex justify-center my-4">
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-red-100 shadow-sm">
                  <Shield size={16} />
                  {chatState.error}
                </div>
              </div>
            )}
            
            {/* Loading Indicator */}
            {chatState.isLoading && (
              <div className="flex justify-start mb-6 animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <AIAvatar state="thinking" size={32} />
                  <div className="flex space-x-1 bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Suggestions Overlay (if empty chat) */}
        {chatState.messages.length === 1 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl px-6 pointer-events-none opacity-0 md:opacity-100 animate-fade-in" style={{ animationDelay: '0.5s', top: '55%' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pointer-events-auto">
              {SUGGESTIONS.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => handleSendMessage(s.prompt)}
                  className="bg-white/80 backdrop-blur-sm hover:bg-white border border-slate-200 hover:border-indigo-300 p-3 rounded-xl shadow-sm hover:shadow-md transition-all text-left flex items-start gap-3 group"
                >
                  <div className="bg-slate-50 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{s.title}</div>
                    <div className="text-xs text-slate-500">{s.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
           <div className="max-w-3xl mx-auto">
             
             {/* Attachment Preview */}
             {attachments.length > 0 && (
               <div className="flex gap-2 mb-3 overflow-x-auto py-2">
                 {attachments.map(att => (
                   <div key={att.id} className="relative group flex-shrink-0">
                     <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                        {att.mimeType.startsWith('image/') ? (
                          <img src={`data:${att.mimeType};base64,${att.data}`} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <FileText size={24} className="text-slate-400" />
                        )}
                     </div>
                     <button 
                       onClick={() => removeAttachment(att.id)}
                       className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <X size={12} />
                     </button>
                   </div>
                 ))}
               </div>
             )}

             <div className="relative bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all shadow-sm">
               <textarea
                 ref={textareaRef}
                 value={inputText}
                 onChange={e => setInputText(e.target.value)}
                 onKeyDown={handleKeyDown}
                 placeholder="Message Baosmart..."
                 className="w-full bg-transparent p-4 pr-24 min-h-[56px] max-h-32 outline-none resize-none text-slate-800 placeholder:text-slate-400 text-sm md:text-base scrollbar-hide"
                 rows={1}
               />
               
               <div className="absolute bottom-2 right-2 flex items-center gap-1">
                 <input 
                   type="file" 
                   id="file-upload" 
                   multiple 
                   className="hidden" 
                   onChange={handleFileSelect}
                 />
                 <label 
                   htmlFor="file-upload" 
                   className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors"
                   title="Attach file"
                 >
                   <Paperclip size={20} />
                 </label>
                 <button 
                   onClick={() => handleSendMessage()}
                   disabled={(!inputText.trim() && attachments.length === 0) || chatState.isLoading}
                   className="p-2 bg-indigo-600 text-white rounded-xl disabled:opacity-50 disabled:bg-slate-300 transition-all hover:bg-indigo-700 shadow-sm"
                 >
                   <Send size={20} />
                 </button>
               </div>
             </div>
             
             <div className="text-center mt-2">
               <p className="text-[10px] text-slate-400">
                 Baosmart can make mistakes. Check important info.
               </p>
             </div>
           </div>
        </div>
      </div>

      {/* Notebook Sidebar */}
      <Notebook 
        notes={notes}
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
        onAddNote={addNote}
        onDeleteNote={deleteNote}
      />

    </div>
  );
};

export default ChatInterface;