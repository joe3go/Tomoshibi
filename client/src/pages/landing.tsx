import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Brain, BookOpen, Target, Star, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Master Japanese with AI-Powered Learning
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transform your Japanese learning journey with personalized SRS flashcards, interactive exercises, and comprehensive JLPT preparation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/auth">
                <Play className="w-5 h-5 mr-2" />
                Start Learning
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/admin/login">
                Admin Login
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Choose Tomoshibi?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Brain className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered SRS</h3>
              <p className="text-muted-foreground">
                Intelligent spaced repetition system adapts to your learning pace
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">JLPT Preparation</h3>
              <p className="text-muted-foreground">
                Comprehensive content for all JLPT levels N5 to N1
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Personalized Learning</h3>
              <p className="text-muted-foreground">
                Tailored study plans based on your goals and progress
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Vocabulary Cards</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-muted-foreground">Grammar Points</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">2,000+</div>
              <div className="text-muted-foreground">Kanji Characters</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Start Your Japanese Journey?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of learners who have transformed their Japanese skills with our platform.
        </p>
        
        <Button size="lg" className="text-lg px-8 py-6" asChild>
          <Link href="/auth">
            Get Started Now
          </Link>
        </Button>
      </div>
    </div>
  );
}