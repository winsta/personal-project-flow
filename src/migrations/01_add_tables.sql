
-- Create enums
CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled');
CREATE TYPE task_status AS ENUM ('to_do', 'in_progress', 'done', 'blocked');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member');

-- Enable storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Create a policy to allow authenticated users to upload objects to the documents bucket
CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Create a policy to allow authenticated users to download objects from the documents bucket
CREATE POLICY "Allow authenticated users to download documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'documents');

-- Create a policy to allow users to update objects in the documents bucket that they own
CREATE POLICY "Allow users to update their own documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'documents' AND owner = auth.uid());

-- Create a policy to allow users to delete objects in the documents bucket that they own
CREATE POLICY "Allow users to delete their own documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents' AND owner = auth.uid());

-- Add RLS to tables

-- Clients table
ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read all clients"
ON clients FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow users to insert clients"
ON clients FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow users to update clients"
ON clients FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow users to delete clients"
ON clients FOR DELETE
TO authenticated
USING (true);

-- Projects table
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read all projects"
ON projects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow users to insert projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow users to update projects"
ON projects FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow users to delete projects"
ON projects FOR DELETE
TO authenticated
USING (true);

-- Create project_finance table for budget tracking
CREATE TABLE IF NOT EXISTS project_finance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  budget DECIMAL(12,2) DEFAULT 0,
  received DECIMAL(12,2) DEFAULT 0,
  spent DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE project_finance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read all project finances"
ON project_finance FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow users to insert project finances"
ON project_finance FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow users to update project finances"
ON project_finance FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow users to delete project finances"
ON project_finance FOR DELETE
TO authenticated
USING (true);

-- Create project_finance_transactions table for tracking income and expenses
CREATE TABLE IF NOT EXISTS project_finance_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE project_finance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read all transactions"
ON project_finance_transactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow users to insert transactions"
ON project_finance_transactions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow users to update transactions"
ON project_finance_transactions FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow users to delete transactions"
ON project_finance_transactions FOR DELETE
TO authenticated
USING (true);

-- Create triggers to update project_finance when transactions are added/updated/deleted
CREATE OR REPLACE FUNCTION update_project_finance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Create project_finance record if it doesn't exist
    INSERT INTO project_finance (project_id, budget, received, spent)
    VALUES (NEW.project_id, 0, 0, 0)
    ON CONFLICT (project_id) DO NOTHING;
    
    -- Update received or spent based on transaction type
    IF NEW.type = 'income' THEN
      UPDATE project_finance 
      SET received = received + NEW.amount,
          updated_at = NOW()
      WHERE project_id = NEW.project_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE project_finance 
      SET spent = spent + NEW.amount,
          updated_at = NOW()
      WHERE project_id = NEW.project_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle update scenarios (transaction amount changed or type changed)
    IF OLD.type = 'income' AND NEW.type = 'income' THEN
      -- Just update the amount
      UPDATE project_finance 
      SET received = received - OLD.amount + NEW.amount,
          updated_at = NOW()
      WHERE project_id = NEW.project_id;
    ELSIF OLD.type = 'expense' AND NEW.type = 'expense' THEN
      -- Just update the amount
      UPDATE project_finance 
      SET spent = spent - OLD.amount + NEW.amount,
          updated_at = NOW()
      WHERE project_id = NEW.project_id;
    ELSIF OLD.type = 'income' AND NEW.type = 'expense' THEN
      -- Changed from income to expense
      UPDATE project_finance 
      SET received = received - OLD.amount,
          spent = spent + NEW.amount,
          updated_at = NOW()
      WHERE project_id = NEW.project_id;
    ELSIF OLD.type = 'expense' AND NEW.type = 'income' THEN
      -- Changed from expense to income
      UPDATE project_finance 
      SET spent = spent - OLD.amount,
          received = received + NEW.amount,
          updated_at = NOW()
      WHERE project_id = NEW.project_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Subtract from received or spent based on deleted transaction type
    IF OLD.type = 'income' THEN
      UPDATE project_finance 
      SET received = received - OLD.amount,
          updated_at = NOW()
      WHERE project_id = OLD.project_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE project_finance 
      SET spent = spent - OLD.amount,
          updated_at = NOW()
      WHERE project_id = OLD.project_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_finance_on_transaction_insert
AFTER INSERT ON project_finance_transactions
FOR EACH ROW
EXECUTE FUNCTION update_project_finance_on_transaction();

CREATE TRIGGER update_project_finance_on_transaction_update
AFTER UPDATE ON project_finance_transactions
FOR EACH ROW
EXECUTE FUNCTION update_project_finance_on_transaction();

CREATE TRIGGER update_project_finance_on_transaction_delete
AFTER DELETE ON project_finance_transactions
FOR EACH ROW
EXECUTE FUNCTION update_project_finance_on_transaction();

-- Add updated_at trigger function for all tables
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER set_timestamp_project_finance
BEFORE UPDATE ON project_finance
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_project_finance_transactions
BEFORE UPDATE ON project_finance_transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
