import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AUTH } from '@/constants/testIds';
import { HeartPulse } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authApi.login({ username: email, password });
      const { accessToken, refreshToken, id, profileCompleted } = response.data;
      
      login(accessToken, refreshToken, { id, email, profileCompleted });
      toast.success('Welcome back!');
      
      if (!profileCompleted) {
        navigate('/profile/complete');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    try {
      setLoading(true);
      // Send credential to our backend
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/google`, {
        credential: credentialResponse.credential
      });
      
      const { accessToken, refreshToken, id, profileCompleted, isNewUser, name, picture } = response.data;
      
      login(accessToken, refreshToken, { id, email: credentialResponse.email, profileCompleted, name, picture });
      toast.success('Welcome back!');
      
      if (isNewUser || !profileCompleted) {
        navigate('/profile/complete');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.response?.data?.detail || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDF9] flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 border-[#E5E7E1] rounded-3xl" data-testid={AUTH.loginForm}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#8A9A5B] rounded-full flex items-center justify-center mb-4">
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-outfit font-semibold text-[#1A1F16] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-[#666] mt-2">Sign in to access your health dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1F16] mb-2">Email</label>
            <Input
              data-testid={AUTH.loginEmail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="rounded-xl border-[#E5E7E1]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#1A1F16] mb-2">Password</label>
            <Input
              data-testid={AUTH.loginPassword}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="rounded-xl border-[#E5E7E1]"
            />
          </div>

          <Button
            data-testid={AUTH.loginSubmit}
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#8A9A5B] hover:bg-[#7a8a4b] text-white h-12 transition-all duration-200 hover:-translate-y-0.5"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-[#E5E7E1]"></div>
          <span className="px-4 text-sm text-[#666]">OR</span>
          <div className="flex-1 border-t border-[#E5E7E1]"></div>
        </div>

        {GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your-google-client-id' && GOOGLE_CLIENT_ID !== '1024444129294-5nu05kge0npno8ck9pld5om3eh1u22p2.apps.googleusercontent.com' ? (
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="flex justify-center" data-testid={AUTH.loginGoogleBtn}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google login failed')}
                theme="outline"
                size="large"
                width="100%"
                text="signin_with"
              />
            </div>
          </GoogleOAuthProvider>
        ) : (
          <GoogleOAuthProvider clientId="1024444129294-5nu05kge0npno8ck9pld5om3eh1u22p2.apps.googleusercontent.com">
            <div className="flex justify-center" data-testid={AUTH.loginGoogleBtn}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google login failed')}
                theme="outline"
                size="large"
                width="100%"
                text="signin_with"
              />
            </div>
          </GoogleOAuthProvider>
        )}

        <p className="text-center text-sm text-[#666] mt-6">
          Don't have an account?{' '}
          <Link
            to="/signup"
            data-testid={AUTH.switchToSignup}
            className="text-[#8A9A5B] hover:text-[#7a8a4b] font-medium transition-colors duration-200"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;