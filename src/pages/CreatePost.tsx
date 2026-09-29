import { useState } from "react";
import { ArrowLeft, Image as ImageIcon, Tag, Send, X, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { dataService } from "@/services/dataService";
import { uploadImageToStorage } from "@/components/ImageUpload";

interface Community {
  id: string;
  name: string;
}

interface UploadedImage {
  file: File;
  preview: string;
  fileId?: string;
}

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [postImage, setPostImage] = useState<UploadedImage | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  // TODO: Replace with actual communities from Supabase
  const communities: Community[] = [];

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
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
      setPostImage({
        file,
        preview
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPostImage(null);
    setUploadError("");
  };

  const handleReplaceImage = () => {
    // Trigger file input click
    document.getElementById('post-image-input')?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      let postImageFileId: string | undefined;

      // Upload image if present
      if (postImage) {
        postImageFileId = await uploadImageToStorage(postImage.file, user!.id, "posts");
      }

      // Create post with dataService
      const newPost = await dataService.createPost({
        content,
        imageFileId: postImageFileId,
        authorId: user!.id,
        authorName: user!.name || user!.email || "User",
        authorEmail: user!.email || "",
        authorAvatar: user!.avatar_url
      });

      console.log("Post created successfully:", newPost);
      
      setSubmitMessage("Post published successfully!");
      
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        navigate("/");
      }, 1000);
      
    } catch (error) {
      console.error('Error creating post:', error);
      setIsSubmitting(false);
      const errorMessage = error instanceof Error ? error.message : "Unable to publish this post.";
      setSubmitMessage(`Failed to publish post: ${errorMessage}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to create a post.</p>
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
            <h1 className="text-xl font-semibold text-foreground">Create Post</h1>
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
          
          <CardContent className="space-y-6">
            {submitMessage && (
              <div className={`text-sm px-3 py-2 rounded-md text-center ${
                submitMessage.includes("successfully") 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {submitMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Content */}
              <div>
                <Textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] resize-none border-0 p-0 text-lg placeholder-muted-foreground focus-visible:ring-0"
                  required
                />
              </div>

              {/* Community Selection */}
              {communities.length > 0 && (
                <div>
                  <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Post to community (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global Post</SelectItem>
                      {communities.map((community) => (
                        <SelectItem key={community.id} value={community.id}>
                          {community.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Add Image (optional)</span>
                </div>
                
                <input
                  id="post-image-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {!postImage ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Upload image from your device
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('post-image-input')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose image from device
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, JPEG, PNG, WebP • Max 5MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden bg-muted">
                      <img
                        src={postImage.preview}
                        alt="Post image preview"
                        className="w-full h-48 object-cover"
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
                      <span>{postImage.file.name}</span>
                      <span>{(postImage.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                )}
                
                {uploadError && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {uploadError}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Tags</span>
                  <span className="text-xs text-muted-foreground">({tags.length}/10)</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={tags.length >= 10}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!newTag.trim() || tags.length >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePost;
