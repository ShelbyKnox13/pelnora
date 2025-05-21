import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { LoginData } from "@shared/schema";

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

  // Login form
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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
      terms: false,
    },
  });
  
  const [showPlacementOptions, setShowPlacementOptions] = useState(false);

  const handleLogin = async (data: LoginData) => {
    await login(data);
    loginForm.reset();
    onCloseLogin();
  };

  const handleSignup = async (data: SignupData) => {
    const { terms, ...userData } = data;
    await register(userData);
    signupForm.reset();
    onSwitchToLogin();
  };

  return (
    <>
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onCloseLogin}>
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-playfair text-2xl font-bold text-purple-dark">Login to Your Account</h2>
              <button className="text-gray-400 hover:text-gray-600" onClick={onCloseLogin}>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={loginForm.handleSubmit(handleLogin)}>
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  {...loginForm.register("email")}
                  className="mt-1"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  {...loginForm.register("password")}
                  className="mt-1"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
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
                className="w-full bg-purple-dark hover:bg-purple text-white font-bold"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onCloseSignup}>
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-playfair text-2xl font-bold text-purple-dark">Create Your Account</h2>
              <button className="text-gray-400 hover:text-gray-600" onClick={onCloseSignup}>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={signupForm.handleSubmit(handleSignup)}>
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
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  {...signupForm.register("email")}
                  className="mt-1"
                />
                {signupForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{signupForm.formState.errors.email.message}</p>
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
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  {...signupForm.register("password")}
                  className="mt-1"
                />
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
                  onChange={(e) => {
                    if (e.target.value.trim().length > 0) {
                      setShowPlacementOptions(true);
                    } else {
                      setShowPlacementOptions(false);
                    }
                  }}
                />
              </div>
              
              {showPlacementOptions && (
                <div className="border rounded-md p-3 bg-gray-50">
                  <Label className="text-sm font-medium mb-2 block">Binary Placement Position</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="placement-left"
                        value="left"
                        {...signupForm.register("placement")}
                        className="h-4 w-4 text-gold-dark focus:ring-gold-dark border-gray-300"
                        defaultChecked
                      />
                      <Label htmlFor="placement-left" className="ml-2 block text-sm">
                        Left
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="placement-right"
                        value="right"
                        {...signupForm.register("placement")}
                        className="h-4 w-4 text-gold-dark focus:ring-gold-dark border-gray-300"
                      />
                      <Label htmlFor="placement-right" className="ml-2 block text-sm">
                        Right
                      </Label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Select your preferred position in your sponsor's binary tree</p>
                </div>
              )}
              
              <div className="flex items-start">
                <Checkbox
                  id="terms"
                  {...signupForm.register("terms")}
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
                type="submit"
                className="w-full bg-purple-dark hover:bg-purple text-white font-bold"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
              
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
