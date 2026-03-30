import { useState } from "react";
import { ArrowLeft, Upload, Users, Plus, X, Eye, EyeOff, Globe, Lock, Send, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

interface UploadedImage {
  file: File;
  preview: string;
  fileId?: string;
}

const CreateSpace = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    visibility: "public"
  });
  const [invitedUsers, setInvitedUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<UploadedImage | null>(null);
  const [uploadError, setUploadError] = useState("");

  const categories = [
    { value: "content", label: "Content" },
    { value: "events", label: "Events" },
    { value: "creative", label: "Creative" },
    { value: "study", label: "Study" },
    { value: "business", label: "Business" },
    { value: "lifestyle", label: "Lifestyle" }
  ];

  const visibilityOptions = [
    { value: "public", label: "Public", description: "Anyone can discover & join", icon: <Globe className="h-4 w-4" /> },
    { value: "friends", label: "Friends only", description: "Only friends can discover & join", icon: <Users className="h-4 w-4" /> },
    { value: "invite", label: "Invite only", description: "Only invited people can join", icon: <Lock className="h-4 w-4" /> }
  ];

  // TODO: Replace with actual user search from Supabase
  const searchUsers = async (query: string) => {
    if (!query) return [];
    // TODO: Replace with actual user search from Supabase
    return [];
  };

  const handleAddUser = async () => {
    if (!userSearch.trim()) return;
    
    const users = await searchUsers(userSearch);
    const newUser = users[0]; // Take first result for demo
    
    if (newUser && !invitedUsers.find(u => u.id === newUser.id)) {
      setInvitedUsers([...invitedUsers, newUser]);
      setUserSearch("");
    }
  };

  const handleRemoveUser = (userId: string) => {
    setInvitedUsers(invitedUsers.filter(u => u.id !== userId));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please upload a valid image file (JPG, JPEG, PNG, or WebP).");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError("Image size must be less than 5MB.");
      return;
    }

    setUploadError("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setCoverImage({
        file,
        preview
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    setUploadError("");
  };

  const handleReplaceImage = () => {
    // Trigger file input click
    document.getElementById('cover-image-input')?.click();
  };

  const uploadImageToStorage = async (file: File): Promise<string> => {
    // TODO: Implement actual upload to Supabase Storage or other service
    // For now, return a mock file ID
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      }, 1000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let coverImageFileId: string | undefined;

      // Upload image if present
      if (coverImage) {
        coverImageFileId = await uploadImageToStorage(coverImage.file);
      }

      // TODO: Create Space in Supabase
      console.log("Creating Space:", {
        ...formData,
        coverImageFileId,
        invitedUsers: invitedUsers.map(u => u.id)
      });

      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        // Redirect to the newly created Space Feed
        navigate(`/space/${formData.name.toLowerCase().replace(/\s+/g, '-')}`);
      }, 1500);
    } catch (error) {
      console.error('Error creating space:', error);
      setIsSubmitting(false);
    }
  };

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
            <div>
              <h1 className="text-xl font-semibold text-foreground">Create a Space</h1>
              <p className="text-sm text-muted-foreground">Start something and invite people to build it with you.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Space Name */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Space Name</CardTitle>
              <p className="text-sm text-muted-foreground">Short, catchy name</p>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Give your space a name..."
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="text-base"
              />
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's this Space about?</CardTitle>
              <p className="text-sm text-muted-foreground">Short description (1-2 lines)</p>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Tell people what your space is all about..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={2}
                className="text-base resize-none"
              />
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {visibilityOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.visibility === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                  onClick={() => setFormData({...formData, visibility: option.value})}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.visibility === option.value
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}>
                    {formData.visibility === option.value && (
                      <div className="w-full h-full rounded-full bg-primary scale-50"></div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Invite People */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invite People</CardTitle>
              <p className="text-sm text-muted-foreground">Username search</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by username..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUser())}
                />
                <Button type="button" onClick={handleAddUser} disabled={!userSearch.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {invitedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {invitedUsers.map((user) => (
                    <Badge key={user.id} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleRemoveUser(user.id)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              
              {userSearch && invitedUsers.length === 0 && (
                <p className="text-sm text-muted-foreground">No users found. Try a different username.</p>
              )}
            </CardContent>
          </Card>

          {/* Cover Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cover Image</CardTitle>
              <p className="text-sm text-muted-foreground">Optional upload • Used as Space banner</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                id="cover-image-input"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {!coverImage ? (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload image from your device
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('cover-image-input')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose image from device
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, JPEG, PNG, WebP • Max 5MB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={coverImage.preview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleReplaceImage}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Replace image
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{coverImage.file.name}</span>
                    <span>{(coverImage.file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              )}
              
              {uploadError && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {uploadError}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={!formData.name.trim() || !formData.description.trim() || !formData.category || isSubmitting}
              className="flex items-center gap-2 px-6"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Creating Space..." : "Create Space"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSpace;
