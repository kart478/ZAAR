import { useState } from "react";
import { Search, Rocket, ExternalLink, Users, Plus, Filter, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

interface Space {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  repoUrl?: string;
  demoUrl?: string;
  communityId: string;
  communityName: string;
  communitySlug: string;
  rolesNeeded: string[];
  createdBy: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  collaboratorsCount: number;
  requestsCount: number;
  featured: boolean;
  createdAt: string;
}

const Spaces = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // TODO: Replace with actual spaces from Supabase
  const spaces: Space[] = [];

  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = space.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.techStack.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "featured" && space.featured) ||
                         (selectedFilter === "seeking" && space.rolesNeeded.length > 0);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Spaces</h1>
              <p className="text-muted-foreground mt-1">Discover and join spaces to build together</p>
            </div>
            <Button asChild>
              <Link to="/create-space">
                <Plus className="h-4 w-4 mr-2" />
                Create Space
              </Link>
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
                placeholder="Search spaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter spaces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Spaces</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="seeking">Looking for Members</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Spaces Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Spaces</TabsTrigger>
            <TabsTrigger value="myspaces">My Spaces</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {filteredSpaces.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Rocket className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No spaces found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? "Try adjusting your search terms" : "Be the first to create a space!"}
                </p>
                <Button asChild>
                  <Link to="/create-space">Create Space</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSpaces.map((space) => (
                  <Card key={space.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{space.title}</CardTitle>
                            {space.featured && (
                              <Badge variant="secondary" className="text-xs">Featured</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">
                            Created {formatDate(space.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground line-clamp-2">
                        {space.description}
                      </p>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2">
                        {space.techStack.slice(0, 4).map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {space.techStack.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{space.techStack.length - 4} more
                          </Badge>
                        )}
                      </div>

                      {/* Roles Needed */}
                      {space.rolesNeeded.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Looking for:</p>
                          <div className="flex flex-wrap gap-2">
                            {space.rolesNeeded.slice(0, 3).map((role, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                            {space.rolesNeeded.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{space.rolesNeeded.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Creator and Links */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={space.createdBy.avatarUrl} alt={space.createdBy.name} />
                            <AvatarFallback>
                              {space.createdBy.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{space.createdBy.name}</p>
                            <p className="text-xs text-muted-foreground">@{space.createdBy.username}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link to={`/communities/${space.communitySlug}`}>
                            <Badge variant="outline" className="text-xs">
                              {space.communityName}
                            </Badge>
                          </Link>
                          
                          <div className="flex gap-1">
                            {space.repoUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={space.repoUrl} target="_blank" rel="noopener noreferrer">
                                  <Github className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            {space.demoUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={space.demoUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {space.collaboratorsCount} members
                        </div>
                        <div className="flex items-center gap-1">
                          <Plus className="h-4 w-4" />
                          {space.requestsCount} requests
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="myspaces" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">You haven't created any spaces yet</p>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">You haven't applied to any spaces yet</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Spaces;
