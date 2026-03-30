import { useState, useEffect } from "react";
import { Search, Users, Hash, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dataService } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import FollowButton from "@/components/zaar/FollowButton";

interface SearchResult {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatarFileId?: string;
  interests: string[];
  followersCount?: number;
  followingCount?: number;
  isPrivate?: boolean;
  mutualFollowers?: number;
}

const SearchPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<'people' | 'interests' | 'spaces'>('people');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [trendingInterests, setTrendingInterests] = useState<string[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load trending content and suggestions on mount
  useEffect(() => {
    loadTrendingInterests();
    loadSuggestedUsers();
  }, []);

  const loadTrendingInterests = async () => {
    try {
      const trending = await dataService.getTrendingInterests();
      setTrendingInterests(trending.map(t => t.interest));
    } catch (error) {
      console.error('Error loading trending interests:', error);
    }
  };

  const loadSuggestedUsers = async () => {
    if (!user) return;
    
    try {
      const suggestions = await dataService.getPeopleYouMayLike(user.id);
      setSuggestedUsers(suggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      let results: SearchResult[] = [];
      
      if (searchType === 'people') {
        const users = await dataService.searchUsers(searchQuery);
        
        // Enhanced search logic
        const enhancedUsers = await Promise.all(
          users.map(async (u) => {
            const isUsernameSearch = searchQuery.startsWith('@');
            const query = isUsernameSearch ? searchQuery.slice(1) : searchQuery.toLowerCase();
            
            let matches = false;
            
            if (isUsernameSearch) {
              // Username search (starts-with)
              matches = u.username.toLowerCase().startsWith(query);
            } else {
              // Name, bio, and interests search (contains)
              const nameMatch = u.name.toLowerCase().includes(query);
              const bioMatch = u.bio?.toLowerCase().includes(query) || false;
              const interestMatch = u.interests?.some(interest => 
                interest.toLowerCase().includes(query)
              ) || false;
              
              matches = nameMatch || bioMatch || interestMatch;
            }
            
            if (matches) {
              // Get mutual followers count
              let mutualFollowers = 0;
              if (user && u.id !== user.id) {
                const userFollowers = await dataService.getFollowers(user.id);
                const otherFollowers = await dataService.getFollowers(u.id);
                const userFollowerIds = new Set(userFollowers.map(f => f.id));
                mutualFollowers = otherFollowers.filter(f => userFollowerIds.has(f.id)).length;
              }
              
              return {
                ...u,
                mutualFollowers
              };
            }
            
            return null;
          })
        );
        
        results = enhancedUsers.filter(Boolean) as SearchResult[];
      } else if (searchType === 'interests') {
        // Search for users by interest using enhanced method
        const usersWithInterest = await dataService.getUsersByInterest(searchQuery, user?.id);
        
        results = usersWithInterest.map(u => ({
          ...u,
          mutualFollowers: 0 // TODO: Calculate mutual followers if needed
        }));
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleInterestClick = async (interest: string) => {
    setSearchQuery(interest);
    setSearchType('interests');
    // Trigger search
    setTimeout(() => handleSearch(), 100);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Discover</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search people, interests, usernames…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Type Tabs */}
        <Tabs value={searchType} onValueChange={(value) => setSearchType(value as 'people' | 'interests' | 'spaces')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
            <TabsTrigger value="spaces">Spaces</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Results */}
        {searchQuery.trim() && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                {searchType === 'people' && `People Results (${searchResults.length})`}
                {searchType === 'interests' && `People interested in "${searchQuery}" (${searchResults.length})`}
                {searchType === 'spaces' && `Spaces (${searchResults.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSearching ? (
                <div className="text-center py-8">
                  <div className="h-6 w-6 bg-muted rounded-full animate-pulse mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Searching...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchType === 'people' && `No people found for "${searchQuery}"`}
                    {searchType === 'interests' && `No people interested in "${searchQuery}"`}
                    {searchType === 'spaces' && `No spaces found for "${searchQuery}"`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={result.avatarFileId} alt={result.name} />
                          <AvatarFallback>
                            {result.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground truncate">{result.name}</h3>
                            <span className="text-sm text-muted-foreground">@{result.username}</span>
                            {result.mutualFollowers && result.mutualFollowers > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {result.mutualFollowers} mutual
                              </Badge>
                            )}
                          </div>
                          {result.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{result.bio}</p>
                          )}
                          {result.interests && result.interests.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {result.interests.slice(0, 2).map((interest, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                  onClick={() => handleInterestClick(interest)}
                                >
                                  {interest}
                                </Badge>
                              ))}
                              {result.interests.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{result.interests.length - 2} more
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{result.followersCount || 0} followers</span>
                            <span>{result.followingCount || 0} following</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <FollowButton 
                          userId={result.id} 
                          userName={result.name}
                          isPrivate={result.isPrivate}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Trending & Suggestions */}
        {!searchQuery.trim() && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trending Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Trending Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingInterests.map((interest, index) => (
                    <div 
                      key={interest} 
                      className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleInterestClick(interest)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                          <span className="text-sm font-medium text-primary">#{index + 1}</span>
                        </div>
                        <span className="font-medium text-foreground">{interest}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Trending
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  People You May Like
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestedUsers.map((suggestedUser) => (
                    <div key={suggestedUser.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={suggestedUser.avatarFileId} alt={suggestedUser.name} />
                          <AvatarFallback className="text-xs">
                            {suggestedUser.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{suggestedUser.name}</h4>
                          <p className="text-sm text-muted-foreground">@{suggestedUser.username}</p>
                          {suggestedUser.interests && suggestedUser.interests.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {suggestedUser.interests.slice(0, 2).map((interest, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                  onClick={() => handleInterestClick(interest)}
                                >
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <FollowButton 
                          userId={suggestedUser.id} 
                          userName={suggestedUser.name}
                          isPrivate={suggestedUser.isPrivate}
                          size="sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
