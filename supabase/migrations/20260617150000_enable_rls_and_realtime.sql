-- Enable RLS for all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies allowing ALL operations for authenticated users
CREATE POLICY "authenticated_all_tenants" ON tenants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_transactions" ON transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_complaints" ON complaints FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_messages" ON messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_managers" ON managers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_visitor_passes" ON visitor_passes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_visitor_logs" ON visitor_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_global_rates" ON global_rates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_expenses" ON expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_units" ON units FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_notifications" ON notifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_all_push_subscriptions" ON push_subscriptions FOR ALL USING (auth.role() = 'authenticated');

-- Enable realtime for visitor_logs and complaints
-- Note: supabase_realtime publication usually exists, but might need to be created or checked.
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE visitor_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE complaints;
