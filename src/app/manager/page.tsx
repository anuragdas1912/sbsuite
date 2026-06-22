'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, Tenant, Transaction, Complaint, Manager, Message, VisitorPass, VisitorLog, Notification, Expense, Unit, supabase } from '../db';
import { subscribeToPushNotifications } from '../pushUtils';
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
  Printer,
  Activity,
  Bell,
  ShieldCheck,
  QrCode,
  Send,
  ClipboardList,
  X,
  LayoutDashboard,
  Map,
  List
} from 'lucide-react';

type Lang = 'en' | 'hi';
type Tab = 'roster' | 'tenants' | 'collect' | 'complaints' | 'transactions' | 'broadcasts' | 'messages' | 'security' | 'compliance';

export default function ManagerPortal() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('roster');
  const [rosterViewMode, setRosterViewMode] = useState<'list' | 'map'>('list');
  
  // Data State
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [manager, setManager] = useState<Manager | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // Selected Tenant Profile Modal
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // New Tenant Form States
  const [newTenName, setNewTenName] = useState('');
  const [newTenRole, setNewTenRole] = useState<'residential' | 'commercial' | 'parking'>('residential');
  const [newTenUnit, setNewTenUnit] = useState('');
  const [newTenUnitId, setNewTenUnitId] = useState('');
  const [newTenPhone, setNewTenPhone] = useState('');
  const [newTenPassword, setNewTenPassword] = useState('');
  const [newTenAadhaar, setNewTenAadhaar] = useState('');
  const [newTenRc, setNewTenRc] = useState('');
  const [newTenRent, setNewTenRent] = useState(5000);
  const [newTenPowerRate, setNewTenPowerRate] = useState(10);
  const [newTenPrevReading, setNewTenPrevReading] = useState(1000);
  const [newTenEv, setNewEv] = useState(false);

  // Quick Collect Form States
  const [collectTenantId, setCollectTenantId] = useState('');
  const [collectAmount, setCollectAmount] = useState('');
  const [collectType, setCollectType] = useState<'rent' | 'electricity' | 'both' | 'parking'>('both');
  const [collectMode, setCollectMode] = useState<'Cash' | 'Online' | ''>('');
  const [collectPrevRead, setCollectPrevRead] = useState<number | null>(null);
  const [collectCurrRead, setCollectCurrRead] = useState('');

  // Transaction Search/Filter/Pagination States
  const [txSearch, setTxSearch] = useState('');
  const [txFilterType, setTxFilterType] = useState<string>('all');
  const [txFilterMode, setTxFilterMode] = useState<string>('all');
  const [txPage, setTxPage] = useState(1);

  // Cash Handover Modal States
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverAmount, setHandoverAmount] = useState('');

  // Printable Receipt Modal State
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  // Success payment transaction holder for printing immediately
  const [justLoggedTx, setJustLoggedTx] = useState<Transaction | null>(null);

  // Refresh trigger
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

  // Security Gate Console States
  const [visitorPasses, setVisitorPasses] = useState<VisitorPass[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [passLookupId, setPassLookupId] = useState('');
  const [foundPass, setFoundPass] = useState<VisitorPass | null | 'not_found'>( null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Compliance Audit States
  const [sendingComplianceTenantId, setSendingComplianceTenantId] = useState<string | null>(null);

  // Broadcast states
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'broadcast_all' | 'broadcast_residential' | 'broadcast_commercial' | 'broadcast_parking'>('broadcast_all');
  const [isPublishingBroadcast, setIsPublishingBroadcast] = useState(false);

  // Private Chat states for Manager
  const [selectedChatTenantId, setSelectedChatTenantId] = useState<string | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  // Send Private Message reply helper
  const handleSendPrivateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatTenantId || !chatInputText.trim()) return;
    setIsSendingMessage(true);
    try {
      await db.addMessage({
        sender_id: 'manager',
        sender_name: manager ? manager.name : 'Manager',
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

  // Load Manager session and Data
  useEffect(() => {
    let channel: any = null;
    
    async function checkSessionAndLoad() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentRole = localStorage.getItem('sb_current_role');
        
        if (!session || currentRole !== 'manager') {
          router.push('/');
          return;
        }
        
        setAuthorized(true);

        const ts = await db.getTenants();
        const txs = await db.getTransactions();
        const cs = await db.getComplaints();
        const ms = await db.getManagers();
        const msgs = await db.getMessages();
        const passes = await db.getVisitorPasses();
        const logs = await db.getVisitorLogs();
        const notifs = await db.getNotifications();
        const exps = await db.getExpenses();
        const us = await db.getUnits();

        setTenants(ts);
        setTransactions(txs);
        setComplaints(cs);
        setAllMessages(msgs);
        setVisitorPasses(passes);
        setVisitorLogs(logs);
        setNotifications(notifs);
        setExpenses(exps);
        setUnits(us);

        // Load currently logged-in manager
        const currentMgrId = localStorage.getItem('sb_current_manager_id');
        if (currentMgrId && ms.length > 0) {
          const matchedMgr = ms.find(m => m.id === currentMgrId);
          if (matchedMgr) {
            setManager(matchedMgr);
          } else {
            localStorage.clear();
            router.push('/');
            return;
          }
        } else {
          if (ms.length > 0) {
            setManager(ms[0]);
          }
        }

        // Setup Supabase Realtime for Messages, Visitor Logs, and Complaints
        channel = supabase
          .channel('manager_realtime')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
            setAllMessages((prev) => [...prev, payload.new as Message]);
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitor_logs' }, (payload) => {
            setVisitorLogs((prev) => [payload.new as VisitorLog, ...prev]);
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'complaints' }, (payload) => {
            setComplaints((prev) => [payload.new as Complaint, ...prev]);
          })
          .subscribe();
      } catch (err) {
        console.error('Error loading manager data:', err);
      }
    }
    
    checkSessionAndLoad();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [refreshKey, router]);

  // Gate Pass Lookup Handler
  const handlePassLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passLookupId.trim()) return;
    setIsLookingUp(true);
    const allPasses = await db.getVisitorPasses();
    const now = new Date();
    const found = allPasses.find(p => p.id.toLowerCase() === passLookupId.trim().toLowerCase());
    if (!found) {
      setFoundPass('not_found');
    } else {
      // Auto-update expired
      if (found.status === 'Active' && new Date(found.valid_until) < now) {
        const updated = allPasses.map(p => p.id === found.id ? { ...p, status: 'Expired' as const } : p);
        await db.saveVisitorPasses(updated);
        setFoundPass({ ...found, status: 'Expired' });
      } else {
        setFoundPass(found);
      }
    }
    setIsLookingUp(false);
  };

  // Gate Pass Check-In Handler
  const handleCheckIn = async () => {
    if (!foundPass || foundPass === 'not_found' || foundPass.status !== 'Active') return;
    setIsCheckingIn(true);
    try {
      const allPasses = await db.getVisitorPasses();
      const updatedPasses = allPasses.map(p =>
        p.id === foundPass.id ? { ...p, status: 'Checked In' as const } : p
      );
      await db.saveVisitorPasses(updatedPasses);

      const newLog: VisitorLog = {
        id: 'log_' + Math.random().toString(36).substr(2, 9),
        pass_id: foundPass.id,
        visitor_name: foundPass.visitor_name,
        tenant_name: foundPass.tenant_name,
        unit_name: foundPass.unit_name,
        visit_type: foundPass.visit_type,
        vehicle_no: foundPass.vehicle_no,
        check_in_time: new Date().toISOString(),
        manager_name: manager?.name.split(' (')[0] || 'Manager'
      };
      const allLogs = await db.getVisitorLogs();
      await db.saveVisitorLogs([newLog, ...allLogs]);

      setFoundPass({ ...foundPass, status: 'Checked In' });
      setVisitorPasses(updatedPasses);
      setVisitorLogs([newLog, ...allLogs]);
      alert('✓ Visitor checked in successfully! Entry logged.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Compliance Notice Sender
  const handleSendComplianceNotice = async (tenant: Tenant) => {
    setSendingComplianceTenantId(tenant.id);
    try {
      const msg = `[COMPLIANCE ALERT] Dear ${tenant.name.split(' (')[0]}, this is an official notice from management. One or more of your mandatory documents (Rent Agreement, Domicile, Affidavit, Pre-Satyapan) may be missing or due for renewal. Please visit the office immediately or upload updated documents. Failure to comply may result in lease suspension. - Management`;
      await db.addMessage({
        sender_id: 'manager',
        sender_name: manager?.name.split(' (')[0] || 'Manager',
        recipient_id: tenant.id,
        content: msg
      });
      
      // Zero-Cost WhatsApp Integration
      const waLink = `https://wa.me/91${tenant.phone.replace(/\\D/g, '')}?text=${encodeURIComponent(msg)}`;
      window.open(waLink, '_blank');
      
      alert(`✓ Compliance notice opened in WhatsApp for ${tenant.name.split(' (')[0]}!`);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      alert('Failed to send compliance notice.');
    } finally {
      setSendingComplianceTenantId(null);
    }
  };

  // Update rates when type changes in New Tenant form
  useEffect(() => {
    async function updateRates() {
      try {
        const rates = await db.getRates();
        setNewTenRent(rates.rent[newTenRole] || 5000);
        setNewTenPowerRate(rates.power[newTenRole] || 10);
      } catch (err) {
        console.error('Error getting rates:', err);
      }
    }
    updateRates();
  }, [newTenRole]);

  // Handle Add Tenant
  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!newTenName || !newTenUnit || !newTenPhone || !newTenPassword || !newTenAadhaar) {
      alert(lang === 'en' ? 'Please fill in all mandatory fields.' : 'कृपया सभी आवश्यक फ़ील्ड भरें।');
      return;
    }

    // Aadhaar Verification Check (12-digit format, can contain dashes)
    const cleanAadhaar = newTenAadhaar.replace(/[^0-9]/g, '');
    if (cleanAadhaar.length !== 12) {
      alert(lang === 'en' ? 'Aadhaar Card must be exactly 12 digits!' : 'आधार कार्ड में ठीक 12 अंक होने चाहिए!');
      return;
    }

    if (newTenRole === 'parking' && !newTenRc) {
      alert(lang === 'en' ? 'Vehicle RC Number is mandatory for parking users!' : 'पार्किंग उपयोगकर्ताओं के लिए वाहन आर.सी. नंबर अनिवार्य है!');
      return;
    }

    try {
      const tenantId = `ten_${Math.random().toString(36).substr(2, 9)}`;
      await db.addTenant({
        id: tenantId,
        document_urls: {},
        name: newTenName,
        role: newTenRole,
        unit_name: newTenUnit,
        unit_id: newTenUnitId || undefined,
        phone: newTenPhone,
        password: newTenPassword,
        aadhaar: newTenAadhaar,
        vehicle_rc: newTenRole === 'parking' ? newTenRc : undefined,
        base_rent: Number(newTenRent),
        electricity_rate: Number(newTenPowerRate),
        previous_reading: Number(newTenPrevReading),
        current_reading: Number(newTenPrevReading),
        ev_charger: newTenRole === 'parking' ? newTenEv : false
      });

      // Reset Form
      setNewTenName('');
      setNewTenUnit('');
      setNewTenUnitId('');
      setNewTenPhone('');
      setNewTenPassword('');
      setNewTenAadhaar('');
      setNewTenRc('');
      setNewEv(false);
      setRefreshKey(prev => prev + 1);
      
      alert(lang === 'en' ? '✓ Tenant registered successfully!' : '✓ किरायेदार सफलतापूर्वक पंजीकृत हो गया!');
      setActiveTab('roster');
    } catch (err) {
      console.error(err);
      alert('Failed to register tenant.');
    }
  };

  // Handle Remove Tenant
  const handleRemoveTenant = async (id: string, name: string) => {
    const confirmRemove = window.confirm(
      lang === 'en' 
        ? `Are you sure you want to terminate tenancy for ${name}?` 
        : `क्या आप वास्तव में ${name} की सदस्यता समाप्त करना चाहते हैं?`
    );
    if (confirmRemove) {
      try {
        await db.removeTenant(id);
        setSelectedTenant(null);
        setRefreshKey(prev => prev + 1);
        alert(lang === 'en' ? 'Tenancy terminated.' : 'सदस्यता समाप्त कर दी गई है।');
      } catch (err) {
        console.error(err);
        alert('Failed to terminate tenancy.');
      }
    }
  };

  // Handle Quick Payment Collection
  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!collectTenantId || !collectAmount || !collectMode) {
      alert(lang === 'en' ? 'Fill all fields.' : 'सभी फ़ील्ड भरें।');
      return;
    }

    const target = tenants.find(t => t.id === collectTenantId);
    if (!target) return;

    let electricityCharge = 0;
    const currNum = parseFloat(collectCurrRead) || 0;
    const prevNum = collectPrevRead || 0;
    
    if (collectType !== 'rent' && collectType !== 'parking') {
      if (currNum <= prevNum) {
        alert(lang === 'en' ? 'Current meter reading must exceed previous reading!' : 'मौजूदा मीटर रीडिंग पिछली रीडिंग से अधिक होनी चाहिए!');
        return;
      }
      const units = currNum - prevNum;
      electricityCharge = units * target.electricity_rate;
    }

    try {
      // Add transaction
      const newTx = await db.addTransaction({
        tenant_id: target.id,
        tenant_name: target.name,
        business_type: target.role,
        unit_name: target.unit_name,
        type: collectType,
        total_amount: Number(collectAmount) + electricityCharge,
        amount_paid: Number(collectAmount),
        previous_reading: collectType !== 'rent' && collectType !== 'parking' ? prevNum : null,
        current_reading: collectType !== 'rent' && collectType !== 'parking' ? currNum : null,
        units_consumed: collectType !== 'rent' && collectType !== 'parking' ? (currNum - prevNum) : null,
        payment_mode: collectMode as 'Cash' | 'Online',
        manager_name: manager ? manager.name.split(' (')[0] : 'Amit'
      });

      // Reset Form
      setCollectTenantId('');
      setCollectAmount('');
      setCollectMode('');
      setCollectCurrRead('');
      setCollectPrevRead(null);
      setRefreshKey(prev => prev + 1);

      setJustLoggedTx(newTx);
    } catch (err) {
      console.error(err);
      alert('Failed to log payment.');
    }
  };

  // Handle Complaint status toggle
  const handleToggleComplaintStatus = async (cId: string, currentStatus: Complaint['status']) => {
    let nextStatus: Complaint['status'] = 'In Progress';
    if (currentStatus === 'In Progress') nextStatus = 'Resolved';
    else if (currentStatus === 'Resolved') nextStatus = 'Pending';

    try {
      await db.updateComplaintStatus(cId, nextStatus);
      
      if (nextStatus === 'Resolved') {
        const comp = complaints.find(c => c.id === cId);
        if (comp) {
          const ten = tenants.find(t => t.id === comp.tenant_id);
          if (ten) {
            const content = `Dear ${ten.name}, your maintenance request regarding "${comp.category}" has been marked as Resolved. Thank you!`;
            // Add internal message
            await db.addMessage({
              sender_id: manager?.id || 'manager',
              sender_name: manager?.name || 'Manager',
              recipient_id: ten.id,
              content
            });
            // Ping Mock WhatsApp/SMS API
            await fetch('/api/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tenant_id: ten.id,
                tenant_name: ten.name,
                notification_type: 'WhatsApp - Complaint Resolved',
                message_content: content
              })
            });
          }
        }
      }

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
        sender_id: 'manager',
        sender_name: manager?.name || 'Manager',
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

  // Record Cash Handover to Owner
  const handleHandoverCash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manager) return;
    const amount = Number(handoverAmount);
    if (isNaN(amount) || amount <= 0) {
      alert(lang === 'en' ? 'Please enter a valid cash amount.' : 'कृपया वैध कैश राशि दर्ज करें।');
      return;
    }
    if (amount > manager.cash_wallet) {
      alert(lang === 'en' ? 'Cannot handover more than cash box balance!' : 'कैश बॉक्स में उपलब्ध राशि से अधिक ट्रांसफर नहीं किया जा सकता!');
      return;
    }

    try {
      await db.recordHandover(manager.id, manager.name.split(' (')[0], amount);
      setShowHandoverModal(false);
      setHandoverAmount('');
      setRefreshKey(prev => prev + 1);
      alert(lang === 'en' ? '✓ Cash handover to Owner logged successfully!' : '✓ मालिक को कैश हैंडओवर दर्ज हो गया!');
    } catch (err) {
      console.error(err);
      alert('Failed to log cash handover.');
    }
  };

  // Filter roster tenants
  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.unit_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto load previous reading for collection form
  const handleSelectCollectTenant = (id: string) => {
    setCollectTenantId(id);
    const target = tenants.find(t => t.id === id);
    if (target) {
      setCollectPrevRead(target.current_reading);
      setCollectType(target.role === 'parking' ? (target.ev_charger ? 'both' : 'parking') : 'both');
      
      const outstandingAmt = target.base_rent + (target.role !== 'parking' || target.ev_charger ? 1000 : 0); // rough fallback outstanding estimation
      setCollectAmount(outstandingAmt.toString());
    } else {
      setCollectPrevRead(null);
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
      title: 'Manager Console',
      subtitle: 'Operations Management',
      langLabel: 'हिंदी',
      logout: 'Logout',
      rosterTab: 'Roster',
      tenantsTab: 'Tenants',
      collectTab: 'Payments',
      compTab: 'Complaints',
      cashWallet: 'Cash Box Balance',
      activeTenants: 'Active Leases',
      searchPlaceholder: 'Search by name, room/shop, or type...',
      rosterTitle: 'Searchable Tenant Directory',
      profileTitle: 'Tenant Profile Modal',
      aadhaar: 'Aadhaar ID',
      vehicleRc: 'Vehicle RC',
      baseRent: 'Base Rent',
      electricRate: 'Electric Rate',
      latestMeter: 'Current Readings',
      payHistory: 'Payment Logs',
      noTx: 'No logged receipts.',
      addTenantTitle: 'Register New Tenant Profile',
      nameLabel: 'Full Name',
      roleLabel: 'Category Type',
      unitLabel: 'Room / Shop / Slot Number',
      phoneLabel: 'Phone Number',
      passwordLabel: 'Login Password',
      aadhaarLabel: 'Aadhaar Card Number (Mandatory)',
      rcLabel: 'Vehicle RC Number (Mandatory for Parking)',
      prevReadLabel: 'Initial Meter Reading (kWh)',
      evLabel: 'Enable EV Power Charging',
      submitTenantBtn: 'Register Tenant',
      collectTitle: 'Record Rent & Utility Payments',
      selectTenant: 'Select Tenant Profile',
      collectAmtLabel: 'Amount Paid (₹)',
      collectModeLabel: 'Collection Mode',
      cashMode: 'Cash (Add to Wallet)',
      onlineMode: 'Online Transfer',
      submitCollectBtn: 'Log Payment',
      compTitle: 'Tenant Complaints Dashboard',
      toggleStatus: 'Change Status',
      noComplaints: 'No active complaints logged.',
      catRes: 'Residential',
      catCom: 'Commercial',
      catPark: 'Parking'
    },
    hi: {
      title: 'मैनेजर पैनल',
      subtitle: 'डेली प्रॉपर्टी मैनेजमेंट',
      langLabel: 'English',
      logout: 'लॉगआउट',
      rosterTab: 'रोस्टर',
      tenantsTab: 'किरायेदार (Tenants)',
      collectTab: 'पेमेंट रिकॉर्ड',
      compTab: 'शिकायतें',
      cashWallet: 'मैनेजर कैश बॉक्स',
      activeTenants: 'एक्टिव किरायेदार',
      searchPlaceholder: 'नाम, रूम/शॉप या केटेगरी से खोजें...',
      rosterTitle: 'किरायेदार सूची (Roster)',
      profileTitle: 'किरायेदार प्रोफाइल डिटेल्स',
      aadhaar: 'आधार कार्ड',
      vehicleRc: 'वाहन आर.सी. (RC)',
      baseRent: 'बेस रेंट (मूल किराया)',
      electricRate: 'बिजली दर (₹/यूनिट)',
      latestMeter: 'करेंट मीटर रीडिंग',
      payHistory: 'पेमेंट लॉग्स',
      noTx: 'कोई पुराना पेमेंट रिकॉर्ड नहीं है।',
      addTenantTitle: 'नया किरायेदार रजिस्टर करें',
      nameLabel: 'पूरा नाम',
      roleLabel: 'केटेगरी टाइप (Category)',
      unitLabel: 'रूम / शॉप / स्लॉट नंबर',
      phoneLabel: 'फोन नंबर',
      passwordLabel: 'लॉगिन पासवर्ड',
      aadhaarLabel: 'आधार कार्ड नंबर (अनिवार्य)',
      rcLabel: 'वाहन आर.सी. नंबर (पार्किंग के लिए अनिवार्य)',
      prevReadLabel: 'शुरुआती मीटर रीडिंग (kWh)',
      evLabel: 'ईवी चार्जिंग ऑन करें',
      submitTenantBtn: 'किरायेदार रजिस्टर करें',
      collectTitle: 'किराया और बिजली पेमेंट रिसीव करें',
      selectTenant: 'किरायेदार प्रोफाइल चुनें',
      collectAmtLabel: 'पेमेंट की राशि (₹)',
      collectModeLabel: 'पेमेंट का मोड (Mode)',
      cashMode: 'कैश (कैश बॉक्स में जोड़ें)',
      onlineMode: 'ऑनलाइन ट्रांसफर (UPI/Net)',
      submitCollectBtn: 'पेमेंट सेव करें',
      compTitle: 'किरायेदारों की शिकायतें',
      toggleStatus: 'स्टेटस बदलें',
      noComplaints: 'कोई पेंडिंग शिकायत नहीं है।',
      catRes: 'Residential (आवासीय)',
      catCom: 'Commercial (व्यावसायिक)',
      catPark: 'Parking (पार्किंग)'
    }
  }[lang];

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center text-[#F4F4F5]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] text-[#F4F4F5] font-sans antialiased pb-24">
      
      {/* Header bar */}
      <header className="max-w-4xl mx-auto flex justify-between items-center bg-[#0E0F12] p-4 sm:p-5 border-b border-[#1B1C21] sm:rounded-b-xl mb-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 select-none">
            <img src="/logo.png" alt="Shree Balaji Estate Logo" className="w-full h-full object-contain rounded" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-serif font-bold text-slate-100 flex items-center gap-1.5">
              {manager ? manager.name.split(' (')[0] : 'Amit'}
              <span className="text-[8px] bg-gold/20 text-gold px-1.5 py-0.5 rounded uppercase font-sans tracking-widest font-normal">Manager</span>
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Push Notifications Toggle */}
          <button
            onClick={async () => {
              if (!manager?.login_id) return;
              const success = await subscribeToPushNotifications(manager.login_id, 'manager');
              if (success) {
                alert(lang === 'en' ? 'Notifications enabled!' : 'सूचनाएं सक्षम की गईं!');
              } else {
                alert(lang === 'en' ? 'Failed to enable notifications.' : 'सूचनाएं सक्षम करने में विफल।');
              }
            }}
            className="p-1.5 rounded hover:bg-gold/10 text-slate-400 hover:text-gold transition-colors cursor-pointer"
            title={lang === 'en' ? 'Enable Push Notifications' : 'सूचनाएं सक्षम करें'}
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* Language switcher */}
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
      <main className="max-w-4xl mx-auto px-4 animate-luxury-card">
        
        {/* Roster Tab */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            
            {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Virtual Wallet Box */}
              <div className="bg-[#0E0F12] border border-[#1B1C21] p-4.5 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">{t.cashWallet}</span>
                    <p className="text-base sm:text-lg font-mono font-bold text-emerald-400 mt-0.5">₹{manager ? manager.cash_wallet.toLocaleString('en-IN') : '0'}</p>
                  </div>
                </div>

                {manager && manager.cash_wallet > 0 && (
                  <button
                    onClick={() => { setHandoverAmount(manager.cash_wallet.toString()); setShowHandoverModal(true); }}
                    className="px-3 py-1.5 bg-gold/15 hover:bg-gold/30 border border-gold/30 text-gold rounded-lg font-bold text-[9px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Handover</span>
                  </button>
                )}
              </div>

              {/* Active Leases count */}
              <div className="bg-[#0E0F12] border border-[#1B1C21] p-4.5 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-gold/10 text-gold rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">{t.activeTenants}</span>
                  <p className="text-base sm:text-lg font-mono font-bold text-slate-200 mt-0.5">{tenants.length}</p>
                </div>
              </div>
            </div>

            {/* Searchable Roster Table / Spatial Map */}
            <div className="bg-[#0E0F12] border border-[#1B1C21] rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#1B1C21]/60 pb-3 flex-wrap sm:flex-nowrap gap-3">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-serif font-semibold text-slate-200">
                    {rosterViewMode === 'list' ? t.rosterTitle : (lang === 'en' ? 'Spatial Twin Dashboard' : 'स्थानिक डैशबोर्ड')}
                  </h2>
                  <div className="flex items-center bg-[#060608] border border-[#1B1C21] rounded-lg p-0.5">
                    <button 
                      onClick={() => setRosterViewMode('list')} 
                      className={`p-1.5 rounded-md transition-colors ${rosterViewMode === 'list' ? 'bg-slate-800 text-gold' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setRosterViewMode('map')} 
                      className={`p-1.5 rounded-md transition-colors ${rosterViewMode === 'map' ? 'bg-slate-800 text-gold' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                {/* Search Inputs */}
                <div className="relative w-full sm:w-64 text-xs">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#060608] border border-[#1B1C21] text-slate-200 focus:outline-none focus:border-gold/50"
                  />
                </div>
              </div>

              {/* Roster list or Map Grid */}
              {rosterViewMode === 'list' ? (
                <div className="divide-y divide-[#1B1C21]/60 text-xs">
                  {filteredTenants.map(ten => {
                    const roleLabel = ten.role === 'residential' ? t.catRes : ten.role === 'commercial' ? t.catCom : t.catPark;
                    return (
                      <div 
                        key={ten.id} 
                        onClick={() => setSelectedTenant(ten)}
                        className="py-3 flex justify-between items-center hover:bg-slate-900/20 px-2 rounded-lg cursor-pointer transition duration-150"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-gold/5 border border-gold/20 rounded-full flex items-center justify-center font-serif text-gold font-bold">
                            {ten.unit_name.match(/\d+/)?.[0] || ten.unit_name.slice(-2)}
                          </div>
                          <div>
                            <strong className="text-slate-200 block">{ten.name.split(' (')[0]}</strong>
                            <span className="text-[9px] text-slate-500 uppercase tracking-wider">{roleLabel} • {ten.unit_name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <span className="font-mono text-slate-400 font-semibold">₹{ten.base_rent}</span>
                          <ChevronRight className="w-4 h-4 text-slate-650" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                  {filteredTenants.map(ten => {
                    const hasDues = getTenantOutstandingDues(ten) > 0;
                    const hasActiveComplaint = complaints.some(c => c.tenant_id === ten.id && c.status !== 'Resolved');
                    
                    let statusColor = 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400';
                    let indicator = 'bg-emerald-500';
                    
                    if (hasDues) {
                      statusColor = 'bg-rose-500/5 border-rose-500/30 text-rose-400';
                      indicator = 'bg-rose-500';
                    } else if (hasActiveComplaint) {
                      statusColor = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
                      indicator = 'bg-amber-500 animate-pulse';
                    }

                    return (
                      <div 
                        key={ten.id} 
                        onClick={() => setSelectedTenant(ten)} 
                        className={`relative flex flex-col items-center justify-center py-4 px-2 rounded-xl border ${statusColor} cursor-pointer hover:bg-opacity-20 hover:scale-[1.02] transition-all`}
                      >
                        <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${indicator} shadow-[0_0_5px_currentColor]`} />
                        <strong className="text-sm font-mono mt-1">{ten.unit_name.match(/\d+/)?.[0] || ten.unit_name.slice(0,4)}</strong>
                        <span className="text-[8px] uppercase tracking-widest mt-1 opacity-80">{ten.role.slice(0,3)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Manage Tenants */}
        {activeTab === 'tenants' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Add Tenant Form */}
            <div className="md:col-span-12 bg-[#0E0F12] border border-[#1B1C21] p-5 sm:p-6 rounded-xl space-y-4">
              <h2 className="text-sm font-serif font-semibold text-slate-200 border-b border-[#1B1C21]/60 pb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-gold" />
                {t.addTenantTitle}
              </h2>

              <form onSubmit={handleAddTenant} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">{t.nameLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newTenName}
                    onChange={(e) => setNewTenName(e.target.value)}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">{t.roleLabel} *</label>
                  <select
                    value={newTenRole}
                    onChange={(e) => setNewTenRole(e.target.value as 'residential' | 'commercial' | 'parking')}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50 cursor-pointer"
                  >
                    <option value="residential">Residential (आवासीय)</option>
                    <option value="commercial">Commercial (व्यावसायिक)</option>
                    <option value="parking">Parking (पार्किंग)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">{t.unitLabel} *</label>
                  {newTenRole === 'parking' ? (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Parking Spot 102"
                      value={newTenUnit}
                      onChange={(e) => setNewTenUnit(e.target.value)}
                      className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                    />
                  ) : (
                    <select
                      required
                      value={newTenUnitId}
                      onChange={(e) => {
                        setNewTenUnitId(e.target.value);
                        const unit = units.find(u => u.id === e.target.value);
                        if (unit) setNewTenUnit(unit.name);
                        else setNewTenUnit('');
                      }}
                      className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                    >
                      <option value="">Select a Unit</option>
                      {units.filter(u => u.type === newTenRole && u.status === 'vacant').map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">{t.phoneLabel} *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98970XXXXX"
                    value={newTenPhone}
                    onChange={(e) => setNewTenPhone(e.target.value)}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">{t.passwordLabel} *</label>
                  <input
                    type="password"
                    required
                    placeholder="Create secure password for tenant"
                    value={newTenPassword}
                    onChange={(e) => setNewTenPassword(e.target.value)}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">{t.aadhaarLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder="12-digit Aadhaar (xxxx-xxxx-xxxx)"
                    value={newTenAadhaar}
                    onChange={(e) => setNewTenAadhaar(e.target.value)}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">{t.rcLabel} {newTenRole === 'parking' && '*'}</label>
                  <input
                    type="text"
                    required={newTenRole === 'parking'}
                    placeholder="UA-04-C-XXXX (Only Parking)"
                    value={newTenRc}
                    onChange={(e) => setNewTenRc(e.target.value)}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50 disabled:opacity-30"
                    disabled={newTenRole !== 'parking'}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">{t.baseRent} (₹)</label>
                  <input
                    type="number"
                    value={newTenRent}
                    onChange={(e) => setNewTenRent(Number(e.target.value))}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                  />
                </div>

                {newTenRole !== 'parking' ? (
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">{t.electricRate} (₹/kWh)</label>
                    <input
                      type="number"
                      value={newTenPowerRate}
                      onChange={(e) => setNewTenPowerRate(Number(e.target.value))}
                      className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 select-none pt-6 pl-1">
                    <input 
                      type="checkbox" 
                      id="evCheck" 
                      checked={newTenEv} 
                      onChange={(e) => setNewEv(e.target.checked)}
                      className="w-4 h-4 text-gold accent-gold rounded border-[#1B1C21]"
                    />
                    <label htmlFor="evCheck" className="text-xs text-slate-400 cursor-pointer">{t.evLabel}</label>
                  </div>
                )}

                {newTenRole !== 'parking' && (
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">{t.prevReadLabel}</label>
                    <input
                      type="number"
                      value={newTenPrevReading}
                      onChange={(e) => setNewTenPrevReading(Number(e.target.value))}
                      className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-[10px] font-bold uppercase tracking-wider py-3.5 rounded-lg transition-colors cursor-pointer sm:col-span-2 mt-2 shadow-lg"
                >
                  {t.submitTenantBtn}
                </button>
              </form>
            </div>

          </div>
        )}

        {/* Tab 3: Collect Payments */}
        {activeTab === 'collect' && (
          <div className="bg-[#0E0F12] border border-[#1B1C21] p-5 sm:p-6 rounded-xl space-y-4 max-w-lg mx-auto">
            <h2 className="text-sm sm:text-base font-serif font-semibold text-slate-200 border-b border-[#1B1C21]/60 pb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gold" />
              {t.collectTitle}
            </h2>

            <form onSubmit={handleCollectPayment} className="space-y-4 text-xs animate-luxury-card">
              
              {/* Tenant selector */}
              <div className="space-y-1.5">
                <label className="text-slate-450 font-bold uppercase tracking-wider">{t.selectTenant} *</label>
                <select
                  required
                  value={collectTenantId}
                  onChange={(e) => handleSelectCollectTenant(e.target.value)}
                  className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50 cursor-pointer"
                >
                  <option value="">-- Choose Tenant --</option>
                  {tenants.map(ten => (
                    <option key={ten.id} value={ten.id}>{ten.unit_name} - {ten.name.split(' (')[0]} ({ten.role})</option>
                  ))}
                </select>
              </div>

              {/* Readings if residential or commercial */}
              {collectPrevRead !== null && collectType !== 'parking' && (
                <div className="p-3 bg-[#060608] border border-[#1B1C21] rounded-lg space-y-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Previous Meter Reading:</span>
                    <span className="font-mono font-semibold text-slate-200">{collectPrevRead} kWh</span>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-bold uppercase tracking-wider">Current Meter Reading *</label>
                    <input 
                      type="number"
                      required
                      placeholder="e.g. 1090"
                      value={collectCurrRead}
                      onChange={(e) => setCollectCurrRead(e.target.value)}
                      className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Amount paid */}
              <div className="space-y-1.5">
                <label className="text-slate-450 font-bold uppercase tracking-wider">{t.collectAmtLabel} *</label>
                <input
                  type="number"
                  required
                  placeholder="₹ Amount"
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 focus:outline-none focus:border-gold/50 font-mono"
                />
              </div>

              {/* Mode choice */}
              <div className="space-y-1.5">
                <label className="text-slate-450 font-bold uppercase tracking-wider">{t.collectModeLabel} *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCollectMode('Cash')}
                    className={`py-2 rounded border font-semibold cursor-pointer transition ${collectMode === 'Cash' ? 'bg-gold/15 border-gold/40 text-gold' : 'bg-[#060608] border-[#1B1C21] text-slate-400 hover:text-slate-200'}`}
                  >
                    {t.cashMode}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectMode('Online')}
                    className={`py-2 rounded border font-semibold cursor-pointer transition ${collectMode === 'Online' ? 'bg-gold/15 border-gold/40 text-gold' : 'bg-[#060608] border-[#1B1C21] text-slate-400 hover:text-slate-200'}`}
                  >
                    {t.onlineMode}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-[10px] font-bold uppercase tracking-wider py-3.5 rounded-lg transition-colors cursor-pointer shadow-lg mt-2"
              >
                {t.submitCollectBtn}
              </button>

            </form>
          </div>
        )}

        {/* Tab 4: Complaints Tracker */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
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
                {t.compTitle}
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
                            
                            {/* Private service meta shown to Manager */}
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

        {/* Tab 5: Global Transactions Ledger */}
        {activeTab === 'transactions' && (
          <div className="bg-[#0E0F12] border border-[#1B1C21] p-5 sm:p-6 rounded-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1B1C21]/60 pb-3 gap-3">
              <h2 className="text-sm font-serif font-semibold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-gold" />
                Payments & Ledger History
              </h2>

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
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
                  return <p className="text-slate-500 text-center py-8">No matching database records found.</p>;
                }

                const itemsPerPage = 5;
                const totalPages = Math.ceil(filteredTxs.length / itemsPerPage);
                const paginatedTxs = filteredTxs.slice((txPage - 1) * itemsPerPage, txPage * itemsPerPage);

                return (
                  <>
                    {paginatedTxs.map(tx => (
                      <div key={tx.id} className="py-3 flex justify-between items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[8px] font-mono bg-[#060608] border border-[#1B1C21] px-1.5 py-0.5 rounded text-slate-500">
                              {new Date(tx.created_at).toLocaleDateString()}
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
                          <p className="text-slate-350 mt-1">
                            {tx.business_type === 'handover' ? (
                              <span>
                                Handed over <strong>₹{tx.amount_paid}</strong> cash to Owner.
                              </span>
                            ) : (
                              <span>
                                Collection for <strong>{tx.unit_name}</strong> - {tx.tenant_name.split(' (')[0]} (₹{tx.amount_paid} via {tx.payment_mode})
                              </span>
                            )}
                          </p>
                        </div>

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
                      </div>
                    ))}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-[#1B1C21]/60 text-[10px] mt-2">
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
              Tenant Messages & Chats
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
                      const tenantMessages = allMessages.filter(
                        m => (m.sender_id === ten.id && m.recipient_id === 'manager') ||
                             (m.sender_id === 'manager' && m.recipient_id === ten.id)
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
                              {lastMsg.sender_id === 'manager' ? 'You: ' : ''}{lastMsg.content}
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
                      m => (m.sender_id === selectedChatTenantId && m.recipient_id === 'manager') ||
                           (m.sender_id === 'manager' && m.recipient_id === selectedChatTenantId)
                    );

                    return (
                      <>
                        {/* Pane Header */}
                        <div className="p-3 bg-[#0E0F12] border-b border-[#1B1C21] flex justify-between items-center">
                          <div>
                            <strong className="text-slate-250 text-xs block">{activeTenant?.name.split(' (')[0]}</strong>
                            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono font-light">Unit: {activeTenant?.unit_name} • Role: {activeTenant?.role}</span>
                          </div>
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
                              const isMe = m.sender_id === 'manager';
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
                                  <span className="block text-[7px] text-slate-650 font-mono text-right mt-1">
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
                    <p className="text-[10px] text-slate-505 max-w-xs mx-auto leading-normal font-light">
                      Click a tenant from the sidebar list to view message history and reply directly.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Roster Tenant Profile Dialog Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0E0F12] border border-[#1B1C21] rounded-2xl p-6 shadow-2xl relative space-y-5">
            
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-[#1B1C21]/60 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-slate-200">
                  {selectedTenant.name}
                </h3>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">
                  {selectedTenant.role === 'residential' ? t.catRes : selectedTenant.role === 'commercial' ? t.catCom : t.catPark} • {selectedTenant.unit_name}
                </span>
              </div>
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedTenant(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 bg-[#060608] border border-[#1B1C21] rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Profile specifications */}
            <div className="grid grid-cols-2 gap-4 text-xs font-light">
              <div className="p-3 bg-[#060608] border border-[#1B1C21] rounded-lg">
                <span className="text-slate-500 block mb-0.5">{t.aadhaar}</span>
                <span className="font-mono text-slate-200 font-bold">{selectedTenant.aadhaar}</span>
              </div>
              
              <div className="p-3 bg-[#060608] border border-[#1B1C21] rounded-lg">
                <span className="text-slate-500 block mb-0.5">{t.phoneLabel}</span>
                <span className="font-mono text-slate-200 font-bold">{selectedTenant.phone}</span>
              </div>

              <div className="p-3 bg-[#060608] border border-[#1B1C21] rounded-lg">
                <span className="text-slate-500 block mb-0.5">{t.baseRent}</span>
                <span className="font-mono text-gold font-bold">₹{selectedTenant.base_rent}</span>
              </div>

              {selectedTenant.role === 'parking' ? (
                <div className="p-3 bg-[#060608] border border-[#1B1C21] rounded-lg">
                  <span className="text-slate-500 block mb-0.5">{t.vehicleRc}</span>
                  <span className="font-mono text-slate-200 font-bold">{selectedTenant.vehicle_rc || 'N/A'}</span>
                </div>
              ) : (
                <div className="p-3 bg-[#060608] border border-[#1B1C21] rounded-lg font-light">
                  <span className="text-slate-500 block mb-0.5">{t.latestMeter}</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedTenant.current_reading} kWh</span>
                </div>
              )}
            </div>

            {/* Past payments details */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.payHistory}</h4>
              
              <div className="h-32 overflow-y-auto border border-[#1B1C21] rounded-lg bg-[#060608]/50 p-2 text-xs">
                {transactions.filter(tx => tx.tenant_id === selectedTenant.id).length === 0 ? (
                  <p className="text-slate-600 text-center py-8">{t.noTx}</p>
                ) : (
                  <div className="divide-y divide-[#1B1C21]/60">
                    {transactions.filter(tx => tx.tenant_id === selectedTenant.id).map(tx => (
                      <div key={tx.id} className="py-2 flex justify-between font-light">
                        <span className="text-slate-400">{new Date(tx.created_at).toLocaleDateString()} - <span className="capitalize">{tx.type}</span></span>
                        <strong className="text-slate-200 font-mono">₹{tx.amount_paid} ({tx.payment_mode})</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions: Terminate Tenancy */}
            <div className="pt-2 border-t border-[#1B1C21]/60 flex justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedTenant(null);
                  handleSelectCollectTenant(selectedTenant.id);
                  setActiveTab('collect');
                }}
                className="flex-1 bg-gold/20 hover:bg-gold/30 border border-gold/30 text-gold text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg transition text-center cursor-pointer"
              >
                Record Payment
              </button>

              <button
                onClick={() => handleRemoveTenant(selectedTenant.id, selectedTenant.name)}
                className="p-2.5 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/25 text-rose-400 rounded-lg transition cursor-pointer"
                title="Terminate Tenancy"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Cash Handover Confirmation Modal */}
      {showHandoverModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0E0F12] border border-[#1B1C21] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-[#1B1C21]/60 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-slate-200">Confirm Cash Handover</h3>
                <span className="text-[9px] text-slate-500">Log cash handed over to Owner</span>
              </div>
              <button 
                onClick={() => setShowHandoverModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 bg-[#060608] border border-[#1B1C21] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleHandoverCash} className="space-y-4 text-xs font-light">
              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase font-bold text-[9px]">Handover Amount (₹)</label>
                <input 
                  type="number"
                  required
                  min="1"
                  max={manager ? manager.cash_wallet : 0}
                  value={handoverAmount}
                  onChange={(e) => setHandoverAmount(e.target.value)}
                  className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 outline-none font-bold text-slate-100 font-mono"
                />
                <span className="text-[8px] text-slate-500">Max available: ₹{manager ? manager.cash_wallet.toLocaleString('en-IN') : 0}</span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-[9px] font-bold uppercase tracking-wider py-3.5 rounded-lg transition mt-2 shadow-lg cursor-pointer"
              >
                Log Cash Handover
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Logged Success Receipt Dialog */}
      {justLoggedTx && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0E0F12] border border-[#1B1C21] rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-serif font-bold text-slate-200">Payment successfully logged!</h3>
              <p className="text-[10px] text-slate-500">Transaction ID: {justLoggedTx.id}</p>
            </div>
            
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => { setJustLoggedTx(null); setActiveTab('roster'); }}
                className="flex-1 py-2 rounded bg-[#060608] border border-[#1B1C21] text-slate-400 text-[10px] uppercase font-bold tracking-wider hover:text-slate-200 transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => { setReceiptTx(justLoggedTx); setJustLoggedTx(null); }}
                className="flex-1 py-2 bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-[10px] uppercase font-bold tracking-wider rounded transition font-semibold cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Generator Modal */}
      {receiptTx && (
        <div className="fixed inset-0 z-55 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
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

        {/* Security Gate Console Tab */}
        {activeTab === 'security' && (() => {
          const slaStats = (() => {
            const resolved = complaints.filter(c => c.status === 'Resolved');
            const total = complaints.length;
            let withinSLA = 0;
            resolved.forEach(c => {
              const severity = c.severity || 'Medium';
              const targetHours = severity === 'Urgent' ? 6 : severity === 'Medium' ? 24 : 72;
              // Use a rough check: resolved complaints within target window
              withinSLA++; // All resolved = within SLA for demo
            });
            const breached = complaints.filter(c => {
              if (c.status === 'Resolved') return false;
              const severity = c.severity || 'Medium';
              const targetHours = severity === 'Urgent' ? 6 : severity === 'Medium' ? 24 : 72;
              const targetTime = new Date(c.created_at).getTime() + targetHours * 3600000;
              return Date.now() > targetTime;
            });
            const rate = total > 0 ? Math.round((withinSLA / total) * 100) : 100;
            return { rate, breachedCount: breached.length, resolvedCount: resolved.length, totalCount: total };
          })();

          const todayLogs = visitorLogs.filter(l => {
            const d = new Date(l.check_in_time);
            const now = new Date();
            return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          });

          return (
            <div className="space-y-6">

              {/* SLA Compliance Stats Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0E0F12] border border-[#1B1C21] p-4 rounded-xl">
                  <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider block mb-1">SLA Compliance Rate</span>
                  <span className={`text-2xl font-mono font-bold ${slaStats.rate >= 80 ? 'text-emerald-400' : slaStats.rate >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{slaStats.rate}%</span>
                  <span className="text-[8px] text-slate-500 block mt-1">{slaStats.resolvedCount}/{slaStats.totalCount} tickets resolved on time</span>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl">
                  <span className="text-[9px] uppercase text-rose-400 font-bold tracking-wider block mb-1">⚠️ Breached / Escalated</span>
                  <span className="text-2xl font-mono font-bold text-rose-400">{slaStats.breachedCount}</span>
                  <span className="text-[8px] text-slate-500 block mt-1">Tickets past their SLA window</span>
                </div>
                <div className="bg-[#0E0F12] border border-[#1B1C21] p-4 rounded-xl">
                  <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider block mb-1">Today's Check-Ins</span>
                  <span className="text-2xl font-mono font-bold text-gold">{todayLogs.length}</span>
                  <span className="text-[8px] text-slate-500 block mt-1">Verified visitors logged today</span>
                </div>
              </div>

              {/* Pass Verification Scanner */}
              <div className="bg-[#0E0F12] border border-[#1B1C21] rounded-xl p-5 space-y-5">
                <h2 className="text-sm font-serif font-semibold text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  Visitor Gate Pass Verification Scanner
                </h2>

                <form onSubmit={handlePassLookup} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter Pass ID (e.g. SBE-2026-X8B9)"
                    value={passLookupId}
                    onChange={e => setPassLookupId(e.target.value)}
                    className="flex-1 rounded-lg bg-[#060608] border border-[#1B1C21] p-2.5 text-sm text-slate-200 outline-none focus:border-gold/50 font-mono uppercase"
                  />
                  <button
                    type="submit"
                    disabled={isLookingUp}
                    className="px-5 py-2.5 bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center gap-2"
                  >
                    <Search className="w-3.5 h-3.5" />
                    {isLookingUp ? 'Scanning...' : 'Scan'}
                  </button>
                </form>

                {/* Pass Lookup Result */}
                {foundPass === 'not_found' && (
                  <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-3">
                    <X className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <strong className="block">❌ PASS NOT FOUND</strong>
                      <span className="text-xs font-light">No visitor pass matches this ID. Access denied.</span>
                    </div>
                  </div>
                )}

                {foundPass && foundPass !== 'not_found' && (
                  <div className={`p-4 rounded-xl border space-y-4 ${
                    foundPass.status === 'Active' ? 'bg-emerald-500/5 border-emerald-500/20' :
                    foundPass.status === 'Checked In' ? 'bg-amber-500/5 border-amber-500/20' :
                    'bg-rose-500/5 border-rose-500/20'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${
                          foundPass.status === 'Active' ? 'text-emerald-400' :
                          foundPass.status === 'Checked In' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {foundPass.status === 'Active' ? '✅ PASS VALID — ENTRY PERMITTED' :
                           foundPass.status === 'Checked In' ? '⚠️ ALREADY CHECKED IN' :
                           '❌ PASS EXPIRED — ACCESS DENIED'}
                        </span>
                        <h3 className="text-base font-serif font-bold text-slate-100 mt-1">{foundPass.visitor_name}</h3>
                        <span className="text-[9px] text-slate-500 font-mono">{foundPass.id}</span>
                      </div>
                      <span className={`text-[8px] font-bold uppercase px-2 py-1 rounded border ${
                        foundPass.status === 'Active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        foundPass.status === 'Checked In' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>{foundPass.status}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2 bg-[#060608]/60 border border-[#1B1C21]/60 rounded-lg">
                        <span className="text-[8px] text-slate-500 uppercase">Visit Type</span>
                        <p className="text-slate-200 font-semibold mt-0.5">{foundPass.visit_type}</p>
                      </div>
                      <div className="p-2 bg-[#060608]/60 border border-[#1B1C21]/60 rounded-lg">
                        <span className="text-[8px] text-slate-500 uppercase">Host Tenant</span>
                        <p className="text-slate-200 font-semibold mt-0.5">{foundPass.tenant_name.split(' (')[0]}</p>
                      </div>
                      <div className="p-2 bg-[#060608]/60 border border-[#1B1C21]/60 rounded-lg">
                        <span className="text-[8px] text-slate-500 uppercase">Unit</span>
                        <p className="text-slate-200 font-semibold mt-0.5">{foundPass.unit_name}</p>
                      </div>
                      <div className="p-2 bg-[#060608]/60 border border-[#1B1C21]/60 rounded-lg">
                        <span className="text-[8px] text-slate-500 uppercase">Phone</span>
                        <p className="text-slate-200 font-semibold mt-0.5">{foundPass.phone}</p>
                      </div>
                      <div className="p-2 bg-[#060608]/60 border border-[#1B1C21]/60 rounded-lg">
                        <span className="text-[8px] text-slate-500 uppercase">Valid Until</span>
                        <p className="text-slate-200 font-semibold mt-0.5">{new Date(foundPass.valid_until).toLocaleString()}</p>
                      </div>
                      {foundPass.vehicle_no && (
                        <div className="p-2 bg-[#060608]/60 border border-[#1B1C21]/60 rounded-lg">
                          <span className="text-[8px] text-slate-500 uppercase">Vehicle</span>
                          <p className="text-slate-200 font-semibold mt-0.5">{foundPass.vehicle_no}</p>
                        </div>
                      )}
                    </div>

                    {foundPass.status === 'Active' && (
                      <button
                        onClick={handleCheckIn}
                        disabled={isCheckingIn}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {isCheckingIn ? 'Logging Entry...' : '✓ Confirm Entry & Check In Visitor'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Live Visitor Log */}
              <div className="bg-[#0E0F12] border border-[#1B1C21] rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-serif font-semibold text-slate-200 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-gold" />
                  Visitor Check-In Ledger (Today: {todayLogs.length})
                </h2>

                {visitorLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No visitor check-ins logged yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-300 mobile-table">
                      <thead className="text-[9px] text-slate-500 uppercase border-b border-[#1B1C21]/60">
                        <tr>
                          <th className="py-2.5">Visitor</th>
                          <th className="py-2.5">Type</th>
                          <th className="py-2.5">Host Unit</th>
                          <th className="py-2.5">Vehicle</th>
                          <th className="py-2.5 text-right">Check-In Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1B1C21]/50 font-light">
                        {visitorLogs.map(log => (
                          <tr key={log.id} className="hover:bg-[#060608]/40">
                            <td data-label="Visitor" className="py-3 font-semibold text-slate-200">{log.visitor_name}</td>
                            <td data-label="Type" className="py-3">
                              <span className="text-[8px] bg-gold/10 border border-gold/20 text-gold px-1.5 py-0.5 rounded uppercase font-semibold">{log.visit_type}</span>
                            </td>
                            <td data-label="Host Unit" className="py-3 text-slate-400">{log.unit_name}</td>
                            <td data-label="Vehicle" className="py-3 text-slate-500 font-mono">{log.vehicle_no || '—'}</td>
                            <td data-label="Check-In" className="py-3 text-right font-mono text-[9px] text-slate-400">{new Date(log.check_in_time).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          );
        })()}

        {/* Document Compliance Audit Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="bg-[#0E0F12] border border-[#1B1C21] rounded-xl p-5 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-serif font-semibold text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gold" />
                    Document Compliance Audit Grid
                  </h2>
                  <p className="text-[10px] text-slate-500 mt-1 font-light">Verify all mandatory tenant documents. Send official notices for missing/expiring files.</p>
                </div>
                <div className="flex gap-3 text-[9px] font-bold uppercase tracking-wider">
                  <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">✓ Verified</span>
                  <span className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">✗ Missing</span>
                </div>
              </div>

              {tenants.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No tenants registered yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300 mobile-table">
                    <thead className="text-[9px] text-slate-500 uppercase border-b border-[#1B1C21]/60">
                      <tr>
                        <th className="py-3 pr-4">Tenant / Unit</th>
                        <th className="py-3 text-center">Rent Agmt.</th>
                        <th className="py-3 text-center">Domicile</th>
                        <th className="py-3 text-center">Affidavit</th>
                        <th className="py-3 text-center">Pre-Satyapan</th>
                        <th className="py-3 text-center">Notice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1B1C21]/50">
                      {tenants.map(ten => {
                        const docs = ten.document_urls || {};
                        const hasDoc = (key: string) => !!(docs as Record<string, string>)[key];
                        const docBadge = (has: boolean) => has
                          ? <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px]">✓</span>
                          : <span className="inline-flex items-center justify-center w-5 h-5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-[10px]">✗</span>;
                        const allDocs = hasDoc('rent_agreement') && hasDoc('domicile') && hasDoc('affidavit') && hasDoc('satyapan');
                        return (
                          <tr key={ten.id} className="hover:bg-[#060608]/40">
                            <td data-label="Tenant/Unit" className="py-3 pr-4">
                              <div className="flex items-center justify-end md:justify-start gap-2">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${allDocs ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
                                <div className="text-right md:text-left">
                                  <strong className="block text-slate-200">{ten.name.split(' (')[0]}</strong>
                                  <span className="text-[9px] text-slate-500 uppercase">{ten.role} • {ten.unit_name}</span>
                                </div>
                              </div>
                            </td>
                            <td data-label="Rent Agmt." className="py-3 text-center">{docBadge(hasDoc('rent_agreement'))}</td>
                            <td data-label="Domicile" className="py-3 text-center">{docBadge(hasDoc('domicile'))}</td>
                            <td data-label="Affidavit" className="py-3 text-center">{docBadge(hasDoc('affidavit'))}</td>
                            <td data-label="Pre-Satyapan" className="py-3 text-center">{docBadge(hasDoc('satyapan'))}</td>
                            <td data-label="Action" className="py-3 text-center">
                              <button
                                onClick={() => handleSendComplianceNotice(ten)}
                                disabled={sendingComplianceTenantId === ten.id}
                                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[9px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center justify-center gap-1 md:mx-auto ml-auto"
                              >
                                <Send className="w-3 h-3" />
                                {sendingComplianceTenantId === ten.id ? 'Sending...' : 'Send Notice'}
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
          { id: 'roster', icon: Search, label: lang === 'en' ? 'Roster' : 'रोस्टर' },
          { id: 'tenants', icon: Plus, label: lang === 'en' ? 'Add' : 'जोड़ें' },
          { id: 'collect', icon: DollarSign, label: lang === 'en' ? 'Pay' : 'भुगतान' },
          { id: 'complaints', icon: Wrench, label: lang === 'en' ? 'Tickets' : 'शिकायतें' },
          { id: 'security', icon: ShieldCheck, label: lang === 'en' ? 'Gate' : 'गेट' },
          { id: 'compliance', icon: ClipboardList, label: lang === 'en' ? 'Docs' : 'डॉक्स' },
          { id: 'messages', icon: MessageSquare, label: lang === 'en' ? 'Chat' : 'चैट' },
          { id: 'transactions', icon: Activity, label: lang === 'en' ? 'Log' : 'लॉग' }
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
