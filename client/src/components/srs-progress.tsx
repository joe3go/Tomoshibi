import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SRS_LEVELS } from "@shared/schema";

interface SrsProgressProps {
  userSrsItems?: {
    itemType: string;
    srsLevel: number;
    itemId: number;
  }[];
}

export default function SrsProgress({ userSrsItems = [] }: SrsProgressProps) {
  // Calculate distribution across SRS levels
  const levelDistribution = Array(10).fill(0);
  userSrsItems.forEach(item => {
    if (item.srsLevel >= 1 && item.srsLevel <= 10) {
      levelDistribution[item.srsLevel - 1]++;
    }
  });

  const totalItems = userSrsItems.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🏯</span>
          SRS Mastery Path
        </CardTitle>
        <CardDescription>
          Traditional Japanese dojo progression system tracking your learning journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {SRS_LEVELS.map((level, index) => {
          const itemCount = levelDistribution[index];
          const percentage = totalItems > 0 ? (itemCount / totalItems) * 100 : 0;
          
          return (
            <div key={level.level} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label={level.englishTitle}>
                    {level.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Level {level.level}: {level.englishTitle}</span>
                      <span className="text-lg font-japanese text-gray-600">
                        {level.japaneseTitle}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 max-w-md">
                      {level.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={itemCount > 0 ? "default" : "secondary"} className="mb-1">
                    {itemCount} items
                  </Badge>
                  {percentage > 0 && (
                    <div className="text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
              
              {itemCount > 0 && (
                <Progress value={percentage} className="h-2" />
              )}
              
              {index < SRS_LEVELS.length - 1 && (
                <div className="border-b border-gray-100 pb-2"></div>
              )}
            </div>
          );
        })}
        
        {totalItems === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🌱</div>
            <p>Start studying to begin your journey through the dojo levels!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}