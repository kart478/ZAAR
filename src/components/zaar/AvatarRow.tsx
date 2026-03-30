import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  avatar?: string;
  isActive?: boolean;
}

const AvatarRow = () => {
  // TODO: Replace with actual users from Supabase
  const users: User[] = [];

  if (users.length === 0) {
    return (
      <div className="px-4 md:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-center h-20 text-muted-foreground">
          <p>No users to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 lg:px-8">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 py-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="relative">
                <Avatar className={cn(
                  "h-14 w-14 md:h-16 md:w-16 ring-2 ring-offset-2 transition-all duration-200",
                  user.isActive 
                    ? "ring-primary" 
                    : "ring-transparent group-hover:ring-border"
                )}>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-medium">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {user.isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-xs font-medium transition-colors",
                user.isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {user.name}
              </span>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  );
};

export default AvatarRow;
