import { useState, useMemo } from "react";
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
  Settings
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DataLoadingAnimation } from "@/components/ui/japanese-loading";
import { AdminGuard } from "@/components/admin-guard";

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

export default function AdminPage() {
  const { toast } = useToast();
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

  // Fetch all cards
  const { data: cards = [], isLoading, error } = useQuery<SentenceCard[]>({
    queryKey: ["/api/admin/cards"],
    retry: false,
  });

  // Create card mutation
  const createCardMutation = useMutation({
    mutationFn: async (cardData: CardFormData) => {
      const processedData = {
        ...cardData,
        tags: cardData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        audioUrl: cardData.audioUrl || undefined
      };
      const response = await apiRequest("POST", "/api/admin/cards", processedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards"] });
      setIsAddDialogOpen(false);
      setFormData(initialFormData);
      toast({
        title: "Card Created",
        description: "New sentence card has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create card",
        variant: "destructive",
      });
    }
  });

  // Update card mutation
  const updateCardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CardFormData }) => {
      const processedData = {
        ...data,
        tags: data.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        audioUrl: data.audioUrl || undefined
      };
      const response = await apiRequest("PATCH", `/api/admin/cards/${id}`, processedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards"] });
      setIsEditDialogOpen(false);
      setEditingCard(null);
      setFormData(initialFormData);
      toast({
        title: "Card Updated",
        description: "Sentence card has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update card",
        variant: "destructive",
      });
    }
  });

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/cards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards"] });
      toast({
        title: "Card Deleted",
        description: "Sentence card has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete card",
        variant: "destructive",
      });
    }
  });

  // Filter and sort cards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = cards.filter(card => {
      const matchesSearch = !searchTerm || 
        card.japanese.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.reading.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLevel = selectedLevel === "all" || card.jlptLevel === selectedLevel;
      const matchesTheme = selectedTheme === "all" || card.theme === selectedTheme;
      const matchesRegister = selectedRegister === "all" || card.register === selectedRegister;
      
      return matchesSearch && matchesLevel && matchesTheme && matchesRegister;
    });

    // Sort cards
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof SentenceCard];
      let bValue: any = b[sortBy as keyof SentenceCard];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [cards, searchTerm, selectedLevel, selectedTheme, selectedRegister, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const total = cards.length;
    const byLevel = jlptLevels.reduce((acc, level) => {
      acc[level] = cards.filter(card => card.jlptLevel === level).length;
      return acc;
    }, {} as Record<string, number>);
    
    const byTheme = themes.reduce((acc, theme) => {
      acc[theme] = cards.filter(card => card.theme === theme).length;
      return acc;
    }, {} as Record<string, number>);

    const avgDifficulty = total > 0 ? cards.reduce((sum, card) => sum + card.difficulty, 0) / total : 0;

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
      tags: card.tags.join(", "),
      audioUrl: card.audioUrl || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this card?")) {
      deleteCardMutation.mutate(id);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredAndSortedCards, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sentence-cards-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const CardFormFields = ({ data, onChange }: { data: CardFormData; onChange: (data: CardFormData) => void }) => (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="japanese">Japanese Text *</Label>
          <Input
            id="japanese"
            value={data.japanese}
            onChange={(e) => onChange({ ...data, japanese: e.target.value })}
            placeholder="日本語"
            className="font-japanese"
          />
        </div>
        <div>
          <Label htmlFor="reading">Reading *</Label>
          <Input
            id="reading"
            value={data.reading}
            onChange={(e) => onChange({ ...data, reading: e.target.value })}
            placeholder="にほんご"
            className="font-japanese"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="english">English Translation *</Label>
        <Textarea
          id="english"
          value={data.english}
          onChange={(e) => onChange({ ...data, english: e.target.value })}
          placeholder="English translation"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="jlptLevel">JLPT Level</Label>
          <Select value={data.jlptLevel} onValueChange={(value) => onChange({ ...data, jlptLevel: value })}>
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
          <Label htmlFor="difficulty">Difficulty (1-10)</Label>
          <Input
            id="difficulty"
            type="number"
            min="1"
            max="10"
            value={data.difficulty}
            onChange={(e) => onChange({ ...data, difficulty: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div>
          <Label htmlFor="register">Register</Label>
          <Select value={data.register} onValueChange={(value) => onChange({ ...data, register: value })}>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="theme">Theme</Label>
          <Select value={data.theme} onValueChange={(value) => onChange({ ...data, theme: value })}>
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
          <Select value={data.source} onValueChange={(value) => onChange({ ...data, source: value })}>
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
          value={data.tags}
          onChange={(e) => onChange({ ...data, tags: e.target.value })}
          placeholder="verb, beginner, daily-life"
        />
      </div>

      <div>
        <Label htmlFor="audioUrl">Audio URL (optional)</Label>
        <Input
          id="audioUrl"
          value={data.audioUrl}
          onChange={(e) => onChange({ ...data, audioUrl: e.target.value })}
          placeholder="https://example.com/audio.mp3"
        />
      </div>
    </div>
  );

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
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
              <p className="text-muted-foreground">Failed to load sentence cards. Please try refreshing the page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Card Administration</h1>
          <p className="text-muted-foreground">Manage sentence cards, view reports, and analyze data</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Sentence Card</DialogTitle>
              </DialogHeader>
              <CardFormFields data={formData} onChange={setFormData} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createCardMutation.mutate(formData)}
                  disabled={createCardMutation.isPending || !formData.japanese || !formData.reading || !formData.english}
                >
                  {createCardMutation.isPending ? "Creating..." : "Create Card"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="cards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cards">
            <FileText className="w-4 h-4 mr-2" />
            Cards Management
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports & Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filters & Search</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showAdvancedFilters ? "Hide" : "Show"} Advanced
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search cards..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div>
                    <Label>Sort by</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">ID</SelectItem>
                        <SelectItem value="japanese">Japanese</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="jlptLevel">JLPT Level</SelectItem>
                        <SelectItem value="difficulty">Difficulty</SelectItem>
                        <SelectItem value="theme">Theme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {showAdvancedFilters && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cards Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Sentence Cards ({filteredAndSortedCards.length} of {cards.length})
              </CardTitle>
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
                      <TableHead>Tags</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedCards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-mono">{card.id}</TableCell>
                        <TableCell className="font-japanese max-w-32 truncate">
                          {card.japanese}
                        </TableCell>
                        <TableCell className="font-japanese max-w-32 truncate">
                          {card.reading}
                        </TableCell>
                        <TableCell className="max-w-48 truncate">
                          {card.english}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{card.jlptLevel}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={card.difficulty >= 7 ? "destructive" : card.difficulty >= 4 ? "default" : "secondary"}>
                            {card.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>{card.theme}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {card.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {card.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{card.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
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
                <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredAndSortedCards.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>JLPT Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jlptLevels.map(level => (
                    <div key={level} className="flex items-center gap-3">
                      <Badge className="w-12 justify-center">{level}</Badge>
                      <div className="flex-1 h-4 bg-muted rounded">
                        <div 
                          className="h-full bg-primary rounded"
                          style={{ 
                            width: `${stats.total > 0 ? (stats.byLevel[level] / stats.total) * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {stats.byLevel[level]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Theme Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byTheme)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([theme, count]) => (
                    <div key={theme} className="flex items-center gap-3">
                      <div className="w-20 text-sm truncate">{theme}</div>
                      <div className="flex-1 h-4 bg-muted rounded">
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sentence Card</DialogTitle>
          </DialogHeader>
          <CardFormFields data={formData} onChange={setFormData} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => editingCard && updateCardMutation.mutate({ id: editingCard.id, data: formData })}
              disabled={updateCardMutation.isPending || !formData.japanese || !formData.reading || !formData.english}
            >
              {updateCardMutation.isPending ? "Updating..." : "Update Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}