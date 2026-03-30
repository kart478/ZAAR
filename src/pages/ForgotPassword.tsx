import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService } from "@/services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft > 0 && submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, submitted]);

  const requestResetCode = async (emailAddress: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await authService.requestPasswordReset({ email: emailAddress });

      if (response.success) {
        setSuccess(response.message || `Password reset code sent to ${emailAddress}`);
        setSubmitted(true);
        setTimeLeft(60);
        setCanResend(false);
        
        // Store email in localStorage for the reset page
        localStorage.setItem('reset_email', emailAddress);
      } else {
        setError(response.error?.message || 'Failed to send reset code');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while sending the reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    await requestResetCode(email);
  };

  const handleResend = () => {
    if (canResend && email) {
      requestResetCode(email);
    }
  };

  const handleBackToSignIn = () => {
    navigate('/signin');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Check Your Email</CardTitle>
            <CardDescription className="text-muted-foreground">
              We've sent you a 6-digit code to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• The reset code will expire in 10 minutes</p>
              <p>• If you don't see the email, check your spam folder</p>
              <p>• Make sure to use the same email you registered with</p>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                onClick={() => navigate('/reset-password')} 
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Enter Reset Code
              </Button>
              
              <Button 
                onClick={handleResend}
                variant="outline" 
                disabled={!canResend || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {canResend ? 'Resend Code' : `Resend in ${timeLeft}s`}
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleBackToSignIn} 
                variant="ghost" 
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Forgot Password?</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email address and we'll send you a 6-digit code to reset your password
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Reset Code...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reset Code
                </>
              )}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link 
                to="/signin" 
                className="text-primary hover:underline font-medium"
              >
                Sign In
              </Link>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="text-primary hover:underline font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
            <p>
              By requesting a password reset, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
