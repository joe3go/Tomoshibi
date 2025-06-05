import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Book, 
  Target, 
  Trophy, 
  Users, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  Award,
  Flame,
  Zap,
  Star,
  Brain,
  BookOpen,
  Play,
  CheckCircle
} from "lucide-react";
import logoImage from "@assets/generation-6a02e368-0179-44e8-b30c-e27dd8718770_1749086561653.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex justify-center mb-6">
                <img 
                  src={logoImage} 
                  alt="Tomoshibi - Japanese Learning with Lantern" 
                  className="max-w-md h-auto"
                />
              </div>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Master Japanese through <span className="font-semibold text-primary">authentic JLPT N5 content</span> with 
                our advanced spaced repetition system. Build lasting knowledge with sentence-based learning.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg">
                    <Play className="w-5 h-5 mr-2" />
                    Start Learning
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-primary text-primary hover:bg-primary/10">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Tomoshibi?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience the most effective way to learn Japanese with our scientifically-backed approach
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Smart SRS Algorithm</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Our advanced spaced repetition system adapts to your learning pace, ensuring optimal retention and progress.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Authentic JLPT Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Learn from genuine JLPT N5 sentences and vocabulary, building real-world Japanese proficiency.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Gamified Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Stay motivated with our belt system, achievements, and social features that make learning addictive.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Learning Approach Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Master Japanese the Right Way
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Our sentence-based approach teaches you Japanese as it's actually used
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Context-Rich Learning
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Learn vocabulary and grammar within authentic Japanese sentences, not isolated words.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      JLPT N5 Focused
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      All content is carefully curated from official JLPT N5 materials and authentic sources.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Progressive Difficulty
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Start with simple sentences and gradually work your way up to complex expressions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-lg">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Sample Learning Card
                  </h3>
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    JLPT N5 • Beginner
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      これは私の本です。
                    </p>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                      これは わたしの ほんです。
                    </p>
                    <p className="text-lg text-gray-800 dark:text-gray-200">
                      This is my book.
                    </p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge variant="outline" className="text-xs">Grammar: これは</Badge>
                      <Badge variant="outline" className="text-xs">Vocab: 本</Badge>
                      <Badge variant="outline" className="text-xs">Particle: の</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary/10 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Begin Your Japanese Journey?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of learners who are mastering Japanese with Tomoshibi's proven method
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg">
                  <Star className="w-5 h-5 mr-2" />
                  Start Free Today
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              No credit card required • Start learning immediately
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}