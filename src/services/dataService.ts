// Simple in-memory data storage (for development)
// In production, this would be replaced with Supabase database calls

interface Post {
  id: string;
  content: string;
  imageFileId?: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  sharedFromPostId?: string; // For shared posts
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  avatarFileId?: string;
  interests: string[];
  createdAt: string;
  isPrivate?: boolean;
  followersCount?: number;
  followingCount?: number;
}

interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  status: 'pending' | 'accepted'; // For private accounts
}

interface Notification {
  id: string;
  userId: string;
  type: 'new_follower' | 'like' | 'comment' | 'mention' | 'space_invite' | 'space_post';
  fromUserId?: string;
  fromUserName?: string;
  postId?: string;
  spaceId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  mediaFileId?: string;
  isRead: boolean;
  createdAt: string;
}

class DataService {
  private posts: Post[] = [];
  private profiles: UserProfile[] = [];
  private comments: Comment[] = [];
  private follows: Follow[] = [];
  private notifications: Notification[] = [];
  private messages: Message[] = [];

  constructor() {
    // Load data from localStorage on initialization
    this.loadData();
  }

  private loadData() {
    try {
      const savedPosts = localStorage.getItem('zaar_posts');
      const savedProfiles = localStorage.getItem('zaar_profiles');
      const savedComments = localStorage.getItem('zaar_comments');
      const savedFollows = localStorage.getItem('zaar_follows');
      const savedNotifications = localStorage.getItem('zaar_notifications');
      const savedMessages = localStorage.getItem('zaar_messages');
      
      if (savedPosts) {
        this.posts = JSON.parse(savedPosts);
      }
      
      if (savedProfiles) {
        this.profiles = JSON.parse(savedProfiles);
      }
      
      if (savedComments) {
        this.comments = JSON.parse(savedComments);
      }
      
      if (savedFollows) {
        this.follows = JSON.parse(savedFollows);
      }
      
      if (savedNotifications) {
        this.notifications = JSON.parse(savedNotifications);
      }
      
      if (savedMessages) {
        this.messages = JSON.parse(savedMessages);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }

  private saveData() {
    try {
      localStorage.setItem('zaar_posts', JSON.stringify(this.posts));
      localStorage.setItem('zaar_profiles', JSON.stringify(this.profiles));
      localStorage.setItem('zaar_comments', JSON.stringify(this.comments));
      localStorage.setItem('zaar_follows', JSON.stringify(this.follows));
      localStorage.setItem('zaar_notifications', JSON.stringify(this.notifications));
      localStorage.setItem('zaar_messages', JSON.stringify(this.messages));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }

  // Posts
  async createPost(postData: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'sharesCount'>): Promise<Post> {
    const newPost: Post = {
      ...postData,
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0
    };

    this.posts.unshift(newPost); // Add to beginning of array
    this.saveData();
    return newPost;
  }

  async getPosts(): Promise<Post[]> {
    return this.posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    return this.posts.filter(post => post.authorId === authorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.profiles.find(profile => profile.id === userId) || null;
  }

  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const existingProfileIndex = this.profiles.findIndex(profile => profile.id === userId);
    
    if (existingProfileIndex !== -1) {
      // Update existing profile
      this.profiles[existingProfileIndex] = {
        ...this.profiles[existingProfileIndex],
        ...profileData
      };
    } else {
      // Create new profile
      const newProfile: UserProfile = {
        id: userId,
        name: profileData.name || '',
        username: profileData.username || '',
        email: profileData.email || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        website: profileData.website || '',
        avatarFileId: profileData.avatarFileId,
        interests: profileData.interests || [],
        createdAt: profileData.createdAt || new Date().toISOString()
      };
      this.profiles.push(newProfile);
    }

    this.saveData();
    return this.profiles[existingProfileIndex] || this.profiles[this.profiles.length - 1];
  }

  // Stats
  async getUserStats(userId: string): Promise<{
    posts: number;
    likes: number;
    comments: number;
    shares: number;
  }> {
    const userPosts = await this.getPostsByAuthor(userId);
    return {
      posts: userPosts.length,
      likes: userPosts.reduce((sum, post) => sum + post.likesCount, 0),
      comments: userPosts.reduce((sum, post) => sum + post.commentsCount, 0),
      shares: userPosts.reduce((sum, post) => sum + post.sharesCount, 0)
    };
  }

  // Post interactions
  async likePost(postId: string): Promise<Post> {
    const postIndex = this.posts.findIndex(post => post.id === postId);
    if (postIndex !== -1) {
      this.posts[postIndex].likesCount += 1;
      this.saveData();
      return this.posts[postIndex];
    }
    throw new Error('Post not found');
  }

  async unlikePost(postId: string): Promise<Post> {
    const postIndex = this.posts.findIndex(post => post.id === postId);
    if (postIndex !== -1) {
      this.posts[postIndex].likesCount = Math.max(0, this.posts[postIndex].likesCount - 1);
      this.saveData();
      return this.posts[postIndex];
    }
    throw new Error('Post not found');
  }

  async commentOnPost(postId: string): Promise<Post> {
    const postIndex = this.posts.findIndex(post => post.id === postId);
    if (postIndex !== -1) {
      this.posts[postIndex].commentsCount += 1;
      this.saveData();
      return this.posts[postIndex];
    }
    throw new Error('Post not found');
  }

  async sharePost(postId: string, shareToFeed: boolean = true, caption?: string): Promise<Post> {
    const originalPost = this.posts.find(post => post.id === postId);
    if (!originalPost) {
      throw new Error('Post not found');
    }

    // Increment share count on original post
    const originalPostIndex = this.posts.findIndex(post => post.id === postId);
    this.posts[originalPostIndex].sharesCount += 1;

    if (shareToFeed) {
      // Create new post as a share
      const sharedPost: Post = {
        content: caption || '',
        imageFileId: originalPost.imageFileId,
        authorId: originalPost.authorId,
        authorName: originalPost.authorName,
        authorEmail: originalPost.authorEmail,
        authorAvatar: originalPost.authorAvatar,
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        sharedFromPostId: postId
      };
      this.posts.unshift(sharedPost);
    }

    this.saveData();
    return this.posts[originalPostIndex];
  }

  // Comments
  async addComment(postId: string, content: string, authorId: string, authorName: string, authorEmail: string, authorAvatar?: string): Promise<Comment> {
    const newComment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      postId,
      authorId,
      authorName,
      authorEmail,
      authorAvatar,
      content,
      createdAt: new Date().toISOString()
    };

    this.comments.push(newComment);

    // Update comment count on post
    const postIndex = this.posts.findIndex(post => post.id === postId);
    if (postIndex !== -1) {
      this.posts[postIndex].commentsCount += 1;
    }

    this.saveData();
    return newComment;
  }

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    return this.comments
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // Follow System
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    // Check if following user is private
    const followingProfile = await this.getProfile(followingId);
    const isPrivate = followingProfile?.isPrivate || false;

    const newFollow: Follow = {
      id: `follow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      followerId,
      followingId,
      createdAt: new Date().toISOString(),
      status: isPrivate ? 'pending' : 'accepted'
    };

    this.follows.push(newFollow);

    // Create notification for the user being followed
    if (!isPrivate) {
      await this.createNotification(followingId, 'new_follower', followerId, undefined, undefined, `${followerId} started following you`);
    } else {
      await this.createNotification(followingId, 'new_follower', followerId, undefined, undefined, `${followerId} requested to follow you`);
    }

    this.saveData();
    return newFollow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const followIndex = this.follows.findIndex(
      f => f.followerId === followerId && f.followingId === followingId
    );
    
    if (followIndex !== -1) {
      this.follows.splice(followIndex, 1);
      this.saveData();
    }
  }

  async acceptFollowRequest(followId: string): Promise<void> {
    const followIndex = this.follows.findIndex(f => f.id === followId);
    if (followIndex !== -1) {
      this.follows[followIndex].status = 'accepted';
      this.saveData();
    }
  }

  async denyFollowRequest(followId: string): Promise<void> {
    const followIndex = this.follows.findIndex(f => f.id === followId);
    if (followIndex !== -1) {
      this.follows.splice(followIndex, 1);
      this.saveData();
    }
  }

  async getFollowers(userId: string): Promise<UserProfile[]> {
    const followerIds = this.follows
      .filter(f => f.followingId === userId && f.status === 'accepted')
      .map(f => f.followerId);
    
    return this.profiles.filter(profile => followerIds.includes(profile.id));
  }

  async getFollowing(userId: string): Promise<UserProfile[]> {
    const followingIds = this.follows
      .filter(f => f.followerId === userId && f.status === 'accepted')
      .map(f => f.followingId);
    
    return this.profiles.filter(profile => followingIds.includes(profile.id));
  }

  async getFollowRequests(userId: string): Promise<Follow[]> {
    return this.follows.filter(f => f.followingId === userId && f.status === 'pending');
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return this.follows.some(
      f => f.followerId === followerId && f.followingId === followingId && f.status === 'accepted'
    );
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return this.profiles.filter(profile => 
      profile.name.toLowerCase().includes(lowerQuery) ||
      profile.username.toLowerCase().includes(lowerQuery) ||
      profile.email.toLowerCase().includes(lowerQuery)
    );
  }

  async searchPosts(query: string): Promise<Post[]> {
    if (!query.trim()) return this.getPosts();
    
    const lowerQuery = query.toLowerCase();
    return this.posts.filter(post => 
      post.content.toLowerCase().includes(lowerQuery) ||
      post.authorName.toLowerCase().includes(lowerQuery)
    );
  }

  // Enhanced Discovery Methods
  async getUsersByInterest(interest: string, currentUserId?: string): Promise<UserProfile[]> {
    const lowerInterest = interest.toLowerCase();
    let users = this.profiles.filter(profile => 
      profile.interests?.some(userInterest => 
        userInterest.toLowerCase() === lowerInterest
      )
    );

    // Exclude current user and already followed users if provided
    if (currentUserId) {
      const following = await this.getFollowing(currentUserId);
      const followingIds = new Set(following.map(f => f.id));
      users = users.filter(u => u.id !== currentUserId && !followingIds.has(u.id));
    }

    // Rank by shared interests and activity
    return users.sort((a, b) => {
      const aSharedInterests = a.interests?.filter(i => 
        i.toLowerCase() === lowerInterest
      ).length || 0;
      const bSharedInterests = b.interests?.filter(i => 
        i.toLowerCase() === lowerInterest
      ).length || 0;
      
      // Sort by shared interests (descending)
      return bSharedInterests - aSharedInterests;
    });
  }

  async getPeopleYouMayLike(currentUserId: string): Promise<UserProfile[]> {
    const currentUser = await this.getProfile(currentUserId);
    if (!currentUser || !currentUser.interests || currentUser.interests.length === 0) {
      // If no interests, return random users
      const allUsers = this.profiles.filter(u => u.id !== currentUserId);
      const following = await this.getFollowing(currentUserId);
      const followingIds = new Set(following.map(f => f.id));
      return allUsers.filter(u => !followingIds.has(u.id)).slice(0, 10);
    }

    const following = await this.getFollowing(currentUserId);
    const followingIds = new Set(following.map(f => f.id));
    
    // Find users with shared interests
    const candidates = this.profiles
      .filter(u => u.id !== currentUserId && !followingIds.has(u.id))
      .map(user => {
        const sharedInterests = user.interests?.filter(interest => 
          currentUser.interests.includes(interest)
        ) || [];
        
        return {
          ...user,
          sharedInterestsCount: sharedInterests.length,
          sharedInterests
        };
      })
      .filter(u => u.sharedInterestsCount > 0)
      .sort((a, b) => {
        // Sort by shared interests count (descending)
        if (b.sharedInterestsCount !== a.sharedInterestsCount) {
          return b.sharedInterestsCount - a.sharedInterestsCount;
        }
        
        // Then by total interests count (ascending - prefer more focused profiles)
        return (a.interests?.length || 0) - (b.interests?.length || 0);
      });

    return candidates.slice(0, 10);
  }

  async getTrendingInterests(): Promise<{ interest: string; count: number }[]> {
    const allInterests = this.profiles.flatMap(profile => profile.interests || []);
    
    // Count frequency of each interest
    const interestCounts = allInterests.reduce((acc, interest) => {
      acc[interest] = (acc[interest] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Sort by frequency and return top 20
    return Object.entries(interestCounts)
      .map(([interest, count]) => ({ interest, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  // Notification System
  async createNotification(
    userId: string, 
    type: Notification['type'], 
    message: string,
    fromUserId?: string, 
    postId?: string, 
    spaceId?: string
  ): Promise<Notification> {
    const notification: Notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      fromUserId,
      fromUserName: fromUserId ? (await this.getProfile(fromUserId))?.name : undefined,
      postId,
      spaceId,
      message,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    this.notifications.push(notification);
    this.saveData();
    return notification;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
    if (notificationIndex !== -1) {
      this.notifications[notificationIndex].isRead = true;
      this.saveData();
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    this.notifications.forEach(notification => {
      if (notification.userId === userId) {
        notification.isRead = true;
      }
    });
    this.saveData();
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return this.notifications.filter(n => n.userId === userId && !n.isRead).length;
  }

  // Messaging System
  async sendMessage(fromUserId: string, toUserId: string, content: string, mediaFileId?: string): Promise<Message> {
    const message: Message = {
      id: `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUserId,
      toUserId,
      content,
      mediaFileId,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    this.messages.push(message);
    this.saveData();
    return message;
  }

  async getMessages(userId: string): Promise<Message[]> {
    return this.messages
      .filter(m => m.fromUserId === userId || m.toUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return this.messages
      .filter(m => 
        (m.fromUserId === userId1 && m.toUserId === userId2) ||
        (m.fromUserId === userId2 && m.toUserId === userId1)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    const messageIndex = this.messages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      this.messages[messageIndex].isRead = true;
      this.saveData();
    }
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    return this.messages.filter(m => m.toUserId === userId && !m.isRead).length;
  }
}

export const dataService = new DataService();
export type { Post, UserProfile, Comment, Follow, Notification, Message };
