import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InterestsSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  maxInterests?: number;
  allowCustom?: boolean;
  className?: string;
}

const PREDEFINED_INTERESTS = [
  "Technology", "Music", "Sports", "Fashion", "Gaming", "Business", 
  "Movies", "Travel", "Food", "Photography", "Art", "Reading",
  "Fitness", "Science", "Politics", "Education", "Health", "Finance",
  "Comedy", "Nature", "Animals", "Cars", "DIY", "Dancing",
  "Writing", "History", "Philosophy", "Religion", "Spirituality", "Astrology"
];

const InterestsSelector = ({ 
  selectedInterests, 
  onInterestsChange, 
  maxInterests = 10,
  allowCustom = true,
  className = ""
}: InterestsSelectorProps) => {
  const [customInterest, setCustomInterest] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleAddInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && !selectedInterests.includes(trimmed) && selectedInterests.length < maxInterests) {
      onInterestsChange([...selectedInterests, trimmed]);
      setCustomInterest("");
      setShowCustomInput(false);
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    onInterestsChange(selectedInterests.filter(interest => interest !== interestToRemove));
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInterest.trim()) {
      handleAddInterest(customInterest);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCustomSubmit(e as any);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-medium text-foreground mb-3">Select Your Interests</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose up to {maxInterests} interests that describe you. This helps others find you.
        </p>
      </div>

      {/* Selected Interests */}
      {selectedInterests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Your Interests ({selectedInterests.length}/{maxInterests})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedInterests.map((interest, index) => (
                <Badge 
                  key={index} 
                  variant="default" 
                  className="text-sm pr-1 py-1"
                >
                  {interest}
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predefined Interests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Popular Interests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_INTERESTS
              .filter(interest => !selectedInterests.includes(interest))
              .slice(0, 20) // Show first 20 to avoid overwhelming
              .map((interest, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleAddInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
          </div>
          
          {PREDEFINED_INTERESTS.filter(interest => !selectedInterests.includes(interest)).length > 20 && (
            <p className="text-xs text-muted-foreground mt-3">
              And {PREDEFINED_INTERESTS.filter(interest => !selectedInterests.includes(interest)).length - 20} more interests available...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Custom Interest Input */}
      {allowCustom && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Custom Interest</CardTitle>
          </CardHeader>
          <CardContent>
            {showCustomInput ? (
              <form onSubmit={handleCustomSubmit} className="flex gap-2">
                <Input
                  placeholder="Enter custom interest..."
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  maxLength={30}
                />
                <Button 
                  type="submit" 
                  disabled={!customInterest.trim() || selectedInterests.length >= maxInterests}
                  size="sm"
                >
                  Add
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomInterest("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setShowCustomInput(true)}
                disabled={selectedInterests.length >= maxInterests}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Interest
              </Button>
            )}
            
            {selectedInterests.length >= maxInterests && (
              <p className="text-xs text-muted-foreground mt-2">
                Maximum {maxInterests} interests reached. Remove some to add more.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InterestsSelector;
