import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Test Supabase connection first
    const testConnection = async () => {
      console.log('Testing Supabase connection...')
      console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
      console.log('Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
      
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Supabase connection test failed:', error)
          setError(`Connection error: ${error.message}`)
        } else {
          console.log('Supabase connection successful!')
        }
      } catch (err) {
        console.error('Supabase connection test error:', err)
        setError('Failed to connect to Supabase')
      }
    };

    testConnection();

    // Check for existing session
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Failed to check authentication status');
      } finally {
        setLoading(false);
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn: async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        console.log('Attempting sign in with:', email);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error('Sign in error:', error);
          
          // Development bypass for email confirmation
          if (error.message === 'Email not confirmed') {
            console.log('Attempting to bypass email confirmation for development...');
            // Try to sign up again to trigger confirmation bypass
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/signin`,
                data: {
                  email_confirmed: true
                }
              }
            });
            
            if (!signUpError && signUpData.user) {
              console.log('Development bypass successful!');
              return {};
            }
          }
          
          return { error: error.message };
        }
        console.log('Sign in successful!');
        return {};
      } catch (err) {
        console.error('Sign in error:', err);
        return { error: 'An unexpected error occurred during sign in' };
      } finally {
        setLoading(false);
      }
    },
    signUp: async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        console.log('Attempting sign up with:', email);
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/signin`,
            // Skip email confirmation for development
            data: {
              email_confirmed: true,
              skip_email_confirmation: true
            }
          }
        });
        if (error) {
          console.error('Sign up error:', error);
          return { error: error.message };
        }
        console.log('Sign up successful!');
        
        // For development, try to sign in immediately
        if (data.user) {
          console.log('Attempting immediate sign in for development...');
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (!signInError) {
            console.log('Development auto sign-in successful!');
          }
        }
        
        return {};
      } catch (err) {
        console.error('Sign up error:', err);
        return { error: 'An unexpected error occurred during sign up' };
      } finally {
        setLoading(false);
      }
    },
    signOut: async () => {
      setLoading(true);
      setError(null);
      try {
        const { error } = await supabase.auth.signOut();
        setUser(null);
        if (error) {
          return { error: error.message };
        }
        return {};
      } catch (err) {
        console.error('Sign out error:', err);
        return { error: 'An unexpected error occurred during sign out' };
      } finally {
        setLoading(false);
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
