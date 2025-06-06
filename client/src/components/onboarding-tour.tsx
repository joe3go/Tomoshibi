import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Brain, 
  Calendar, 
  Target, 
  Award,
  BookOpen,
  Zap
} from "lucide-react";

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tourSteps = [
  {
    id: 1,
    title: "Welcome to Tomoshibi",
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed">
          Tomoshibi uses a scientifically-proven <strong>Spaced Repetition System (SRS)</strong> to help you learn Japanese efficiently.
        </p>
        <div className="bg-primary/5 p-4 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            How SRS Works
          </h4>
          <p className="text-xs text-muted-foreground">
            Cards you find difficult appear more frequently, while easy cards appear less often. This optimizes your study time and improves retention.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "Understanding Review Buttons",
    icon: <Target className="w-8 h-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <p className="text-sm">Each review button affects when you'll see the card again:</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="destructive" className="w-16 text-xs">Again</Badge>
            <span className="text-sm">Shows again in ~1 minute</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="w-16 text-xs">Hard</Badge>
            <span className="text-sm">Reduces interval by ~50%</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="default" className="w-16 text-xs">Good</Badge>
            <span className="text-sm">Normal interval progression</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="w-16 text-xs bg-green-50 border-green-200">Easy</Badge>
            <span className="text-sm">Increases interval significantly</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Card Learning Stages",
    icon: <Award className="w-8 h-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <p className="text-sm">Cards progress through different mastery levels:</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-sm"><strong>New:</strong> Learning for the first time</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
            <span className="text-sm"><strong>Learning:</strong> Short intervals (minutes to days)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-sm"><strong>Review:</strong> Longer intervals (days to weeks)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-sm"><strong>Mature:</strong> Months between reviews</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "Your Study Dashboard",
    icon: <Calendar className="w-8 h-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <p className="text-sm">Track your progress and maintain consistency:</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-sm">Daily streak counter</span>
          </div>
          <div className="flex items-center gap-3">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-sm">Review queue status</span>
          </div>
          <div className="flex items-center gap-3">
            <Award className="w-4 h-4 text-green-500" />
            <span className="text-sm">Progress milestones</span>
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Tip:</strong> Consistent daily reviews, even just 10 minutes, are more effective than long cramming sessions.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: "Ready to Start Learning!",
    icon: <Zap className="w-8 h-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <p className="text-sm">You're all set to begin your Japanese learning journey!</p>
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Getting Started Tips:</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• Start with 5-10 new cards per day</li>
            <li>• Review all due cards daily</li>
            <li>• Use the "Again" button when unsure</li>
            <li>• Focus on understanding, not speed</li>
          </ul>
        </div>
      </div>
    )
  }
];

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    // Mark onboarding as completed
    localStorage.setItem('tomoshibi-onboarding-completed', 'true');
    setTimeout(() => {
      onComplete();
      onClose();
    }, 500);
  };

  const handleSkip = () => {
    localStorage.setItem('tomoshibi-onboarding-completed', 'true');
    onClose();
  };

  const currentStepData = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {currentStepData.icon}
              {currentStepData.title}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep + 1} of {tourSteps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="min-h-[200px]">
            {currentStepData.content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Skip Tour
              </Button>
              <Button
                onClick={handleNext}
                disabled={isCompleting}
                className="flex items-center gap-2"
              >
                {currentStep === tourSteps.length - 1 ? (
                  isCompleting ? "Starting..." : "Get Started"
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('tomoshibi-onboarding-completed');
    if (!hasCompletedOnboarding) {
      // Delay showing onboarding to let the page load
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const startOnboarding = () => setShowOnboarding(true);
  const completeOnboarding = () => setShowOnboarding(false);

  return {
    showOnboarding,
    startOnboarding,
    completeOnboarding
  };
}