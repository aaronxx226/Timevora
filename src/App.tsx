/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  History, 
  ArrowRight, 
  RefreshCw, 
  Compass, 
  AlertCircle, 
  TrendingUp, 
  Lightbulb,
  Clock,
  User,
  Briefcase,
  BookOpen,
  Mail,
  MessageSquare,
  X,
  LogIn,
  UserPlus,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Zap,
  Heart,
  Leaf,
  Moon,
  Sun
} from 'lucide-react';
import Markdown from 'react-markdown';
import { generateSimulation, UserData, TimelineEvent } from './services/gemini';
import { TimelineEventForm } from './components/TimelineEventForm';
import { auth, googleProvider, isFirebaseConfigured } from './services/firebase';
import { LegalModal } from './components/Legal';
import { FAQSection } from './components/FAQ';
import { ReviewsSection } from './components/Reviews';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';

export default function App() {
  const [view, setView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authError, setAuthError] = useState('');
  const [authFormData, setAuthFormData] = useState({ email: '', password: '', name: '' });

  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [customScenario, setCustomScenario] = useState('');
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean, type: 'terms' | 'privacy' | 'disclaimer' }>({
    isOpen: false,
    type: 'terms'
  });
  const [formData, setFormData] = useState<UserData>({
    age: '',
    profession: '',
    story: '',
    context: '',
    scenario: '',
    timelineEvents: []
  });

  // Auth Logic
  React.useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL
        });
        setView('app');
        
        // Check if tutorial should be shown
        const hasSeenTutorial = localStorage.getItem(`timevora_tutorial_seen_${user.uid}`);
        if (!hasSeenTutorial) {
          setShowTutorial(true);
        }
      } else {
        setCurrentUser(null);
        setView('landing');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleAuth = async () => {
    if (!isFirebaseConfigured || !auth) {
      setAuthError('Firebase is not configured. Please set up your environment variables.');
      return;
    }
    try {
      setAuthError('');
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      setAuthError(error.message || 'Google Sign-In failed.');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured || !auth) {
      setAuthError('Firebase is not configured. Please set up your environment variables.');
      return;
    }
    setAuthError('');
    
    try {
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, authFormData.email, authFormData.password);
        if (authFormData.name) {
          await updateProfile(userCredential.user, { displayName: authFormData.name });
        }
      } else {
        await signInWithEmailAndPassword(auth, authFormData.email, authFormData.password);
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      setAuthError(error.message || 'Authentication failed.');
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const closeTutorial = () => {
    if (currentUser) {
      localStorage.setItem(`timevora_tutorial_seen_${currentUser.uid}`, 'true');
    }
    setShowTutorial(false);
  };

  const openLegal = (type: 'terms' | 'privacy' | 'disclaimer') => {
    setLegalModal({ isOpen: true, type });
  };

  const tutorialSteps = [
    {
      title: "Welcome to Timevora",
      content: "This is a space to explore the 'what ifs' of your life with compassion and clarity. We'll help you visualize an alternate path you didn't take.",
      icon: <Sparkles className="w-8 h-8 text-[#ff4e00]" />
    },
    {
      title: "1. Tell us who you are",
      content: "Start by entering your age and profession. This helps the AI ground the simulation in your real-world context.",
      icon: <User className="w-8 h-8 text-[#ff4e00]" />
    },
    {
      title: "2. Share your story",
      content: "Describe a key decision or a moment you're curious about. Be as specific or as brief as you like.",
      icon: <BookOpen className="w-8 h-8 text-[#ff4e00]" />
    },
    {
      title: "3. Pick a 'What If'",
      content: "Choose one of our common scenarios or create your own custom 'What If' to see how that specific choice might have changed things.",
      icon: <History className="w-8 h-8 text-[#ff4e00]" />
    },
    {
      title: "4. Shift the Timeline",
      content: "Click 'Shift Timeline' to generate a compassionate narrative of your alternate life, including positive outcomes and realistic challenges.",
      icon: <ArrowRight className="w-8 h-8 text-[#ff4e00]" />
    }
  ];

  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = (event: TimelineEvent) => {
    setFormData(prev => ({
      ...prev,
      timelineEvents: [...(prev.timelineEvents || []), event]
    }));
  };

  const handleRemoveEvent = (id: string) => {
    setFormData(prev => ({
      ...prev,
      timelineEvents: (prev.timelineEvents || []).filter(e => e.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setError(null);
    try {
      const finalData = {
        ...formData,
        scenario: formData.scenario === 'Custom Scenario' ? customScenario : formData.scenario
      };
      const simulation = await generateSimulation(finalData);
      setResult(simulation || 'No simulation generated.');
      setStep('result');
    } catch (err) {
      console.error(err);
      setError('The timeline shifted unexpectedly. Please try again.');
      setStep('input');
    }
  };

  const reset = () => {
    setStep('input');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-[#f5f2ed] font-sans selection:bg-[#ff4e00]/30 selection:text-white overflow-x-hidden">
      {/* Immersive Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="atmosphere absolute inset-0" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3a1510] rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ff4e00] rounded-full blur-[150px] opacity-10" />
      </div>

      <LegalModal 
        isOpen={legalModal.isOpen} 
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })} 
        type={legalModal.type} 
      />

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <div key="landing-wrapper" className="relative z-10">
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center"
            >
              <div className="max-w-4xl mx-auto space-y-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs font-medium tracking-widest uppercase mb-6"
                >
                  <Sparkles className="w-4 h-4 text-[#ff4e00]" />
                  The Future of Reflection
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-6xl md:text-8xl font-serif font-light tracking-tight leading-tight"
                >
                  What if you took the <br />
                  <span className="italic text-[#ff4e00]">Other Path?</span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl text-white/60 font-light max-w-2xl mx-auto leading-relaxed"
                >
                  Timevora uses advanced intelligence to help you visualize alternate life timelines. 
                  It's not about regret—it's about gaining clarity and peace with the choices you've made.
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12"
                >
                  {[
                    { icon: <ShieldCheck className="w-6 h-6" />, title: "Safe Space", desc: "A non-judgmental environment for deep reflection." },
                    { icon: <Zap className="w-6 h-6" />, title: "AI Powered", desc: "Sophisticated simulations based on your real context." },
                    { icon: <Heart className="w-6 h-6" />, title: "Emotional Relief", desc: "Designed to reduce 'what if' anxiety and build peace." }
                  ].map((feature, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 text-left space-y-3">
                      <div className="text-[#ff4e00]">{feature.icon}</div>
                      <h3 className="font-serif italic text-lg">{feature.title}</h3>
                      <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
                >
                  <button 
                    onClick={() => { setAuthMode('signup'); setView('auth'); }}
                    className="px-10 py-5 rounded-2xl bg-[#ff4e00] hover:bg-[#ff6a26] text-white font-medium transition-all flex items-center justify-center gap-2 group shadow-xl shadow-[#ff4e00]/20"
                  >
                    Get Started for Free
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => { setAuthMode('login'); setView('auth'); }}
                    className="px-10 py-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all"
                  >
                    Sign In
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}

        {view === 'auth' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 min-h-screen flex items-center justify-center px-6"
          >
            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-[#ff4e00]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {authMode === 'login' ? <LogIn className="w-8 h-8 text-[#ff4e00]" /> : <UserPlus className="w-8 h-8 text-[#ff4e00]" />}
                </div>
                <h2 className="text-3xl font-serif italic">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="text-white/40 text-sm mt-2">
                  {authMode === 'login' ? 'Continue your journey of reflection.' : 'Start exploring your alternate timelines.'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                {authMode === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Full Name</label>
                    <input
                      required
                      type="text"
                      value={authFormData.name}
                      onChange={(e) => setAuthFormData({...authFormData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/50 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Email Address</label>
                  <input
                    required
                    type="email"
                    value={authFormData.email}
                    onChange={(e) => setAuthFormData({...authFormData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/50 transition-all"
                    placeholder="name@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Password</label>
                  <input
                    required
                    type="password"
                    value={authFormData.password}
                    onChange={(e) => setAuthFormData({...authFormData, password: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>

                {authError && (
                  <p className="text-red-400 text-xs text-center">{authError}</p>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#ff4e00] hover:bg-[#ff6a26] text-white font-medium py-5 rounded-2xl transition-all shadow-lg shadow-[#ff4e00]/20"
                >
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#1a1a1a] px-2 text-white/40">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-4 rounded-2xl transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
              </form>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }}
                  className="text-sm text-white/40 hover:text-white transition-colors"
                >
                  {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
              
              <button 
                onClick={() => setView('landing')}
                className="mt-4 w-full text-xs text-white/20 hover:text-white transition-colors"
              >
                Back to Landing Page
              </button>
            </div>
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 max-w-3xl mx-auto px-6 py-12 md:py-24"
          >
            <div className="flex justify-between items-center mb-16">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#ff4e00]/20 flex items-center justify-center text-[#ff4e00] font-serif italic">
                  {currentUser?.name?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest">Welcome back</p>
                  <p className="text-sm font-medium">{currentUser?.name || 'Explorer'}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <header className="mb-16 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium tracking-widest uppercase mb-6"
              >
                <Clock className="w-3 h-3 text-[#ff4e00]" />
                Timevora
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-serif font-light tracking-tight mb-4"
              >
                Reflect on the <span className="italic text-[#ff4e00]">Unlived</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-white/60 font-light max-w-xl mx-auto"
              >
                An emotionally intelligent space to explore alternate life paths with compassion and clarity.
              </motion.p>
            </header>

            <AnimatePresence mode="wait">
              {step === 'input' && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <form onSubmit={handleSubmit} className="space-y-8 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40 ml-1">
                          <User className="w-3 h-3" /> Age
                        </label>
                        <input
                          required
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          placeholder="e.g. 32"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/50 transition-all placeholder:text-white/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40 ml-1">
                          <Briefcase className="w-3 h-3" /> Profession
                        </label>
                        <input
                          required
                          type="text"
                          name="profession"
                          value={formData.profession}
                          onChange={handleInputChange}
                          placeholder="e.g. Graphic Designer"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/50 transition-all placeholder:text-white/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40 ml-1">
                        <BookOpen className="w-3 h-3" /> Your Story or Key Decision
                      </label>
                      <textarea
                        required
                        name="story"
                        value={formData.story}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Describe the moment or path you're curious about..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/50 transition-all placeholder:text-white/20 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40 ml-1">
                        <Sparkles className="w-3 h-3" /> Emotional Context
                      </label>
                      <input
                        required
                        type="text"
                        name="context"
                        value={formData.context}
                        onChange={handleInputChange}
                        placeholder="What are you feeling? (e.g. curiosity, mild regret, seeking peace)"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/50 transition-all placeholder:text-white/20"
                      />
                    </div>

                    <TimelineEventForm 
                      events={formData.timelineEvents || []}
                      onAddEvent={handleAddEvent}
                      onRemoveEvent={handleRemoveEvent}
                    />

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40 ml-1">
                        <History className="w-3 h-3" /> The "What If" Scenario
                      </label>
                      <select
                        required
                        name="scenario"
                        value={formData.scenario}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="bg-[#1a1a1a]">Select a time jump...</option>
                        <option value="I chose the other career path" className="bg-[#1a1a1a]">I chose the other career path</option>
                        <option value="I moved to that different city" className="bg-[#1a1a1a]">I moved to that different city</option>
                        <option value="I stayed in that relationship" className="bg-[#1a1a1a]">I stayed in that relationship</option>
                        <option value="I took that big risk 5 years ago" className="bg-[#1a1a1a]">I took that big risk 5 years ago</option>
                        <option value="Custom Scenario" className="bg-[#1a1a1a]">Other / Custom Scenario</option>
                      </select>
                    </div>

                    <AnimatePresence>
                      {formData.scenario === 'Custom Scenario' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40 ml-1">
                            <Sparkles className="w-3 h-3" /> Describe your custom scenario
                          </label>
                          <input
                            required
                            type="text"
                            value={customScenario}
                            onChange={(e) => setCustomScenario(e.target.value)}
                            placeholder="e.g. I decided to start my own business instead of taking the job"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/50 transition-all placeholder:text-white/20"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {error && (
                      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-[#ff4e00] hover:bg-[#ff6a26] text-white font-medium py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-[#ff4e00]/20"
                    >
                      Shift Timeline
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                </motion.div>
              )}

              {step === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24 space-y-6"
                >
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-white/5 border-t-[#ff4e00] rounded-full animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#ff4e00] animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-serif italic">Aligning possibilities...</h3>
                    <p className="text-white/40 text-sm">Gathering threads of an alternate reality with compassion.</p>
                  </div>
                </motion.div>
              )}

              {step === 'result' && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                  <div className="glass-card p-8 md:p-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                      <History className="w-64 h-64" />
                    </div>

                    <div className="relative z-10">
                      <div className="markdown-body">
                        {result.split('\n\n').map((section, idx) => {
                          if (idx === 0) {
                            return (
                              <h2 key={idx} className="text-4xl md:text-5xl font-serif font-light text-[#ff4e00] mb-12 leading-tight tracking-tight">
                                {section.replace(/#/g, '').trim()}
                              </h2>
                            );
                          }

                          const isNarrative = section.includes('✨');
                          const isEmotional = section.includes('💓');
                          const isPositive = section.includes('🌿');
                          const isRisks = section.includes('🌑');
                          const isOutlook = section.includes('🌅');
                          const isPrompt = section.includes('🕯️');
                          const isDisclaimer = section.includes('MANDATORY DISCLAIMER');

                          return (
                            <div key={idx} className={`
                              ${isNarrative ? 'bg-white/[0.03] p-8 rounded-3xl border border-white/5 italic font-serif text-xl leading-relaxed text-white/90 mb-12' : ''}
                              ${isEmotional ? 'bg-[#ff4e00]/5 p-8 rounded-3xl border border-[#ff4e00]/10 mb-12' : ''}
                              ${isPositive ? 'space-y-4 mb-8' : ''}
                              ${isRisks ? 'space-y-4 mb-8' : ''}
                              ${isOutlook ? 'border-l-2 border-[#ff4e00]/30 pl-8 py-4 my-12' : ''}
                              ${isPrompt ? 'bg-[#ff4e00]/5 p-8 rounded-3xl border border-[#ff4e00]/10 text-center my-12' : ''}
                              ${isDisclaimer ? 'text-[10px] uppercase tracking-[0.2em] text-white/20 pt-12 border-t border-white/5 mt-12 text-center' : ''}
                            `}>
                              {section.split('\n').map((line, lIdx) => {
                                const cleanLine = line.replace(/^[✨💓🌿🌑🌅🕯️]\s*/, '').replace(/^\*\s*/, '').replace(/#/g, '').trim();
                                if (!cleanLine && lIdx > 0) return null;

                                if (line.includes('✨')) return <div key={lIdx} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff4e00] mb-6"><History className="w-4 h-4" /> The Alternate Echo</div>;
                                if (line.includes('💓')) return <div key={lIdx} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff4e00] mb-6"><Heart className="w-4 h-4" /> Emotional Resonance</div>;
                                if (line.includes('🌿')) return <div key={lIdx} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400/80 mb-6"><Leaf className="w-4 h-4" /> Fruits of that Path</div>;
                                if (line.includes('🌑')) return <div key={lIdx} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-6"><Moon className="w-4 h-4" /> The Shadows of that Path</div>;
                                if (line.includes('🌅')) return <div key={lIdx} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400/60 mb-6"><Sun className="w-4 h-4" /> The Integration</div>;
                                if (line.includes('🕯️')) return <div key={lIdx} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff4e00] mb-6 justify-center"><Sparkles className="w-4 h-4" /> A Moment For You</div>;

                                if (line.startsWith('*') || line.startsWith('-')) {
                                  return (
                                    <div key={lIdx} className="flex gap-4 items-start text-white/70 mb-3">
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff4e00]/30 mt-2.5 shrink-0" />
                                      <span className="text-base font-light">{cleanLine}</span>
                                    </div>
                                  );
                                }

                                return <p key={lIdx} className="text-base font-light mb-4">{cleanLine}</p>;
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <button
                      onClick={reset}
                      className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2 text-sm font-medium"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Explore Another Path
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-8 py-4 rounded-2xl bg-[#ff4e00]/10 hover:bg-[#ff4e00]/20 border border-[#ff4e00]/20 text-[#ff4e00] transition-all flex items-center gap-2 text-sm font-medium"
                    >
                      Save Reflection
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <footer className="mt-24 pt-12 border-t border-white/5 text-center space-y-8">
              <div className="space-y-2">
                <p className="text-xs text-white/20 tracking-widest uppercase">
                  Designed for emotional clarity & perspective
                </p>
                <div className="flex flex-col items-center gap-4 pt-4">
                  <button 
                    onClick={() => {
                      setTutorialStep(0);
                      setShowTutorial(true);
                    }}
                    className="flex items-center gap-2 text-xs font-medium text-white/40 hover:text-[#ff4e00] transition-colors uppercase tracking-widest"
                  >
                    <Sparkles className="w-3 h-3" />
                    How it works
                  </button>
                </div>
              </div>

              <div className="py-8 px-6 bg-white/5 rounded-3xl border border-white/5 max-w-md mx-auto">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">Official Website</p>
                <a 
                  href="https://trytimevora.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-serif italic text-white hover:text-[#ff4e00] transition-all block mb-6"
                >
                  trytimevora.online
                </a>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">Questions or Suggestions?</p>
                <a 
                  href="mailto:contactus@trytimevora.online"
                  className="flex items-center justify-center gap-3 text-white/80 hover:text-[#ff4e00] transition-all group"
                >
                  <Mail className="w-4 h-4 text-[#ff4e00] group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-light tracking-wide">contactus@trytimevora.online</span>
                </a>
              </div>

              <div className="flex justify-center gap-6 opacity-20 grayscale">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">TV</div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">AI</div>
              </div>
            </footer>

            {/* Tutorial Modal */}
            <AnimatePresence>
              {showTutorial && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
                  >
                    {/* Background Glow */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff4e00] to-transparent opacity-50" />
                    
                    <div className="relative z-10">
                      <div className="flex justify-center mb-8">
                        <motion.div
                          key={tutorialStep}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="p-4 bg-[#ff4e00]/10 rounded-3xl border border-[#ff4e00]/20"
                        >
                          {tutorialSteps[tutorialStep].icon}
                        </motion.div>
                      </div>

                      <div className="text-center space-y-4 mb-10">
                        <motion.h3 
                          key={`title-${tutorialStep}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-3xl font-serif italic text-white"
                        >
                          {tutorialSteps[tutorialStep].title}
                        </motion.h3>
                        <motion.p 
                          key={`content-${tutorialStep}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-white/60 leading-relaxed"
                        >
                          {tutorialSteps[tutorialStep].content}
                        </motion.p>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex gap-1.5">
                          {tutorialSteps.map((_, idx) => (
                            <div 
                              key={idx} 
                              className={`h-1 rounded-full transition-all duration-500 ${idx === tutorialStep ? 'w-8 bg-[#ff4e00]' : 'w-2 bg-white/10'}`} 
                            />
                          ))}
                        </div>

                        <div className="flex gap-3">
                          {tutorialStep > 0 && (
                            <button
                              onClick={() => setTutorialStep(prev => prev - 1)}
                              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white transition-colors"
                            >
                              Back
                            </button>
                          )}
                          <button
                            onClick={() => {
                            if (tutorialStep < tutorialSteps.length - 1) {
                              setTutorialStep(prev => prev + 1);
                            } else {
                              closeTutorial();
                            }
                            }}
                            className="px-8 py-2.5 rounded-xl bg-[#ff4e00] hover:bg-[#ff6a26] text-white text-sm font-medium transition-all shadow-lg shadow-[#ff4e00]/20"
                          >
                            {tutorialStep === tutorialSteps.length - 1 ? "Start Exploring" : "Next"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <ReviewsSection />
      <FAQSection />

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-[#0a0502]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <History className="w-6 h-6 text-[#ff4e00]" />
              <span className="text-xl font-light tracking-tight text-[#f5f2ed]">Timevora</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8">
              <button onClick={() => openLegal('terms')} className="text-xs text-white/40 hover:text-[#ff4e00] transition-colors uppercase tracking-widest">Terms</button>
              <button onClick={() => openLegal('privacy')} className="text-xs text-white/40 hover:text-[#ff4e00] transition-colors uppercase tracking-widest">Privacy</button>
              <button onClick={() => openLegal('disclaimer')} className="text-xs text-white/40 hover:text-[#ff4e00] transition-colors uppercase tracking-widest">Disclaimer</button>
              <a href="#faq" className="text-xs text-white/40 hover:text-[#ff4e00] transition-colors uppercase tracking-widest">FAQ</a>
              <a href="#reviews" className="text-xs text-white/40 hover:text-[#ff4e00] transition-colors uppercase tracking-widest">Reviews</a>
            </div>

            <div className="text-xs text-white/20 uppercase tracking-widest">
              © 2026 Timevora. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
