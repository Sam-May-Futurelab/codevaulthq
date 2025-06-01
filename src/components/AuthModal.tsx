import React, { useState } from 'react';
import { X, Mail, Lock, User, Github } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp, signInWithGoogle, signInWithGithub, resetPassword } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        await signUp(email, password, displayName);
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setError('Password reset email sent! Check your inbox.');
        return;
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError('');

    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithGithub();
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Social sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    setMode(newMode);
    resetForm();
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-vault-dark border border-vault-light/20 rounded-xl w-full max-w-md shadow-2xl">        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-vault-light/20">
          <h2 className="text-xl font-semibold text-white">
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-vault-medium border border-vault-light/30 rounded-lg focus:ring-2 focus:ring-vault-accent focus:border-vault-accent text-white placeholder-gray-500"
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-vault-medium border border-vault-light/30 rounded-lg focus:ring-2 focus:ring-vault-accent focus:border-vault-accent text-white placeholder-gray-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-vault-medium border border-vault-light/30 rounded-lg focus:ring-2 focus:ring-vault-accent focus:border-vault-accent text-white placeholder-gray-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-vault-accent text-black py-3 px-4 rounded-lg hover:bg-vault-accent/80 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Loading...' : (
                <>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Email'}
                </>
              )}
            </button>
          </form>          {mode !== 'forgot' && (
            <>
              <div className="mt-6 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-vault-light/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-vault-dark text-gray-400">Or continue with</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSocialSignIn('google')}
                  disabled={loading}
                  className="w-full inline-flex justify-center py-3 px-4 border border-vault-light/30 rounded-lg bg-vault-medium text-sm font-medium text-gray-300 hover:bg-vault-light/10 transition-colors"
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
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="ml-2">Google</span>
                </button>

                <button
                  onClick={() => handleSocialSignIn('github')}
                  disabled={loading}
                  className="w-full inline-flex justify-center py-3 px-4 border border-vault-light/30 rounded-lg bg-vault-medium text-sm font-medium text-gray-300 hover:bg-vault-light/10 transition-colors"
                >
                  <Github className="w-5 h-5" />
                  <span className="ml-2">GitHub</span>
                </button>
              </div>
            </>
          )}          {/* Footer Links */}
          <div className="mt-6 text-center text-sm">
            {mode === 'signin' && (
              <>
                <button
                  onClick={() => switchMode('forgot')}
                  className="text-vault-accent hover:text-vault-accent/80 transition-colors"
                >
                  Forgot your password?
                </button>
                <div className="mt-2">
                  <span className="text-gray-400">Don't have an account? </span>
                  <button
                    onClick={() => switchMode('signup')}
                    className="text-vault-accent hover:text-vault-accent/80 transition-colors"
                  >
                    Sign up
                  </button>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <div>
                <span className="text-gray-400">Already have an account? </span>
                <button
                  onClick={() => switchMode('signin')}
                  className="text-vault-accent hover:text-vault-accent/80 transition-colors"
                >
                  Sign in
                </button>
              </div>
            )}

            {mode === 'forgot' && (
              <button
                onClick={() => switchMode('signin')}
                className="text-vault-accent hover:text-vault-accent/80 transition-colors"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
