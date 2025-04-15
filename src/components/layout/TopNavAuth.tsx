
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TopNavAuth = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  return (
    <div className="ml-auto flex items-center gap-2">
      {user && (
        <>
          <div className="text-sm text-muted-foreground mr-2 hidden md:block">
            <span>{user.email}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
            <LogOut className="h-5 w-5" />
          </Button>
        </>
      )}
      {!user && (
        <Button variant="outline" onClick={() => navigate("/auth")}>
          <User className="h-4 w-4 mr-2" />
          Login
        </Button>
      )}
    </div>
  );
};

export default TopNavAuth;
