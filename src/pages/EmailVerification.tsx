import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Shield, CheckCircle, AlertCircle, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { emailService } from "@/services/emailService";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      // Automatically send code when page loads with email
      sendVerificationCode(emailParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const sendVerificationCode = async (emailAddress: string) => {
    setSending(true);
    setError("");
    setSuccess("");

    try {
      const verificationCode = emailService.generateVerificationCode();
      const sent = await emailService.sendVerificationCode(emailAddress, verificationCode);
      
      if (sent) {
        setSuccess(`Verification code sent to ${emailAddress}. The code will expire in 10 minutes.`);
        setTimeLeft(600); // Reset timer to 10 minutes
        setCanResend(false);
      } else {
        setError("Failed to send verification code. Please try again.");
      }
    } catch (error) {
      setError("An error occurred while sending the verification code.");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError("Please enter the verification code");
      return;
    }

    if (code.length !== 6) {
      setError("Verification code must be 6 digits");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const isValid = await emailService.verifyCode(email, code);
      
      if (isValid) {
        setSuccess("Email verified successfully! Redirecting...");
        
        // Store verification status
        localStorage.setItem(`email_verified_${email}`, 'true');
        
        // Redirect to the intended destination or home
        const redirectTo = searchParams.get('redirect') || '/';
        setTimeout(() => {
          navigate(redirectTo);
        }, 2000);
      } else {
        setError("Invalid verification code. Please check and try again.");
      }
    } catch (error) {
      setError("An error occurred while verifying the code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (canResend && email) {
      sendVerificationCode(email);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-foreground">Email Required</CardTitle>
            <CardDescription className="text-muted-foreground">
              Please provide an email address to verify
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/signup')} 
              className="w-full"
            >
              Go to Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success && success.includes("successfully")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Email Verified!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your email has been successfully verified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
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
          <CardTitle className="text-2xl font-bold text-foreground">Verify Your Email</CardTitle>
          <CardDescription className="text-muted-foreground">
            We've sent a 6-digit verification code to {email}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && !success.includes("successfully") && (
            <Alert className="bg-blue-50 border-blue-200">
              <Mail className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-foreground">
                Verification Code
              </label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                disabled={loading}
                required
                className="w-full text-center text-lg tracking-widest font-mono"
                maxLength={6}
              />
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {timeLeft > 0 ? (
                <p>Code expires in <span className="font-mono font-medium">{formatTime(timeLeft)}</span></p>
              ) : (
                <p>Code has expired. Please request a new one.</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Email
                </>
              )}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the code?
              </p>
              <Button 
                variant="outline" 
                onClick={handleResend}
                disabled={!canResend || sending}
                className="w-full"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
                  </>
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <Link 
                to="/signin" 
                className="text-primary hover:underline flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
            <p>
              If you don't see the email, check your spam folder or ensure the email address is correct.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
