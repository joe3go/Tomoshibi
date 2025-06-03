import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  category: string;
}

interface AchievementModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AchievementModal({ achievement, isOpen, onClose }: AchievementModalProps) {
  if (!achievement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 text-center">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <i className={`${achievement.icon} text-white text-3xl`}></i>
          </motion.div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Achievement Unlocked!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{achievement.name}</h3>
            <p className="text-gray-600">{achievement.description}</p>
          </div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-orange-500 font-bold text-lg"
          >
            +{achievement.xpReward} XP Earned
          </motion.div>
          
          <Button
            onClick={onClose}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600"
          >
            Awesome!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
