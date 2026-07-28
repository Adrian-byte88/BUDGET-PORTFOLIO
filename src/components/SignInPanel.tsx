import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Shield, AlertCircle } from 'lucide-react';

interface SignInPanelProps {
  onSignIn: () => void;
}

export default function SignInPanel({ onSignIn }: SignInPanelProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (isResetMode) {
        await sendPasswordResetEmail(auth, email);
        setMessage('Password reset email sent. Please check your inbox.');
      } else if (isSignUpMode) {
        await createUserWithEmailAndPassword(auth, email, password);
        onSignIn();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onSignIn();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      onSignIn();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col items-center mb-8">
          <img src="/src/assets/images/budget_portfolio_logo_1784635990294.jpg" alt="Logo" className="w-16 h-16 rounded-xl mb-4 shadow-lg" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Budget Portfolio</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isResetMode && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          )}

          {!isResetMode && !isSignUpMode && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          )}
          
          {isSignUpMode && !isResetMode && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4"/>{error}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}

          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300">
            {isResetMode ? 'Send Reset Email' : isSignUpMode ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {!isResetMode && (
          <button
            onClick={handleGoogleSignIn}
            className="w-full mt-4 py-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition duration-300"
          >
            Sign in with Google
          </button>
        )}

        <button 
          onClick={() => {
            setIsResetMode(!isResetMode);
            setIsSignUpMode(false);
          }}
          className="w-full mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isResetMode ? 'Back to Sign In' : 'Forgot Password?'}
        </button>
        
        {!isResetMode && (
          <button 
            onClick={() => setIsSignUpMode(!isSignUpMode)}
            className="w-full mt-2 text-sm text-slate-600 dark:text-slate-400 hover:underline"
          >
            {isSignUpMode ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        )}
      </div>
    </div>
  );
}
