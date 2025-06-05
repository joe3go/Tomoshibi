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


export default function Landing() {
  return (
    <div className="min-h-screen warm-gradient">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-12">
              <div className="inline-flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center card-shadow border border-border/10">
                  <div className="lantern-icon text-primary scale-150"></div>
                </div>
                <h1 className="text-7xl font-light text-foreground tracking-tight">
                  Tomoshibi
                </h1>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-8 leading-tight">
                2,000 kanji. 6,000 vocabulary words. <br />
                <span className="text-primary font-normal">In just over a year.</span>
              </h2>
              
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto font-light">
                Master Japanese through <span className="font-medium text-foreground">authentic JLPT N5 content</span> with 
                our advanced spaced repetition system. Build lasting knowledge with sentence-based learning that works.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Link href="/auth">
                  <Button size="lg" className="btn-primary px-10 py-4 text-lg rounded-xl font-medium">
                    <Play className="w-5 h-5 mr-2" />
                    Start Learning
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="lg" className="btn-secondary px-10 py-4 text-lg rounded-xl font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="lg" className="btn-tertiary px-8 py-4 text-lg rounded-xl font-medium">
                    Try Demo
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-muted-foreground">
                No credit card required • Start learning immediately
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-foreground mb-4 max-w-4xl mx-auto leading-tight">
              From Japanese residents to self learners, our members learn to read Japanese quickly
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">A</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Andrew E.</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Self-learner, Boston MA</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "I studied Japanese in college, but kanji was my weak point. Tomoshibi teaches kanji with mnemonics and 
                  reinforces lessons with spaced reviews. Knowing kanji helped me jump from textbooks to native material."
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">S</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Shagun A.</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Self-learner, California</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "I was close to giving up on learning kanji until I found Tomoshibi. The SRS and leveling structure 
                  made sure I never overwhelmed myself. After a year, I can now read over 1,500 kanji confidently."
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">B</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Brian N.</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Japan Resident</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "I lived in Japan for eight years without learning much Japanese. After joining Tomoshibi and studying 
                  daily, the confidence I've gained helped me use Japanese in everyday life."
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">P</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Philip N.</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Teacher, Osaka Japan</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "I failed the JLPT N2 miserably with a score of 64/180. After just over a year with Tomoshibi, 
                  I passed the JLPT N2, nearly doubling my score to 121/180."
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">A</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Anthony R.</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Salaryman, Nagoya Japan</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "I worked in Japan for three years struggling with reading. After six months of daily Tomoshibi use, 
                  I've learned hundreds of kanji and now understand most Japanese text I encounter."
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">R</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Robert P.</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Self-learner, UK</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "Learning kanji felt like an overwhelming mountain to climb. Through Tomoshibi's comprehensive system, 
                  I made significant progress. The JLPT N3 kanji portion was a breeze thanks to this foundation."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Why It Works Section */}
      <div className="py-20 bg-gradient-to-r from-primary/10 to-orange-100 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What makes the Tomoshibi method effective?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Mnemonics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Tomoshibi has mnemonics to teach you every single kanji and vocabulary word. 
                  Waste less time, memorize and recall way more.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Sentence Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Learn kanji and vocabulary through authentic JLPT N5 sentences. 
                  Build real understanding, not just isolated knowledge.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Spaced Repetition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Our SRS algorithm adjusts review timing for each item based on your performance. 
                  See content at the optimal time for retention.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">JLPT Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Learn over 2,000 kanji and 6,000 vocabulary words, all carefully curated from 
                  official JLPT N5 materials and authentic sources.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Gamified Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Belt system, achievements, and progress tracking keep you motivated. 
                  Turn learning into an engaging, rewarding experience.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Daily Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Structured daily lessons and reviews ensure consistent progress. 
                  Just 15-30 minutes a day leads to dramatic improvement.
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

      {/* Final CTA Section */}
      <div className="py-20 bg-gradient-to-br from-primary to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How many kanji can you learn this month?
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Try Tomoshibi for free.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Link href="/auth">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                  <Star className="w-5 h-5 mr-2" />
                  Join Us
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
            
            <p className="text-white/80 text-sm">
              No credit card required • Start learning immediately
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}