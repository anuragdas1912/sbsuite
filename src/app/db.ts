'use client';

import { createClient } from '@supabase/supabase-js';

// Types representing the database schema
export interface Tenant {
  id: string;
  name: string;
  role: 'residential' | 'commercial' | 'parking';
  unit_name: string;
  phone: string;
  aadhaar: string; // Mandatory for all
  vehicle_rc?: string; // Mandatory for parking only
  base_rent: number;
  electricity_rate: number; // For power bill calculation
  previous_reading: number;
  current_reading: number;
  ev_charger: boolean; // For parking EV users
  document_urls: {
    rent_agreement?: string;
    domicile?: string;
    affidavit?: string;
    satyapan?: string;
  };
  created_at: string;
}

export interface Transaction {
  id: string;
  tenant_id: string | null;
  tenant_name: string;
  business_type: 'residential' | 'commercial' | 'parking' | 'handover';
  unit_name: string;
  type: 'rent' | 'electricity' | 'both' | 'parking' | 'handover';
  total_amount: number;
  amount_paid: number;
  previous_reading: number | null;
  current_reading: number | null;
  units_consumed: number | null;
  payment_mode: 'Cash' | 'Online';
  manager_name: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  tenant_id: string;
  tenant_name: string;
  unit_name: string;
  role: 'residential' | 'commercial' | 'parking';
  subject: string;
  desc: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  category?: 'Plumbing' | 'Electrical' | 'Appliance' | 'Housekeeping' | 'Other';
  severity?: 'Urgent' | 'Medium' | 'Low';
  visit_slot?: string | null;
  visit_notes?: string | null;
  service_cost?: number;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string; // Tenant ID, Manager ID ('manager'), or Owner ID ('owner')
  sender_name: string;
  recipient_id: string; // Tenant ID, 'manager', or 'owner'
  content: string;
  created_at: string;
}

export interface VisitorPass {
  id: string;
  tenant_id: string;
  tenant_name: string;
  unit_name: string;
  visitor_name: string;
  phone: string;
  visit_type: 'Guest' | 'Delivery' | 'Maintenance' | 'Other';
  vehicle_no?: string;
  valid_until: string;
  status: 'Active' | 'Checked In' | 'Expired';
  created_at: string;
}

export interface VisitorLog {
  id: string;
  pass_id: string;
  visitor_name: string;
  tenant_name: string;
  unit_name: string;
  visit_type: string;
  vehicle_no?: string;
  check_in_time: string;
  manager_name: string;
}

export interface Manager {
  id: string;
  name: string;
  phone: string;
  cash_wallet: number; // Virtual cash wallet balance
  created_at: string;
}

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check environment
const isBrowser = typeof window !== 'undefined';

// Safe LocalStorage Load/Save (Fallback for non-database configs like global rates)
function loadData<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error loading key ${key} from localStorage`, e);
    return fallback;
  }
}

function saveData<T>(key: string, data: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving key ${key} to localStorage`, e);
  }
}

