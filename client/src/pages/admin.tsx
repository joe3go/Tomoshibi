import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Save,
  X,
  ArrowUpDown,
  Eye,
  BarChart3,
  FileText,
  Settings,
  Users,
  Shield,
  Check,
  AlertTriangle
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SentenceCard {
  id: number;
  japanese: string;
  reading: string;
  english: string;
  jlptLevel: string;
  difficulty: number;
  register: string;
  theme: string;
  source: string;
  tags: string[];
  audioUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  id: number;
  username: string;
  displayName: string;
  email: string | null;
  userType: string;
  currentBelt: string;
  currentJLPTLevel: string;
  totalXP: number;
  currentStreak: number;
  bestStreak: number;
  lastStudyDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CardFormData {
  japanese: string;
  reading: string;
  english: string;
  jlptLevel: string;
  difficulty: number;
  register: string;
  theme: string;
  source: string;
  tags: string;
  audioUrl: string;
}

const initialFormData: CardFormData = {
  japanese: "",
  reading: "",
  english: "",
  jlptLevel: "N5",
  difficulty: 1,
  register: "casual",
  theme: "general",
  source: "manual",
  tags: "",
  audioUrl: ""
};

const jlptLevels = ["N5", "N4", "N3", "N2", "N1"];
const registers = ["formal", "casual", "polite", "literary", "colloquial"];
const themes = ["general", "business", "travel", "food", "technology", "culture", "daily life", "education"];
const sources = ["manual", "jlpt", "textbook", "media", "conversation"];

function AdminPageContent() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Card management state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");
  const [selectedRegister, setSelectedRegister] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [editingCard, setEditingCard] = useState<SentenceCard | null>(null);
  const [formData, setFormData] = useState<CardFormData>(initialFormData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");

  // User management state
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserEditDialogOpen, setIsUserEditDialogOpen] = useState(false);

  // Upload state
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Fetch all cards
  const { data: cards = [], isLoading: cardsLoading, error: cardsError } = useQuery<SentenceCard[]>({
    queryKey: ["/api/admin/cards"],
  });

  // Fetch all users
  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Create card mutation
  const createCardMutation = useMutation({
    mutationFn: async (cardData: Partial<SentenceCard>) => {
      const response = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      });
      if (!response.ok) throw new Error("Failed to create card");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards"] });
      setIsAddDialogOpen(false);
      setFormData(initialFormData);
      toast({
        title: "Success",
        description: "Card created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create card",
        variant: "destructive",
      });
    },
  });

  // Update card mutation
  const updateCardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SentenceCard> }) => {
      const response = await fetch(`/api/admin/cards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update card");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards"] });
      setIsEditDialogOpen(false);
      setEditingCard(null);
      setFormData(initialFormData);
      toast({
        title: "Success",
        description: "Card updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update card",
        variant: "destructive",
      });
    },
  });

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/cards/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete card");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards"] });
      toast({
        title: "Success",
        description: "Card deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete card",
        variant: "destructive",
      });
    },
  });

  // Filtered and sorted cards
  const filteredCards = useMemo(() => {
    return cards
      .filter(card => {
        const matchesSearch = card.japanese.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             card.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             card.reading.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = selectedLevel === "all" || card.jlptLevel === selectedLevel;
        const matchesTheme = selectedTheme === "all" || card.theme === selectedTheme;
        const matchesRegister = selectedRegister === "all" || card.register === selectedRegister;
        
        return matchesSearch && matchesLevel && matchesTheme && matchesRegister;
      })
      .sort((a, b) => {
        const aVal = a[sortBy as keyof SentenceCard];
        const bVal = b[sortBy as keyof SentenceCard];
        
        if (sortOrder === "asc") {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });
  }, [cards, searchTerm, selectedLevel, selectedTheme, selectedRegister, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const total = cards.length;
    const byLevel = cards.reduce((acc, card) => {
      acc[card.jlptLevel] = (acc[card.jlptLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byTheme = cards.reduce((acc, card) => {
      acc[card.theme] = (acc[card.theme] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const avgDifficulty = cards.length > 0 ? cards.reduce((sum, card) => sum + card.difficulty, 0) / cards.length : 0;
    
    return { total, byLevel, byTheme, avgDifficulty };
  }, [cards]);

  const handleEdit = (card: SentenceCard) => {
    setEditingCard(card);
    setFormData({
      japanese: card.japanese,
      reading: card.reading,
      english: card.english,
      jlptLevel: card.jlptLevel,
      difficulty: card.difficulty,
      register: card.register,
      theme: card.theme,
      source: card.source,
      tags: Array.isArray(card.tags) ? card.tags.join(", ") : "",
      audioUrl: card.audioUrl || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this card?")) {
      deleteCardMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cardData = {
      ...formData,
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      audioUrl: formData.audioUrl || undefined
    };

    if (editingCard) {
      updateCardMutation.mutate({ id: editingCard.id, data: cardData });
    } else {
      createCardMutation.mutate(cardData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <DataLoadingAnimation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">Error Loading Admin Panel</h2>
              <p className="text-muted-foreground">
                Failed to load admin data. Please check your authentication.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage sentence cards and system content</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Card
        </Button>
      </div>

      <Tabs defaultValue="cards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cards">Sentence Cards</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search Japanese, English, or reading..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  Advanced Filters
                </Button>
              </div>

              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <Label>JLPT Level</Label>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {jlptLevels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Theme</Label>
                    <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Themes</SelectItem>
                        {themes.map(theme => (
                          <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Register</Label>
                    <Select value={selectedRegister} onValueChange={setSelectedRegister}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Registers</SelectItem>
                        {registers.map(register => (
                          <SelectItem key={register} value={register}>{register}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">ID</SelectItem>
                        <SelectItem value="japanese">Japanese</SelectItem>
                        <SelectItem value="difficulty">Difficulty</SelectItem>
                        <SelectItem value="jlptLevel">JLPT Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cards Table */}
          <Card>
            <CardHeader>
              <CardTitle>Sentence Cards ({filteredCards.length})</CardTitle>
              <CardDescription>
                Manage and edit sentence cards in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Japanese</TableHead>
                      <TableHead>Reading</TableHead>
                      <TableHead>English</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Theme</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell>{card.id}</TableCell>
                        <TableCell className="font-japanese">{card.japanese}</TableCell>
                        <TableCell className="text-muted-foreground">{card.reading}</TableCell>
                        <TableCell>{card.english}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{card.jlptLevel}</Badge>
                        </TableCell>
                        <TableCell>{card.difficulty}</TableCell>
                        <TableCell>{card.theme}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(card)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(card.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgDifficulty.toFixed(1)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Most Common Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {Object.entries(stats.byTheme).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Most Common Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {Object.entries(stats.byLevel).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cards by JLPT Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jlptLevels.map(level => {
                    const count = stats.byLevel[level] || 0;
                    return (
                      <div key={level} className="flex items-center gap-3">
                        <div className="w-12 text-sm font-medium">{level}</div>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ 
                              width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cards by Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byTheme)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([theme, count]) => (
                      <div key={theme} className="flex items-center gap-3">
                        <div className="w-20 text-sm font-medium truncate" title={theme}>
                          {theme}
                        </div>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-secondary rounded"
                            style={{ 
                              width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingCard(null);
          setFormData(initialFormData);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? "Edit Sentence Card" : "Add New Sentence Card"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="japanese">Japanese *</Label>
                <Input
                  id="japanese"
                  value={formData.japanese}
                  onChange={(e) => setFormData({ ...formData, japanese: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reading">Reading *</Label>
                <Input
                  id="reading"
                  value={formData.reading}
                  onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="english">English Translation *</Label>
              <Textarea
                id="english"
                value={formData.english}
                onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="jlptLevel">JLPT Level</Label>
                <Select
                  value={formData.jlptLevel}
                  onValueChange={(value) => setFormData({ ...formData, jlptLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jlptLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty (1-5)</Label>
                <Input
                  id="difficulty"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="register">Register</Label>
                <Select
                  value={formData.register}
                  onValueChange={(value) => setFormData({ ...formData, register: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {registers.map(register => (
                      <SelectItem key={register} value={register}>{register}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={formData.theme}
                  onValueChange={(value) => setFormData({ ...formData, theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map(theme => (
                      <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="source">Source</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData({ ...formData, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="verb, past-tense, common"
              />
            </div>

            <div>
              <Label htmlFor="audioUrl">Audio URL (optional)</Label>
              <Input
                id="audioUrl"
                type="url"
                value={formData.audioUrl}
                onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                placeholder="https://example.com/audio.mp3"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setIsEditDialogOpen(false);
                  setEditingCard(null);
                  setFormData(initialFormData);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCardMutation.isPending || updateCardMutation.isPending}
              >
                {createCardMutation.isPending || updateCardMutation.isPending
                  ? "Saving..."
                  : editingCard
                  ? "Update Card"
                  : "Create Card"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminPageContent />
    </AdminGuard>
  );
}