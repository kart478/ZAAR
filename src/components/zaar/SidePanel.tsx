import { Users, Calendar, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Community {
  id: string;
  name: string;
  members: string;
  avatar?: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  attendees: number;
}

const SidePanel = () => {
  // TODO: Replace with actual communities and events from Supabase
  const communities: Community[] = [];
  const events: Event[] = [];

  return (
    <div className="space-y-6">
      {/* Joined Communities */}
      <div className="bg-card rounded-[14px] border border-border shadow-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Your Communities</h3>
          </div>
          <Link to="/communities">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary">
              See all
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
        
        {communities.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">No communities yet</p>
            <Link to="/create-community">
              <Button size="sm" className="text-xs">Create Community</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {communities.map((community) => (
              <div 
                key={community.id} 
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg cursor-pointer hover:bg-accent transition-colors"
              >
                <Avatar className="h-9 w-9 rounded-lg">
                  <AvatarImage src={community.avatar} alt={community.name} className="rounded-lg" />
                  <AvatarFallback className="rounded-lg bg-secondary text-xs">
                    {community.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{community.name}</p>
                  <p className="text-xs text-muted-foreground">{community.members} members</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="bg-card rounded-[14px] border border-border shadow-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Upcoming Events</h3>
          </div>
          <Link to="/events">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary">
              See all
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
        
        {events.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="p-3 -mx-3 rounded-lg cursor-pointer hover:bg-accent transition-colors"
              >
                <p className="text-sm font-medium text-foreground">{event.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs text-muted-foreground">{event.date} • {event.time}</p>
                  <p className="text-xs text-muted-foreground">{event.attendees} attending</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidePanel;
