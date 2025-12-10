import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Send, Paperclip, Loader2, Stethoscope, X, LogOut } from 'lucide-react';
import { ChatMessage, MedicalRecord, ProcessingState, User } from './types';
import { INITIAL_MEDICAL_RECORD } from './constants';
import { sendMessageToGemini } from './services/geminiService';
import { Sidebar } from './components/Sidebar';
import { ChatBubble } from './components/ChatBubble';
import { LoginScreen } from './components/LoginScreen';

const App: React.FC = () => {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  
  // Medical Record State
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord>(() => ({
    ...INITIAL_MEDICAL_RECORD,
    patient_id: `PT-${Math.floor(1000 + Math.random() * 9000)}`
  }));

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({ isTyping: false, error: null });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize Chat when user logs in
  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([
        {
          id: 'init-1',
          role: 'model',
          text: `👋 **Welcome, ${user.name} (${user.role}).**\n\nI am ready to triage **Patient ${medicalRecord.patient_id}**.\n\nPlease describe the patient's symptoms or upload a medical report to begin the assessment.\n\n_System Status: Active | Guidelines: WHO/CDC_`,
          timestamp: Date.now()
        }
      ]);
    }
  }, [user]);

  // Session Timeout Logic (30 minutes)
  const resetSessionTimer = () => {
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    if (user) {
      sessionTimeoutRef.current = setTimeout(() => {
        alert("Session timed out due to inactivity.");
        handleLogout();
      }, 30 * 60 * 1000); // 30 minutes
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', resetSessionTimer);
    window.addEventListener('keydown', resetSessionTimer);
    return () => {
      window.removeEventListener('mousemove', resetSessionTimer);
      window.removeEventListener('keydown', resetSessionTimer);
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    };
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setMessages([]);
    setMedicalRecord({
        ...INITIAL_MEDICAL_RECORD,
        patient_id: `PT-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, processingState.isTyping]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedImage) || processingState.isTyping) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      image: selectedImage || undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setProcessingState({ isTyping: true, error: null });

    try {
      const allMessages = [...messages, newMessage];
      const response = await sendMessageToGemini(allMessages);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMessage]);

      if (response.medicalRecord) {
        setMedicalRecord(prev => ({
          ...prev,
          ...response.medicalRecord,
          patient_id: (response.medicalRecord && response.medicalRecord.patient_id && response.medicalRecord.patient_id !== 'string') 
            ? response.medicalRecord.patient_id 
            : prev.patient_id
        }));
      }

    } catch (error) {
      console.error(error);
      setProcessingState({ isTyping: false, error: "System Error: Unable to process request." });
    } finally {
      setProcessingState(prev => ({ ...prev, isTyping: false }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // If not logged in, show Login Screen
  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center shadow-sm z-10 justify-between">
          <div className="flex items-center">
            <div className="bg-teal-600 p-2 rounded-lg mr-3">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">MedAssist Pro</h1>
              <p className="text-xs text-slate-500">Clinical Decision Support System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-700">{user.name}</p>
                <p className="text-xs text-slate-500 bg-slate-100 px-1 rounded inline-block">{user.role}</p>
             </div>
             <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
             >
                <LogOut className="w-5 h-5" />
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
          <div className="max-w-3xl mx-auto">
            {messages.map(msg => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            
            {processingState.isTyping && (
              <div className="flex w-full mb-6 justify-start">
                <div className="flex items-center space-x-2 bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-200">
                  <div className="w-2 h-2 bg-teal-400 rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full typing-dot"></div>
                </div>
              </div>
            )}
            
            {processingState.error && (
               <div className="flex w-full mb-6 justify-center">
                 <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold border border-red-200">
                   {processingState.error}
                 </div>
               </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="bg-white border-t border-slate-200 p-4">
          <div className="max-w-3xl mx-auto relative">
            
            {selectedImage && (
              <div className="absolute bottom-full left-0 mb-4 p-2 bg-white rounded-lg shadow-lg border border-slate-200">
                <div className="relative">
                  <img src={selectedImage} alt="Preview" className="h-24 w-auto rounded-md object-cover" />
                  <button 
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent transition-all">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                title="Upload Report/Image"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type clinical notes or patient symptoms..."
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-2 text-slate-800 placeholder:text-slate-400"
                rows={1}
                style={{ height: 'auto', minHeight: '44px' }}
                // Admins might only be able to view, but for demo assume full access for all roles
                disabled={processingState.isTyping} 
              />

              <button 
                onClick={handleSendMessage}
                disabled={processingState.isTyping || (!inputText.trim() && !selectedImage)}
                className={`p-2 rounded-lg transition-all ${
                  (inputText.trim() || selectedImage) && !processingState.isTyping
                    ? 'bg-teal-600 text-white shadow-md hover:bg-teal-700' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {processingState.isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <div className="text-center mt-2">
                 <span className="text-[10px] text-slate-400 uppercase tracking-widest">MedAssist Pro - Confidential - Decision Support Only</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block h-full">
        <Sidebar data={medicalRecord} currentUser={user} />
      </div>

    </div>
  );
};

export default App;