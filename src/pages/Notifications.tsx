import { useState, useEffect } from "react";
import { Bell, Check, X, Heart, MessageCircle, Users, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { dataService } from "@/services/dataService";

interface NotificationItem {
  id: string;
  type: 'new_follower' | 'like' | 'comment' | 'mention' | 'space_invite' | 'space_post';
  fromUserName?: string;
  message: string;
  postId?: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [userNotifications, unreadCount] = await Promise.all([
        dataService.getNotifications(user!.id),
        dataService.getUnreadNotificationCount(user!.id)
      ]);

      const formattedNotifications = userNotifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        fromUserName: notification.fromUserName,
        message: notification.message,
        postId: notification.postId,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      }));

      setNotifications(formattedNotifications);
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await dataService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await dataService.markAllNotificationsAsRead(user.id);
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_follower':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'mention':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case 'space_invite':
        return <Users className="h-4 w-4 text-amber-500" />;
      case 'space_post':
        return <Share2 className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Notifications</h2>
          <p className="text-muted-foreground">Please sign in to view your notifications.</p>
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} unread
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="h-6 w-6 bg-muted rounded-full animate-pulse mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No notifications yet</h3>
              <p className="text-muted-foreground">When people interact with your posts, you'll see them here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-colors ${
                  !notification.isRead 
                    ? 'bg-background border-border' 
                    : 'bg-primary/5 border-primary/20'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          {notification.fromUserName && (
                            <span className="font-medium text-foreground">
                              {notification.fromUserName}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground ml-2">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-foreground break-words">
                        {notification.message}
                      </p>
                      {notification.postId && (
                        <div className="mt-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/post/${notification.postId}`}>
                              View post
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
