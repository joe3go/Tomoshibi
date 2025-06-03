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
  { level: "N5", name: "初心者", color: "hsl(var(--jlpt-n5))", status: "complete", xp: 500 },
  { level: "N4", name: "基礎", color: "hsl(var(--jlpt-n4))", status: "current", progress: 68, xp: 680 },
  { level: "N3", name: "中級", color: "hsl(var(--jlpt-n3))", status: "locked" },
  { level: "N2", name: "上級", color: "hsl(var(--jlpt-n2))", status: "locked" },
  { level: "N1", name: "熟達", color: "hsl(var(--jlpt-n1))", status: "locked" },
];

export default function JLPTJourney({ currentLevel, progress }: JLPTJourneyProps) {
  return (
    <div className="bg-gradient-to-br from-washi via-white to-sakura/5 rounded-2xl shadow-lg border border-sakura/20 p-4 lg:p-8 relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="currentColor"/>
          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8 relative z-10 gap-4 lg:gap-0">
        <div className="text-center lg:text-left">
          <h3 className="text-xl lg:text-2xl font-bold text-sumi mb-1">JLPT 進歩の旅路</h3>
          <p className="text-momiji font-medium">Japanese Proficiency Journey</p>
        </div>
        <div className="text-center lg:text-right">
          <div className="text-sm text-momiji font-medium">現在のレベル</div>
          <div className="text-lg font-bold text-sumi">{currentLevel}</div>
        </div>
      </div>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="hidden lg:block absolute top-8 left-8 right-8 h-0.5 bg-gray-200">
          <div className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-blue-500 w-2/5"></div>
        </div>
        
        {/* JLPT Levels */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4 lg:gap-0 relative z-10">
          {jlptLevels.map((level, index) => (
            <motion.div
              key={level.level}
              className={`flex flex-row lg:flex-col items-center lg:items-center gap-4 lg:gap-0 p-3 lg:p-0 rounded-xl lg:rounded-none bg-white/50 lg:bg-transparent ${level.status === "locked" ? "opacity-60" : ""}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: level.status === "locked" ? 0.6 : 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-white font-bold text-base lg:text-lg shadow-lg ${
                  level.status === "current" ? "border-4 border-blue-200" : ""
                }`}
                style={{ 
                  backgroundColor: level.status === "locked" ? "#D1D5DB" : level.color 
                }}
              >
                {level.status === "complete" && <i className="fas fa-check"></i>}
                {level.status === "current" && <span className="text-sm lg:text-base">{level.progress}%</span>}
                {level.status === "locked" && <i className="fas fa-lock text-gray-500"></i>}
              </div>
              
              <div className="flex-1 lg:flex-none lg:mt-3 text-left lg:text-center">
                <div className="font-bold text-sumi text-lg lg:text-base">{level.level}</div>
                <div className="text-sm text-momiji font-medium">{level.name}</div>
                <div className={`text-xs font-medium ${
                  level.status === "complete" ? "text-green-600" :
                  level.status === "current" ? "text-blue-600" :
                  "text-gray-400"
                }`}>
                  {level.status === "complete" && "Complete"}
                  {level.status === "current" && "In Progress"}
                  {level.status === "locked" && "Locked"}
                </div>
                
                {(level.status === "complete" || level.status === "current") && (
                  <div
                    className="mt-1 lg:mt-2 text-white px-2 py-1 rounded-full text-xs inline-block"
                    style={{ backgroundColor: level.color }}
                  >
                    {level.status === "complete" ? `+${level.xp} XP` : `${level.xp}/1000 XP`}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
