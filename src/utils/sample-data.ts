
import { formatISO, addDays, subDays } from "date-fns";
import { TaskStatus, TaskPriority } from "@/components/tasks/TaskCard";

// Generate a random date within the past month to the next month
const randomDate = () => {
  const daysOffset = Math.floor(Math.random() * 60) - 30;
  return formatISO(daysOffset > 0 ? addDays(new Date(), daysOffset) : subDays(new Date(), Math.abs(daysOffset)));
};

// Sample projects data
export const projects = [
  {
    id: "p1",
    title: "Website Redesign",
    description: "Complete overhaul of the company website with new branding and improved UX/UI.",
    status: "active",
    progress: 65,
    dueDate: formatISO(addDays(new Date(), 15)),
    clientId: "c1",
    clientName: "Acme Inc.",
    tasksCount: 12,
    completedTasks: 8,
  },
  {
    id: "p2",
    title: "Mobile App Development",
    description: "Building a new mobile application for both iOS and Android platforms.",
    status: "active",
    progress: 30,
    dueDate: formatISO(addDays(new Date(), 45)),
    clientId: "c2",
    clientName: "TechGlobe",
    tasksCount: 24,
    completedTasks: 7,
  },
  {
    id: "p3",
    title: "Marketing Campaign",
    description: "Q2 marketing campaign for new product launch, including social media and email marketing.",
    status: "on-hold",
    progress: 15,
    dueDate: formatISO(addDays(new Date(), 5)),
    clientId: "c3",
    clientName: "Brand Masters",
    tasksCount: 8,
    completedTasks: 1,
  },
  {
    id: "p4",
    title: "Server Migration",
    description: "Migrating legacy server infrastructure to the cloud for improved scalability.",
    status: "completed",
    progress: 100,
    dueDate: formatISO(subDays(new Date(), 5)),
    clientId: "c1",
    clientName: "Acme Inc.",
    tasksCount: 6,
    completedTasks: 6,
  },
  {
    id: "p5",
    title: "E-commerce Integration",
    description: "Integrating payment gateways and shopping cart functionality into the client's website.",
    status: "active",
    progress: 85,
    dueDate: formatISO(addDays(new Date(), 3)),
    clientId: "c4",
    clientName: "Shop Right",
    tasksCount: 10,
    completedTasks: 9,
  },
  {
    id: "p6",
    title: "Annual Report Design",
    description: "Designing and formatting the annual financial and business report for stakeholders.",
    status: "active",
    progress: 45,
    dueDate: formatISO(addDays(new Date(), 21)),
    clientId: "c5",
    clientName: "Finance Pro",
    tasksCount: 7,
    completedTasks: 3,
  },
];

