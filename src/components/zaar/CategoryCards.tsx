import { Camera, Code, Gamepad2, BookOpen, Briefcase } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const CategoryCards = () => {
  // TODO: Replace with actual categories from Supabase
  const categories: Category[] = [];

  if (categories.length === 0) {
    return (
      <div className="px-4 md:px-6 lg:px-8 py-2">
        <h2 className="text-sm font-semibold text-foreground mb-3">Explore Categories</h2>
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <p>No categories to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 py-2">
      <h2 className="text-sm font-semibold text-foreground mb-3">Explore Categories</h2>
      
      {/* Mobile: Horizontal scroll */}
      <div className="lg:hidden">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      </div>
      
      {/* Desktop: Grid layout */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
};

const CategoryCard = ({ category }: { category: Category }) => {
  return (
    <div className="flex-shrink-0 w-24 lg:w-auto">
      <div className="group cursor-pointer">
        <div className={cn(
          "flex flex-col items-center justify-center p-4 rounded-2xl bg-card border border-border shadow-soft transition-all duration-200 hover:shadow-card hover:-translate-y-0.5",
          "h-24 lg:h-28"
        )}>
          <div className={cn(
            "p-2.5 rounded-xl mb-2 transition-transform group-hover:scale-110",
            category.color
          )}>
            {category.icon}
          </div>
          <span className="text-xs font-medium text-foreground text-center">
            {category.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CategoryCards;
