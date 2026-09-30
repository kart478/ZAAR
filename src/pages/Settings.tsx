import { useState, useEffect } from "react";
import { User, Mail, Lock, Bell, Shield, Palette, Globe, Smartphone, HelpCircle, LogOut, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { dataService } from "@/services/dataService";
import { ImageUpload, uploadImageToStorage } from "@/components/ImageUpload";

interface NotificationSettings {
  newFollower: boolean;
  likes: boolean;
  comments: boolean;
  mentions: boolean;
  spaceInvites: boolean;
  spacePosts: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  showLocation: boolean;
  allowTagging: boolean;
}

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  
  // Profile settings
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarImage, setAvatarImage] = useState<any>(null);
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    newFollower: true,
    likes: true,
    comments: true,
    mentions: true,
    spaceInvites: true,
    spacePosts: false
  });
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true,
    allowTagging: true
  });

  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      const profile = await dataService.getProfile(user!.id);
      
      if (profile) {
        setName(profile.name || "");
        setUsername(profile.username || "");
        setEmail(profile.email || "");
        setBio(profile.bio || "");
        setLocation(profile.location || "");
        setWebsite(profile.website || "");
      }
      
      // Load settings from localStorage (for demo)
      const savedNotifications = localStorage.getItem('user_notifications');
      const savedPrivacy = localStorage.getItem('user_privacy');
      
      if (savedNotifications) {
        setNotificationSettings(JSON.parse(savedNotifications));
      }
      
      if (savedPrivacy) {
        setPrivacySettings(JSON.parse(savedPrivacy));
      }
      
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    setSaveMessage("");
    
    try {
      let avatarFileId: string | undefined = undefined;
      
      // Upload avatar if changed
      if (avatarImage) {
        avatarFileId = (await uploadImageToStorage(avatarImage.file, user.id, "avatars")) || undefined;
      }

      // Update profile
      await dataService.updateProfile(user.id, {
        name,
        username,
        email,
        bio,
        location,
        website,
        avatarFileId,
        interests: [], // Keep existing interests
        isPrivate: privacySettings.profileVisibility === 'private',
        createdAt: new Date().toISOString()
      });

      setSaveMessage("Profile updated successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage("Failed to update profile. Please try again.");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      localStorage.setItem('user_notifications', JSON.stringify(notificationSettings));
      setSaveMessage("Notification settings saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setSaveMessage("Failed to save notification settings.");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      localStorage.setItem('user_privacy', JSON.stringify(privacySettings));
      setSaveMessage("Privacy settings saved!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      setSaveMessage("Failed to save privacy settings.");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    
    try {
      // In a real app, this would call an API
      alert("Account deletion would be processed here. For demo, account remains active.");
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Settings</h2>
          <p className="text-muted-foreground mb-6">Please sign in to access your settings.</p>
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg border ${
            saveMessage.includes("successfully") 
              ? "bg-green-50 border-green-200 text-green-800" 
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {saveMessage}
          </div>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Profile Picture</label>
                  <ImageUpload
                    currentImage={user.avatar_url}
                    onImageChange={setAvatarImage}
                    buttonText="Choose avatar"
                    previewClassName="h-20 w-20 rounded-full"
                    disabled={loading}
                  />
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Username</label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Bio</label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Website</label>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveProfile} 
                  disabled={saving || loading}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">New Followers</p>
                      <p className="text-sm text-muted-foreground">When someone follows you</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.newFollower}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        newFollower: e.target.checked
                      })}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Likes</p>
                      <p className="text-sm text-muted-foreground">When someone likes your post</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.likes}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        likes: e.target.checked
                      })}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Comments</p>
                      <p className="text-sm text-muted-foreground">When someone comments on your post</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.comments}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        comments: e.target.checked
                      })}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Mentions</p>
                      <p className="text-sm text-muted-foreground">When someone mentions you</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.mentions}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        mentions: e.target.checked
                      })}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Space Invites</p>
                      <p className="text-sm text-muted-foreground">When someone invites you to a space</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.spaceInvites}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        spaceInvites: e.target.checked
                      })}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Space Posts</p>
                      <p className="text-sm text-muted-foreground">New posts in your spaces</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.spacePosts}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        spacePosts: e.target.checked
                      })}
                      className="h-4 w-4"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveNotifications} 
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Notification Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-foreground mb-3">Profile Visibility</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="visibility"
                          value="public"
                          checked={privacySettings.profileVisibility === 'public'}
                          onChange={(e) => setPrivacySettings({
                            ...privacySettings,
                            profileVisibility: e.target.value as 'public' | 'private'
                          })}
                        />
                        <span className="text-sm">Public - Anyone can see your profile</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="visibility"
                          value="private"
                          checked={privacySettings.profileVisibility === 'private'}
                          onChange={(e) => setPrivacySettings({
                            ...privacySettings,
                            profileVisibility: e.target.value as 'public' | 'private'
                          })}
                        />
                        <span className="text-sm">Private - Only approved followers can see your profile</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Show Email</p>
                      <p className="text-sm text-muted-foreground">Display email on your profile</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.showEmail}
                      onChange={(e) => setPrivacySettings({
                        ...privacySettings,
                        showEmail: e.target.checked
                      })}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Show Location</p>
                      <p className="text-sm text-muted-foreground">Display location on your profile</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.showLocation}
                      onChange={(e) => setPrivacySettings({
                        ...privacySettings,
                        showLocation: e.target.checked
                      })}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Allow Tagging</p>
                      <p className="text-sm text-muted-foreground">Let others tag you in posts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.allowTagging}
                      onChange={(e) => setPrivacySettings({
                        ...privacySettings,
                        allowTagging: e.target.checked
                      })}
                      className="h-4 w-4"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSavePrivacy} 
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Privacy Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url} alt={user.name || user.email} />
                      <AvatarFallback>
                        {(user.name || user.email || 'U').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{user.name || user.email}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <Badge variant="secondary" className="mt-1">
                        Verified
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Account Type</span>
                      <span className="text-sm font-medium">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Member Since</span>
                      <span className="text-sm font-medium">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Trash2 className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-foreground mb-2">Delete Account</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete your account and all data. This action cannot be undone.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      className="w-full"
                    >
                      Delete Account
                    </Button>
                  </div>

                  <div>
                    <Button 
                      variant="outline" 
                      onClick={signOut}
                      className="w-full"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
