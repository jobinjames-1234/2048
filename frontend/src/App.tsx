import React, { useState, useEffect, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { auth, googleProvider, db } from './lib/firebase';
import { getUserProfile, createUserProfile, updateBestScore, submitScore, getLeaderboard } from './services/db';
import { submitScoreToDjango } from './services/djangoApi';
import { UserProfile, ScoreEntry, Direction } from './types';
import { use2048 } from './hooks/use2048';
import { Grid } from './components/Grid';
import { ScoreBoard } from './components/ScoreBoard';
import { Leaderboard } from './components/Leaderboard';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { 
  LogOut, 
  LogIn, 
  Undo, 
  RotateCcw, 
  Shield, 
  Trophy, 
  Gamepad2, 
  LayoutDashboard,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { doc, getDocFromServer } from 'firebase/firestore';

function App() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [scoresLoading, setScoresLoading] = useState(false);

  // Connection test
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  const fetchProfile = useCallback(async (user: FirebaseUser) => {
    let p = await getUserProfile(user.uid);
    if (!p) {
      p = await createUserProfile(user.uid, user.email || '', user.displayName || 'Player');
    }
    setProfile(p);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        fetchProfile(user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchProfile]);

  const loadLeaderboard = useCallback(async () => {
    setScoresLoading(true);
    const data = await getLeaderboard();
    setLeaderboard(data);
    setScoresLoading(false);
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login failed', error);
      if (error.code === 'auth/popup-blocked') {
        setLoginError('Popup blocked by browser. Please allow popups for this site.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setLoginError('Domain not authorized in Firebase Console. Add this URL to authorized domains.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignore user cancellation
      } else {
        setLoginError('Sign in failed: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-yellow-400 selection:text-slate-900">
        <AnimatePresence>
          {loginError && (
            <motion.div 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm"
            >
              <Shield className="w-4 h-4" />
              {loginError}
              <button 
                onClick={() => setLoginError(null)}
                className="ml-2 hover:bg-white/20 rounded-full p-1"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-yellow-500 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                <Gamepad2 className="w-5 h-5 text-slate-900" />
              </div>
              <span className="font-black text-xl tracking-tighter text-white uppercase italic">2048<span className="text-yellow-500">PRO</span></span>
            </Link>

            <div className="flex items-center gap-6">
              {profile && (
                <div className="hidden md:flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                  <Link to="/" className="hover:text-white transition-colors">Play</Link>
                  <Link to="/leaderboard" className="hover:text-white transition-colors">Hall of Fame</Link>
                  {(profile.role === 'admin' || profile.role === 'super_admin' || profile.email === 'jobinjames2027@mca.ajce.in') && (
                    <Link to="/admin" className="text-blue-400 hover:text-blue-300 transition-colors">Admin</Link>
                  )}
                </div>
              )}

              {firebaseUser ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-white leading-none">{profile?.username}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-tighter">{profile?.role}</div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)] active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </nav>

        <main className="py-8">
          <Routes>
            <Route path="/" element={<GameView profile={profile} leaderboard={leaderboard} loadingScores={scoresLoading} onLogin={handleLogin} />} />
            <Route path="/leaderboard" element={<div className="max-w-md mx-auto p-4"><Leaderboard scores={leaderboard} loading={scoresLoading} /></div>} />
            <Route path="/admin" element={
              (profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.email === 'jobinjames2027@mca.ajce.in') 
                ? <AdminDashboard /> 
                : <Navigate to="/" />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function GameView({ profile, leaderboard, loadingScores, onLogin }: { profile: UserProfile | null, leaderboard: ScoreEntry[], loadingScores: boolean, onLogin: () => void }) {
  const { grid, score, bestScore, gameOver, won, move, undo, reset } = use2048(profile?.bestScore || 0);
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const [showLoginNudge, setShowLoginNudge] = useState(true);

  const syncScore = useCallback(async () => {
    if (profile && score > profile.bestScore) {
      await updateBestScore(profile.uid, score);
    }
    if (profile && score > 0) {
      // Submit to Firestore (existing) and Django backend (new) in parallel
      const maxTile = Math.max(...grid.flat().map(t => t?.value ?? 0));
      await Promise.allSettled([
        submitScore(profile.uid, profile.username, score),
        submitScoreToDjango(score, maxTile),
      ]);
    }
  }, [profile, score, grid]);

  useEffect(() => {
    if (gameOver) {
      syncScore();
    }
  }, [gameOver, syncScore]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;
    switch (e.key) {
      case 'ArrowUp': move('UP'); break;
      case 'ArrowDown': move('DOWN'); break;
      case 'ArrowLeft': move('LEFT'); break;
      case 'ArrowRight': move('RIGHT'); break;
    }
  }, [move, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > 30) {
        move(deltaX > 0 ? 'RIGHT' : 'LEFT');
      }
    } else {
      if (Math.abs(deltaY) > 30) {
        move(deltaY > 0 ? 'DOWN' : 'UP');
      }
    }
    setTouchStart(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      <div className="lg:col-span-7 flex flex-col items-center space-y-8">
        <header className="w-full flex justify-between items-end max-w-[400px]">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white">2048</h1>
            <p className="text-slate-500 font-serif italic text-sm mt-1">Join the numbers and get to the 2048 tile!</p>
          </div>
          <div className="flex gap-2">
            <ScoreBoard label="Score" score={score} />
            <ScoreBoard label="Best" score={bestScore} />
          </div>
        </header>

        <div className="relative w-full max-w-[400px]">
          <div 
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="touch-none"
          >
            <Grid grid={grid} />
          </div>

          <AnimatePresence>
            {gameOver && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-8 text-center z-10"
              >
                <div className="bg-red-500/10 p-4 rounded-full mb-4">
                  <RotateCcw className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Game Over</h2>
                <p className="text-slate-400 mb-8 max-w-[200px]">Strategic failure detected. Ready to try again?</p>
                <button 
                  onClick={reset}
                  className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold text-lg hover:bg-slate-200 transition-all active:scale-95 shadow-xl"
                >
                  New Campaign
                </button>
              </motion.div>
            )}

            {!profile && !gameOver && showLoginNudge && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-8 text-center z-10"
              >
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white leading-tight">Save Your Progress</h3>
                    <p className="text-xs text-slate-400">Sign in to track your scores on the global leaderboard.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={onLogin}
                      className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                      <LogIn className="w-4 h-4" /> Sign In with Google
                    </button>
                    <button 
                      onClick={() => setShowLoginNudge(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors py-1 uppercase tracking-widest"
                    >
                      Play as Guest
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full max-w-[400px] grid grid-cols-2 gap-4">
          <button 
            onClick={undo}
            disabled={gameOver}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 p-3 rounded-xl text-slate-300 font-bold border border-slate-700 disabled:opacity-50 transition-all"
          >
            <Undo className="w-4 h-4" /> Undo Move
          </button>
          <button 
            onClick={reset}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 p-3 rounded-xl text-slate-300 font-bold border border-slate-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Reset Game
          </button>
        </div>

        <div className="text-slate-600 text-xs text-center max-w-[300px]">
          <strong>HOW TO PLAY:</strong> Use your <strong>arrow keys</strong> or <strong>swipe</strong> to move the tiles. Tiles with the same number merge into one when they touch. Add them up to reach <strong>2048!</strong>
        </div>
      </div>

      <aside className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
        {profile && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
             <div className="flex items-center gap-4 mb-6">
                {profile.role !== 'player' && (
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">{profile.username}</h3>
                  <p className="text-slate-500 text-xs uppercase tracking-widest font-bold font-mono">Agent Status: {profile.role}</p>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Total Score</div>
                  <div className="text-2xl font-black tabular-nums text-white italic">{score}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Personal Best</div>
                  <div className="text-2xl font-black tabular-nums text-yellow-500 italic">{bestScore}</div>
                </div>
             </div>
          </div>
        )}

        <Leaderboard scores={leaderboard} loading={loadingScores} />

        <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
           <h4 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-4">Tactical Intelligence</h4>
           <p className="text-sm text-slate-500 leading-relaxed italic font-serif">
             "To reach 2048, one must master the corners. The highest tile should remain anchored, while siblings organize themselves in descending order."
           </p>
        </div>
      </aside>
    </div>
  );
}

export default App;
