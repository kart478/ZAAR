import { ArrowLeft, Home } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PageNavigation = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <>
      <div className="sticky top-0 z-50 flex h-14 items-center gap-2 border-b border-border bg-card/95 px-4 backdrop-blur-lg md:px-6">
        <Button variant="ghost" size="sm" onClick={handleBack} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Link to="/">
          <Button variant="ghost" size="sm" aria-label="Go home">
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>
      </div>
      <Outlet />
    </>
  );
};

export default PageNavigation;