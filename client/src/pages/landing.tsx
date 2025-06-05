import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Play, 
  Brain, 
  BookOpen, 
  Target, 
  Star, 
  Users, 
  Clock,
  TrendingUp,
  Award,
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

      {/* Features Section */}
      <div className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-semibold text-center mb-16 text-foreground">
            Why Tomoshibi Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8 rounded-2xl bg-white card-shadow border border-border/10">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-xl mb-4 text-foreground">Smart SRS Algorithm</h4>
              <p className="text-muted-foreground leading-relaxed">
                Our scientifically-proven spaced repetition system adapts to your learning pace, ensuring optimal retention.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white card-shadow border border-border/10">
              <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-xl mb-4 text-foreground">Authentic JLPT Content</h4>
              <p className="text-muted-foreground leading-relaxed">
                Learn with real JLPT N5 sentences and vocabulary, not artificial examples. Build practical Japanese skills.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white card-shadow border border-border/10">
              <div className="w-16 h-16 bg-tertiary rounded-xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-tertiary-foreground" />
              </div>
              <h4 className="font-semibold text-xl mb-4 text-foreground">Gamified Progress</h4>
              <p className="text-muted-foreground leading-relaxed">
                Stay motivated with achievement badges, streak tracking, and personalized learning paths.
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
            <Card className="border border-border/10 card-shadow bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">A</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Andrew E.</h4>
                    <p className="text-sm text-muted-foreground">Self-learner, Boston MA</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "I studied Japanese in college, but kanji was my weak point. Tomoshibi teaches kanji with mnemonics and 
                  reinforces lessons with spaced reviews. Knowing kanji helped me jump from textbooks to native material."
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/10 card-shadow bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="text-secondary font-semibold text-lg">S</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Shagun A.</h4>
                    <p className="text-sm text-muted-foreground">Self-learner, California</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "I was close to giving up on learning kanji until I found Tomoshibi. The SRS and leveling structure 
                  made sure I never overwhelmed myself. After a year, I can now read over 1,500 kanji confidently."
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/10 card-shadow bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center">
                    <span className="text-tertiary font-semibold text-lg">B</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Brian N.</h4>
                    <p className="text-sm text-muted-foreground">Japan Resident</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "I lived in Japan for eight years without learning much Japanese. After joining Tomoshibi and studying 
                  daily, the confidence I've gained helped me use Japanese in everyday life."
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/10 card-shadow bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">P</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Philip N.</h4>
                    <p className="text-sm text-muted-foreground">Teacher, Osaka Japan</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "When I started at Tomoshibi I could only read katakana and hiragana. Now I read news articles 
                  and understand anime without subtitles. The structured learning path made all the difference."
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/10 card-shadow bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="text-secondary font-semibold text-lg">M</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Maria S.</h4>
                    <p className="text-sm text-muted-foreground">Graphic Designer, Spain</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "Learning kanji seemed impossible until I discovered Tomoshibi. The SRS system helped me retain 
                  characters effortlessly. Now I'm confidently reading manga in Japanese!"
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/10 card-shadow bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center">
                    <span className="text-tertiary font-semibold text-lg">K</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Keiko T.</h4>
                    <p className="text-sm text-muted-foreground">Student, Tokyo Japan</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "As a Japanese person learning to read complex kanji, Tomoshibi's systematic approach helped me 
                  master characters I'd been struggling with. The achievement system keeps me motivated."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              Join thousands of successful learners
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-2xl bg-white card-shadow border border-border/10">
              <div className="text-3xl font-bold text-primary mb-2">50,000+</div>
              <p className="text-muted-foreground">Active Learners</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white card-shadow border border-border/10">
              <div className="text-3xl font-bold text-secondary mb-2">2.1M+</div>
              <p className="text-muted-foreground">Reviews Completed</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white card-shadow border border-border/10">
              <div className="text-3xl font-bold text-tertiary mb-2">85%</div>
              <p className="text-muted-foreground">Retention Rate</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white card-shadow border border-border/10">
              <div className="text-3xl font-bold text-primary mb-2">4.8/5</div>
              <p className="text-muted-foreground">User Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Path Section */}
      <div className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              Your path to Japanese mastery
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Follow our carefully crafted learning progression that takes you from beginner to confident reader
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border border-border/10 card-shadow bg-white p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Foundation</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Start with essential hiragana, katakana, and basic kanji. Build your foundation with core vocabulary and grammar patterns.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    46 hiragana characters
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    46 katakana characters
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    100 basic kanji
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-border/10 card-shadow bg-white p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Expansion</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Expand your vocabulary with JLPT N5 content. Learn kanji through authentic sentences and context-based examples.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-secondary mr-2" />
                    800+ vocabulary words
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-secondary mr-2" />
                    200+ kanji characters
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-secondary mr-2" />
                    Grammar patterns
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-border/10 card-shadow bg-white p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-tertiary rounded-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-tertiary-foreground text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Mastery</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Achieve reading fluency with advanced vocabulary and complex sentences. Ready for native content and beyond.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-tertiary mr-2" />
                    2000+ kanji characters
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-tertiary mr-2" />
                    6000+ vocabulary words
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-tertiary mr-2" />
                    Native content ready
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-semibold text-foreground mb-6">
              Start your Japanese learning journey today
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join thousands of learners who have mastered Japanese with our proven SRS system. 
              Your first lesson is waiting.
            </p>
            <Link href="/auth">
              <Button size="lg" className="btn-primary px-12 py-4 text-lg rounded-xl font-medium">
                <Play className="w-5 h-5 mr-2" />
                Begin Learning Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}