// Database Engine Wrapper using Supabase
export const db = {
  // --- Tenants ---
  async getTenants(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching tenants:', error);
      return [];
    }
    return data || [];
  },

  async addTenant(tenant: Omit<Tenant, 'id' | 'created_at' | 'document_urls'>): Promise<Tenant> {
    const id = 'tenant_' + Math.random().toString(36).substr(2, 9);
    const newTenant = {
      ...tenant,
      id,
      document_urls: {
        rent_agreement: 'rent_agreement_' + Date.now() + '.pdf',
        domicile: 'domicile_' + Date.now() + '.pdf',
        affidavit: 'affidavit_' + Date.now() + '.pdf',
        satyapan: 'satyapan_' + Date.now() + '.pdf'
      },
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from('tenants').insert(newTenant);
    if (error) throw error;
    return newTenant;
  },

  async removeTenant(id: string): Promise<void> {
    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (error) throw error;
  },

  async updateTenant(updatedTenant: Tenant): Promise<void> {
    const { error } = await supabase.from('tenants').update(updatedTenant).eq('id', updatedTenant.id);
    if (error) throw error;
  },

  // --- Transactions / Payments ---
  async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
    return data || [];
  },

  async addTransaction(tx: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    const id = 'tx_' + Math.random().toString(36).substr(2, 9);
    const newTx = {
      ...tx,
      id,
      created_at: new Date().toISOString()
    };

    const { error: txError } = await supabase.from('transactions').insert(newTx);
    if (txError) throw txError;

    // If it was a CASH transaction, credit the manager's virtual cash wallet!
    if (tx.payment_mode === 'Cash') {
      const { data: managers, error: mgrError } = await supabase.from('managers').select('*');
      if (!mgrError && managers) {
        const managerIndex = managers.findIndex(m => m.name.includes(tx.manager_name) || tx.manager_name.includes(m.name));
        if (managerIndex !== -1) {
          const mgr = managers[managerIndex];
          const newWallet = Number(mgr.cash_wallet) + Number(tx.amount_paid);
          await supabase.from('managers').update({ cash_wallet: newWallet }).eq('id', mgr.id);
        } else if (managers.length > 0) {
          const mgr = managers[0];
          const newWallet = Number(mgr.cash_wallet) + Number(tx.amount_paid);
          await supabase.from('managers').update({ cash_wallet: newWallet }).eq('id', mgr.id);
        }
      }
    }

    // Update tenant readings if applicable
    if (tx.current_reading !== null) {
      const { error: tErr } = await supabase
        .from('tenants')
        .update({ previous_reading: tx.current_reading })
        .eq('id', tx.tenant_id);
      if (tErr) console.error('Error updating tenant reading:', tErr);
    }

    return newTx;
  },

  async deleteTransaction(id: string): Promise<void> {
    const { data: txToDelete, error: getErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (getErr) throw getErr;

    const { error: delErr } = await supabase.from('transactions').delete().eq('id', id);
    if (delErr) throw delErr;

    // If it was a CASH transaction, we must deduct the amount from the manager's cash box!
    if (txToDelete && txToDelete.payment_mode === 'Cash') {
      const { data: managers, error: mgrError } = await supabase.from('managers').select('*');
      if (!mgrError && managers) {
        const managerIndex = managers.findIndex(m => m.name.includes(txToDelete.manager_name) || txToDelete.manager_name.includes(m.name));
        if (managerIndex !== -1) {
          const mgr = managers[managerIndex];
          const newWallet = Math.max(0, Number(mgr.cash_wallet) - Number(txToDelete.amount_paid));
          await supabase.from('managers').update({ cash_wallet: newWallet }).eq('id', mgr.id);
        }
      }
    }
  },

  async updateTransaction(updatedTx: Transaction): Promise<void> {
    const { data: oldTx, error: getErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', updatedTx.id)
      .single();
    
    if (getErr) throw getErr;

    const { error: upErr } = await supabase.from('transactions').update(updatedTx).eq('id', updatedTx.id);
    if (upErr) throw upErr;

    // Adjust manager cash wallet if payment amount or mode changed
    const mName = updatedTx.manager_name || oldTx.manager_name;
    const { data: managers, error: mgrError } = await supabase.from('managers').select('*');
    if (!mgrError && managers) {
      const managerIndex = managers.findIndex(m => m.name.includes(mName) || mName.includes(m.name));
      if (managerIndex !== -1) {
        const mgr = managers[managerIndex];
        let newWallet = Number(mgr.cash_wallet);
        // deduct old cash if it was cash
        if (oldTx.payment_mode === 'Cash') {
          newWallet = Math.max(0, newWallet - Number(oldTx.amount_paid));
        }
        // add new cash if it is cash
        if (updatedTx.payment_mode === 'Cash') {
          newWallet += Number(updatedTx.amount_paid);
        }
        await supabase.from('managers').update({ cash_wallet: newWallet }).eq('id', mgr.id);
      }
    }
  },

  async recordHandover(managerId: string, managerName: string, amount: number): Promise<Transaction> {
    // 1. Get the manager to check and update their wallet
    const { data: manager, error: getErr } = await supabase
      .from('managers')
      .select('*')
      .eq('id', managerId)
      .single();

    if (getErr) throw getErr;
    if (!manager) throw new Error('Manager not found');

    const newWallet = Math.max(0, Number(manager.cash_wallet) - amount);

    // 2. Update the manager's wallet
    const { error: upErr } = await supabase
      .from('managers')
      .update({ cash_wallet: newWallet })
      .eq('id', managerId);

    if (upErr) throw upErr;

    // 3. Create the handover transaction
    const id = 'handover_' + Math.random().toString(36).substr(2, 9);
    const newTx: Transaction = {
      id,
      tenant_id: null,
      tenant_name: 'Owner Cash Handover',
      business_type: 'handover',
      unit_name: 'N/A',
      type: 'handover',
      total_amount: amount,
      amount_paid: amount,
      previous_reading: null,
      current_reading: null,
      units_consumed: null,
      payment_mode: 'Cash',
      manager_name: managerName,
      created_at: new Date().toISOString()
    };

    const { error: txErr } = await supabase.from('transactions').insert(newTx);
    if (txErr) throw txErr;

    return newTx;
  },

  // --- Complaints ---
  async getComplaints(): Promise<Complaint[]> {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching complaints:', error);
      return [];
    }
    return data || [];
  },

  async addComplaint(c: Omit<Complaint, 'id' | 'status' | 'created_at'>): Promise<Complaint> {
    const id = 'c_' + Math.random().toString(36).substr(2, 9);
    const newComplaint = {
      ...c,
      id,
      status: 'Pending' as const,
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from('complaints').insert(newComplaint);
    if (error) throw error;
    return newComplaint;
  },

  async updateComplaintStatus(id: string, status: 'Pending' | 'In Progress' | 'Resolved'): Promise<void> {
    const { error } = await supabase.from('complaints').update({ status }).eq('id', id);
    if (error) throw error;
  },

  async updateComplaint(updated: Complaint): Promise<void> {
    const { error } = await supabase.from('complaints').update(updated).eq('id', updated.id);
    if (error) throw error;
  },

  // --- Messages ---
  async getMessages(): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    return data || [];
  },

  async addMessage(msg: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    const id = 'msg_' + Math.random().toString(36).substr(2, 9);
    const newMsg = {
      ...msg,
      id,
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from('messages').insert(newMsg);
    if (error) throw error;
    return newMsg;
  },

  // --- Managers ---
  async getManagers(): Promise<Manager[]> {
    const { data, error } = await supabase
      .from('managers')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching managers:', error);
      return [];
    }
    return data || [];
  },

  async addManager(m: Omit<Manager, 'id' | 'cash_wallet' | 'created_at'>): Promise<Manager> {
    const id = 'm_' + Math.random().toString(36).substr(2, 9);
    const newManager = {
      ...m,
      id,
      cash_wallet: 0,
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from('managers').insert(newManager);
    if (error) throw error;
    return newManager;
  },

  async removeManager(id: string): Promise<void> {
    const { error } = await supabase.from('managers').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Owner Configurable Global Rates (Stored locally) ---
  async getRates(): Promise<{ rent: Record<string, number>; power: Record<string, number> }> {
    const defaultRates = {
      rent: { residential: 5000, commercial: 12000, parking: 1500 },
      power: { residential: 10, commercial: 15, parking: 12 }
    };
    return loadData('sb_global_rates', defaultRates);
  },

  async saveRates(rates: { rent: Record<string, number>; power: Record<string, number> }): Promise<void> {
    saveData('sb_global_rates', rates);
  },

  // --- Visitor Passes & Logs ---
  async getVisitorPasses(): Promise<VisitorPass[]> {
    return loadData<VisitorPass[]>('sb_visitor_passes', []);
  },

  async saveVisitorPasses(passes: VisitorPass[]): Promise<void> {
    saveData('sb_visitor_passes', passes);
  },

  async getVisitorLogs(): Promise<VisitorLog[]> {
    return loadData<VisitorLog[]>('sb_visitor_logs', []);
  },

  async saveVisitorLogs(logs: VisitorLog[]): Promise<void> {
    saveData('sb_visitor_logs', logs);
  }
};
