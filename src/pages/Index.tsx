
import { useNavigate as useRouterNavigate, useEffect } from "react-router-dom";

const Index = () => {
  const navigate = useRouterNavigate();
  
  useEffect(() => {
    navigate("/");
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Dashboard...</h1>
      </div>
    </div>
  );
};

export default Index;
