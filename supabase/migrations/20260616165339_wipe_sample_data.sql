-- Wipe all data from tracking tables to prep for production
DELETE FROM public.expenses;
DELETE FROM public.transactions;
DELETE FROM public.visitor_passes;
DELETE FROM public.visitor_logs;
DELETE FROM public.messages;
DELETE FROM public.complaints;
DELETE FROM public.push_subscriptions;

-- Wipe tenants and managers (since the user will register the first manager via the app)
DELETE FROM public.tenants;
DELETE FROM public.managers;

-- Reset all units back to vacant
UPDATE public.units SET status = 'vacant', tenant_id = NULL;
