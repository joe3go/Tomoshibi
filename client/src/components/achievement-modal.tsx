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
      <DialogContent className="max-w-md mx-4 text-center bg-gradient-to-br from-washi via-white to-sakura/10 border-2 border-achievement">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-24 h-24 bg-gradient-to-br from-achievement-gold via-achievement to-momiji rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
          >
            <i className={`${achievement.icon} text-white text-4xl`}></i>
          </motion.div>
          <DialogTitle className="text-3xl font-bold text-sumi mb-2">
            実績解除！
          </DialogTitle>
          <p className="text-momiji font-medium">Achievement Unlocked!</p>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="relative">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sakura/20 to-transparent rounded-lg"></div>
            <div className="relative p-4">
              <h3 className="text-xl font-bold text-sumi mb-2">{achievement.name}</h3>
              <p className="text-sumi/80">{achievement.description}</p>
            </div>
          </div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-achievement-gold to-achievement text-white font-bold text-xl py-3 px-6 rounded-xl shadow-lg"
          >
            +{achievement.xpReward} XP 獲得
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-momiji to-ume text-white px-8 py-3 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-200"
            >
              素晴らしい！
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
