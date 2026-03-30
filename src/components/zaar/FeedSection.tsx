import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PostCard from "./PostCard";
import { dataService } from "@/services/dataService";

interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  title: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
}

const FeedSection = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await dataService.getPosts();
      
      // Transform posts to match PostCard interface
      const transformedPosts: Post[] = fetchedPosts.map(post => ({
        id: post.id,
        author: {
          name: post.authorName,
          username: post.authorEmail?.split('@')[0] || 'user',
          avatar: post.authorAvatar
        },
        title: post.content,
        image: post.imageFileId,
        likes: post.likesCount,
        comments: post.commentsCount,
        shares: post.sharesCount,
        timeAgo: formatTimeAgo(post.createdAt)
      }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return 'just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handlePostInteraction = async (postId: string, action: 'like' | 'comment' | 'share') => {
    try {
      let updatedPost;
      switch (action) {
        case 'like':
          updatedPost = await dataService.likePost(postId);
          break;
        case 'comment':
          updatedPost = await dataService.commentOnPost(postId);
          break;
        case 'share':
          updatedPost = await dataService.sharePost(postId);
          break;
      }

      // Update the post in the local state
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? {
                ...post,
                likes: updatedPost.likesCount,
                comments: updatedPost.commentsCount,
                shares: updatedPost.sharesCount
              }
            : post
        )
      );
    } catch (error) {
      console.error(`Error ${action} post:`, error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Post Button */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-soft">
        <Link to="/create-post">
          <Button variant="ghost" className="w-full justify-start h-12 text-muted-foreground hover:text-foreground">
            <Plus className="h-5 w-5 mr-3" />
            What's on your mind?
          </Button>
        </Link>
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <div className="h-8 w-8 bg-muted rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <p className="text-muted-foreground mb-4">No posts yet</p>
          <Link to="/create-post">
            <Button>Create the first post</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onInteraction={handlePostInteraction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedSection;
