import { useState } from "react";
import { ArrowLeft, Upload, Eye, EyeOff, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const CreateCommunity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    coverImageUrl: "",
    iconUrl: "",
    isPrivate: false
  });
  const [rules, setRules] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: "technology", label: "Technology" },
    { value: "photography", label: "Photography" },
    { value: "gaming", label: "Gaming" },
    { value: "design", label: "Design" },
    { value: "business", label: "Business" },
    { value: "art", label: "Art" },
    { value: "music", label: "Music" },
    { value: "sports", label: "Sports" },
    { value: "education", label: "Education" },
    { value: "other", label: "Other" }
  ];

  const handleAddRule = () => {
    if (rules.length < 10) {
      setRules([...rules, ""]);
    }
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement community creation with Supabase
    console.log("Creating community:", {
      ...formData,
      rules: rules.filter(rule => rule.trim()),
      creatorId: user?.id
    });

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/communities");
    }, 1000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to create a community.</p>
          <Button asChild className="mt-4">
            <a href="/signin">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Create Community</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url} alt={user.name || user.email} />
                <AvatarFallback>
                  {(user.name || user.email || 'U').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{user.name || user.email}</p>
                <p className="text-sm text-muted-foreground">@{user.email?.split('@')[0]}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Community Name */}
              <div>
                <label className="text-sm font-medium text-foreground">Community Name</label>
                <Input
                  placeholder="Enter community name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  placeholder="What's your community about?"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1"
                  rows={3}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-foreground">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="text-sm font-medium text-foreground">Cover Image URL (optional)</label>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({...formData, coverImageUrl: e.target.value})}
                  className="mt-1"
                />
              </div>

              {/* Icon URL */}
              <div>
                <label className="text-sm font-medium text-foreground">Icon URL (optional)</label>
                <Input
                  type="url"
                  placeholder="https://example.com/icon.jpg"
                  value={formData.iconUrl}
                  onChange={(e) => setFormData({...formData, iconUrl: e.target.value})}
                  className="mt-1"
                />
              </div>

              {/* Rules */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Community Rules</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRule}
                    disabled={rules.length >= 10}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Rule
                  </Button>
                </div>
                <div className="space-y-2">
                  {rules.map((rule, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Rule ${index + 1}`}
                        value={rule}
                        onChange={(e) => handleRuleChange(index, e.target.value)}
                      />
                      {rules.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveRule(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Private Community */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Private Community</label>
                  <p className="text-sm text-muted-foreground">Only invited members can join</p>
                </div>
                <Switch
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) => setFormData({...formData, isPrivate: checked})}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!formData.name.trim() || !formData.description.trim() || !formData.category || isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Community"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateCommunity;
