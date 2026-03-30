import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import CommentSection from "./CommentSection";
import ShareModal from "./ShareModal";

interface Post {
  id: string;
  author: {
    name: string;
    avatar?: string;
    username: string;
  };
  title: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
  sharedFromPostId?: string;
}

interface PostCardProps {
  post: Post;
  onInteraction?: (postId: string, action: 'like' | 'comment' | 'share') => void;
}

const PostCard = ({ post, onInteraction }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [shareCount, setShareCount] = useState(post.shares);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleLike = async () => {
    try {
      if (onInteraction) {
        if (isLiked) {
          await onInteraction(post.id, 'like'); // Unlike functionality
          setLikeCount(prev => Math.max(0, prev - 1));
        } else {
          await onInteraction(post.id, 'like');
          setLikeCount(prev => prev + 1);
        }
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async () => {
    try {
      // Toggle comments section
      setShowComments(!showComments);
    } catch (error) {
      console.error('Error opening comments:', error);
    }
  };

  const handleShare = async () => {
    try {
      setShowShareModal(true);
    } catch (error) {
      console.error('Error opening share modal:', error);
    }
  };

  const handleCommentAdded = () => {
    setCommentCount(prev => prev + 1);
  };

  const handleShared = () => {
    setShareCount(prev => prev + 1);
  };

  return (
    <>
      <article className="bg-card rounded-[14px] border border-border shadow-card overflow-hidden transition-shadow hover:shadow-soft">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback className="bg-secondary text-secondary-foreground font-medium text-sm">
                {post.author.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{post.author.name}</h3>
              <p className="text-xs text-muted-foreground">@{post.author.username} · {post.timeAgo}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Shared Post Indicator */}
        {post.sharedFromPostId && (
          <div className="px-4 pb-2">
            <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 inline-block">
              Shared from original post
            </div>
          </div>
        )}

        {/* Title */}
        <div className="px-4 pb-3">
          <p className="text-sm text-foreground leading-relaxed">{post.title}</p>
        </div>

        {/* Image */}
        {post.image && (
          <div className="relative aspect-[16/10] bg-muted">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 p-3 border-t border-border">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-3 gap-1.5 transition-colors ${
              isLiked 
                ? 'text-rose-500 bg-rose-50 hover:text-rose-600 hover:bg-rose-100' 
                : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-50'
            }`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">{likeCount}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-9 px-3 gap-1.5 transition-colors ${
              showComments
                ? 'text-primary bg-primary/5 hover:text-primary hover:bg-primary/10'
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
            }`}
            onClick={handleComment}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-medium">{commentCount}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 px-3 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-50 gap-1.5"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs font-medium">{shareCount}</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <CommentSection
            postId={post.id}
            isOpen={showComments}
            onClose={() => setShowComments(false)}
            onCommentAdded={handleCommentAdded}
          />
        )}
      </article>

      {/* Share Modal */}
      <ShareModal
        postId={post.id}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShared={handleShared}
      />
    </>
  );
};

export default PostCard;
