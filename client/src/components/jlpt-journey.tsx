import { motion } from "framer-motion";

interface JLPTLevel {
  level: string;
  name: string;
  color: string;
  status: "complete" | "current" | "locked";
  progress?: number;
  xp?: number;
}

interface JLPTJourneyProps {
  currentLevel: string;
  progress?: any;
}

const jlptLevels: JLPTLevel[] = [
  { level: "N5", name: "Beginner", color: "#10B981", status: "complete", xp: 500 },
  { level: "N4", name: "Elementary", color: "#3B82F6", status: "current", progress: 68, xp: 680 },
  { level: "N3", name: "Intermediate", color: "#F59E0B", status: "locked" },
  { level: "N2", name: "Upper Inter.", color: "#EF4444", status: "locked" },
  { level: "N1", name: "Advanced", color: "#8B5CF6", status: "locked" },
];

export default function JLPTJourney({ currentLevel, progress }: JLPTJourneyProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">JLPT Progress Journey</h3>
        <div className="text-sm text-gray-500">Current Level: {currentLevel}</div>
      </div>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-8 left-8 right-8 h-0.5 bg-gray-200">
          <div className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-blue-500 w-2/5"></div>
        </div>
        
        {/* JLPT Levels */}
        <div className="flex justify-between relative z-10">
          {jlptLevels.map((level, index) => (
            <motion.div
              key={level.level}
              className={`flex flex-col items-center ${level.status === "locked" ? "opacity-60" : ""}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: level.status === "locked" ? 0.6 : 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                  level.status === "current" ? "border-4 border-blue-200" : ""
                }`}
                style={{ 
                  backgroundColor: level.status === "locked" ? "#D1D5DB" : level.color 
                }}
              >
                {level.status === "complete" && <i className="fas fa-check"></i>}
                {level.status === "current" && <span>{level.progress}%</span>}
                {level.status === "locked" && <i className="fas fa-lock text-gray-500"></i>}
              </div>
              
              <div className="mt-3 text-center">
                <div className="font-bold text-gray-900">{level.level}</div>
                <div className="text-sm text-gray-500">{level.name}</div>
                <div className={`text-xs font-medium ${
                  level.status === "complete" ? "text-green-600" :
                  level.status === "current" ? "text-blue-600" :
                  "text-gray-400"
                }`}>
                  {level.status === "complete" && "Complete"}
                  {level.status === "current" && "In Progress"}
                  {level.status === "locked" && "Locked"}
                </div>
              </div>
              
              {(level.status === "complete" || level.status === "current") && (
                <div
                  className="mt-2 text-white px-2 py-1 rounded-full text-xs"
                  style={{ backgroundColor: level.color }}
                >
                  {level.status === "complete" ? `+${level.xp} XP` : `${level.xp}/1000 XP`}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
