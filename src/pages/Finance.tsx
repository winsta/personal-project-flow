
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { 
  DollarSign, 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Download,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, checkTableExists } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const financeSchema = z.object({
  project_id: z.string().min(1, "Project is required"),
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(2, "Description is required"),
  date: z.string().min(1, "Date is required"),
});

type FinanceFormValues = z.infer<typeof financeSchema>;

const Finance = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FinanceFormValues>({
    resolver: zodResolver(financeSchema),
    defaultValues: {
      project_id: "",
      type: "income",
      amount: 0,
      description: "",
      date: new Date().toISOString().substring(0, 10),
    },
  });

  // Fetch projects for the select dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name");
      
      if (error) throw error;
      
      return data || [];
    },
  });

  // Fetch project finance data
  const { data: financeData = [], isLoading: financeLoading, error: financeError, refetch: refetchFinance } = useQuery({
    queryKey: ["project-finance"],
    queryFn: async () => {
      try {
        // Check if table exists first
        const tableExists = await checkTableExists("project_finance");
        
        if (!tableExists) {
          console.log("Project finance table doesn't exist yet");
          return [];
        }
        
        // If we reach here, the table exists, so fetch all data
        const { data, error } = await supabase
          .from("project_finance" as any)
          .select("*, projects(name)")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error("Error fetching finance data:", error);
        return [];
      }
    },
  });

  // Fetch finance transactions
  const { data: transactions = [], isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ["finance-transactions"],
    queryFn: async () => {
      try {
        // Check if table exists first
        const tableExists = await checkTableExists("project_finance_transactions");
        
        if (!tableExists) {
          console.log("Finance transactions table doesn't exist yet");
          return [];
        }
        
        // If we reach here, the table exists
        const { data, error } = await supabase
          .from("project_finance_transactions" as any)
          .select("*, projects(name)")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
      }
    },
  });

  // Fetch project finance summaries
  const { data: projectSummaries = [], refetch: refetchSummaries } = useQuery({
    queryKey: ["project-finances"],
    queryFn: async () => {
      try {
        // Check if table exists first
        const tableExists = await checkTableExists("project_finance");
        
        if (!tableExists) {
          return [];
        }
        
        const { data, error } = await supabase
          .from("project_finance" as any)
          .select(`*, projects(name)`);
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error("Error fetching project summaries:", error);
        return [];
      }
    },
  });

  const addTransaction = useMutation({
    mutationFn: async (data: FinanceFormValues) => {
      const { error } = await supabase
        .from("project_finance_transactions" as any)
        .insert({
          project_id: data.project_id,
          type: data.type,
          amount: data.amount,
          description: data.description,
          date: data.date,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      form.reset();
      setDialogOpen(false);
      toast.success("Transaction added successfully!");
      refetch();
    },
    onError: (error: any) => {
      toast.error("Failed to add transaction", {
        description: error.message,
      });
    },
  });

  function onSubmit(data: FinanceFormValues) {
    addTransaction.mutate(data);
  }

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const netProfit = totalIncome - totalExpense;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const exportFinanceData = () => {
    // Prepare CSV data
    const headers = "Date,Project,Type,Description,Amount\n";
    const csvData = transactions.map(t => 
      `"${t.date}","${t.projects?.name || ''}","${t.type}","${t.description}",${t.amount}`
    ).join("\n");
    
    const csv = headers + csvData;
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `finance_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Define the refetch function to refresh all finance-related data
  const refetch = () => {
    refetchFinance();
    refetchTransactions();
    refetchSummaries();
    toast.success("Data refreshed");
  };

  return (
    <>
      <Helmet>
        <title>Finance | ProjectFlow</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
            <p className="text-muted-foreground">
              Track income, expenses, and project budgets.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Financial Transaction</DialogTitle>
                  <DialogDescription>
                    Record a new income or expense for a project.
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="project_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select project" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="100.00" 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Client payment for design work" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={addTransaction.isPending}
                      >
                        {addTransaction.isPending ? "Adding..." : "Add Transaction"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={exportFinanceData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="ghost" size="icon" onClick={refetch} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Income
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpense)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Net Profit
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="projects">Project Finances</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  View and manage your financial transactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Loading transactions...
                        </TableCell>
                      </TableRow>
                    ) : transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{transaction.projects?.name || 'Unknown'}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type === 'income' ? 'Income' : 'Expense'}
                            </span>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(transaction.amount || 0)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No transactions found. Add your first transaction to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Finances</CardTitle>
                <CardDescription>
                  Financial overview of all projects.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead className="text-right">Budget</TableHead>
                      <TableHead className="text-right">Income</TableHead>
                      <TableHead className="text-right">Expenses</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financeLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Loading project finances...
                        </TableCell>
                      </TableRow>
                    ) : projectSummaries.length > 0 ? (
                      projectSummaries.map((summary) => {
                        const budget = summary.budget || 0;
                        const received = summary.received || 0;
                        const spent = summary.spent || 0;
                        const profit = received - spent;
                        const remaining = budget - spent;
                        
                        return (
                          <TableRow key={summary.id}>
                            <TableCell className="font-medium">{summary.projects?.name || 'Unknown'}</TableCell>
                            <TableCell className="text-right">{formatCurrency(budget)}</TableCell>
                            <TableCell className="text-right text-green-600">{formatCurrency(received)}</TableCell>
                            <TableCell className="text-right text-red-600">{formatCurrency(spent)}</TableCell>
                            <TableCell className={`text-right font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(profit)}
                            </TableCell>
                            <TableCell className={`text-right font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(remaining)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No project finances found. Create projects and add transactions to see financial data.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Finance;
