import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, CheckCircle2, XCircle, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { LoginData } from "@shared/schema";
import { PACKAGES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthModalsProps {
  showLogin: boolean;
  showSignup: boolean;
  onCloseLogin: () => void;
  onCloseSignup: () => void;
  onSwitchToLogin: () => void;
  onSwitchToSignup: () => void;
}

// Form schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  referralId: z.string().optional(),
  placement: z.enum(["left", "right"]).optional(),
  packageType: z.enum(["silver", "gold", "platinum", "diamond"], {
    required_error: "Please select a package",
  }),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type SignupData = z.infer<typeof signupSchema>;

export const AuthModals = ({
  showLogin,
  showSignup,
  onCloseLogin,
  onCloseSignup,
  onSwitchToLogin,
  onSwitchToSignup,
}: AuthModalsProps) => {
  const { login, register, isLoading } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginStep, setLoginStep] = useState<'email' | 'password'>('email');
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [showPlacementOptions, setShowPlacementOptions] = useState(false);
  const [signupStep, setSignupStep] = useState<'email' | 'details' | 'placement' | 'package'>('email');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [showNoReferralDialog, setShowNoReferralDialog] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [isCheckingEmailAvailability, setIsCheckingEmailAvailability] = useState(false);

  // Login form
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Watch email and password fields
  const email = loginForm.watch("email");
  const password = loginForm.watch("password");

  // Verify email in real-time
  useEffect(() => {
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        setIsEmailVerified(true);
      } else {
        setIsEmailVerified(false);
      }
    } else {
      setIsEmailVerified(false);
    }
  }, [email]);

  // Verify password in real-time
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const verifyPassword = async () => {
      if (password && loginStep === 'password') {
        setIsVerifyingPassword(true);
        try {
          // Here you would make an API call to verify the password
          // For demo purposes, we'll simulate an API call
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
          
          // This is where you would check the password against the stored password
          // For demo purposes, we'll use a simple check
          const isCorrect = password === "test123"; // Replace with actual password check
          
          if (isCorrect) {
            setIsPasswordVerified(true);
            setPasswordError("");
          } else {
            setIsPasswordVerified(false);
            setPasswordError("Incorrect password");
          }
        } catch (error) {
          setIsPasswordVerified(false);
          setPasswordError("Error verifying password");
        } finally {
          setIsVerifyingPassword(false);
        }
      } else {
        setIsPasswordVerified(false);
        setPasswordError("");
      }
    };

    // Debounce the password verification
    if (password && loginStep === 'password') {
      timeoutId = setTimeout(verifyPassword, 500);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [password, loginStep]);

  const handleEmailNext = () => {
    if (isEmailVerified) {
      setLoginStep('password');
    }
  };

  const handleLogin = async (data: LoginData) => {
    if (!isPasswordVerified) return;
    await login(data);
    loginForm.reset();
    onCloseLogin();
  };

  const handleBackToEmail = () => {
    setLoginStep('email');
    setIsPasswordVerified(false);
    setPasswordError("");
  };

  // Signup form
  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      referralId: "",
      placement: "left",
      packageType: undefined,
      terms: false,
    },
  });

  // Watch email field for signup
  const signupEmail = signupForm.watch("email");

  // Verify email in real-time for signup
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const verifyEmailAndAvailability = async () => {
      if (signupEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(signupEmail)) {
          setIsEmailVerified(true);
          
          // Check email availability after format validation
          setIsCheckingEmailAvailability(true);
          setEmailError("");
          
          try {
            const isAvailable = await checkEmailAvailability(signupEmail);
            setIsEmailAvailable(isAvailable);
            
            if (!isAvailable) {
              setEmailError("This email is already registered. Please use a different email or login.");
            } else {
              setEmailError("");
            }
          } catch (error) {
            console.error('Error checking email availability:', error);
            setIsEmailAvailable(null);
            setEmailError("Unable to verify email availability. Please try again.");
          } finally {
            setIsCheckingEmailAvailability(false);
          }
        } else {
          setIsEmailVerified(false);
          setIsEmailAvailable(null);
          setEmailError("");
        }
      } else {
        setIsEmailVerified(false);
        setIsEmailAvailable(null);
        setEmailError("");
      }
    };

    // Debounce the email verification and availability check
    if (signupEmail) {
      timeoutId = setTimeout(verifyEmailAndAvailability, 800);
    } else {
      setIsEmailVerified(false);
      setIsEmailAvailable(null);
      setEmailError("");
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [signupEmail]);

  // Handle email next step for signup
  const handleSignupEmailNext = () => {
    if (isEmailVerified && (isEmailAvailable === true || isEmailAvailable === null)) {
      setSignupStep('details');
    }
  };

  // Check for stored referral ID when signup modal opens and reset states
  useEffect(() => {
    if (showSignup) {
      const storedRefId = sessionStorage.getItem('referralId');
      if (storedRefId) {
        signupForm.setValue('referralId', storedRefId);
        setShowPlacementOptions(true);
      }
    } else {
      // Reset email verification states when modal closes
      setIsEmailVerified(false);
      setIsEmailAvailable(null);
      setIsCheckingEmailAvailability(false);
      setEmailError("");
      setSignupStep('email');
      setSelectedPackage("");
    }
  }, [showSignup, signupForm]);

  // Check email availability
  const checkEmailAvailability = async (email: string) => {
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Email check response:', data); // Debug log
      return !data.exists; // true if email is available (doesn't exist)
    } catch (error) {
      console.error('Error checking email availability:', error);
      // Return null to indicate an error occurred, not that email is unavailable
      throw error;
    }
  };

  // Handle signup with email verification
  const handleSignup = async (data: SignupData) => {
    // Double-check email availability before final submission
    if (isEmailAvailable === false) {
      setEmailError("This email is already registered. Please use a different email.");
      return;
    }

    setIsCheckingEmail(true);
    setEmailError("");

    try {
      const { terms, ...userData } = data;
      await register(userData);
      // Clear the referral ID only after successful registration
      sessionStorage.removeItem('referralId');
      signupForm.reset();
      setSelectedPackage("");
      onSwitchToLogin();
    } catch (error) {
      console.error('Signup error:', error);
      setEmailError("An error occurred during registration. Please try again.");
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleDetailsNext = () => {
    const referralId = signupForm.watch("referralId");
    if (!referralId || referralId.trim() === "") {
      setShowNoReferralDialog(true);
    } else {
      setSignupStep('placement');
    }
  };

  const handleContinueWithoutReferral = async () => {
    try {
      // Fetch test user's referral ID
      const response = await fetch('/api/auth/test-referral-id');
      if (response.ok) {
        const data = await response.json();
        // Set test user's referral ID in the form
        signupForm.setValue("referralId", data.referralId);
      } else {
        console.error('Failed to fetch test user referral ID');
        // Fallback: clear referral ID and let backend handle it
        signupForm.setValue("referralId", "");
      }
    } catch (error) {
      console.error('Error fetching test user referral ID:', error);
      // Fallback: clear referral ID and let backend handle it
      signupForm.setValue("referralId", "");
    }
    
    setShowNoReferralDialog(false);
    setSignupStep('placement');
  };

  return (
    <>
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onCloseLogin}>
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl mx-auto my-auto max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-playfair text-2xl font-bold text-purple-dark">Login to Your Account</h2>
              <button className="text-gray-400 hover:text-gray-600" onClick={onCloseLogin}>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={loginForm.handleSubmit(handleLogin)}>
              {loginStep === 'email' ? (
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      {...loginForm.register("email")}
                      className="mt-1"
                    />
                    {email && (
                      <div className="mt-1 flex items-center">
                        {isEmailVerified ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            <span className="text-sm">Email verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Please enter a valid email</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={handleEmailNext}
                    disabled={!isEmailVerified}
                    className="w-full mt-4 bg-gold-dark hover:bg-gold text-gray-900 font-bold py-3 shadow-lg text-base tracking-wide border-2 border-gray-800"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email: {email}</span>
                      <button
                        type="button"
                        onClick={handleBackToEmail}
                        className="text-sm text-gold-dark hover:text-gold"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...loginForm.register("password")}
                        className="mt-1 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-1 flex items-center">
                        {isVerifyingPassword ? (
                          <div className="flex items-center text-gray-600">
                            <span className="text-sm">Verifying password...</span>
                          </div>
                        ) : isPasswordVerified ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            <span className="text-sm">Password verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">{passwordError}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="h-4 w-4 text-gold-dark focus:ring-gold-dark border-gray-300 rounded"
                      />
                      <Label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">Remember me</Label>
                    </div>
                    <a href="#" className="text-sm font-medium text-gold-dark hover:text-gold">Forgot password?</a>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-gold-dark hover:bg-gold text-gray-900 font-bold py-3 shadow-lg text-base tracking-wide border-2 border-gray-800"
                    disabled={isLoading || !isPasswordVerified || isVerifyingPassword}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </>
              )}
              
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <a href="#" className="font-medium text-gold-dark hover:text-gold" onClick={onSwitchToSignup}>
                  Sign up
                </a>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onCloseSignup}>
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl mx-auto my-auto max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-playfair text-2xl font-bold text-purple-dark">Create Your Account</h2>
              <button className="text-gray-400 hover:text-gray-600" onClick={onCloseSignup}>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={signupForm.handleSubmit(handleSignup)}>
              {signupStep === 'email' ? (
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      {...signupForm.register("email")}
                      className="mt-1"
                    />
                    {signupEmail && (
                      <div className="mt-1 flex items-center">
                        {!isEmailVerified ? (
                          <div className="flex items-center text-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Please enter a valid email</span>
                          </div>
                        ) : isCheckingEmailAvailability ? (
                          <div className="flex items-center text-gray-600">
                            <span className="text-sm">Checking email availability...</span>
                          </div>
                        ) : isEmailAvailable === true ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            <span className="text-sm">Email is available</span>
                          </div>
                        ) : isEmailAvailable === false ? (
                          <div className="flex items-center text-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Email is already registered</span>
                          </div>
                        ) : emailError ? (
                          <div className="flex items-center text-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Unable to verify email</span>
                          </div>
                        ) : null}
                      </div>
                    )}
                    {emailError && (
                      <div className="mt-1 text-red-600">
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">{emailError}</span>
                        </div>
                        {isEmailAvailable === false && (
                          <div className="mt-1">
                            <button
                              type="button"
                              onClick={onSwitchToLogin}
                              className="text-sm text-gold-dark hover:text-gold underline"
                            >
                              Switch to Login instead
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={handleSignupEmailNext}
                    disabled={!isEmailVerified || isCheckingEmailAvailability || isEmailAvailable === false}
                    className="w-full mt-4 bg-gold-dark hover:bg-gold text-gray-900 font-bold py-3 shadow-lg text-base tracking-wide border-2 border-gray-800"
                  >
                    {isCheckingEmailAvailability ? "Checking..." : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : signupStep === 'details' ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSignupStep('email')}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
                      Back
                    </Button>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">Email:</span>
                      <span className="font-medium">{signupEmail}</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      {...signupForm.register("name")}
                      className="mt-1"
                    />
                    {signupForm.formState.errors.name && (
                      <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      {...signupForm.register("phone")}
                      className="mt-1"
                    />
                    {signupForm.formState.errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...signupForm.register("password")}
                        className="mt-1 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {signupForm.formState.errors.password && (
                      <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-referral">Referral ID (Optional)</Label>
                    <Input
                      id="signup-referral"
                      type="text"
                      placeholder="Enter referral code"
                      {...signupForm.register("referralId")}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-start">
                    <Checkbox
                      id="terms"
                      checked={signupForm.watch("terms")}
                      onCheckedChange={(checked) => signupForm.setValue("terms", checked as boolean)}
                      className="h-4 w-4 mt-1 text-gold-dark focus:ring-gold-dark border-gray-300 rounded"
                    />
                    <Label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the <a href="#" className="text-gold-dark hover:text-gold">Terms of Service</a> and{" "}
                      <a href="#" className="text-gold-dark hover:text-gold">Privacy Policy</a>
                    </Label>
                  </div>
                  {signupForm.formState.errors.terms && (
                    <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.terms.message}</p>
                  )}

                  <Button
                    type="button"
                    onClick={handleDetailsNext}
                    className="w-full bg-gold-dark hover:bg-gold text-gray-900 font-bold py-3 shadow-lg text-base tracking-wide border-2 border-gray-800"
                    disabled={
                      isLoading || 
                      isCheckingEmail || 
                      !signupForm.watch("name") || 
                      !signupForm.watch("phone") || 
                      !signupForm.watch("password") || 
                      !signupForm.watch("terms") ||
                      signupForm.formState.errors.name ||
                      signupForm.formState.errors.phone ||
                      signupForm.formState.errors.password
                    }
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  {/* No Referral Dialog */}
                  <Dialog open={showNoReferralDialog} onOpenChange={setShowNoReferralDialog}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>No Referral ID</DialogTitle>
                        <DialogDescription>
                          You haven't provided a referral ID. Would you like to continue without a referral ID?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex space-x-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setShowNoReferralDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleContinueWithoutReferral}
                          className="bg-gold-dark hover:bg-gold text-gray-900"
                        >
                          Continue
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              ) : signupStep === 'placement' ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSignupStep('details')}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
                      Back
                    </Button>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">Email:</span>
                      <span className="font-medium">{signupEmail}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Choose Your Placement Position</h3>
                    <p className="text-sm text-gray-600">Select your preferred position in your sponsor's binary tree</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          signupForm.watch("placement") === "left"
                            ? "border-gold-dark bg-gold/10"
                            : "border-gray-200 hover:border-gold"
                        }`}
                        onClick={() => signupForm.setValue("placement", "left")}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Left</span>
                          {signupForm.watch("placement") === "left" && (
                            <CheckCircle2 className="h-5 w-5 text-gold-dark" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Place under sponsor's left leg</p>
                      </div>
                      
                      <div
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          signupForm.watch("placement") === "right"
                            ? "border-gold-dark bg-gold/10"
                            : "border-gray-200 hover:border-gold"
                        }`}
                        onClick={() => signupForm.setValue("placement", "right")}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Right</span>
                          {signupForm.watch("placement") === "right" && (
                            <CheckCircle2 className="h-5 w-5 text-gold-dark" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Place under sponsor's right leg</p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => setSignupStep('package')}
                      className="w-full bg-gold-dark hover:bg-gold text-gray-900 font-bold py-3 shadow-lg text-base tracking-wide border-2 border-gray-800"
                      disabled={!signupForm.watch("placement")}
                    >
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSignupStep('placement')}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
                      Back
                    </Button>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">Email:</span>
                      <span className="font-medium">{signupEmail}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Choose Your Package</h3>
                    <p className="text-sm text-gray-600">Select the investment package that best suits your goals</p>
                    
                    <div className="grid gap-4">
                      {PACKAGES.map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            selectedPackage === pkg.id
                              ? "border-gold-dark bg-gold/10"
                              : "border-gray-200 hover:border-gold"
                          }`}
                          onClick={() => {
                            setSelectedPackage(pkg.id);
                            signupForm.setValue("packageType", pkg.id as "silver" | "gold" | "platinum" | "diamond");
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-lg">{pkg.name}</h4>
                              <p className="text-sm text-gray-600">₹{pkg.monthlyAmount}/month</p>
                            </div>
                            {selectedPackage === pkg.id && (
                              <CheckCircle2 className="h-5 w-5 text-gold-dark" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gold-dark hover:bg-gold text-gray-900 font-bold py-3 shadow-lg text-base tracking-wide border-2 border-gray-800"
                      disabled={isLoading || isCheckingEmail || !signupForm.watch("packageType")}
                    >
                      {isLoading ? "Creating Account..." : isCheckingEmail ? "Verifying Email..." : "Create Account"}
                    </Button>
                    
                    {emailError && (
                      <div className="mt-2 flex items-center text-red-600">
                        <XCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">{emailError}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <a href="#" className="font-medium text-gold-dark hover:text-gold" onClick={onSwitchToLogin}>
                  Login
                </a>
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
