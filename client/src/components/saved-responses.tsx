import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  MessageSquare,
  Clock
} from 'lucide-react';
import { 
  SavedResponse, 
  getUserResponses, 
  updateUserResponse, 
  deleteUserResponse,
  formatTimestamp
} from '@/lib/vocab-utils';

interface SavedResponsesProps {
  vocabWord: string;
  onResponseUpdate?: () => void;
  className?: string;
}

export function SavedResponses({ vocabWord, onResponseUpdate, className = "" }: SavedResponsesProps) {
  const [responses, setResponses] = useState<SavedResponse[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadResponses();
  }, [vocabWord]);

  const loadResponses = () => {
    const userResponses = getUserResponses(vocabWord);
    setResponses(userResponses.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  };

  const handleEdit = (response: SavedResponse) => {
    setEditingId(response.id);
    setEditText(response.sentence);
  };

  const handleSaveEdit = () => {
    if (editingId && editText.trim()) {
      updateUserResponse(vocabWord, editingId, editText.trim());
      setEditingId(null);
      setEditText('');
      loadResponses();
      onResponseUpdate?.();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = (responseId: string) => {
    if (confirm('Are you sure you want to delete this response?')) {
      deleteUserResponse(vocabWord, responseId);
      loadResponses();
      onResponseUpdate?.();
    }
  };

  if (responses.length === 0) {
    return null;
  }

  const displayResponses = isExpanded ? responses : responses.slice(0, 3);

  return (
    <Card className={`p-4 bg-background/30 backdrop-blur-sm ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium text-foreground">
              Your Practice ({responses.length})
            </h4>
          </div>
          {responses.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? 'Show less' : `Show all ${responses.length}`}
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {displayResponses.map((response, index) => (
              <motion.div
                key={response.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className="saved-response-item"
              >
                <Card className="p-3 bg-card/50 hover:bg-card/70 transition-colors">
                  {editingId === response.id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="input-field text-sm"
                        placeholder="Edit your sentence..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="mobile-button"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={!editText.trim()}
                          className="mobile-button"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <div className="space-y-2">
                      <p className="text-sm text-foreground leading-relaxed context-sentence">
                        {response.sentence}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(response.timestamp)}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(response)}
                            className="h-8 w-8 p-0 mobile-button"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(response.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive mobile-button"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {responses.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No saved responses yet. Practice writing sentences to see them here!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}