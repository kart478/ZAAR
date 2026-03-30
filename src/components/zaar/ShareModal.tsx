import { useState } from "react";
import { X, Share, Link2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { dataService } from "@/services/dataService";

interface ShareModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  onShared: () => void;
}

const ShareModal = ({ postId, isOpen, onClose, onShared }: ShareModalProps) => {
  const { user } = useAuth();
  const [shareOption, setShareOption] = useState<'feed' | 'space' | 'link'>('feed');
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      switch (shareOption) {
        case 'feed':
          await dataService.sharePost(postId, true, caption);
          break;
        case 'space':
          // TODO: Implement space sharing when spaces are ready
          await dataService.sharePost(postId, false, caption);
          break;
        case 'link':
          const postUrl = `${window.location.origin}/post/${postId}`;
          await navigator.clipboard.writeText(postUrl);
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2000);
          break;
      }

      onShared(); // Update share count in parent
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        setCaption("");
      }, 500);
    } catch (error) {
      console.error('Error sharing post:', error);
      setIsSubmitting(false);
    }
  };

  const getPostUrl = () => {
    return `${window.location.origin}/post/${postId}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Share Post</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Share Options */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Button
              variant={shareOption === 'feed' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setShareOption('feed')}
            >
              <Share className="h-4 w-4 mr-3" />
              Share to your feed
            </Button>
            
            <Button
              variant={shareOption === 'space' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setShareOption('space')}
            >
              <Users className="h-4 w-4 mr-3" />
              Share to a Space
            </Button>
            
            <Button
              variant={shareOption === 'link' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setShareOption('link')}
            >
              <Link2 className="h-4 w-4 mr-3" />
              Copy post link
            </Button>
          </div>

          {/* Caption Input (for feed/space sharing) */}
          {(shareOption === 'feed' || shareOption === 'space') && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Add a caption (optional)
              </label>
              <Textarea
                placeholder="What are your thoughts?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          {/* Link Display (for link copying) */}
          {shareOption === 'link' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Post link
              </label>
              <div className="flex gap-2">
                <Input
                  value={getPostUrl()}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(getPostUrl());
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                >
                  {copiedLink ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            className="flex-1"
            disabled={isSubmitting || (shareOption !== 'link' && !user)}
          >
            {isSubmitting ? 'Sharing...' : 
             shareOption === 'link' ? (copiedLink ? 'Copied!' : 'Copy Link') :
             'Share'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
