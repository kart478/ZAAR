import Header from "@/components/zaar/Header";
import AvatarRow from "@/components/zaar/AvatarRow";
import SearchBar from "@/components/zaar/SearchBar";
import CategoryCards from "@/components/zaar/CategoryCards";
import FeedSection from "@/components/zaar/FeedSection";
import SidePanel from "@/components/zaar/SidePanel";
import BottomNav from "@/components/zaar/BottomNav";
import TopNav from "@/components/zaar/TopNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Top Navigation */}
      <TopNav />
      
      <main className="max-w-7xl mx-auto">
        {/* Mobile Header - hidden on desktop since TopNav has branding */}
        <div className="lg:hidden">
          <Header />
        </div>
        
        {/* Avatar/Story Row */}
        <AvatarRow />
        
        {/* Search Bar */}
        <SearchBar />
        
        {/* Category Cards */}
        <CategoryCards />
        
        {/* Main Content Area */}
        <div className="px-4 md:px-6 lg:px-8 py-4 pb-24 lg:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feed - takes 2 columns on desktop */}
            <div className="lg:col-span-2">
              <FeedSection />
            </div>
            
            {/* Side Panel - hidden on mobile, shown on desktop */}
            <div className="hidden lg:block">
              <SidePanel />
            </div>
          </div>
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Index;
