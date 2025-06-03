import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface JourneyNode {
  id: string;
  title: string;
  titleJapanese: string;
  description: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  type: 'milestone' | 'skill' | 'achievement' | 'checkpoint';
  status: 'completed' | 'current' | 'locked' | 'available';
  position: { x: number; y: number };
  connections: string[];
  requirements?: {
    kanji?: number;
    vocabulary?: number;
    grammar?: number;
    xp?: number;
  };
  rewards?: {
    xp: number;
    badge?: string;
  };
}

interface JourneyMapProps {
  userProgress?: {
    wanikaniData?: any;
    bunproData?: any;
  };
  userLevel: string;
  totalXP: number;
}

export default function JourneyMap({ userProgress, userLevel, totalXP }: JourneyMapProps) {
  const [selectedNode, setSelectedNode] = useState<JourneyNode | null>(null);
  const [animatedNodes, setAnimatedNodes] = useState<Set<string>>(new Set());

  // Define the learning journey nodes
  const journeyNodes: JourneyNode[] = [
    // N5 Foundation
    {
      id: "hiragana",
      title: "Hiragana Mastery",
      titleJapanese: "ひらがな",
      description: "Learn the basic Japanese syllabary",
      level: "N5",
      type: "milestone",
      status: "completed",
      position: { x: 10, y: 80 },
      connections: ["katakana"],
      requirements: { vocabulary: 50 },
      rewards: { xp: 100, badge: "First Steps" }
    },
    {
      id: "katakana",
      title: "Katakana Mastery",
      titleJapanese: "カタカナ",
      description: "Master the katakana writing system",
      level: "N5",
      type: "milestone",
      status: "completed",
      position: { x: 25, y: 70 },
      connections: ["basic-kanji"],
      requirements: { vocabulary: 100 },
      rewards: { xp: 150 }
    },
    {
      id: "basic-kanji",
      title: "Basic Kanji",
      titleJapanese: "基本漢字",
      description: "Learn fundamental kanji characters",
      level: "N5",
      type: "skill",
      status: "current",
      position: { x: 40, y: 60 },
      connections: ["greetings", "numbers"],
      requirements: { kanji: 50 },
      rewards: { xp: 300 }
    },
    {
      id: "greetings",
      title: "Greetings & Courtesy",
      titleJapanese: "挨拶",
      description: "Essential Japanese greetings and polite expressions",
      level: "N5",
      type: "skill",
      status: "available",
      position: { x: 60, y: 50 },
      connections: ["family"],
      requirements: { vocabulary: 200 },
      rewards: { xp: 200 }
    },
    {
      id: "numbers",
      title: "Numbers & Time",
      titleJapanese: "数字と時間",
      description: "Learn counting, time, and dates",
      level: "N5",
      type: "skill",
      status: "available",
      position: { x: 45, y: 40 },
      connections: ["shopping"],
      requirements: { vocabulary: 150 },
      rewards: { xp: 250 }
    },
    
    // N4 Intermediate
    {
      id: "family",
      title: "Family & Relationships",
      titleJapanese: "家族",
      description: "Vocabulary for family and social relationships",
      level: "N4",
      type: "skill",
      status: "locked",
      position: { x: 75, y: 35 },
      connections: ["te-form"],
      requirements: { vocabulary: 300, grammar: 20 },
      rewards: { xp: 400 }
    },
    {
      id: "shopping",
      title: "Shopping & Money",
      titleJapanese: "買い物",
      description: "Learn shopping vocabulary and transactions",
      level: "N4",
      type: "skill",
      status: "locked",
      position: { x: 55, y: 25 },
      connections: ["te-form"],
      requirements: { vocabulary: 350 },
      rewards: { xp: 350 }
    },
    {
      id: "te-form",
      title: "Te-form Grammar",
      titleJapanese: "て形",
      description: "Master the versatile te-form conjugation",
      level: "N4",
      type: "milestone",
      status: "locked",
      position: { x: 70, y: 20 },
      connections: ["past-tense"],
      requirements: { grammar: 35, vocabulary: 400 },
      rewards: { xp: 500, badge: "Grammar Expert" }
    },
    
    // N3 Advanced
    {
      id: "past-tense",
      title: "Past Tense Mastery",
      titleJapanese: "過去形",
      description: "Learn all past tense forms and usage",
      level: "N3",
      type: "skill",
      status: "locked",
      position: { x: 85, y: 15 },
      connections: ["keigo-basic"],
      requirements: { grammar: 50, vocabulary: 600 },
      rewards: { xp: 600 }
    },
    {
      id: "keigo-basic",
      title: "Basic Keigo",
      titleJapanese: "基本敬語",
      description: "Introduction to Japanese honorific language",
      level: "N3",
      type: "milestone",
      status: "locked",
      position: { x: 90, y: 8 },
      connections: [],
      requirements: { grammar: 75, vocabulary: 800, xp: 3000 },
      rewards: { xp: 800, badge: "Polite Speaker" }
    }
  ];

  // Calculate node status based on user progress
  const getNodeStatus = (node: JourneyNode): 'completed' | 'current' | 'available' | 'locked' => {
    const kanjiCount = userProgress?.wanikaniData?.subjects?.kanji || 0;
    const vocabCount = userProgress?.wanikaniData?.subjects?.vocabulary || 0;
    const grammarCount = userProgress?.bunproData?.grammar_points_learned || 0;

    // Check if requirements are met
    const meetsRequirements = 
      (!node.requirements?.kanji || kanjiCount >= node.requirements.kanji) &&
      (!node.requirements?.vocabulary || vocabCount >= node.requirements.vocabulary) &&
      (!node.requirements?.grammar || grammarCount >= node.requirements.grammar) &&
      (!node.requirements?.xp || totalXP >= node.requirements.xp);

    if (!meetsRequirements) return 'locked';

    // Simple progression logic
    if (node.id === 'hiragana' || node.id === 'katakana') return 'completed';
    if (node.id === 'basic-kanji') return 'current';
    if (node.level === 'N5' && kanjiCount >= 25) return 'available';
    if (node.level === 'N4' && kanjiCount >= 100) return 'available';
    if (node.level === 'N3' && kanjiCount >= 200) return 'available';
    
    return 'locked';
  };

  // Update node statuses
  const updatedNodes = journeyNodes.map(node => ({
    ...node,
    status: getNodeStatus(node)
  }));

  // Animate nodes on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      updatedNodes.forEach((node, index) => {
        setTimeout(() => {
          setAnimatedNodes(prev => new Set(Array.from(prev).concat(node.id)));
        }, index * 200);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const getNodeColor = (status: string, type: string) => {
    switch (status) {
      case 'completed':
        return type === 'milestone' ? 'bg-achievement-gold' : 'bg-matcha';
      case 'current':
        return 'bg-primary zen-pulse';
      case 'available':
        return 'bg-bamboo';
      case 'locked':
      default:
        return 'bg-muted';
    }
  };

  const getNodeBorder = (status: string, level: string) => {
    const levelColors = {
      'N5': 'border-jlpt-n5',
      'N4': 'border-jlpt-n4', 
      'N3': 'border-jlpt-n3',
      'N2': 'border-jlpt-n2',
      'N1': 'border-jlpt-n1'
    };
    return `${levelColors[level as keyof typeof levelColors]} ${status === 'current' ? 'border-2' : 'border'}`;
  };

  const getProgressForNode = (node: JourneyNode) => {
    if (!node.requirements) return 100;
    
    const kanjiCount = userProgress?.wanikaniData?.subjects?.kanji || 0;
    const vocabCount = userProgress?.wanikaniData?.subjects?.vocabulary || 0;
    const grammarCount = userProgress?.bunproData?.grammar_points_learned || 0;

    const kanjiProgress = node.requirements.kanji ? Math.min(100, (kanjiCount / node.requirements.kanji) * 100) : 100;
    const vocabProgress = node.requirements.vocabulary ? Math.min(100, (vocabCount / node.requirements.vocabulary) * 100) : 100;
    const grammarProgress = node.requirements.grammar ? Math.min(100, (grammarCount / node.requirements.grammar) * 100) : 100;
    const xpProgress = node.requirements.xp ? Math.min(100, (totalXP / node.requirements.xp) * 100) : 100;

    return Math.min(kanjiProgress, vocabProgress, grammarProgress, xpProgress);
  };

  return (
    <div className="japanese-card p-6">
      <div className="mb-6">
        <h2 className="japanese-heading text-2xl font-bold text-foreground mb-2">
          学習の旅 - Learning Journey
        </h2>
        <p className="japanese-text text-muted-foreground">
          Navigate your path to Japanese mastery
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Journey Map */}
        <div className="lg:col-span-2">
          <div className="relative bg-washi rounded-xl p-6 min-h-[500px] overflow-hidden">
            {/* Background grid pattern */}
            <div className="absolute inset-0 shoji-pattern pointer-events-none" />
            
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              {updatedNodes.map(node => 
                node.connections.map(connectionId => {
                  const targetNode = updatedNodes.find(n => n.id === connectionId);
                  if (!targetNode) return null;
                  
                  return (
                    <line
                      key={`${node.id}-${connectionId}`}
                      x1={`${node.position.x}%`}
                      y1={`${node.position.y}%`}
                      x2={`${targetNode.position.x}%`}
                      y2={`${targetNode.position.y}%`}
                      stroke="hsl(var(--border))"
                      strokeWidth="2"
                      strokeDasharray={node.status === 'completed' ? "0" : "5,5"}
                      className="transition-all duration-500"
                    />
                  );
                })
              )}
            </svg>

            {/* Journey nodes */}
            {updatedNodes.map((node) => (
              <div
                key={node.id}
                className={`absolute cursor-pointer transition-all duration-500 ${
                  animatedNodes.has(node.id) ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}
                style={{
                  left: `${node.position.x}%`,
                  top: `${node.position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2
                }}
                onClick={() => setSelectedNode(node)}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform ${getNodeColor(node.status, node.type)} ${getNodeBorder(node.status, node.level)}`}
                >
                  {node.type === 'milestone' && (
                    <span className="text-2xl">🏆</span>
                  )}
                  {node.type === 'skill' && (
                    <span className="text-2xl">📚</span>
                  )}
                  {node.type === 'achievement' && (
                    <span className="text-2xl">⭐</span>
                  )}
                  {node.type === 'checkpoint' && (
                    <span className="text-2xl">🎯</span>
                  )}
                </div>
                
                {/* Node label */}
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-center">
                  <div className="japanese-text text-xs font-medium text-foreground whitespace-nowrap">
                    {node.titleJapanese}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {node.title}
                  </div>
                </div>

                {/* Progress indicator for current/available nodes */}
                {(node.status === 'current' || node.status === 'available') && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20">
                    <Progress 
                      value={getProgressForNode(node)} 
                      className="h-1 bg-muted"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Node Details Panel */}
        <div className="space-y-4">
          {selectedNode ? (
            <Card className="japanese-card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="japanese-heading text-lg font-semibold">
                        {selectedNode.titleJapanese}
                      </h3>
                      <Badge variant="outline" className={`text-jlpt-${selectedNode.level.toLowerCase()}`}>
                        {selectedNode.level}
                      </Badge>
                    </div>
                    <h4 className="text-base font-medium text-muted-foreground mb-3">
                      {selectedNode.title}
                    </h4>
                    <p className="japanese-text text-sm text-muted-foreground">
                      {selectedNode.description}
                    </p>
                  </div>

                  {/* Requirements */}
                  {selectedNode.requirements && (
                    <div>
                      <h5 className="japanese-text font-medium mb-2">Requirements:</h5>
                      <div className="space-y-2">
                        {selectedNode.requirements.kanji && (
                          <div className="flex justify-between text-sm">
                            <span>Kanji:</span>
                            <span className="japanese-text">
                              {userProgress?.wanikaniData?.subjects?.kanji || 0}/{selectedNode.requirements.kanji}
                            </span>
                          </div>
                        )}
                        {selectedNode.requirements.vocabulary && (
                          <div className="flex justify-between text-sm">
                            <span>Vocabulary:</span>
                            <span className="japanese-text">
                              {userProgress?.wanikaniData?.subjects?.vocabulary || 0}/{selectedNode.requirements.vocabulary}
                            </span>
                          </div>
                        )}
                        {selectedNode.requirements.grammar && (
                          <div className="flex justify-between text-sm">
                            <span>Grammar:</span>
                            <span className="japanese-text">
                              {userProgress?.bunproData?.grammar_points_learned || 0}/{selectedNode.requirements.grammar}
                            </span>
                          </div>
                        )}
                        {selectedNode.requirements.xp && (
                          <div className="flex justify-between text-sm">
                            <span>Total XP:</span>
                            <span className="japanese-text">
                              {totalXP}/{selectedNode.requirements.xp}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rewards */}
                  {selectedNode.rewards && (
                    <div>
                      <h5 className="japanese-text font-medium mb-2">Rewards:</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>XP Reward:</span>
                          <span className="text-achievement japanese-text">+{selectedNode.rewards.xp}</span>
                        </div>
                        {selectedNode.rewards.badge && (
                          <div className="flex justify-between">
                            <span>Badge:</span>
                            <span className="text-achievement-gold">{selectedNode.rewards.badge}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress:</span>
                      <span className="japanese-text">{Math.round(getProgressForNode(selectedNode))}%</span>
                    </div>
                    <Progress value={getProgressForNode(selectedNode)} className="h-2" />
                  </div>

                  {/* Action button */}
                  {selectedNode.status === 'available' && (
                    <Button className="w-full matcha-gradient text-white">
                      Begin Learning
                    </Button>
                  )}
                  {selectedNode.status === 'current' && (
                    <Button className="w-full sakura-gradient text-white">
                      Continue Learning
                    </Button>
                  )}
                  {selectedNode.status === 'completed' && (
                    <Button variant="outline" className="w-full" disabled>
                      ✓ Completed
                    </Button>
                  )}
                  {selectedNode.status === 'locked' && (
                    <Button variant="outline" className="w-full" disabled>
                      🔒 Locked
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="japanese-card">
              <CardContent className="p-6 text-center">
                <div className="gentle-float text-4xl mb-4">🗾</div>
                <h3 className="japanese-heading text-lg font-semibold mb-2">
                  日本語の旅
                </h3>
                <p className="japanese-text text-sm text-muted-foreground">
                  Click on any point in the journey map to explore your learning path and track your progress.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <Card className="japanese-card">
            <CardContent className="p-4">
              <h4 className="japanese-text font-medium mb-3">Legend:</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-achievement-gold"></div>
                  <span>Milestone Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-matcha"></div>
                  <span>Skill Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary zen-pulse"></div>
                  <span>Currently Learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-bamboo"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-muted"></div>
                  <span>Locked</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}