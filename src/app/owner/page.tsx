'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, Tenant, Transaction, Complaint, Manager, Message } from '../db';
import { 
  ArrowLeft, 
  Globe, 
  Wrench, 
  DollarSign, 
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle,
  CreditCard,
  AlertTriangle,
  FileText,
  MessageSquare,
  Download,
  LogOut,
  Plus,
  Trash2,
  Search,
  Wallet,
  User,
  Sliders,
  ChevronRight,
  Edit3,
  TrendingUp,
  Activity,
  ShieldAlert,
  Printer,
  Bell,
  ClipboardList,
  Send
} from 'lucide-react';

type Lang = 'en' | 'hi';
type Tab = 'stats' | 'tenants' | 'managers' | 'rates' | 'complaints' | 'broadcasts' | 'messages' | 'compliance';

export default function OwnerDashboard() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [activeTab, setActiveTab] = useState<Tab>('stats');

  // Database State
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [globalRates, setGlobalRates] = useState<Awaited<ReturnType<typeof db.getRates>>>({
    rent: { residential: 5000, commercial: 12000, parking: 1500 },
    power: { residential: 10, commercial: 15, parking: 12 }
  });

  // Edit Transaction Modal States
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editAmountPaid, setEditAmountPaid] = useState('');
  const [editTotalAmount, setEditTotalAmount] = useState('');
  const [editMode, setEditMode] = useState<'Cash' | 'Online'>('Online');
  const [editPrevRead, setEditPrevRead] = useState('');
  const [editCurrRead, setEditCurrRead] = useState('');

  // Add Manager Form States
  const [newMgrName, setNewMgrName] = useState('');
  const [newMgrPhone, setNewMgrPhone] = useState('');

  // Add Tenant Form States
  const [newTenName, setNewTenName] = useState('');
  const [newTenRole, setNewTenRole] = useState<'residential' | 'commercial' | 'parking'>('residential');
  const [newTenUnit, setNewTenUnit] = useState('');
  const [newTenPhone, setNewTenPhone] = useState('');
  const [newTenAadhaar, setNewTenAadhaar] = useState('');
  const [newTenRc, setNewTenRc] = useState('');
  const [newTenRent, setNewTenRent] = useState(5000);
  const [newTenPowerRate, setNewTenPowerRate] = useState(10);
  const [newTenPrevReading, setNewTenPrevReading] = useState(1000);
  const [newTenEv, setNewEv] = useState(false);

  // Search
  const [tenantSearch, setTenantSearch] = useState('');

  // Transaction Search/Filter/Pagination States
  const [txSearch, setTxSearch] = useState('');
  const [txFilterType, setTxFilterType] = useState<string>('all');
  const [txFilterMode, setTxFilterMode] = useState<string>('all');
  const [txPage, setTxPage] = useState(1);

  // Hover Category state for SVG Chart
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Receipt Modal State
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  // Refresh
  const [refreshKey, setRefreshKey] = useState(0);

  const [allMessages, setAllMessages] = useState<Message[]>([]);

  // Complaint editing states
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [editCompStatus, setEditCompStatus] = useState<Complaint['status']>('Pending');
  const [editCompCategory, setEditCompCategory] = useState<'Plumbing' | 'Electrical' | 'Appliance' | 'Housekeeping' | 'Other'>('Other');
  const [editCompSeverity, setEditCompSeverity] = useState<'Urgent' | 'Medium' | 'Low'>('Medium');
  const [editCompSlot, setEditCompSlot] = useState('');
  const [editCompNotes, setEditCompNotes] = useState('');
  const [editCompCost, setEditCompCost] = useState<number>(0);

  // Broadcast states
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'broadcast_all' | 'broadcast_residential' | 'broadcast_commercial' | 'broadcast_parking'>('broadcast_all');
  const [isPublishingBroadcast, setIsPublishingBroadcast] = useState(false);

  // Sorting state for tenants
  const [tenantSortOption, setTenantSortOption] = useState<'default' | 'dues_desc' | 'dues_asc'>('default');

  // Compliance Notice Sender (Owner)
  const [sendingComplianceTenantId, setSendingComplianceTenantId] = useState<string | null>(null);

  // Private Chat states
  const [selectedChatTenantId, setSelectedChatTenantId] = useState<string | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [sendingAlertTenantId, setSendingAlertTenantId] = useState<string | null>(null);

  // Send Private Message reply helper
  const handleSendPrivateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatTenantId || !chatInputText.trim()) return;
    setIsSendingMessage(true);
    try {
      await db.addMessage({
        sender_id: 'owner',
        sender_name: 'Owner Balaji',
        recipient_id: selectedChatTenantId,
        content: chatInputText
      });
      setChatInputText('');
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Send One-Click Due Reminder message helper
  const handleSendDueReminder = async (tenant: Tenant) => {
    const dues = getTenantOutstandingDues(tenant);
    if (dues <= 0) return;
    setSendingAlertTenantId(tenant.id);
    try {
      await db.addMessage({
        sender_id: 'owner',
        sender_name: 'Owner Balaji',
        recipient_id: tenant.id,
        content: `Dear ${tenant.name.split(' (')[0]}, this is a friendly reminder that you have an outstanding due of ₹${dues.toLocaleString('en-IN')} for your unit ${tenant.unit_name}. Please complete your payment as soon as possible. - Owner Balaji`
      });
      alert(`✓ Payment reminder sent to ${tenant.name.split(' (')[0]}!`);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      alert('Failed to send reminder.');
    } finally {
      setSendingAlertTenantId(null);
    }
  };

  // Load stats
  useEffect(() => {
    async function loadData() {
      try {
        const ts = await db.getTenants();
        const txs = await db.getTransactions();
        const cs = await db.getComplaints();
        const ms = await db.getManagers();
        const rs = await db.getRates();
        const msgs = await db.getMessages();

        setTenants(ts);
        setTransactions(txs);
        setComplaints(cs);
        setManagers(ms);
        setGlobalRates(rs);
        setAllMessages(msgs);
      } catch (err) {
        console.error('Error loading owner stats:', err);
      }
    }
    loadData();
  }, [refreshKey]);

  // Update rates when type changes in New Tenant form
  useEffect(() => {
    setNewTenRent(globalRates.rent[newTenRole] || 5000);
    setNewTenPowerRate(globalRates.power[newTenRole] || 10);
  }, [newTenRole, globalRates]);

  // Compute live database statistics
  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount_paid, 0);
  const activeUnitsCount = new Set(tenants.map(t => t.unit_name)).size;
  const pendingDuesCount = tenants.reduce((sum, t) => {
    // outstanding check
    const txs = transactions.filter(tx => tx.tenant_id === t.id);
    const paid = txs.reduce((s, tx) => s + tx.amount_paid, 0);
    const currBill = t.base_rent + (t.role !== 'parking' || t.ev_charger ? (t.current_reading - t.previous_reading) * t.electricity_rate : 0);
    return sum + Math.max(0, currBill - paid);
  }, 0);

  const grossCollections = transactions
    .filter(tx => tx.business_type !== 'handover')
    .reduce((sum, tx) => sum + tx.amount_paid, 0);

  const totalMaintenanceExpense = complaints.reduce((sum, c) => sum + Number(c.service_cost || 0), 0);
  const netProfit = grossCollections - totalMaintenanceExpense;
  const profitMargin = grossCollections > 0 ? (netProfit / grossCollections) * 100 : 0;
  const maintenanceToRevenueRatio = grossCollections > 0 ? (totalMaintenanceExpense / grossCollections) * 100 : 0;

  let roiHealth = 'Excellent';
  let roiHealthColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
  if (maintenanceToRevenueRatio > 30) {
    roiHealth = 'High / Attention Needed';
    roiHealthColor = 'text-rose-400 border-rose-500/20 bg-rose-500/5';
  } else if (maintenanceToRevenueRatio > 10) {
    roiHealth = 'Healthy';
    roiHealthColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
  }

  // SLA Compliance Stats (computed)
  const slaStats = (() => {
    const resolved = complaints.filter(c => c.status === 'Resolved');
    const total = complaints.length;
    const withinSLA = resolved.length; // all resolved = within SLA for dashboard display
    const breached = complaints.filter(c => {
      if (c.status === 'Resolved') return false;
      const severity = c.severity || 'Medium';
      const targetHours = severity === 'Urgent' ? 6 : severity === 'Medium' ? 24 : 72;
      return Date.now() > new Date(c.created_at).getTime() + targetHours * 3600000;
    });
    const rate = total > 0 ? Math.round((withinSLA / total) * 100) : 100;
    return { rate, breachedCount: breached.length, resolvedCount: resolved.length, totalCount: total };
  })();

  // Add Manager
  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMgrName || !newMgrPhone) return;

    try {
      await db.addManager({
        name: newMgrName,
        phone: newMgrPhone
      });
      setNewMgrName('');
      setNewMgrPhone('');
      setRefreshKey(prev => prev + 1);
      alert(lang === 'en' ? 'Manager registered.' : 'मैनेजर पंजीकृत कर दिया गया है।');
    } catch (err) {
      console.error(err);
      alert('Failed to register manager.');
    }
  };

  // Remove Manager
  const handleRemoveManager = async (id: string, name: string) => {
    const confirmRemove = window.confirm(lang === 'en' ? `Remove manager ${name}?` : `क्या आप मैनेजर ${name} को हटाना चाहते हैं?`);
    if (confirmRemove) {
      try {
        await db.removeManager(id);
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        console.error(err);
        alert('Failed to remove manager.');
      }
    }
  };

  // Add Tenant
  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenName || !newTenUnit || !newTenPhone || !newTenAadhaar) return;

    const cleanAadhaar = newTenAadhaar.replace(/[^0-9]/g, '');
    if (cleanAadhaar.length !== 12) {
      alert(lang === 'en' ? 'Aadhaar must be exactly 12 digits!' : 'आधार में ठीक 12 अंक होने चाहिए!');
      return;
    }

    if (newTenRole === 'parking' && !newTenRc) {
      alert(lang === 'en' ? 'Vehicle RC is mandatory for Parking!' : 'पार्किंग के लिए वाहन आर.सी. अनिवार्य है!');
      return;
    }

    try {
      await db.addTenant({
        name: newTenName,
        role: newTenRole,
        unit_name: newTenUnit,
        phone: newTenPhone,
        aadhaar: newTenAadhaar,
        vehicle_rc: newTenRole === 'parking' ? newTenRc : undefined,
        base_rent: Number(newTenRent),
        electricity_rate: Number(newTenPowerRate),
        previous_reading: Number(newTenPrevReading),
        current_reading: Number(newTenPrevReading),
        ev_charger: newTenRole === 'parking' ? newTenEv : false
      });

      setNewTenName('');
      setNewTenUnit('');
      setNewTenPhone('');
      setNewTenAadhaar('');
      setNewTenRc('');
      setNewEv(false);
      setRefreshKey(prev => prev + 1);
      alert(lang === 'en' ? 'Tenant added.' : 'किरायेदार जोड़ा गया।');
    } catch (err) {
      console.error(err);
      alert('Failed to add tenant.');
    }
  };

  // Remove Tenant
  const handleRemoveTenant = async (id: string, name: string) => {
    const confirmRemove = window.confirm(lang === 'en' ? `Terminate lease for ${name}?` : `क्या आप ${name} की लीज समाप्त करना चाहते हैं?`);
    if (confirmRemove) {
      try {
        await db.removeTenant(id);
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        console.error(err);
        alert('Failed to remove tenant.');
      }
    }
  };

  // Edit global charges rates
  const handleUpdateRates = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.saveRates(globalRates);
      setRefreshKey(prev => prev + 1);
      alert(lang === 'en' ? 'Global rates updated.' : 'वैश्विक दरें अपडेट कर दी गई हैं।');
    } catch (err) {
      console.error(err);
      alert('Failed to update rates.');
    }
  };

  // Open Edit Transaction Modal
  const handleOpenEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setEditAmountPaid(tx.amount_paid.toString());
    setEditTotalAmount(tx.total_amount.toString());
    setEditMode(tx.payment_mode);
    setEditPrevRead(tx.previous_reading !== null ? tx.previous_reading.toString() : '');
    setEditCurrRead(tx.current_reading !== null ? tx.current_reading.toString() : '');
  };

  // Submit Edited Transaction
  const handleSaveEditTx = async () => {
    if (!editingTx) return;

    const updatedTx: Transaction = {
      ...editingTx,
      amount_paid: Number(editAmountPaid),
      total_amount: Number(editTotalAmount),
      payment_mode: editMode,
      previous_reading: editPrevRead ? Number(editPrevRead) : null,
      current_reading: editCurrRead ? Number(editCurrRead) : null,
      units_consumed: (editPrevRead && editCurrRead) ? (Number(editCurrRead) - Number(editPrevRead)) : null
    };

    try {
      await db.updateTransaction(updatedTx);
      setEditingTx(null);
      setRefreshKey(prev => prev + 1);
      alert(lang === 'en' ? '✓ Transaction details adjusted successfully!' : '✓ लेनदेन विवरण सफलतापूर्वक ठीक कर दिया गया!');
    } catch (err) {
      console.error(err);
      alert('Failed to update transaction.');
    }
  };

  // Delete Transaction
  const handleDeleteTx = async (id: string) => {
    const confirmDelete = window.confirm(lang === 'en' ? 'Delete this payment record? This will adjust manager cash boxes.' : 'क्या आप इस भुगतान रिकॉर्ड को हटाना चाहते हैं? इससे मैनेजर का कैश बॉक्स भी एडजस्ट हो जाएगा।');
    if (confirmDelete) {
      try {
        await db.deleteTransaction(id);
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        console.error(err);
        alert('Failed to delete transaction.');
      }
    }
  };

  // Compliance Notice Sender
  const handleSendComplianceNotice = async (tenant: Tenant) => {
    setSendingComplianceTenantId(tenant.id);
    try {
      await db.addMessage({
        sender_id: 'owner',
        sender_name: 'Owner Balaji',
        recipient_id: tenant.id,
        content: `[COMPLIANCE ALERT] Dear ${tenant.name.split(' (')[0]}, this is an official notice from the property owner. One or more of your mandatory documents (Rent Agreement, Domicile, Affidavit, Pre-Satyapan) are missing or require renewal. Please visit the office immediately. Non-compliance may result in lease suspension. - Owner Balaji`
      });
      alert(`✓ Compliance notice sent to ${tenant.name.split(' (')[0]}!`);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      alert('Failed to send compliance notice.');
    } finally {
      setSendingComplianceTenantId(null);
    }
  };

  // Toggle complaint status
  const handleToggleComplaintStatus = async (cId: string, currentStatus: Complaint['status']) => {
    let nextStatus: Complaint['status'] = 'In Progress';
    if (currentStatus === 'In Progress') nextStatus = 'Resolved';
    else if (currentStatus === 'Resolved') nextStatus = 'Pending';

    try {
      await db.updateComplaintStatus(cId, nextStatus);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      alert('Failed to update complaint status.');
    }
  };

  // Publish broadcast message
  const handlePublishBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastContent.trim()) return;
    setIsPublishingBroadcast(true);
    try {
      await db.addMessage({
        sender_id: 'owner',
        sender_name: 'Owner Balaji',
        recipient_id: broadcastTarget,
        content: broadcastContent
      });
      setBroadcastContent('');
      alert(lang === 'en' ? 'Announcement broadcasted successfully!' : 'घोषणा सफलतापूर्वक प्रसारित की गई!');
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      alert('Failed to publish broadcast.');
    } finally {
      setIsPublishingBroadcast(false);
    }
  };

  // Tenant outstanding dues helper
  const getTenantOutstandingDues = (tenant: Tenant) => {
    const rentAmount = tenant.base_rent;
    const isEvUser = tenant.ev_charger;
    const powerRate = tenant.electricity_rate || (tenant.role === 'commercial' ? 15 : tenant.role === 'parking' ? 12 : 10);
    const prevReading = tenant.previous_reading || 0;
    const currReading = tenant.current_reading || 0;
    const unitsConsumed = currReading > prevReading ? currReading - prevReading : 0;
    const electricityCharge = (tenant.role !== 'parking' || isEvUser) ? (unitsConsumed * powerRate) : 0;
    const totalOutstanding = rentAmount + electricityCharge;

    const currentMonthPaid = transactions
      .filter(tx => {
        if (tx.tenant_id !== tenant.id) return false;
        const txDate = new Date(tx.created_at);
        const now = new Date();
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, tx) => sum + tx.amount_paid, 0);

    return Math.max(0, totalOutstanding - currentMonthPaid);
  };

  const t = {
    en: {
      dashboard: 'Owner Master Center',
      langLabel: 'हिंदी',
      logout: 'Logout',
      overview: 'Main Overview',
      totalRevenue: 'Total Collections',
      activeUnits: 'Active Units',
      pendingDues: 'Pending Dues Estimate',
      liveLogs: 'Live Database Activity Logs',
      editBtn: 'Edit',
      deleteBtn: 'Delete',
      tenantsTab: 'Tenants',
      managersTab: 'Managers',
      ratesTab: 'Global Rates',
      complaintsTab: 'Complaints',
      cashHeld: 'Cash Box Wallet',
      addMgrTitle: 'Register New Property Manager',
      mgrName: 'Manager Name',
      mgrPhone: 'Phone Number',
      addMgrBtn: 'Register Manager',
      activeMgrs: 'Active Managers List',
      ratesTitle: 'Adjust Global Base Rents & Power Rates',
      rentRes: 'Residential Rent (₹)',
      rentCom: 'Commercial Rent (₹)',
      rentPark: 'Parking Rent (₹)',
      powerRes: 'Residential Power (₹/kWh)',
      powerCom: 'Commercial Power (₹/kWh)',
      powerPark: 'Parking Power (₹/kWh)',
      saveRatesBtn: 'Save Rates Config',
      noComplaints: 'No active complaints logged.',
      catRes: 'Residential',
      catCom: 'Commercial',
      catPark: 'Parking',
      toggleStatus: 'Change Status'
    },
    hi: {
      dashboard: 'मालिक मास्टर सेंटर',
      langLabel: 'English',
      logout: 'लॉगआउट',
      overview: 'मुख्य विवरण',
      totalRevenue: 'कुल जमा राशि',
      activeUnits: 'सक्रिय यूनिट्स',
      pendingDues: 'कुल अनुमानित बकाया',
      liveLogs: 'लाइव डेटाबेस लेनदेन लॉग',
      editBtn: 'संपादित करें',
      deleteBtn: 'हटाएं',
      tenantsTab: 'किरायेदार',
      managersTab: 'मैनेजर',
      ratesTab: 'वैश्विक दरें',
      complaintsTab: 'शिकायतें',
      cashHeld: 'कैश बॉक्स बटुआ',
      addMgrTitle: 'नया प्रॉपर्टी मैनेजर जोड़ें',
      mgrName: 'मैनेजर का नाम',
      mgrPhone: 'फोन नंबर',
      addMgrBtn: 'मैनेजर जोड़ें',
      activeMgrs: 'सक्रिय मैनेजरों की सूची',
      ratesTitle: 'कमरा किराया एवं बिजली दरें बदलें',
      rentRes: 'आवासीय किराया (₹)',
      rentCom: 'व्यावसायिक किराया (₹)',
      rentPark: 'पार्किंग किराया (₹)',
      powerRes: 'आवासीय बिजली दर (₹/kWh)',
      powerCom: 'व्यावसायिक बिजली दर (₹/kWh)',
      powerPark: 'पार्किंग बिजली दर (₹/kWh)',
      saveRatesBtn: 'दरें सहेजें',
      noComplaints: 'कोई शिकायत दर्ज नहीं है।',
      catRes: 'Residential (आवासीय)',
      catCom: 'Commercial (व्यावसायिक)',
      catPark: 'Parking (पार्किंग)',
      toggleStatus: 'स्थिति बदलें'
    }
  }[lang];

  return (
    <div className="min-h-screen bg-[#060608] text-[#F4F4F5] font-sans antialiased pb-24">
      
      {/* Header bar */}
      <header className="max-w-6xl mx-auto flex justify-between items-center bg-[#0E0F12] p-4 sm:p-5 border-b border-[#1B1C21] sm:rounded-b-xl mb-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 select-none">
            <img src="/logo.png" alt="Shree Balaji Estate Logo" className="w-full h-full object-contain rounded" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-serif font-bold text-slate-100 flex items-center gap-1.5">
              Anurag Das (अनुराग दास)
              <span className="text-[8px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded uppercase font-sans tracking-widest font-normal">Owner</span>
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{t.dashboard}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="px-2 py-1 rounded bg-[#060608] border border-[#1B1C21] text-[9px] font-semibold text-gold cursor-pointer flex items-center gap-1"
          >
            <Globe className="w-3 h-3" />
            <span>{t.langLabel}</span>
          </button>

          {/* Logout */}
          <button
            onClick={() => { localStorage.clear(); router.push('/'); }}
            className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title={t.logout}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Tab Container */}
      <main className="max-w-6xl mx-auto px-4 animate-luxury-card">
        
        {/* Tab 1: Stats & Ledger Overview */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0E0F12] border border-[#1B1C21] p-4.5 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">{t.totalRevenue}</span>
                  <p className="text-base sm:text-lg font-mono font-bold text-emerald-400 mt-0.5">₹{totalRevenue.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="bg-[#0E0F12] border border-[#1B1C21] p-4.5 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-gold/10 text-gold rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">{t.activeUnits}</span>
                  <p className="text-base sm:text-lg font-mono font-bold text-slate-200 mt-0.5">{activeUnitsCount}</p>
                </div>
              </div>

              <div className="bg-[#0E0F12] border border-[#1B1C21] p-4.5 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">{t.pendingDues}</span>
                  <p className="text-base sm:text-lg font-mono font-bold text-rose-400 mt-0.5">₹{pendingDuesCount.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* SLA & Compliance Stats Row */}
            {(() => {
              const complianceIssues = tenants.filter(t => {
                const docs = t.document_urls || {};
                return !docs.rent_agreement || !docs.domicile || !docs.affidavit || !docs.satyapan;
              });
              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl border flex items-center gap-4 ${
                    slaStats.rate >= 80 ? 'bg-emerald-500/5 border-emerald-500/20' :
                    slaStats.rate >= 50 ? 'bg-amber-500/5 border-amber-500/20' :
                    'bg-rose-500/5 border-rose-500/20'
                  }`}>
                    <div className={`p-3 rounded-lg ${
                      slaStats.rate >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                      slaStats.rate >= 50 ? 'bg-amber-500/10 text-amber-400' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">SLA Compliance Rate</span>
                      <p className={`text-base sm:text-lg font-mono font-bold mt-0.5 ${
                        slaStats.rate >= 80 ? 'text-emerald-400' : slaStats.rate >= 50 ? 'text-amber-400' : 'text-rose-400'
                      }`}>{slaStats.rate}%</p>
                      <span className="text-[8px] text-slate-500">{slaStats.resolvedCount}/{slaStats.totalCount} tickets closed on time</span>
                    </div>
                  </div>

                  <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-rose-400 font-bold tracking-wider">⚠️ Escalated Tickets</span>
                      <p className="text-base sm:text-lg font-mono font-bold text-rose-400 mt-0.5">{slaStats.breachedCount}</p>
                      <span className="text-[8px] text-slate-500">Tickets past their SLA window</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border flex items-center gap-4 ${complianceIssues.length > 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                    <div className={`p-3 rounded-lg ${complianceIssues.length > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Doc. Compliance</span>
                      <p className={`text-base sm:text-lg font-mono font-bold mt-0.5 ${complianceIssues.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {tenants.length - complianceIssues.length}/{tenants.length}
                      </p>
                      <span className="text-[8px] text-slate-500">{complianceIssues.length} tenant(s) with missing docs</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Visual Analytics Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Breakdown (Donut Chart) */}
              <div className="bg-[#0E0F12] border border-[#1B1C21] p-5 sm:p-6 rounded-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gold" />
                  Revenue Distribution by Category
                </h3>
                
                {(() => {
                  const resTotal = transactions.filter(t => t.business_type === 'residential').reduce((sum, tx) => sum + Number(tx.amount_paid), 0);
                  const comTotal = transactions.filter(t => t.business_type === 'commercial').reduce((sum, tx) => sum + Number(tx.amount_paid), 0);
                  const parkTotal = transactions.filter(t => t.business_type === 'parking').reduce((sum, tx) => sum + Number(tx.amount_paid), 0);
                  const handoverTotal = transactions.filter(t => t.business_type === 'handover').reduce((sum, tx) => sum + Number(tx.amount_paid), 0);
                  const grandTotal = resTotal + comTotal + parkTotal + handoverTotal;

                  const resPct = grandTotal > 0 ? resTotal / grandTotal : 0;
                  const comPct = grandTotal > 0 ? comTotal / grandTotal : 0;
                  const parkPct = grandTotal > 0 ? parkTotal / grandTotal : 0;
                  const handoverPct = grandTotal > 0 ? handoverTotal / grandTotal : 0;

                  // Circ = 2 * pi * r (r=40 -> 251.32)
                  const circ = 251.32;
                  const resDash = resPct * circ;
                  const comDash = comPct * circ;
                  const parkDash = parkPct * circ;
                  const handoverDash = handoverPct * circ;

                  const resOffset = circ;
                  const comOffset = circ - resDash;
                  const parkOffset = circ - resDash - comDash;
                  const handoverOffset = circ - resDash - comDash - parkDash;

                  return (
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
                      {/* SVG Donut */}
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          {/* Background Circle */}
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1B1C21" strokeWidth="8" />
                          
                          {/* Residential (Gold) */}
                          {resDash > 0 && (
                            <circle 
                              cx="50" cy="50" r="40" fill="transparent" 
                              stroke="#C5A880" strokeWidth="8" 
                              strokeDasharray={`${resDash} ${circ - resDash}`} 
                              strokeDashoffset={resOffset}
                              strokeLinecap="round"
                              className="transition-all duration-300 cursor-pointer"
                              onMouseEnter={() => setHoveredCategory('Residential')}
                              onMouseLeave={() => setHoveredCategory(null)}
                            />
                          )}
                          
                          {/* Commercial (Emerald) */}
                          {comDash > 0 && (
                            <circle 
                              cx="50" cy="50" r="40" fill="transparent" 
                              stroke="#34d399" strokeWidth="8" 
                              strokeDasharray={`${comDash} ${circ - comDash}`} 
                              strokeDashoffset={comOffset}
                              strokeLinecap="round"
                              className="transition-all duration-300 cursor-pointer"
                              onMouseEnter={() => setHoveredCategory('Commercial')}
                              onMouseLeave={() => setHoveredCategory(null)}
                            />
                          )}

                          {/* Parking (Blue) */}
                          {parkDash > 0 && (
                            <circle 
                              cx="50" cy="50" r="40" fill="transparent" 
                              stroke="#60a5fa" strokeWidth="8" 
                              strokeDasharray={`${parkDash} ${circ - parkDash}`} 
                              strokeDashoffset={parkOffset}
                              strokeLinecap="round"
                              className="transition-all duration-300 cursor-pointer"
                              onMouseEnter={() => setHoveredCategory('Parking')}
                              onMouseLeave={() => setHoveredCategory(null)}
                            />
                          )}

                          {/* Handovers (Rose) */}
                          {handoverDash > 0 && (
                            <circle 
                              cx="50" cy="50" r="40" fill="transparent" 
                              stroke="#fb7185" strokeWidth="8" 
                              strokeDasharray={`${handoverDash} ${circ - handoverDash}`} 
                              strokeDashoffset={handoverOffset}
                              strokeLinecap="round"
                              className="transition-all duration-300 cursor-pointer"
                              onMouseEnter={() => setHoveredCategory('Handovers')}
                              onMouseLeave={() => setHoveredCategory(null)}
                            />
                          )}
                        </svg>
                        
                        {/* Center Display */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold">
                            {hoveredCategory || 'Total'}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-slate-200 mt-0.5">
                            ₹{
                              hoveredCategory === 'Residential' ? resTotal.toLocaleString('en-IN') :
                              hoveredCategory === 'Commercial' ? comTotal.toLocaleString('en-IN') :
                              hoveredCategory === 'Parking' ? parkTotal.toLocaleString('en-IN') :
                              hoveredCategory === 'Handovers' ? handoverTotal.toLocaleString('en-IN') :
                              grandTotal.toLocaleString('en-IN')
                            }
                          </span>
                        </div>
                      </div>

                      {/* Legends */}
                      <div className="space-y-1.5 text-[9px] w-full sm:w-auto">
                        <div 
                          className={`flex items-center justify-between gap-4 p-1 rounded transition ${hoveredCategory === 'Residential' ? 'bg-[#C5A880]/10 border border-[#C5A880]/20' : ''}`}
                          onMouseEnter={() => setHoveredCategory('Residential')}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded bg-[#C5A880]" />
                            <span className="text-slate-400">Residential</span>
                          </div>
                          <span className="font-mono text-slate-200 font-semibold">₹{resTotal.toLocaleString('en-IN')} ({Math.round(resPct * 100)}%)</span>
                        </div>
                        <div 
                          className={`flex items-center justify-between gap-4 p-1 rounded transition ${hoveredCategory === 'Commercial' ? 'bg-emerald-500/10 border border-emerald-500/20' : ''}`}
                          onMouseEnter={() => setHoveredCategory('Commercial')}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded bg-[#34d399]" />
                            <span className="text-slate-400">Commercial</span>
                          </div>
                          <span className="font-mono text-slate-200 font-semibold">₹{comTotal.toLocaleString('en-IN')} ({Math.round(comPct * 100)}%)</span>
                        </div>
                        <div 
                          className={`flex items-center justify-between gap-4 p-1 rounded transition ${hoveredCategory === 'Parking' ? 'bg-blue-500/10 border border-blue-500/20' : ''}`}
                          onMouseEnter={() => setHoveredCategory('Parking')}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded bg-[#60a5fa]" />
                            <span className="text-slate-400">Parking</span>
                          </div>
                          <span className="font-mono text-slate-200 font-semibold">₹{parkTotal.toLocaleString('en-IN')} ({Math.round(parkPct * 100)}%)</span>
                        </div>
                        <div 
                          className={`flex items-center justify-between gap-4 p-1 rounded transition ${hoveredCategory === 'Handovers' ? 'bg-rose-500/10 border border-rose-500/20' : ''}`}
                          onMouseEnter={() => setHoveredCategory('Handovers')}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded bg-[#fb7185]" />
                            <span className="text-slate-400">Handovers</span>
                          </div>
                          <span className="font-mono text-slate-200 font-semibold">₹{handoverTotal.toLocaleString('en-IN')} ({Math.round(handoverPct * 100)}%)</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Recent Transactions Bar Chart */}
              <div className="bg-[#0E0F12] border border-[#1B1C21] p-5 sm:p-6 rounded-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gold" />
                  Recent Collection Trends (Last 6 Payments)
                </h3>

                {(() => {
                  const recentTxs = [...transactions]
                    .filter(tx => tx.business_type !== 'handover')
                    .slice(-6);
                  
                  if (recentTxs.length === 0) {
                    return <p className="text-slate-600 text-center py-10 text-xs font-light">No collections logged yet.</p>;
                  }

                  const maxVal = Math.max(...recentTxs.map(t => Number(t.amount_paid)), 1000);

                  return (
                    <div className="flex items-end justify-between gap-2.5 pt-6 h-28">
                      {recentTxs.map(tx => {
                        const heightPct = (Number(tx.amount_paid) / maxVal) * 100;
                        const dateLabel = new Date(tx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
                        return (
                          <div key={tx.id} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                            {/* Hover amount tooltip */}
                            <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-[#1B1C21] px-1.5 py-0.5 rounded text-[8px] text-slate-200 font-mono pointer-events-none whitespace-nowrap z-10">
                              ₹{tx.amount_paid}
                            </div>
                            
                            {/* Bar */}
                            <div 
                              style={{ height: `${Math.max(5, heightPct)}%` }}
                              className={`w-full rounded-t transition-all duration-300 ${
                                tx.business_type === 'commercial' ? 'bg-[#34d399] hover:bg-[#34d399]/80' :
                                tx.business_type === 'parking' ? 'bg-[#60a5fa] hover:bg-[#60a5fa]/80' :
                                'bg-[#C5A880] hover:bg-[#C5A880]/80'
                              }`}
                            />
                            
                            {/* Label */}
                            <span className="text-[7.5px] text-slate-500 font-mono text-center truncate w-full">
                              {tx.unit_name}
                              <span className="block text-[6.5px] text-slate-650">{dateLabel}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Property Profitability & Maintenance ROI */}
            <div className="bg-[#0E0F12] border border-[#1B1C21] p-5 sm:p-6 rounded-xl space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#1B1C21]/60 pb-3 gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gold" />
                  Property Profitability & Maintenance ROI
                </h3>
                <span className={`text-[8.5px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${roiHealthColor}`}>
                  Maintenance Cost Ratio: {roiHealth}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Financial Summary metrics */}
                <div className="md:col-span-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#060608]/40 border border-[#1B1C21]/50 p-3.5 rounded-lg">
                      <span className="text-[8.5px] uppercase font-bold text-slate-500 tracking-wider">Gross Collections</span>
                      <p className="text-sm sm:text-base font-mono font-bold text-emerald-400 mt-1">₹{grossCollections.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="bg-[#060608]/40 border border-[#1B1C21]/50 p-3.5 rounded-lg">
                      <span className="text-[8.5px] uppercase font-bold text-slate-500 tracking-wider">Maintenance Expense</span>
                      <p className="text-sm sm:text-base font-mono font-bold text-rose-400 mt-1">₹{totalMaintenanceExpense.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="bg-[#060608]/40 border border-[#1B1C21]/50 p-3.5 rounded-lg">
                      <span className="text-[8.5px] uppercase font-bold text-slate-500 tracking-wider">Net Profit</span>
                      <p className="text-sm sm:text-base font-mono font-bold text-gold mt-1">₹{netProfit.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="bg-[#060608]/40 border border-[#1B1C21]/50 p-3.5 rounded-lg">
                      <span className="text-[8.5px] uppercase font-bold text-slate-500 tracking-wider">Net Profit Margin</span>
                      <p className="text-sm sm:text-base font-mono font-bold text-slate-200 mt-1">{profitMargin.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="bg-[#060608]/40 border border-[#1B1C21]/50 p-3.5 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                      <span>Maintenance Ratio</span>
                      <span className={maintenanceToRevenueRatio > 30 ? 'text-rose-400' : maintenanceToRevenueRatio > 10 ? 'text-amber-400' : 'text-emerald-400'}>
                        {maintenanceToRevenueRatio.toFixed(1)}% of Revenue
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#060608] rounded-full overflow-hidden border border-[#1B1C21]">
                      <div 
                        style={{ width: `${Math.min(100, maintenanceToRevenueRatio)}%` }} 
                        className={`h-full rounded-full transition-all duration-500 ${
                          maintenanceToRevenueRatio > 30 ? 'bg-rose-500' :
                          maintenanceToRevenueRatio > 10 ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`}
                      />
                    </div>
                    <p className="text-[8.5px] text-slate-500 font-light leading-normal">
                      Ideally, maintenance expenses should remain below 10% of gross collections to optimize properties ROI.
                    </p>
                  </div>
                </div>

                {/* SVG Visual comparison */}
                <div className="md:col-span-7 bg-[#060608]/45 border border-[#1B1C21]/60 rounded-xl p-4 flex flex-col justify-between h-full min-h-[180px]">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">Collections vs Expenses Comparison</span>
                  
                  {(() => {
                    const maxVal = Math.max(grossCollections, totalMaintenanceExpense, Math.abs(netProfit), 1000);
                    const collHeight = (grossCollections / maxVal) * 100;
                    const expHeight = (totalMaintenanceExpense / maxVal) * 100;
                    const profitHeight = (Math.max(0, netProfit) / maxVal) * 100;

                    return (
                      <div className="flex items-end justify-around h-32 pt-4 border-b border-[#1B1C21]/40 pb-2">
                        {/* Collections Bar */}
                        <div className="flex flex-col items-center gap-1.5 w-16 group relative">
                          <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-[#1B1C21] px-2 py-0.5 rounded text-[9px] text-slate-200 font-mono pointer-events-none whitespace-nowrap z-10">
                            ₹{grossCollections.toLocaleString('en-IN')}
                          </div>
                          <div 
                            style={{ height: `${Math.max(5, collHeight)}%` }}
                            className="w-12 bg-emerald-500 hover:bg-emerald-400 rounded-t transition-all duration-300"
                          />
                          <span className="text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider text-center mt-1">Revenue</span>
                        </div>

                        {/* Expenses Bar */}
                        <div className="flex flex-col items-center gap-1.5 w-16 group relative">
                          <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-[#1B1C21] px-2 py-0.5 rounded text-[9px] text-slate-200 font-mono pointer-events-none whitespace-nowrap z-10">
                            ₹{totalMaintenanceExpense.toLocaleString('en-IN')}
                          </div>
                          <div 
                            style={{ height: `${Math.max(5, expHeight)}%` }}
                            className="w-12 bg-rose-500 hover:bg-rose-400 rounded-t transition-all duration-300"
                          />
                          <span className="text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider text-center mt-1">Expenses</span>
                        </div>

                        {/* Profit Bar */}
                        <div className="flex flex-col items-center gap-1.5 w-16 group relative">
                          <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-[#1B1C21] px-2 py-0.5 rounded text-[9px] text-slate-200 font-mono pointer-events-none whitespace-nowrap z-10">
                            ₹{netProfit.toLocaleString('en-IN')}
                          </div>
                          <div 
                            style={{ height: `${Math.max(5, profitHeight)}%` }}
                            className="w-12 bg-gold hover:bg-[#DFD3C3] rounded-t transition-all duration-300"
                          />
                          <span className="text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider text-center mt-1">Net Profit</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Transaction log lists */}
            <div className="bg-[#0E0F12] border border-[#1B1C21] rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1B1C21]/60 pb-3 gap-3">
                <h2 className="text-sm font-serif font-semibold text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gold" />
                  {t.liveLogs}
                </h2>

                {/* Filters Bar */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Search */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500">
                      <Search className="w-3 h-3" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={txSearch}
                      onChange={(e) => { setTxSearch(e.target.value); setTxPage(1); }}
                      className="pl-7 pr-2.5 py-1 rounded bg-[#060608] border border-[#1B1C21] text-slate-200 focus:outline-none focus:border-gold/50 text-[10px] w-36"
                    />
                  </div>

                  {/* Type Filter */}
                  <select
                    value={txFilterType}
                    onChange={(e) => { setTxFilterType(e.target.value); setTxPage(1); }}
                    className="rounded bg-[#060608] border border-[#1B1C21] px-2 py-1 text-slate-400 focus:outline-none text-[10px]"
                  >
                    <option value="all">All Types</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="parking">Parking</option>
                    <option value="handover">Handovers</option>
                  </select>

                  {/* Mode Filter */}
                  <select
                    value={txFilterMode}
                    onChange={(e) => { setTxFilterMode(e.target.value); setTxPage(1); }}
                    className="rounded bg-[#060608] border border-[#1B1C21] px-2 py-1 text-slate-400 focus:outline-none text-[10px]"
                  >
                    <option value="all">All Modes</option>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-[#1B1C21]/60 text-xs font-light">
                {(() => {
                  const filteredTxs = transactions.filter(tx => {
                    const matchesSearch = 
                      tx.tenant_name.toLowerCase().includes(txSearch.toLowerCase()) ||
                      tx.unit_name.toLowerCase().includes(txSearch.toLowerCase()) ||
                      tx.manager_name.toLowerCase().includes(txSearch.toLowerCase());
                    const matchesType = txFilterType === 'all' || tx.business_type === txFilterType;
                    const matchesMode = txFilterMode === 'all' || tx.payment_mode === txFilterMode;
                    return matchesSearch && matchesType && matchesMode;
                  });

                  if (filteredTxs.length === 0) {
                    return <p className="text-slate-600 text-center py-6">No matching database records found.</p>;
                  }

                  const itemsPerPage = 5;
                  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage);
                  const paginatedTxs = filteredTxs.slice((txPage - 1) * itemsPerPage, txPage * itemsPerPage);

                  return (
                    <>
                      {paginatedTxs.map(tx => (
                        <div key={tx.id} className="py-3.5 flex justify-between items-center gap-4 flex-wrap sm:flex-nowrap">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[8px] font-mono bg-[#060608] border border-[#1B1C21] px-1.5 py-0.5 rounded text-slate-500">
                                {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className={`text-[8px] border px-1 rounded uppercase tracking-wider font-semibold ${
                                tx.business_type === 'commercial' ? 'bg-emerald-500/10 text-[#34d399] border-emerald-500/20' :
                                tx.business_type === 'parking' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                tx.business_type === 'handover' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                'bg-gold/10 text-gold border-gold/20'
                              }`}>
                                {tx.business_type}
                              </span>
                            </div>
                            <p className="text-slate-300 mt-1 leading-relaxed">
                              {tx.business_type === 'handover' ? (
                                <span>
                                  <strong>{tx.manager_name}:</strong> handed over <strong>₹{tx.amount_paid}</strong> in cash to Owner.
                                </span>
                              ) : (
                                <span>
                                  <strong>{tx.manager_name}:</strong> log collection for <strong>{tx.unit_name}</strong> - {tx.tenant_name.split(' (')[0]} (₹{tx.amount_paid} via {tx.payment_mode})
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="flex gap-2 flex-shrink-0">
                            {tx.business_type !== 'handover' && (
                              <button
                                onClick={() => setReceiptTx(tx)}
                                className="px-2.5 py-1 rounded bg-[#060608] hover:bg-gold/15 border border-[#1B1C21] hover:border-gold/30 text-[9px] text-slate-350 flex items-center gap-1 transition cursor-pointer"
                                title="Print Receipt"
                              >
                                <Printer className="w-3 h-3 text-gold" />
                                <span>Receipt</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditTx(tx)}
                              className="px-2.5 py-1 rounded bg-[#060608] hover:bg-gold/15 border border-[#1B1C21] hover:border-gold/30 text-[9px] text-[#C5A880] transition cursor-pointer"
                            >
                              {t.editBtn}
                            </button>
                            <button
                              onClick={() => handleDeleteTx(tx.id)}
                              className="px-2.5 py-1 rounded bg-[#060608] hover:bg-rose-500/10 border border-[#1B1C21] hover:border-rose-500/30 text-[9px] text-rose-400 transition cursor-pointer"
                            >
                              {t.deleteBtn}
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t border-[#1B1C21]/60 text-[10px]">
                          <button
                            disabled={txPage === 1}
                            onClick={() => setTxPage(prev => Math.max(1, prev - 1))}
                            className="px-2.5 py-1 bg-[#0E0F12] border border-[#1B1C21] rounded text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-900 transition"
                          >
                            Previous
                          </button>
                          <span className="text-slate-500">
                            Page <strong>{txPage}</strong> of {totalPages}
                          </span>
                          <button
                            disabled={txPage === totalPages}
                            onClick={() => setTxPage(prev => Math.min(totalPages, prev + 1))}
                            className="px-2.5 py-1 bg-[#0E0F12] border border-[#1B1C21] rounded text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-900 transition"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Manage Tenants */}
        {activeTab === 'tenants' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Form */}
            <div className="md:col-span-4 bg-[#0E0F12] border border-[#1B1C21] p-5 rounded-xl space-y-4 h-fit">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-gold" />
                Add Tenant
              </h2>

              <form onSubmit={handleAddTenant} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase">Tenant Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={newTenName}
                    onChange={(e) => setNewTenName(e.target.value)}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase">Role</label>
                  <select
                    value={newTenRole}
                    onChange={(e) => setNewTenRole(e.target.value as 'residential' | 'commercial' | 'parking')}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="parking">Parking</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase">Unit / Room No</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 102"
                    value={newTenUnit}
                    onChange={(e) => setNewTenUnit(e.target.value)}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newTenPhone}
                    onChange={(e) => setNewTenPhone(e.target.value)}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase">Aadhaar (Mandatory)</label>
                  <input
                    type="text"
                    required
                    placeholder="xxxx-xxxx-xxxx"
                    value={newTenAadhaar}
                    onChange={(e) => setNewTenAadhaar(e.target.value)}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                  />
                </div>

                {newTenRole === 'parking' && (
                  <div className="space-y-1.5 animate-luxury-card">
                    <label className="text-slate-500 font-bold uppercase">Vehicle RC (Mandatory)</label>
                    <input
                      type="text"
                      required
                      placeholder="RC Number"
                      value={newTenRc}
                      onChange={(e) => setNewTenRc(e.target.value)}
                      className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-[9px] font-bold uppercase tracking-wider py-3.5 rounded-lg transition"
                >
                  Create Tenant
                </button>
              </form>
            </div>

            {/* List */}
            <div className="md:col-span-8 bg-[#0E0F12] border border-[#1B1C21] p-5 sm:p-6 rounded-xl space-y-4">
              <div className="flex justify-between items-center border-b border-[#1B1C21]/60 pb-3 flex-wrap sm:flex-nowrap gap-3">
                <h2 className="text-sm font-serif font-semibold text-slate-200">Registered Tenants List</h2>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Sort Selector */}
                  <select
                    value={tenantSortOption}
                    onChange={(e) => setTenantSortOption(e.target.value as 'default' | 'dues_desc' | 'dues_asc')}
                    className="rounded bg-[#060608] border border-[#1B1C21] text-xs px-2.5 py-1.5 focus:outline-none focus:border-gold/50 text-slate-250 w-44 animate-luxury-card text-xs"
                  >
                    <option value="default">Default Sort (क्रमानुसार)</option>
                    <option value="dues_desc">Dues: High to Low (बकाया: अधिक से कम)</option>
                    <option value="dues_asc">Dues: Low to High (बकाया: कम से अधिक)</option>
                  </select>

                  {/* Search */}
                  <input 
                    type="text"
                    placeholder="Filter tenants..."
                    value={tenantSearch}
                    onChange={(e) => setTenantSearch(e.target.value)}
                    className="rounded bg-[#060608] border border-[#1B1C21] text-xs px-3 py-1.5 focus:outline-none focus:border-gold/50 text-slate-250 w-40"
                  />
                </div>
              </div>

              <div className="overflow-x-auto text-xs font-light text-slate-300">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#1B1C21] text-slate-500 text-[10px] uppercase font-bold">
                      <th className="py-2">Name</th>
                      <th className="py-2">Unit</th>
                      <th className="py-2">Outstanding Dues</th>
                      <th className="py-2">Phone</th>
                      <th className="py-2 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1B1C21]/50">
                    {(() => {
                      let filtered = tenants.filter(t => t.name.toLowerCase().includes(tenantSearch.toLowerCase()) || t.unit_name.toLowerCase().includes(tenantSearch.toLowerCase()));
                      
                      if (tenantSortOption === 'dues_desc') {
                        filtered = [...filtered].sort((a, b) => getTenantOutstandingDues(b) - getTenantOutstandingDues(a));
                      } else if (tenantSortOption === 'dues_asc') {
                        filtered = [...filtered].sort((a, b) => getTenantOutstandingDues(a) - getTenantOutstandingDues(b));
                      }
                      
                      return filtered.map(ten => {
                        const dues = getTenantOutstandingDues(ten);
                        return (
                          <tr key={ten.id} className="hover:bg-[#060608]/20 transition-colors">
                            <td className="py-3 font-semibold text-slate-250">{ten.name.split(' (')[0]} <span className="text-[8px] bg-slate-900 border border-[#1B1C21] px-1.5 py-0.5 rounded text-slate-500 uppercase">{ten.role}</span></td>
                            <td className="py-3">{ten.unit_name}</td>
                            <td className="py-3 font-mono font-bold text-rose-400">₹{dues.toLocaleString('en-IN')}</td>
                            <td className="py-3 font-mono">{ten.phone}</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleRemoveTenant(ten.id, ten.name)}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 rounded transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Managers Administration */}
        {activeTab === 'managers' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Form */}
            <div className="md:col-span-5 bg-[#0E0F12] border border-[#1B1C21] p-5 rounded-xl space-y-4 h-fit">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-gold" />
                {t.addMgrTitle}
              </h2>

              <form onSubmit={handleAddManager} className="space-y-4 text-xs animate-luxury-card">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase">{t.mgrName} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Kumar"
                    value={newMgrName}
                    onChange={(e) => setNewMgrName(e.target.value)}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase">{t.mgrPhone} *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 99999-XXXXX"
                    value={newMgrPhone}
                    onChange={(e) => setNewMgrPhone(e.target.value)}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-[9px] font-bold uppercase tracking-wider py-3 rounded-lg transition"
                >
                  {t.addMgrBtn}
                </button>
              </form>
            </div>

            {/* List with cash wallets */}
            <div className="md:col-span-7 bg-[#0E0F12] border border-[#1B1C21] p-5 sm:p-6 rounded-xl space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#1B1C21]/60 pb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-gold" />
                {t.activeMgrs}
              </h2>

              <div className="divide-y divide-[#1B1C21]/60 text-xs">
                {managers.map(mgr => (
                  <div key={mgr.id} className="py-3.5 flex justify-between items-center">
                    <div>
                      <strong className="text-slate-200 block text-sm">{mgr.name.split(' (')[0]}</strong>
                      <span className="text-[9px] text-slate-500 font-mono">Phone: {mgr.phone} • Registered: {new Date(mgr.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Virtual Cash Wallet Balances audit */}
                      <div className="text-right">
                        <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider">{t.cashHeld}</span>
                        <strong className="font-mono text-emerald-400 font-bold text-sm">₹{mgr.cash_wallet.toLocaleString('en-IN')}</strong>
                      </div>

                      <button
                        onClick={() => handleRemoveManager(mgr.id, mgr.name)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-400 rounded transition cursor-pointer"
                        title="Remove Manager"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Global Rates Setting */}
        {activeTab === 'rates' && (
          <div className="bg-[#0E0F12] border border-[#1B1C21] p-5 sm:p-6 rounded-xl space-y-4 max-w-lg mx-auto">
            <h2 className="text-sm font-serif font-semibold text-slate-200 border-b border-[#1B1C21]/60 pb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-gold" />
              {t.ratesTitle}
            </h2>

            <form onSubmit={handleUpdateRates} className="space-y-4 text-xs animate-luxury-card">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase">{t.rentRes}</label>
                  <input
                    type="number"
                    value={globalRates.rent.residential}
                    onChange={(e) => setGlobalRates({
                      ...globalRates,
                      rent: { ...globalRates.rent, residential: Number(e.target.value) }
                    })}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase">{t.powerRes}</label>
                  <input
                    type="number"
                    value={globalRates.power.residential}
                    onChange={(e) => setGlobalRates({
                      ...globalRates,
                      power: { ...globalRates.power, residential: Number(e.target.value) }
                    })}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase">{t.rentCom}</label>
                  <input
                    type="number"
                    value={globalRates.rent.commercial}
                    onChange={(e) => setGlobalRates({
                      ...globalRates,
                      rent: { ...globalRates.rent, commercial: Number(e.target.value) }
                    })}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase">{t.powerCom}</label>
                  <input
                    type="number"
                    value={globalRates.power.commercial}
                    onChange={(e) => setGlobalRates({
                      ...globalRates,
                      power: { ...globalRates.power, commercial: Number(e.target.value) }
                    })}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase">{t.rentPark}</label>
                  <input
                    type="number"
                    value={globalRates.rent.parking}
                    onChange={(e) => setGlobalRates({
                      ...globalRates,
                      rent: { ...globalRates.rent, parking: Number(e.target.value) }
                    })}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold uppercase">{t.powerPark}</label>
                  <input
                    type="number"
                    value={globalRates.power.parking}
                    onChange={(e) => setGlobalRates({
                      ...globalRates,
                      power: { ...globalRates.power, parking: Number(e.target.value) }
                    })}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-[10px] font-bold uppercase tracking-wider py-3.5 rounded-lg transition shadow-lg mt-2 cursor-pointer"
              >
                {t.saveRatesBtn}
              </button>
            </form>
          </div>
        )}

        {/* Tab 5: Complaints Status */}
        {activeTab === 'complaints' && (
          <div className="space-y-6 animate-luxury-card">
            {/* Maintenance & Expense Summaries */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#0E0F12] border border-[#1B1C21] rounded-xl flex flex-col justify-center">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Total Tickets Raised</span>
                <span className="text-xl font-bold font-mono text-slate-200 mt-1">{complaints.length}</span>
              </div>
              <div className="p-4 bg-[#0E0F12] border border-[#1B1C21] rounded-xl flex flex-col justify-center">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Active Tickets</span>
                <span className="text-xl font-bold font-mono text-amber-400 mt-1">
                  {complaints.filter(c => c.status !== 'Resolved').length}
                </span>
              </div>
              <div className="p-4 bg-[#0E0F12] border border-[#1B1C21] rounded-xl flex flex-col justify-center">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Maintenance Expenses</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  ₹{complaints.reduce((sum, c) => sum + Number(c.service_cost || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="bg-[#0E0F12] border border-[#1B1C21] p-5 sm:p-6 rounded-xl space-y-4">
              <h2 className="text-sm font-serif font-semibold text-slate-200 border-b border-[#1B1C21]/60 pb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gold" />
                {t.complaintsTab} Tracker
              </h2>

              {complaints.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">{t.noComplaints}</p>
              ) : (
                <div className="divide-y divide-[#1B1C21]/60 text-xs">
                  {complaints.map(comp => {
                    const roleLabel = comp.role === 'residential' ? t.catRes : comp.role === 'commercial' ? t.catCom : t.catPark;
                    return (
                      <div key={comp.id} className="py-4 space-y-3 animate-luxury-card">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-100 text-sm">{comp.subject}</span>
                              <span className="text-[8px] bg-slate-900 border border-[#1B1C21] px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-widest">{roleLabel}</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed font-light">{comp.desc}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-slate-500 font-mono pt-1">
                              <span>Tenant: <strong className="text-slate-300">{comp.tenant_name.split(' (')[0]} ({comp.unit_name})</strong></span>
                              <span>Logged: {new Date(comp.created_at).toLocaleDateString()}</span>
                              {comp.visit_slot && (
                                <span>Preferred Slot: <strong className="text-slate-300 font-sans">{comp.visit_slot}</strong></span>
                              )}
                            </div>
                            
                            {/* Private service meta shown to Owner */}
                            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-500 bg-[#060608]/40 border border-[#1B1C21]/50 p-2 rounded-lg mt-2 w-fit">
                              <div>Category: <strong className="text-slate-300">{comp.category || 'Other'}</strong></div>
                              <div>Severity: <strong className="text-slate-300">{comp.severity || 'Medium'}</strong></div>
                              <div className="col-span-2 text-gold">Service Cost: <strong className="text-emerald-400 font-sans">₹{comp.service_cost || 0}</strong></div>
                              {comp.visit_notes && (
                                <div className="col-span-2 border-t border-[#1B1C21]/40 pt-1">
                                  Notes: <strong className="text-slate-300 font-sans">{comp.visit_notes}</strong>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className={`text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${
                              comp.status === 'Resolved' 
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                                : comp.status === 'In Progress'
                                ? 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                                : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                            }`}>
                              {comp.status}
                            </span>

                            <button
                              onClick={() => {
                                if (editingCompId === comp.id) {
                                  setEditingCompId(null);
                                } else {
                                  setEditingCompId(comp.id);
                                  setEditCompStatus(comp.status);
                                  setEditCompCategory(comp.category || 'Other');
                                  setEditCompSeverity(comp.severity || 'Medium');
                                  setEditCompSlot(comp.visit_slot || '');
                                  setEditCompNotes(comp.visit_notes || '');
                                  setEditCompCost(comp.service_cost || 0);
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-[#060608] hover:bg-gold/10 border border-[#1B1C21] hover:border-gold/30 text-[9px] text-[#C5A880] transition cursor-pointer font-bold"
                            >
                              {editingCompId === comp.id ? 'Cancel' : 'Edit / Schedule'}
                            </button>
                          </div>
                        </div>

                        {/* Inline editor panel */}
                        {editingCompId === comp.id && (
                          <div className="w-full bg-[#060608]/80 border border-[#1B1C21] p-4 rounded-xl mt-2 space-y-3 text-xs">
                            <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-[#1B1C21] pb-1.5 mb-2">
                              Update Service Visit Details
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-slate-500">Ticket Status</label>
                                <select
                                  value={editCompStatus}
                                  onChange={(e) => setEditCompStatus(e.target.value as 'Pending' | 'In Progress' | 'Resolved')}
                                  className="w-full rounded bg-slate-950 border border-[#1B1C21] p-2 text-slate-200 outline-none focus:border-gold/50 text-xs"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Resolved">Resolved</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-slate-500">Category</label>
                                <select
                                  value={editCompCategory}
                                  onChange={(e) => setEditCompCategory(e.target.value as 'Plumbing' | 'Electrical' | 'Appliance' | 'Housekeeping' | 'Other')}
                                  className="w-full rounded bg-slate-950 border border-[#1B1C21] p-2 text-slate-200 outline-none focus:border-gold/50 text-xs"
                                >
                                  <option value="Plumbing">Plumbing</option>
                                  <option value="Electrical">Electrical</option>
                                  <option value="Appliance">Appliance</option>
                                  <option value="Housekeeping">Housekeeping</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-slate-500">Severity</label>
                                <select
                                  value={editCompSeverity}
                                  onChange={(e) => setEditCompSeverity(e.target.value as 'Urgent' | 'Medium' | 'Low')}
                                  className="w-full rounded bg-slate-950 border border-[#1B1C21] p-2 text-slate-200 outline-none focus:border-gold/50 text-xs"
                                >
                                  <option value="Urgent">Urgent</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Low">Low</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-slate-500">Scheduled Visit Slot</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Next Saturday, 2-5 PM"
                                  value={editCompSlot}
                                  onChange={(e) => setEditCompSlot(e.target.value)}
                                  className="w-full rounded bg-slate-950 border border-[#1B1C21] p-2 text-slate-200 outline-none focus:border-gold/50 text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-slate-500">Service Cost (₹) - Private</label>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={editCompCost || ''}
                                  onChange={(e) => setEditCompCost(Number(e.target.value))}
                                  className="w-full rounded bg-slate-950 border border-[#1B1C21] p-2 text-slate-200 outline-none focus:border-gold/50 text-xs font-mono"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-500">Technician/Scheduler Notes</label>
                              <textarea
                                rows={2}
                                placeholder="e.g. Plumber assigned. Cost covers parts replacement."
                                value={editCompNotes}
                                onChange={(e) => setEditCompNotes(e.target.value)}
                                className="w-full rounded bg-slate-950 border border-[#1B1C21] p-2 text-slate-200 outline-none focus:border-gold/50 text-xs resize-none"
                              />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-[#1B1C21]/60">
                              <button
                                type="button"
                                onClick={() => setEditingCompId(null)}
                                className="px-3 py-1.5 rounded bg-[#060608] hover:bg-slate-900 border border-[#1B1C21] text-[10px] text-slate-400 font-bold uppercase transition cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await db.updateComplaint({
                                      ...comp,
                                      status: editCompStatus,
                                      category: editCompCategory,
                                      severity: editCompSeverity,
                                      visit_slot: editCompSlot || null,
                                      visit_notes: editCompNotes || null,
                                      service_cost: Number(editCompCost) || 0
                                    });
                                    setEditingCompId(null);
                                    setRefreshKey(prev => prev + 1);
                                    alert('✓ Ticket updated successfully!');
                                  } catch (err) {
                                    console.error(err);
                                    alert('Failed to update complaint.');
                                  }
                                }}
                                className="px-3 py-1.5 rounded bg-gold hover:bg-[#DFD3C3] text-slate-950 text-[10px] font-bold uppercase transition cursor-pointer"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Broadcast Announcements */}
        {activeTab === 'broadcasts' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-luxury-card">
            {/* Broadcast Composer */}
            <div className="md:col-span-5 bg-[#0E0F12] border border-[#1B1C21] p-5 rounded-xl space-y-4 h-fit">
              <h2 className="text-sm font-serif font-semibold text-slate-200 border-b border-[#1B1C21]/60 pb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-gold" />
                Broadcast Center
              </h2>

              <form onSubmit={handlePublishBroadcast} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase text-[9px] font-bold">Target Audience *</label>
                  <select
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value as 'broadcast_all' | 'broadcast_residential' | 'broadcast_commercial' | 'broadcast_parking')}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 outline-none focus:border-gold/50 text-xs"
                  >
                    <option value="broadcast_all">All Tenants (सभी किरायेदार)</option>
                    <option value="broadcast_residential">Residential Only (केवल आवासीय)</option>
                    <option value="broadcast_commercial">Commercial Only (केवल व्यावसायिक)</option>
                    <option value="broadcast_parking">Parking Pass Users Only (केवल पार्किंग पास)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase text-[9px] font-bold">Announcement Content *</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Type announcement message here..."
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 outline-none focus:border-gold/50 resize-none font-light leading-relaxed text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPublishingBroadcast}
                  className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-[9px] font-bold uppercase tracking-wider py-3 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isPublishingBroadcast ? 'Publishing...' : 'Publish Broadcast'}
                </button>
              </form>
            </div>

            {/* Broadcast History */}
            <div className="md:col-span-7 bg-[#0E0F12] border border-[#1B1C21] p-5 rounded-xl space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-gold" />
                Published Announcements Log
              </h2>

              {(() => {
                const broadcasts = allMessages.filter(
                  m => m.recipient_id.startsWith('broadcast_')
                );

                if (broadcasts.length === 0) {
                  return <p className="text-xs text-slate-500 py-8 text-center">No broadcasted announcements found.</p>;
                }

                return (
                  <div className="divide-y divide-[#1B1C21]/60 text-xs">
                    {[...broadcasts].reverse().map(ann => {
                      let audLabel = 'All Tenants';
                      if (ann.recipient_id === 'broadcast_residential') audLabel = 'Residential';
                      else if (ann.recipient_id === 'broadcast_commercial') audLabel = 'Commercial';
                      else if (ann.recipient_id === 'broadcast_parking') audLabel = 'Parking';

                      return (
                        <div key={ann.id} className="py-3.5 space-y-1.5">
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-bold text-[8px] tracking-wider uppercase text-gold bg-gold/5 px-2 py-0.5 rounded border border-gold/15">
                              {audLabel}
                            </span>
                            <span className="text-[7.5px] text-slate-500 font-mono">
                              {new Date(ann.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-300 font-light leading-relaxed">{ann.content}</p>
                          <div className="text-[7.5px] text-slate-500">
                            By: <strong className="text-slate-400 uppercase">{ann.sender_name === 'owner' ? 'Owner' : 'Manager'}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab 7: Private Messages Hub */}
        {activeTab === 'messages' && (
          <div className="bg-[#0E0F12] border border-[#1B1C21] rounded-xl p-5 sm:p-6 space-y-4 animate-luxury-card">
            <h2 className="text-sm font-serif font-semibold text-slate-200 border-b border-[#1B1C21]/60 pb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gold" />
              Private Tenant Chats
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[450px]">
              {/* Tenants Sidebar */}
              <div className="md:col-span-4 border border-[#1B1C21] rounded-xl flex flex-col bg-[#060608]/30 overflow-hidden h-full">
                {/* Search */}
                <div className="p-3 border-b border-[#1B1C21]">
                  <input
                    type="text"
                    placeholder="Search tenant..."
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto divide-y divide-[#1B1C21]/40">
                  {tenants
                    .filter(ten => ten.name.toLowerCase().includes(chatSearchQuery.toLowerCase()) || ten.unit_name.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                    .map(ten => {
                      const isSelected = selectedChatTenantId === ten.id;
                      // Get last message for preview
                      const tenantMessages = allMessages.filter(
                        m => (m.sender_id === ten.id && m.recipient_id === 'owner') ||
                             (m.sender_id === 'owner' && m.recipient_id === ten.id)
                      );
                      const lastMsg = tenantMessages[tenantMessages.length - 1];

                      return (
                        <button
                          key={ten.id}
                          onClick={() => {
                            setSelectedChatTenantId(ten.id);
                            setChatInputText('');
                          }}
                          className={`w-full p-3 text-left transition flex flex-col gap-1 border-l-2 cursor-pointer ${
                            isSelected 
                              ? 'bg-gold/5 border-gold text-slate-200' 
                              : 'border-transparent text-slate-400 hover:bg-slate-900/10'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="font-semibold text-xs truncate max-w-[70%]">{ten.name.split(' (')[0]}</span>
                            <span className="text-[7.5px] uppercase bg-[#060608] border border-[#1B1C21] px-1 rounded text-slate-500 font-mono font-medium">{ten.unit_name}</span>
                          </div>
                          {lastMsg ? (
                            <p className="text-[9px] text-slate-500 truncate w-full leading-normal">
                              {lastMsg.sender_id === 'owner' ? 'You: ' : ''}{lastMsg.content}
                            </p>
                          ) : (
                            <span className="text-[8px] text-slate-650 font-light italic">No chat history</span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Chat Thread Pane */}
              <div className="md:col-span-8 border border-[#1B1C21] rounded-xl flex flex-col bg-[#060608]/20 overflow-hidden h-full">
                {selectedChatTenantId ? (
                  (() => {
                    const activeTenant = tenants.find(t => t.id === selectedChatTenantId);
                    const chatThread = allMessages.filter(
                      m => (m.sender_id === selectedChatTenantId && m.recipient_id === 'owner') ||
                           (m.sender_id === 'owner' && m.recipient_id === selectedChatTenantId)
                    );

                    return (
                      <>
                        {/* Pane Header */}
                        <div className="p-3 bg-[#0E0F12] border-b border-[#1B1C21] flex justify-between items-center">
                          <div>
                            <strong className="text-slate-250 text-xs block">{activeTenant?.name.split(' (')[0]}</strong>
                            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">Unit: {activeTenant?.unit_name} • Role: {activeTenant?.role}</span>
                          </div>
                          {activeTenant && getTenantOutstandingDues(activeTenant) > 0 && (
                            <button
                              onClick={() => handleSendDueReminder(activeTenant)}
                              disabled={sendingAlertTenantId === activeTenant.id}
                              className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-[8.5px] uppercase tracking-wider cursor-pointer flex items-center gap-1 transition"
                            >
                              <Bell className="w-2.5 h-2.5" />
                              <span>Remind Dues</span>
                            </button>
                          )}
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col justify-start">
                          {chatThread.length === 0 ? (
                            <div className="text-center my-auto space-y-1">
                              <p className="text-xs text-slate-500 font-light">No messages exchanged yet.</p>
                              <p className="text-[9px] text-slate-650">Type a message below to start the conversation.</p>
                            </div>
                          ) : (
                            chatThread.map(m => {
                              const isMe = m.sender_id === 'owner';
                              return (
                                <div
                                  key={m.id}
                                  className={`max-w-[75%] rounded-lg p-2.5 text-xs ${
                                    isMe
                                      ? 'bg-gold/10 border border-gold/15 text-slate-200 self-end ml-auto'
                                      : 'bg-[#14151B] border border-[#24252D] text-slate-300 self-start'
                                  }`}
                                >
                                  <span className="block text-[8px] text-slate-500 uppercase font-semibold mb-0.5">{m.sender_name.split(' (')[0]}</span>
                                  <p className="leading-relaxed font-light">{m.content}</p>
                                  <span className="block text-[7px] text-slate-600 font-mono text-right mt-1">
                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Input Composer */}
                        <form onSubmit={handleSendPrivateMessage} className="p-3 bg-[#0E0F12] border-t border-[#1B1C21] flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Type your message..."
                            value={chatInputText}
                            onChange={(e) => setChatInputText(e.target.value)}
                            className="flex-1 rounded bg-[#060608] border border-[#1B1C21] px-3 py-2 text-xs text-slate-200 outline-none focus:border-gold/50"
                          />
                          <button
                            type="submit"
                            disabled={isSendingMessage}
                            className="bg-gold hover:bg-[#DFD3C3] text-[#060608] font-bold text-xs px-4 py-2 rounded-lg transition cursor-pointer"
                          >
                            Send
                          </button>
                        </form>
                      </>
                    );
                  })()
                ) : (
                  <div className="text-center my-auto p-6 space-y-1.5">
                    <MessageSquare className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                    <strong className="text-slate-400 text-xs block">Select a conversation</strong>
                    <p className="text-[10px] text-slate-505 max-w-xs mx-auto leading-normal">
                      Click a tenant from the sidebar list to view message history and reply directly.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Owner Transaction Mistakes Edit Modal Popup */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0E0F12] border border-[#1B1C21] rounded-2xl p-6 shadow-2xl relative space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#1B1C21]/60 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-slate-200">Adjust Transaction Details</h3>
                <span className="text-[9px] text-slate-500">Edit transaction log mistakes</span>
              </div>
              <button 
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 bg-[#060608] border border-[#1B1C21] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Inputs */}
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEditTx(); }} className="space-y-4 text-xs font-light">
              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase font-bold text-[9px]">Outstanding / Total Amount Due</label>
                <input 
                  type="number"
                  required
                  value={editTotalAmount}
                  onChange={(e) => setEditTotalAmount(e.target.value)}
                  className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase font-bold text-[9px]">Amount Paid (₹)</label>
                <input 
                  type="number"
                  required
                  value={editAmountPaid}
                  onChange={(e) => setEditAmountPaid(e.target.value)}
                  className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 outline-none font-bold text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase font-bold text-[9px]">Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditMode('Cash')}
                    className={`py-2 rounded border font-semibold cursor-pointer transition ${editMode === 'Cash' ? 'bg-gold/15 border-gold/40 text-gold' : 'bg-[#060608] border-[#1B1C21] text-slate-400 hover:text-slate-200'}`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode('Online')}
                    className={`py-2 rounded border font-semibold cursor-pointer transition ${editMode === 'Online' ? 'bg-gold/15 border-gold/40 text-gold' : 'bg-[#060608] border-[#1B1C21] text-slate-400 hover:text-slate-200'}`}
                  >
                    Online (UPI/Card)
                  </button>
                </div>
              </div>

              {editingTx.previous_reading !== null && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#060608] border border-[#1B1C21] rounded-xl font-mono">
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase text-slate-500">Prev Reading</span>
                    <input 
                      type="number"
                      value={editPrevRead}
                      onChange={(e) => setEditPrevRead(e.target.value)}
                      className="w-full rounded bg-[#0E0F12] border border-[#1B1C21] p-1.5 text-slate-200 outline-none text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase text-slate-500">Curr Reading</span>
                    <input 
                      type="number"
                      value={editCurrRead}
                      onChange={(e) => setEditCurrRead(e.target.value)}
                      className="w-full rounded bg-[#0E0F12] border border-[#1B1C21] p-1.5 text-slate-200 outline-none text-center"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-[9px] font-bold uppercase tracking-wider py-3.5 rounded-lg transition mt-2 shadow-lg cursor-pointer"
              >
                Apply Correction Changes
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Printable Receipt Generator Modal */}
      {receiptTx && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white text-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-6" id="printable-receipt">
            {/* Print Specific CSS Style Injection */}
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                #printable-receipt, #printable-receipt * {
                  visibility: visible;
                }
                #printable-receipt {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  box-shadow: none;
                  border: none;
                  background: white;
                  color: black;
                  padding: 30px;
                }
              }
            `}</style>

            {/* Receipt Content */}
            <div className="text-center space-y-1 pb-4 border-b border-slate-200">
              <h2 className="text-lg font-serif font-bold tracking-wide text-slate-900">SHREE BALAJI PROPERTIES</h2>
              <p className="text-[10px] text-slate-500 font-mono">Real Estate & Management Suite • Invoice Receipt</p>
              <div className="text-[9px] text-slate-400 font-mono mt-1">Receipt ID: {receiptTx.id}</div>
            </div>

            {/* Receipt Summary Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Tenant Name</span>
                <strong className="text-slate-800 text-sm">{receiptTx.tenant_name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Unit / Room</span>
                <strong className="text-slate-800 text-sm">{receiptTx.unit_name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Date & Time</span>
                <span className="text-slate-700 font-mono">{new Date(receiptTx.created_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Payment Category</span>
                <span className="text-slate-700 uppercase font-semibold font-mono text-[10px]">{receiptTx.business_type} ({receiptTx.type})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Collected By</span>
                <span className="text-slate-700 font-medium">{receiptTx.manager_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">Payment Mode</span>
                <span className="text-slate-700 font-bold">{receiptTx.payment_mode}</span>
              </div>
            </div>

            {/* Billing breakdown */}
            <div className="border-t border-b border-slate-200 py-3 text-xs space-y-2">
              <div className="flex justify-between font-semibold text-slate-900 border-b border-slate-100 pb-1.5 uppercase text-[9px] tracking-wider">
                <span>Description</span>
                <span>Amount</span>
              </div>

              {receiptTx.type === 'rent' || receiptTx.type === 'both' ? (
                <div className="flex justify-between text-slate-700">
                  <span>Base rent collection</span>
                  <span className="font-mono">₹{receiptTx.amount_paid - (receiptTx.units_consumed ? (receiptTx.units_consumed * 10) : 0)}</span>
                </div>
              ) : null}

              {receiptTx.previous_reading !== null && receiptTx.current_reading !== null && (
                <div className="space-y-1 pt-1.5 border-t border-slate-100/50">
                  <div className="flex justify-between text-slate-700">
                    <span>Power Bill Collection ({receiptTx.units_consumed} kWh consumed)</span>
                    <span className="font-mono">₹{(receiptTx.units_consumed || 0) * 10}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    Meter Readings: {receiptTx.previous_reading} kWh (Prev) → {receiptTx.current_reading} kWh (Curr)
                  </div>
                </div>
              )}

              <div className="flex justify-between text-slate-800 font-medium border-t border-slate-100 pt-2 text-[13px]">
                <span>Total Due Amount</span>
                <span className="font-mono">₹{receiptTx.total_amount}</span>
              </div>
              
              <div className="flex justify-between text-emerald-600 font-bold text-sm bg-emerald-55 p-2.5 rounded-lg mt-1">
                <span>Amount Paid</span>
                <span className="font-mono">₹{receiptTx.amount_paid}</span>
              </div>
            </div>

            {/* Bottom buttons (Hidden in print) */}
            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 print:hidden text-xs">
              <button
                onClick={() => setReceiptTx(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-55 transition font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1.5 transition font-bold shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
            </div>

          </div>
        </div>
      )}

        {/* Document Compliance Audit Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="bg-[#0E0F12] border border-[#1B1C21] rounded-xl p-5 space-y-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-sm font-serif font-semibold text-slate-200 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-gold" />
                    Document Compliance Audit Center
                  </h2>
                  <p className="text-[10px] text-slate-500 mt-1 font-light">Review all tenant document statuses and dispatch official compliance notices instantly.</p>
                </div>
                <div className="flex gap-2 text-[9px] font-bold uppercase tracking-wider">
                  <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">✓ Complete</span>
                  <span className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">✗ Missing</span>
                </div>
              </div>

              {/* Summary stats */}
              {(() => {
                const compliantTenants = tenants.filter(t => {
                  const docs = t.document_urls || {};
                  return docs.rent_agreement && docs.domicile && docs.affidavit && docs.satyapan;
                });
                const nonCompliant = tenants.length - compliantTenants.length;
                const complianceRate = tenants.length > 0 ? Math.round((compliantTenants.length / tenants.length) * 100) : 100;
                return (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#060608] border border-[#1B1C21] p-3 rounded-lg text-center">
                      <span className="text-[8px] uppercase text-slate-500 block">Total Tenants</span>
                      <span className="text-xl font-mono font-bold text-slate-200">{tenants.length}</span>
                    </div>
                    <div className="bg-[#060608] border border-[#1B1C21] p-3 rounded-lg text-center">
                      <span className="text-[8px] uppercase text-emerald-400 block">Compliant</span>
                      <span className="text-xl font-mono font-bold text-emerald-400">{compliantTenants.length}</span>
                    </div>
                    <div className={`bg-[#060608] border p-3 rounded-lg text-center ${nonCompliant > 0 ? 'border-rose-500/20' : 'border-[#1B1C21]'}`}>
                      <span className={`text-[8px] uppercase block ${nonCompliant > 0 ? 'text-rose-400' : 'text-slate-500'}`}>Pending Action</span>
                      <span className={`text-xl font-mono font-bold ${nonCompliant > 0 ? 'text-rose-400' : 'text-slate-500'}`}>{nonCompliant}</span>
                    </div>
                  </div>
                );
              })()}

              {tenants.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No tenants registered yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="text-[9px] text-slate-500 uppercase border-b border-[#1B1C21]/60">
                      <tr>
                        <th className="py-3 pr-4">Tenant</th>
                        <th className="py-3 text-center">Rent Agmt.</th>
                        <th className="py-3 text-center">Domicile</th>
                        <th className="py-3 text-center">Affidavit</th>
                        <th className="py-3 text-center">Pre-Satyapan</th>
                        <th className="py-3 text-center">Status</th>
                        <th className="py-3 text-center">Send Notice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1B1C21]/50">
                      {tenants.map(ten => {
                        const docs = ten.document_urls || {};
                        const hasDoc = (key: string) => !!(docs as Record<string, string>)[key];
                        const docBadge = (has: boolean) => has
                          ? <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">✓</span>
                          : <span className="inline-flex items-center justify-center w-5 h-5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-[10px] font-bold">✗</span>;
                        const allDocs = hasDoc('rent_agreement') && hasDoc('domicile') && hasDoc('affidavit') && hasDoc('satyapan');
                        return (
                          <tr key={ten.id} className="hover:bg-[#060608]/40">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${allDocs ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
                                <div>
                                  <strong className="block text-slate-200">{ten.name.split(' (')[0]}</strong>
                                  <span className="text-[9px] text-slate-500 uppercase font-mono">{ten.role} • {ten.unit_name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-center">{docBadge(hasDoc('rent_agreement'))}</td>
                            <td className="py-3 text-center">{docBadge(hasDoc('domicile'))}</td>
                            <td className="py-3 text-center">{docBadge(hasDoc('affidavit'))}</td>
                            <td className="py-3 text-center">{docBadge(hasDoc('satyapan'))}</td>
                            <td className="py-3 text-center">
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                allDocs
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                              }`}>
                                {allDocs ? 'Compliant' : 'Non-Compliant'}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <button
                                onClick={() => handleSendComplianceNotice(ten)}
                                disabled={sendingComplianceTenantId === ten.id}
                                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[9px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center gap-1 mx-auto"
                              >
                                <Send className="w-3 h-3" />
                                {sendingComplianceTenantId === ten.id ? 'Sending...' : 'Notice'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Bottom Sticky Tabs Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E0F12]/90 backdrop-blur-md border-t border-[#1B1C21] shadow-xl flex items-center" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {[
          { id: 'stats', icon: Activity, label: lang === 'en' ? 'Stats' : 'स्तिति' },
          { id: 'tenants', icon: User, label: lang === 'en' ? 'Tenants' : 'किरायेदार' },
          { id: 'managers', icon: Wallet, label: lang === 'en' ? 'Mgrs' : 'मैनेजर' },
          { id: 'rates', icon: Sliders, label: lang === 'en' ? 'Rates' : 'दरें' },
          { id: 'complaints', icon: Wrench, label: lang === 'en' ? 'Issues' : 'शिकायतें' },
          { id: 'compliance', icon: ClipboardList, label: lang === 'en' ? 'Docs' : 'डॉक्स' },
          { id: 'messages', icon: MessageSquare, label: lang === 'en' ? 'Chat' : 'चैट' },
          { id: 'broadcasts', icon: Bell, label: lang === 'en' ? 'Alert' : 'अलर्ट' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all duration-200 py-2 ${
                isActive ? 'text-gold' : 'text-slate-500 active:text-slate-300'
              }`}
            >
              <div className={`p-1 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-gold/10' : ''
              }`}>
                <Icon className="w-[16px] h-[16px]" />
              </div>
              <span className={`text-[7px] uppercase font-semibold tracking-wide leading-none ${
                isActive ? 'text-gold' : 'text-slate-600'
              }`}>{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
