import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { Eye, EyeOff, Cherry, Sparkles } from "lucide-react";
import { SiGoogle } from "react-icons/si";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/login", loginForm);
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to your account.",
        });
        
        // Invalidate user query to refetch data
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        setLocation("/");
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An error occurred while logging in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/register", {
        email: registerForm.email,
        password: registerForm.password,
        username: registerForm.username,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Registration successful!",
          description: data.message,
        });
        
        // Reset form and switch to login tab
        setRegisterForm({
          email: "",
          password: "",
          confirmPassword: "",
          username: "",
        });
      } else {
        toast({
          title: "Registration failed",
          description: data.message || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An error occurred while creating your account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sakura via-shiro to-kawa">
      {/* Navigation Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-momiji to-ume rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">日</span>
            </div>
            <h1 className="text-xl font-bold text-sumi">Tomoshibi</h1>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                Home
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="hidden lg:block space-y-6 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="p-3 bg-gradient-to-br from-momiji to-ume rounded-xl">
                <Cherry className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-momiji to-ume bg-clip-text text-transparent">
                日本語学習
              </h1>
            </div>
            <h2 className="text-3xl font-bold text-yami mb-4">
              Master Japanese with Confidence
            </h2>
            <p className="text-lg text-yami/70 leading-relaxed">
              Master Japanese with our comprehensive JLPT-based learning system. Track your progress through vocabulary, kanji, and grammar with authentic content.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl text-center">
              <Sparkles className="h-6 w-6 mx-auto mb-2 text-momiji" />
              <div className="text-sm font-medium text-yami">JLPT Progress</div>
              <div className="text-xs text-yami/60">Visual journey map</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl text-center">
              <Cherry className="h-6 w-6 mx-auto mb-2 text-ume" />
              <div className="text-sm font-medium text-yami">SRS Learning</div>
              <div className="text-xs text-yami/60">Spaced repetition system</div>
            </div>
          </div>
        </div>

        {/* Authentication Form */}
        <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl bg-gradient-to-r from-momiji to-ume bg-clip-text text-transparent">
              Welcome
            </CardTitle>
            <CardDescription>
              Sign in to continue your Japanese learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <div className="space-y-4">
                  {/* Google OAuth Sign In */}
                  <Button
                    onClick={() => window.location.href = '/api/auth/google'}
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
                    variant="outline"
                  >
                    <SiGoogle className="mr-2 h-4 w-4" />
                    Continue with Google
                  </Button>
                  
                  <Button
                    onClick={async () => {
                      // Directly call the login API with demo credentials
                      try {
                        const response = await apiRequest("POST", "/api/login", {
                          username: "demo",
                          password: "demo"
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          queryClient.setQueryData(["/api/user"], data);
                          setLocation("/");
                        } else {
                          const errorData = await response.json();
                          toast({
                            title: "Demo login failed",
                            description: errorData.error || "Invalid credentials",
                            variant: "destructive",
                          });
                        }
                      } catch (error) {
                        toast({
                          title: "Demo login failed",
                          description: "Connection error",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    variant="default"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Try Demo Account
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Username or Email</Label>
                      <Input
                        id="login-email"
                        type="text"
                        placeholder="Enter your username or email"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-momiji to-ume hover:from-momiji/90 hover:to-ume/90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </div>
              </TabsContent>
              
              <TabsContent value="register">
                <div className="space-y-4">
                  {/* Google OAuth Sign Up */}
                  <Button
                    onClick={() => window.location.href = '/api/auth/google'}
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
                    variant="outline"
                  >
                    <SiGoogle className="mr-2 h-4 w-4" />
                    Sign up with Google
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Or create account with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Choose a username"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        required
                      />
                    </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-confirmPassword">Confirm Password</Label>
                    <Input
                      id="register-confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-momiji to-ume hover:from-momiji/90 hover:to-ume/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}