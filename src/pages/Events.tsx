import { useState } from "react";
import { Search, Calendar, MapPin, Users, Clock, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location?: string;
  onlineLink?: string;
  communityId: string;
  communityName: string;
  communitySlug: string;
  bannerUrl?: string;
  createdBy: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  rsvpStatus: "going" | "interested" | "notGoing" | null;
  attendeesCount: number;
  interestedCount: number;
  isOnline: boolean;
}

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // TODO: Replace with actual events from Supabase
  const events: Event[] = [];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "online" && event.isOnline) ||
                         (selectedFilter === "inperson" && !event.isOnline);
    return matchesSearch && matchesFilter;
  });

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Events</h1>
              <p className="text-muted-foreground mt-1">Discover and join events from your communities</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="online">Online Events</SelectItem>
              <SelectItem value="inperson">In-Person Events</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
            <TabsTrigger value="myevents">My Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No upcoming events</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? "Try adjusting your search terms" : "Be the first to create an event!"}
                </p>
                <Button>Create Event</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    {event.bannerUrl && (
                      <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${event.bannerUrl})` }} />
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDateTime(event.startTime)}
                            </div>
                            {event.isOnline ? (
                              <Badge variant="secondary">Online</Badge>
                            ) : (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={event.createdBy.avatarUrl} alt={event.createdBy.name} />
                            <AvatarFallback>
                              {event.createdBy.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{event.createdBy.name}</p>
                            <p className="text-xs text-muted-foreground">@{event.createdBy.username}</p>
                          </div>
                        </div>
                        <Link to={`/communities/${event.communitySlug}`}>
                          <Badge variant="outline" className="text-xs">
                            {event.communityName}
                          </Badge>
                        </Link>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.attendeesCount} going
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {event.interestedCount} interested
                          </div>
                        </div>
                        <Button size="sm">
                          {event.rsvpStatus === "going" ? "Going" : 
                           event.rsvpStatus === "interested" ? "Interested" : "RSVP"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">No past events to display</p>
            </div>
          </TabsContent>

          <TabsContent value="myevents" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">You haven't RSVP'd to any events yet</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Events;
