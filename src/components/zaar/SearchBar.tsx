import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchBar = () => {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-4">
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search communities"
          className="pl-11 h-12 rounded-full bg-card border-border shadow-soft focus-visible:ring-primary/20 focus-visible:ring-offset-0 focus-visible:border-primary"
        />
      </div>
    </div>
  );
};

export default SearchBar;
