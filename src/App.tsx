
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";

import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import Clients from "@/pages/Clients";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

// Placeholder pages - to be implemented later
const Documents = () => <div className="p-6"><h1 className="text-2xl font-bold">Documents</h1><p>Document management coming soon...</p></div>;
const Finance = () => <div className="p-6"><h1 className="text-2xl font-bold">Finance</h1><p>Financial tracking coming soon...</p></div>;
const Snippets = () => <div className="p-6"><h1 className="text-2xl font-bold">Code Snippets</h1><p>Code snippet management coming soon...</p></div>;
const Settings = () => <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>Settings page coming soon...</p></div>;

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Helmet 
            titleTemplate="%s | ProjectFlow"
            defaultTitle="ProjectFlow - Project Management for Personal Use"
          />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/snippets" element={<Snippets />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