// Sample tasks data
export const tasks = [
  {
    id: "t1",
    projectId: "p1",
    title: "Homepage Design",
    description: "Create a new responsive homepage design based on brand guidelines.",
    status: "completed" as TaskStatus,
    priority: "high" as TaskPriority,
    dueDate: formatISO(subDays(new Date(), 5)),
    assignedTo: "John Doe",
    subtasks: [
      { id: "st1", title: "Wireframes", completed: true },
      { id: "st2", title: "Mockups", completed: true },
      { id: "st3", title: "Mobile version", completed: true },
    ],
  },
  {
    id: "t2",
    projectId: "p1",
    title: "About Page Content",
    description: "Write and format content for the About Us page including company history and team profiles.",
    status: "review" as TaskStatus,
    priority: "medium" as TaskPriority,
    dueDate: formatISO(addDays(new Date(), 2)),
    assignedTo: "Sarah Johnson",
    subtasks: [
      { id: "st4", title: "Company history section", completed: true },
      { id: "st5", title: "Team profiles", completed: true },
      { id: "st6", title: "Mission statement", completed: false },
    ],
  },
  {
    id: "t3",
    projectId: "p1",
    title: "Contact Form Implementation",
    description: "Implement form validation and email functionality for the contact page.",
    status: "in-progress" as TaskStatus,
    priority: "medium" as TaskPriority,
    dueDate: formatISO(addDays(new Date(), 7)),
    assignedTo: "Mike Wilson",
    subtasks: [
      { id: "st7", title: "Form design", completed: true },
      { id: "st8", title: "Form validation", completed: false },
      { id: "st9", title: "Email service integration", completed: false },
    ],
  },
  {
    id: "t4",
    projectId: "p2",
    title: "User Authentication",
    description: "Implement secure user authentication including login, registration, and password reset.",
    status: "in-progress" as TaskStatus,
    priority: "high" as TaskPriority,
    dueDate: formatISO(addDays(new Date(), 10)),
    assignedTo: "Jane Smith",
    subtasks: [
      { id: "st10", title: "Login functionality", completed: true },
      { id: "st11", title: "Registration form", completed: true },
      { id: "st12", title: "Password reset", completed: false },
      { id: "st13", title: "Email verification", completed: false },
    ],
  },
  {
    id: "t5",
    projectId: "p2",
    title: "Product Listing Page",
    description: "Design and implement the product listing page with filtering and sorting options.",
    status: "todo" as TaskStatus,
    priority: "medium" as TaskPriority,
    dueDate: formatISO(addDays(new Date(), 15)),
    assignedTo: "Robert Brown",
    subtasks: [
      { id: "st14", title: "Grid layout design", completed: false },
      { id: "st15", title: "Filter components", completed: false },
      { id: "st16", title: "Sorting functionality", completed: false },
    ],
  },
  {
    id: "t6",
    projectId: "p3",
    title: "Email Campaign Setup",
    description: "Set up email templates and subscriber lists for the product launch campaign.",
    status: "todo" as TaskStatus,
    priority: "high" as TaskPriority,
    dueDate: formatISO(addDays(new Date(), 3)),
    assignedTo: "Lisa Chen",
    subtasks: [
      { id: "st17", title: "Email template design", completed: false },
      { id: "st18", title: "Subscriber list segmentation", completed: true },
      { id: "st19", title: "A/B testing setup", completed: false },
    ],
  },
];

// Sample clients data
export const clients = [
  {
    id: "c1",
    name: "Acme Inc.",
    email: "contact@acmeinc.com",
    company: "Acme Incorporated",
    phone: "+1 (555) 123-4567",
    projectsCount: 2,
    status: "active",
  },
  {
    id: "c2",
    name: "TechGlobe",
    email: "info@techglobe.com",
    company: "TechGlobe Solutions",
    phone: "+1 (555) 987-6543",
    projectsCount: 1,
    status: "active",
  },
  {
    id: "c3",
    name: "Brand Masters",
    email: "hello@brandmasters.co",
    company: "Brand Masters Agency",
    phone: "+1 (555) 345-6789",
    projectsCount: 1,
    status: "active",
  },
  {
    id: "c4",
    name: "Shop Right",
    email: "support@shopright.com",
    company: "Shop Right Stores",
    phone: "+1 (555) 456-7890",
    projectsCount: 1,
    status: "active",
  },
  {
    id: "c5",
    name: "Finance Pro",
    email: "contact@financepro.com",
    company: "Finance Pro Ltd",
    phone: "+1 (555) 567-8901",
    projectsCount: 1,
    status: "inactive",
  },
];

// Summary data for dashboard
export const summaryData = {
  activeProjects: projects.filter(p => p.status === "active").length,
  completedProjects: projects.filter(p => p.status === "completed").length,
  onHoldProjects: projects.filter(p => p.status === "on-hold").length,
  totalTasks: tasks.length,
  completedTasks: tasks.filter(t => t.status === "completed").length,
  activeClients: clients.filter(c => c.status === "active").length,
  revenueThisMonth: 12580,
  pendingInvoices: 3,
};

// Get projects for a specific client
export const getProjectsForClient = (clientId: string) => {
  return projects.filter(project => project.clientId === clientId);
};

// Get tasks for a specific project
export const getTasksForProject = (projectId: string) => {
  return tasks.filter(task => task.projectId === projectId);
};

// Get recently updated projects
export const getRecentProjects = (limit = 5) => {
  return [...projects]
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, limit);
};

// Get upcoming/overdue tasks
export const getUpcomingTasks = (limit = 5) => {
  return [...tasks]
    .filter(task => task.status !== "completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, limit);
};
