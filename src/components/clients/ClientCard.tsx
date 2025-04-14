
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Building } from "lucide-react";

export interface ClientCardProps {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  projectsCount: number;
  status: "active" | "inactive";
  avatarUrl?: string;
}

const ClientCard = ({
  id,
  name,
  email,
  company,
  phone,
  projectsCount,
  status,
  avatarUrl,
}: ClientCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardHeader className="pb-2 flex flex-row items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-medium">{name}</h3>
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          <a href={`mailto:${email}`} className="text-primary hover:underline">
            {email}
          </a>
        </div>
        
        {phone && (
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <a href={`tel:${phone}`} className="hover:underline">
              {phone}
            </a>
          </div>
        )}
        
        {company && (
          <div className="flex items-center text-sm">
            <Building className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{company}</span>
          </div>
        )}
        
        <div className="pt-2 text-sm">
          <span className="font-medium">{projectsCount}</span> project{projectsCount !== 1 ? "s" : ""}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;
