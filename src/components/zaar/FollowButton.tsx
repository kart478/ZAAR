import { useState } from "react";
import { UserPlus, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { dataService } from "@/services/dataService";

interface FollowButtonProps {
  userId: string;
  userName: string;
  isPrivate?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
}

const FollowButton = ({ userId, userName, isPrivate = false, className = "", size = "default" }: FollowButtonProps) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [followStatus, setFollowStatus] = useState<'none' | 'pending' | 'accepted'>('none');

  // Check follow status on mount
  useState(() => {
    const checkFollowStatus = async () => {
      if (user && user.id !== userId) {
        try {
          const following = await dataService.isFollowing(user.id, userId);
          setIsFollowing(following);
          
          // Check if there's a pending request
          const followRequests = await dataService.getFollowRequests(userId);
          const hasPendingRequest = followRequests.some(req => req.followerId === user.id);
          setFollowStatus(hasPendingRequest ? 'pending' : (following ? 'accepted' : 'none'));
        } catch (error) {
          console.error('Error checking follow status:', error);
        }
      }
    };

    checkFollowStatus();
  });

  const handleFollow = async () => {
    if (!user || user.id === userId || isLoading) return;

    setIsLoading(true);
    try {
      await dataService.followUser(user.id, userId);
      if (isPrivate) {
        setFollowStatus('pending');
      } else {
        setIsFollowing(true);
        setFollowStatus('accepted');
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!user || user.id === userId || isLoading) return;

    setIsLoading(true);
    try {
      await dataService.unfollowUser(user.id, userId);
      setIsFollowing(false);
      setFollowStatus('none');
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.id === userId) {
    return null; // Don't show follow button for own profile
  }

  if (followStatus === 'pending') {
    return (
      <Button 
        variant="outline" 
        size={size}
        className={`${className} text-amber-600 border-amber-600 hover:bg-amber-50`}
        disabled
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Requested
      </Button>
    );
  }

  if (isFollowing) {
    return (
      <Button 
        variant="outline" 
        size={size}
        className={`${className} text-muted-foreground hover:text-destructive`}
        onClick={handleUnfollow}
        disabled={isLoading}
      >
        <UserX className="h-4 w-4 mr-2" />
        {isLoading ? 'Unfollowing...' : 'Unfollow'}
      </Button>
    );
  }

  return (
    <Button 
      variant="default" 
      size={size}
      className={`${className}`}
      onClick={handleFollow}
      disabled={isLoading}
    >
      <UserPlus className="h-4 w-4 mr-2" />
      {isLoading ? 'Following...' : 'Follow'}
    </Button>
  );
};

export default FollowButton;
