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
const userTypes = ["free", "premium", "admin"];
const belts = ["白帯", "黄帯", "緑帯", "青帯", "茶帯", "黒帯"];

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
      const response = await apiRequest("/api/admin/cards", {
        method: "POST",
        body: JSON.stringify(cardData),
        headers: { "Content-Type": "application/json" }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards"] });
      setIsAddDialogOpen(false);
      setFormData(initialFormData);
      toast({ title: "Success", description: "Card created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update card mutation
  const updateCardMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<SentenceCard> }) => {
      const response = await apiRequest(`/api/admin/cards/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
        headers: { "Content-Type": "application/json" }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards"] });
      setIsEditDialogOpen(false);
      setEditingCard(null);
      setEditingCardId(null);
      setEditingField(null);
      toast({ title: "Success", description: "Card updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/admin/cards/${id}`, { method: "DELETE" });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards"] });
      toast({ title: "Success", description: "Card deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<User> }) => {
      const response = await apiRequest(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
        headers: { "Content-Type": "application/json" }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsUserEditDialogOpen(false);
      setEditingUser(null);
      toast({ title: "Success", description: "User updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // CSV upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (csvData: string) => {
      const response = await apiRequest("/api/admin/cards/bulk-upload", {
        method: "POST",
        body: JSON.stringify({ csvData }),
        headers: { "Content-Type": "application/json" }
      });
      return response;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards"] });
      setUploadStatus(`Upload complete! Created ${data.created} cards. ${data.errors} errors.`);
      setIsUploading(false);
      toast({ 
        title: "Upload Complete", 
        description: `Created ${data.created} cards with ${data.errors} errors` 
      });
    },
    onError: (error: Error) => {
      setUploadStatus(`Upload failed: ${error.message}`);
      setIsUploading(false);
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    }
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
        
        if (aVal === undefined || bVal === undefined) return 0;
        
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }
        
        if (sortOrder === "asc") {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });
  }, [cards, searchTerm, selectedLevel, selectedTheme, selectedRegister, sortBy, sortOrder]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          user.displayName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          (user.email && user.email.toLowerCase().includes(userSearchTerm.toLowerCase()));
      const matchesType = selectedUserType === "all" || user.userType === selectedUserType;
      
      return matchesSearch && matchesType;
    });
  }, [users, userSearchTerm, selectedUserType]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCard) {
      // Update existing card
      const cardData = {
        ...formData,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
        difficulty: Number(formData.difficulty)
      };
      updateCardMutation.mutate({ id: editingCard.id, updates: cardData });
    } else {
      // Create new card
      const cardData = {
        ...formData,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
        difficulty: Number(formData.difficulty)
      };
      createCardMutation.mutate(cardData);
    }
  };

  // Inline editing functions
  const handleInlineEdit = (cardId: number, field: string, value: string | number) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const updates: any = { [field]: value };
    if (field === 'difficulty') {
      updates[field] = Number(value);
    }

    updateCardMutation.mutate({ id: cardId, updates });
  };

  const startEdit = (cardId: number, field: string, currentValue: string | number) => {
    setEditingCardId(cardId);
    setEditingField(field);
    setTempValue(String(currentValue));
  };

  const saveEdit = () => {
    if (editingCardId && editingField) {
      handleInlineEdit(editingCardId, editingField, tempValue);
      setEditingCardId(null);
      setEditingField(null);
      setTempValue("");
    }
  };

  const cancelEdit = () => {
    setEditingCardId(null);
    setEditingField(null);
    setTempValue("");
  };

  // CSV upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target?.result as string;
      setIsUploading(true);
      setUploadStatus("Uploading...");
      uploadMutation.mutate(csvData);
    };
    reader.readAsText(file);
  };

  // User management functions
  const handleUserEdit = (user: User) => {
    setEditingUser(user);
    setIsUserEditDialogOpen(true);
  };

  const handleUserUpdate = (updates: Partial<User>) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, updates });
    }
  };

  const isLoading = cardsLoading || usersLoading;
  const error = cardsError || usersError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
              <p className="text-muted-foreground">
                Failed to load admin data. Please refresh the page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage cards, users, and content</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Admin Access
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="cards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Cards
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            CSV Upload
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Cards Management Tab */}
        <TabsContent value="cards" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sentence Cards</CardTitle>
                  <CardDescription>
                    Manage and edit sentence cards with inline editing
                  </CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Card</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="japanese">Japanese</Label>
                          <Input
                            id="japanese"
                            value={formData.japanese}
                            onChange={(e) => setFormData({ ...formData, japanese: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="reading">Reading</Label>
                          <Input
                            id="reading"
                            value={formData.reading}
                            onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="english">English</Label>
                        <Textarea
                          id="english"
                          value={formData.english}
                          onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="jlptLevel">JLPT Level</Label>
                          <Select value={formData.jlptLevel} onValueChange={(value) => setFormData({ ...formData, jlptLevel: value })}>
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
                          <Label htmlFor="difficulty">Difficulty</Label>
                          <Input
                            id="difficulty"
                            type="number"
                            min="1"
                            max="10"
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="register">Register</Label>
                          <Select value={formData.register} onValueChange={(value) => setFormData({ ...formData, register: value })}>
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
                          <Select value={formData.theme} onValueChange={(value) => setFormData({ ...formData, theme: value })}>
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
                          <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
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
                          placeholder="tag1, tag2, tag3"
                        />
                      </div>
                      <div>
                        <Label htmlFor="audioUrl">Audio URL (optional)</Label>
                        <Input
                          id="audioUrl"
                          value={formData.audioUrl}
                          onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={createCardMutation.isPending}>
                          {createCardMutation.isPending ? "Creating..." : "Create Card"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter Controls */}
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search cards..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label>JLPT Level</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className="w-[120px]">
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
                    <SelectTrigger className="w-[140px]">
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
                  <Label>Sort By</Label>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">ID</SelectItem>
                        <SelectItem value="japanese">Japanese</SelectItem>
                        <SelectItem value="jlptLevel">JLPT Level</SelectItem>
                        <SelectItem value="difficulty">Difficulty</SelectItem>
                        <SelectItem value="theme">Theme</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Cards Table */}
              <div className="border rounded-lg">
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Japanese</TableHead>
                        <TableHead>Reading</TableHead>
                        <TableHead>English</TableHead>
                        <TableHead>JLPT</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Theme</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCards.map((card) => (
                        <TableRow key={card.id}>
                          <TableCell>{card.id}</TableCell>
                          <TableCell>
                            {editingCardId === card.id && editingField === "japanese" ? (
                              <div className="flex gap-1">
                                <Input
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                  className="h-8"
                                />
                                <Button size="sm" variant="ghost" onClick={saveEdit}>
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div 
                                className="cursor-pointer hover:bg-muted/50 rounded px-2 py-1"
                                onClick={() => startEdit(card.id, "japanese", card.japanese)}
                              >
                                {card.japanese}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingCardId === card.id && editingField === "reading" ? (
                              <div className="flex gap-1">
                                <Input
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                  className="h-8"
                                />
                                <Button size="sm" variant="ghost" onClick={saveEdit}>
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div 
                                className="cursor-pointer hover:bg-muted/50 rounded px-2 py-1"
                                onClick={() => startEdit(card.id, "reading", card.reading)}
                              >
                                {card.reading}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingCardId === card.id && editingField === "english" ? (
                              <div className="flex gap-1">
                                <Input
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                  className="h-8"
                                />
                                <Button size="sm" variant="ghost" onClick={saveEdit}>
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div 
                                className="cursor-pointer hover:bg-muted/50 rounded px-2 py-1 max-w-[200px] truncate"
                                onClick={() => startEdit(card.id, "english", card.english)}
                                title={card.english}
                              >
                                {card.english}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{card.jlptLevel}</Badge>
                          </TableCell>
                          <TableCell>
                            {editingCardId === card.id && editingField === "difficulty" ? (
                              <div className="flex gap-1">
                                <Input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                  className="h-8 w-16"
                                />
                                <Button size="sm" variant="ghost" onClick={saveEdit}>
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div 
                                className="cursor-pointer hover:bg-muted/50 rounded px-2 py-1 w-fit"
                                onClick={() => startEdit(card.id, "difficulty", card.difficulty)}
                              >
                                {card.difficulty}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{card.theme}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(card)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteCardMutation.mutate(card.id)}
                                disabled={deleteCardMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {filteredCards.length} of {cards.length} cards
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View and manage user accounts
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Search and Filter */}
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="userSearch">Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="userSearch"
                      placeholder="Search by username, email, or display name..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label>User Type</Label>
                  <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {userTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Users Table */}
              <div className="border rounded-lg">
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Belt</TableHead>
                        <TableHead>JLPT Level</TableHead>
                        <TableHead>XP</TableHead>
                        <TableHead>Streak</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.displayName}</TableCell>
                          <TableCell>{user.email || "N/A"}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.userType === "admin" ? "default" : user.userType === "premium" ? "secondary" : "outline"}
                            >
                              {user.userType}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.currentBelt}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.currentJLPTLevel}</Badge>
                          </TableCell>
                          <TableCell>{user.totalXP}</TableCell>
                          <TableCell>{user.currentStreak}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUserEdit(user)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSV Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Card Upload</CardTitle>
              <CardDescription>
                Upload multiple cards via CSV file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  CSV Format: japanese,reading,english,jlptLevel,difficulty,register,theme,source,tags,audioUrl
                  <br />
                  Tags should be separated by semicolons (;)
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="csvFile">Select CSV File</Label>
                  <Input
                    ref={fileInputRef}
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </div>

                {uploadStatus && (
                  <Alert>
                    <AlertDescription>{uploadStatus}</AlertDescription>
                  </Alert>
                )}

                {isUploading && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Uploading cards...</span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2">Sample CSV Format:</h4>
                <div className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
                  japanese,reading,english,jlptLevel,difficulty,register,theme,source,tags,audioUrl<br />
                  こんにちは,こんにちは,Hello,N5,1,casual,general,manual,greeting;basic,<br />
                  ありがとう,ありがとう,Thank you,N5,1,polite,general,manual,gratitude;polite,
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Difficulty</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgDifficulty.toFixed(1)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.userType === "admin").length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cards by JLPT Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.byLevel).map(([level, count]) => (
                    <div key={level} className="flex justify-between items-center">
                      <span>{level}</span>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${(count / stats.total) * 100}px` }}></div>
                        <span className="text-sm">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cards by Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.byTheme).slice(0, 8).map(([theme, count]) => (
                    <div key={theme} className="flex justify-between items-center">
                      <span className="capitalize">{theme}</span>
                      <div className="flex items-center gap-2">
                        <div className="bg-secondary h-2 rounded-full" style={{ width: `${(count / stats.total) * 100}px` }}></div>
                        <span className="text-sm">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Card Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-japanese">Japanese</Label>
                <Input
                  id="edit-japanese"
                  value={formData.japanese}
                  onChange={(e) => setFormData({ ...formData, japanese: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-reading">Reading</Label>
                <Input
                  id="edit-reading"
                  value={formData.reading}
                  onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-english">English</Label>
              <Textarea
                id="edit-english"
                value={formData.english}
                onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-jlptLevel">JLPT Level</Label>
                <Select value={formData.jlptLevel} onValueChange={(value) => setFormData({ ...formData, jlptLevel: value })}>
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
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <Input
                  id="edit-difficulty"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-register">Register</Label>
                <Select value={formData.register} onValueChange={(value) => setFormData({ ...formData, register: value })}>
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
                <Label htmlFor="edit-theme">Theme</Label>
                <Select value={formData.theme} onValueChange={(value) => setFormData({ ...formData, theme: value })}>
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
                <Label htmlFor="edit-source">Source</Label>
                <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
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
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <div>
              <Label htmlFor="edit-audioUrl">Audio URL (optional)</Label>
              <Input
                id="edit-audioUrl"
                value={formData.audioUrl}
                onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateCardMutation.isPending}>
                {updateCardMutation.isPending ? "Updating..." : "Update Card"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isUserEditDialogOpen} onOpenChange={setIsUserEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input value={editingUser.username} disabled />
              </div>
              <div>
                <Label>Display Name</Label>
                <Input 
                  value={editingUser.displayName}
                  onChange={(e) => setEditingUser({ ...editingUser, displayName: e.target.value })}
                />
              </div>
              <div>
                <Label>User Type</Label>
                <Select 
                  value={editingUser.userType} 
                  onValueChange={(value) => setEditingUser({ ...editingUser, userType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Current Belt</Label>
                <Select 
                  value={editingUser.currentBelt} 
                  onValueChange={(value) => setEditingUser({ ...editingUser, currentBelt: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {belts.map(belt => (
                      <SelectItem key={belt} value={belt}>{belt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>JLPT Level</Label>
                <Select 
                  value={editingUser.currentJLPTLevel} 
                  onValueChange={(value) => setEditingUser({ ...editingUser, currentJLPTLevel: value })}
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
              <DialogFooter>
                <Button 
                  onClick={() => handleUserUpdate({
                    displayName: editingUser.displayName,
                    userType: editingUser.userType,
                    currentBelt: editingUser.currentBelt,
                    currentJLPTLevel: editingUser.currentJLPTLevel
                  })}
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminPage() {
  return <AdminPageContent />;
}