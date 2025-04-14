
import { useState } from "react";
import { Helmet } from "react-helmet";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ClientCard, { ClientCardProps } from "@/components/clients/ClientCard";
import { clients } from "@/utils/sample-data";

const Clients = () => {
  const [allClients] = useState<ClientCardProps[]>(clients);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = allClients.filter((client) => {
    return (
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <>
      <Helmet>
        <title>Clients | ProjectFlow</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">
              Manage your client information and associated projects.
            </p>
          </div>
          <Button className="sm:w-auto w-full">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8"
          />
        </div>

        {/* Clients Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} {...client} />
          ))}
          
          {filteredClients.length === 0 && (
            <div className="col-span-full text-center py-8">
              <h3 className="text-lg font-medium">No clients found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or add a new client.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Clients;
