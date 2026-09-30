import { useState, useEffect } from "react";
import { User, Mail, Calendar, MapPin, Edit3, Settings, Heart, MessageSquare, Share2, Users, Award, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { ImageUpload, uploadImageToStorage } from "@/components/ImageUpload";
import { dataService } from "@/services/dataService";
import InterestsSelector from "@/components/zaar/InterestsSelector";

interface Post {
  id: string;
  content: string;
  imageFileId?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const { user, loading } = useAuth();
  const [avatarImage, setAvatarImage] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [userStats, setUserStats] = useState({
    posts: 0,
    likes: 0,
    followers: 0,
    following: 0,
    communities: 0
  });
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    interests: [] as string[]
  });

  // Load user profile and posts when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUserPosts();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await dataService.getProfile(user.id);
      if (profile) {
        setUserProfile(profile);
        setFormData({
          name: profile.name || "",
          username: profile.username || "",
          email: profile.email || "",
          bio: profile.bio || "",
          location: profile.location || "",
          website: profile.website || "",
          interests: profile.interests || []
        });
      } else {
        // Create initial profile if none exists
        const initialProfile = {
          id: user.id,
          name: user.name || user.email || "User",
          username: user.email?.split('@')[0] || "user",
          email: user.email || "",
          bio: "",
          location: "",
          website: "",
          avatarFileId: user.avatar_url,
          interests: [],
          createdAt: new Date().toISOString()
        };
        
        const savedProfile = await dataService.updateProfile(user.id, initialProfile);
        setUserProfile(savedProfile);
        setFormData({
          name: savedProfile.name || "",
          username: savedProfile.username || "",
          email: savedProfile.email || "",
          bio: savedProfile.bio || "",
          location: savedProfile.location || "",
          website: savedProfile.website || "",
          interests: savedProfile.interests || []
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadUserPosts = async () => {
    if (!user) return;
    
    try {
      const posts = await dataService.getPostsByAuthor(user.id);
      setRecentPosts(posts);
      
      const stats = await dataService.getUserStats(user.id);
      setUserStats({
        posts: stats.posts,
        likes: stats.likes,
        followers: 0, // TODO: Implement followers count
        following: 0, // TODO: Implement following count
        communities: 0 // TODO: Implement communities count
      });
    } catch (error) {
      console.error('Error loading user posts:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveMessage("");
    
    try {
      let avatarFileId: string | undefined = userProfile?.avatarFileId;

      // Upload avatar if changed
      if (avatarImage) {
        avatarFileId = (await uploadImageToStorage(avatarImage.file, user.id, "avatars")) || avatarFileId;
      }

      // Update profile with dataService
      const updatedProfile = await dataService.updateProfile(user.id, {
        ...formData,
        avatarFileId
      });

      setUserProfile(updatedProfile);
      console.log("Profile saved successfully:", updatedProfile);

      // Simulate API call
      setTimeout(() => {
        setIsSaving(false);
        setIsEditing(false);
        setSaveMessage("Profile updated successfully!");
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveMessage("");
        }, 3000);
      }, 500);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setIsSaving(false);
      setSaveMessage("Failed to update profile. Please try again.");
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    }
  };

  const handleCancel = () => {
    // Reset form to current profile data
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        username: userProfile.username || "",
        email: userProfile.email || "",
        bio: userProfile.bio || "",
        location: userProfile.location || "",
        website: userProfile.website || "",
        interests: userProfile.interests || []
      });
    }
    setAvatarImage(null);
    setIsEditing(false);
    setSaveMessage("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 bg-muted rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Profile Not Available</h2>
          <p className="text-muted-foreground mb-6">Please sign in to view your profile.</p>
          <Button asChild>
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
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            <div className="flex items-center gap-2">
              {saveMessage && (
                <div className={`text-sm px-3 py-1 rounded-md ${
                  saveMessage.includes("successfully") 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {saveMessage}
                </div>
              )}
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                disabled={isSaving}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    {isEditing ? (
                      <ImageUpload
                        currentImage={userProfile?.avatarFileId}
                        onImageChange={setAvatarImage}
                        className="mb-4"
                        previewClassName="h-24 w-24 rounded-full"
                        buttonText="Choose avatar"
                        disabled={!isEditing}
                      />
                    ) : (
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={userProfile?.avatarFileId} alt={userProfile?.name} />
                        <AvatarFallback className="text-lg">
                          {userProfile?.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="w-full space-y-4">
                      <Input
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                      <Input
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                      />
                      <Textarea
                        placeholder="Bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        rows={3}
                      />
                      <Input
                        placeholder="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                      <Input
                        placeholder="Website"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                      />
                      
                      <InterestsSelector
                        selectedInterests={formData.interests}
                        onInterestsChange={(interests) => setFormData({...formData, interests})}
                        maxInterests={10}
                        allowCustom={true}
                      />
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSave} 
                          className="flex-1" 
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </Button>
                        <Button 
                          onClick={handleCancel} 
                          variant="outline" 
                          className="flex-1"
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-foreground">{userProfile?.name}</h2>
                      <p className="text-muted-foreground">@{userProfile?.username}</p>
                      
                      {userProfile?.bio && (
                        <p className="text-sm text-muted-foreground mt-2">{userProfile.bio}</p>
                      )}
                      
                      <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                        {userProfile?.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {userProfile.location}
                          </div>
                        )}
                        {userProfile?.createdAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Joined {new Date(userProfile.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {userProfile?.website && (
                        <Button variant="link" asChild className="mt-2">
                          <a href={userProfile.website} target="_blank" rel="noopener noreferrer">
                            {userProfile.website}
                          </a>
                        </Button>
                      )}

                      <Separator className="my-4" />

                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-foreground">{userStats.posts}</p>
                          <p className="text-xs text-muted-foreground">Posts</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-foreground">{userStats.likes}</p>
                          <p className="text-xs text-muted-foreground">Likes</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-foreground">{userStats.followers}</p>
                          <p className="text-xs text-muted-foreground">Followers</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-foreground">{userStats.following}</p>
                          <p className="text-xs text-muted-foreground">Following</p>
                        </div>
                      </div>

                      {userProfile?.interests && userProfile.interests.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div className="w-full">
                            <h3 className="text-sm font-medium text-foreground mb-2">Interests</h3>
                            <div className="flex flex-wrap gap-2">
                              {userProfile.interests.map((interest: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="posts" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="communities">Communities</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-4">
                {recentPosts.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                      <p className="text-muted-foreground">Start sharing your thoughts with the community!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <Card key={post.id}>
                        <CardContent className="pt-6">
                          <p className="text-muted-foreground mb-4">{post.content}</p>
                          {post.imageFileId && (
                            <img 
                              src={post.imageFileId} 
                              alt="Post" 
                              className="w-full h-64 object-cover rounded-lg mb-4"
                            />
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {post.likesCount}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {post.commentsCount}
                            </div>
                            <div className="flex items-center gap-1">
                              <Share2 className="h-4 w-4" />
                              {post.sharesCount}
                            </div>
                            <span className="ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="about" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      About
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userProfile?.bio ? (
                      <p className="text-muted-foreground">{userProfile.bio}</p>
                    ) : (
                      <p className="text-muted-foreground">No bio added yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communities" className="space-y-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No communities joined yet</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No achievements yet</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
