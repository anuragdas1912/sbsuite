'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, Tenant, Transaction, Complaint, Message, VisitorPass, supabase } from '../db';
import { subscribeToPushNotifications } from '../pushUtils';
import { 
  ArrowLeft, 
  Globe, 
  Wrench, 
  Bell, 
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
  Send,
  QrCode,
  Check
} from 'lucide-react';

type Lang = 'en' | 'hi';
type Tab = 'home' | 'payments' | 'complaints' | 'documents' | 'messages' | 'passes';

export default function CommercialPortal() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Database States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Gate Pass States
  const [passes, setPasses] = useState<VisitorPass[]>([]);
  const [passName, setPassName] = useState('');
  const [passPhone, setPassPhone] = useState('');
  const [passType, setPassType] = useState<'Guest' | 'Delivery' | 'Maintenance' | 'Other'>('Guest');
  const [passVehicle, setPassVehicle] = useState('');
  const [passDuration, setPassDuration] = useState('2'); // hours
  const [showPassModal, setShowPassModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState<VisitorPass | null>(null);
  const [isGeneratingPass, setIsGeneratingPass] = useState(false);

  // Payment Modal States
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'rent' | 'electricity' | 'both'>('both');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | ''>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Form inputs
  const [compSubject, setCompSubject] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compCategory, setCompCategory] = useState<'Plumbing' | 'Electrical' | 'Appliance' | 'Housekeeping' | 'Other'>('Other');
  const [compSeverity, setCompSeverity] = useState<'Urgent' | 'Medium' | 'Low'>('Medium');
  const [compVisitSlot, setCompVisitSlot] = useState('');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  
  const [chatRecipient, setChatRecipient] = useState<'manager' | 'owner'>('manager');
  const [chatContent, setChatContent] = useState('');
  const [chatTrigger, setChatTrigger] = useState(0); // For reloading messages

  // Load tenant session and database states
  const loadDatabase = async (tenantId: string) => {
    try {
      const allTenants = await db.getTenants();
      const currentTenant = allTenants.find(t => t.id === tenantId);
      
      if (currentTenant && currentTenant.role === 'commercial') {
        setTenant(currentTenant);

        const txs = await db.getTransactions();
        setTransactions(txs.filter(tx => tx.tenant_id === currentTenant.id));

        const comps = await db.getComplaints();
        setComplaints(comps.filter(c => c.tenant_id === currentTenant.id));

        const msgs = await db.getMessages();
        setMessages(msgs);

        const allPasses = await db.getVisitorPasses();
        setPasses(allPasses.filter(p => p.tenant_id === currentTenant.id));
      } else {
        localStorage.clear();
        router.push('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tenantId = localStorage.getItem('sb_current_tenant_id');
    const role = localStorage.getItem('sb_current_role');

    if (!tenantId || role !== 'commercial') {
      localStorage.clear();
      router.push('/');
      return;
    }

    loadDatabase(tenantId);

    // Setup Supabase Realtime for Messages
    const channel = supabase
      .channel('com_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatTrigger]);

  if (loading || !tenant) {
    return (
      <div className="min-h-screen bg-[#060608] text-[#F4F4F5] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold mb-3" />
        <p className="text-sm font-light">Loading portal statements...</p>
      </div>
    );
  }

  // Calculate current invoice details
  const rentAmount = tenant.base_rent;
  const powerRate = tenant.electricity_rate;
  const prevReading = tenant.previous_reading;
  const currReading = tenant.current_reading;
  const unitsConsumed = currReading > prevReading ? currReading - prevReading : 0;
  const electricityCharge = unitsConsumed * powerRate;
  const totalOutstanding = rentAmount + electricityCharge;

  // Check past transactions to see what's paid
  const currentMonthPaid = transactions
    .filter(tx => {
      const txDate = new Date(tx.created_at);
      const now = new Date();
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, tx) => sum + tx.amount_paid, 0);

  const pendingRentDue = Math.max(0, rentAmount - currentMonthPaid);
  const pendingElectricDue = Math.max(0, electricityCharge - Math.max(0, currentMonthPaid - rentAmount));
  const totalDue = pendingRentDue + pendingElectricDue;
  const isPaid = totalDue <= 0;

  // Language mapping
  const t = {
    en: {
      dashboard: 'Commercial Portal',
      logout: 'Logout',
      langLabel: 'हिंदी',
      aadhaarRequired: 'Aadhaar Card is verified for registration.',
      homeTab: 'Home',
      payTab: 'Ledger',
      compTab: 'Complaints',
      docTab: 'Documents',
      msgTab: 'Messages',
      welcome: 'Welcome,',
      unitLabel: 'Shop Number',
      rentSummary: 'Lease & Rent Summary',
      rentLabel: 'Base Shop Rent',
      electricLabel: 'Electricity Bill',
      totalBill: 'Total Current Bill',
      statusLabel: 'Outstanding Status',
      paid: 'Fully Paid ✓',
      pending: 'Pending Dues',
      payBtn: 'Make Payment',
      meterDetails: 'Electricity Meter Readings',
      prevRead: 'Previous Reading',
      currRead: 'Current Reading',
      consumed: 'Units Consumed',
      rate: 'Rate per unit',
      announcements: 'Notice Board Announcements',
      notice1: '📢 Lift maintenance is scheduled for Tuesday from 10 AM to 2 PM.',
      notice2: '📢 Please submit utility reading figures before the 20th of this month.',
      ledgerTitle: 'Payment History Records',
      dateCol: 'Date',
      typeCol: 'Payment Type',
      amtCol: 'Amount',
      modeCol: 'Mode',
      receiptCol: 'Receipt',
      downloadBtn: 'Download',
      noTx: 'No past transactions found.',
      compTitle: 'Raise a Maintenance Complaint',
      compSubject: 'Complaint Subject (e.g. Electric fault)',
      compDesc: 'Detailed description of the issue',
      compBtn: 'Submit Complaint',
      compSuccess: 'Complaint logged successfully! Our team will resolve it soon.',
      compHistory: 'Active Complaints Tracker',
      compStatus: 'Status',
      noComplaints: 'No complaints raised yet.',
      docsTitle: 'Your Verification Documents',
      rentAg: 'Shop Lease Agreement (किरायानामा/लीज)',
      domicile: 'Domicile Certificate (मूल निवास)',
      affidavit: 'Affidavit (हलफनामा)',
      satyapan: 'Pre Satyapan Verification Form (सत्यापन प्रपत्र)',
      docDesc: 'Download your registered administrative documents below.',
      msgTitle: 'Secure Private Messages',
      msgTo: 'Message Recipient',
      managerOpt: 'Property Manager (Amit)',
      ownerOpt: 'Property Owner (Balaji)',
      typeMsg: 'Type your message...',
      sendBtn: 'Send Message',
      paymentModalTitle: 'Process Secure Payment',
      payRent: 'Pay Shop Rent Only',
      payElectric: 'Pay Electricity Only',
      payBoth: 'Pay Rent + Electricity',
      selectMode: 'Choose Payment Method',
      modeUPI: 'UPI Transfer (Scan QR)',
      modeCash: 'Cash to Manager (Amit)',
      upiInstructions: 'Scan this QR code with any UPI app (GPay/PhonePe/Paytm) to complete payment.',
      cashInstructions: 'Please hand over the cash to manager Amit. Your status will update once logged.',
      payConfirmBtn: 'Confirm & Complete Payment',
      payProcessing: 'Authenticating Transaction...',
      paySuccessMsg: 'Payment completed successfully! Database record updated.'
    },
    hi: {
      dashboard: 'दुकान डैशबोर्ड (Shop Console)',
      logout: 'लॉगआउट',
      langLabel: 'English',
      aadhaarRequired: 'आपका आधार कार्ड वेरीफाइड (Verified) है।',
      homeTab: 'होम (Home)',
      payTab: 'पेमेंट लॉग्स (Ledger)',
      compTab: 'शिकायतें (Complaints)',
      docTab: 'डॉक्युमेंट्स (Documents)',
      msgTab: 'मैसेज (Chat)',
      welcome: 'स्वागत है,',
      unitLabel: 'शॉप/दुकान नंबर',
      rentSummary: 'शॉप लीज और किराया डिटेल्स',
      rentLabel: 'दुकान का किराया (Rent)',
      electricLabel: 'बिजली का बिल',
      totalBill: 'कुल देय राशि (Total Due)',
      statusLabel: 'पेमेंट स्टेटस (Payment Status)',
      paid: 'पेड है (Paid) ✓',
      pending: 'बकाया राशि (Dues)',
      payBtn: 'पेमेंट करें',
      meterDetails: 'बिजली मीटर रीडिंग डिटेल्स',
      prevRead: 'पुरानी मीटर रीडिंग',
      currRead: 'नई मीटर रीडिंग',
      consumed: 'टोटल खर्च यूनिट्स',
      rate: 'बिजली रेट (प्रति यूनिट)',
      announcements: 'सोसाइटी नोटिस बोर्ड (Notice Board)',
      notice1: '📢 मंगलवार सुबह 10 बजे से दोपहर 2 बजे तक लिफ्ट का रखरखाव किया जाएगा।',
      notice2: '📢 कृपया इस महीने की 20 तारीख से पहले अपनी मीटर रीडिंग दर्ज करवाएं।',
      ledgerTitle: 'पेमेंट हिस्ट्री (Ledger)',
      dateCol: 'तारीख (Date)',
      typeCol: 'पेमेंट टाइप',
      amtCol: 'अमाउंट (Amount)',
      modeCol: 'पेमेंट मोड',
      receiptCol: 'रसीद (Receipt)',
      downloadBtn: 'डाउनलोड करें',
      noTx: 'कोई पुराना पेमेंट रिकॉर्ड नहीं मिला।',
      compTitle: 'नई शिकायत दर्ज करें (New Complaint)',
      compSubject: 'शिकायत का विषय (जैसे: शटर की समस्या)',
      compDesc: 'समस्या का पूरा विवरण (Description)',
      compBtn: 'शिकायत सबमिट करें (Submit)',
      compSuccess: 'शिकायत दर्ज हो गई है! जल्द ही इसे ठीक किया जाएगा।',
      compHistory: 'पुरानी शिकायतें (Complaint Tracker)',
      compStatus: 'स्टेटस (Status)',
      noComplaints: 'कोई शिकायत दर्ज नहीं की गई है।',
      docsTitle: 'आपके वेरिफाइड डॉक्युमेंट्स',
      rentAg: 'शॉप लीज एग्रीमेंट (Lease Agreement)',
      domicile: 'निवास प्रमाण पत्र (Domicile)',
      affidavit: 'एफिडेविट (Affidavit)',
      satyapan: 'पुलिस वेरिफिकेशन फॉर्म (Verification Form)',
      docDesc: 'अपने रजिस्टर किए गए डॉक्युमेंट्स नीचे से डाउनलोड करें।',
      msgTitle: 'प्राइवेट चैट/मैसेज (Chat)',
      msgTo: 'मैसेज भेजें (Send to)',
      managerOpt: 'मैनेजर अमित',
      ownerOpt: 'ओनर बालाजी',
      typeMsg: 'अपना मैसेज लिखें...',
      sendBtn: 'मैसेज भेजें',
      paymentModalTitle: 'सिक्योर पेमेंट गेटवे (Secure Payment)',
      payRent: 'केवल दुकान का किराया (Rent Only)',
      payElectric: 'केवल बिजली का बिल (Bill Only)',
      payBoth: 'किराया + बिजली दोनों (Pay Both)',
      selectMode: 'पेमेंट करने का मोड चुनें (Payment Mode)',
      modeUPI: 'UPI ट्रांसफर (QR कोड स्कैन करें)',
      modeCash: 'मैनेजर अमित को कैश दें',
      upiInstructions: 'पेमेंट पूरा करने के लिए किसी भी UPI ऐप (GPay/PhonePe/Paytm) से इस QR कोड को स्कैन करें।',
      cashInstructions: 'कृपया कैश अमाउंट मैनेजर अमित को दें। मैनेजर के अपडेट करते ही आपकी पेमेंट रसीद यहाँ दिखने लगेगी।',
      payConfirmBtn: 'पेमेंट कन्फर्म करें (Confirm)',
      payProcessing: 'पेमेंट प्रोसेस हो रही है, कृपया थोड़ा रुकें...',
      paySuccessMsg: 'पेमेंट सक्सेसफुल रहा! डेटाबेस अपडेट हो गया है।'
    }
  }[lang];

  // Document download action simulation
  const handleDownloadDoc = (docName: string, docTitle: string) => {
    const docContent = `SHREE BALAJI PROPERTIES\nTransit Camp, Rudrapur, Uttarakhand\n---------------------------------------------\nDOCUMENT: ${docTitle}\nTENANT NAME: ${tenant.name}\nSHOP NO: ${tenant.unit_name}\nAADHAAR ID: ${tenant.aadhaar}\nDATE GENERATED: ${new Date().toLocaleDateString()}\nSTATUS: VERIFIED & OFFICIAL\n---------------------------------------------\nThis is a secure system-generated copy.`;
    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${docName.replace('.pdf', '')}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Raise Complaint
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compSubject || !compDesc) return;
    setIsSubmittingComplaint(true);

    try {
      await db.addComplaint({
        tenant_id: tenant.id,
        tenant_name: tenant.name,
        unit_name: tenant.unit_name,
        role: 'commercial',
        subject: compSubject,
        desc: compDesc,
        category: compCategory,
        severity: compSeverity,
        visit_slot: compVisitSlot || null,
        visit_notes: null,
        service_cost: 0
      });
      setCompSubject('');
      setCompDesc('');
      setCompVisitSlot('');
      setCompCategory('Other');
      setCompSeverity('Medium');
      alert(t.compSuccess);
      // Reload complaints
      const comps = await db.getComplaints();
      setComplaints(comps.filter(c => c.tenant_id === tenant.id));
    } catch (err) {
      console.error(err);
      alert('Failed to submit complaint.');
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  // Send private message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatContent) return;

    try {
      await db.addMessage({
        sender_id: tenant.id,
        sender_name: tenant.name,
        recipient_id: chatRecipient,
        content: chatContent
      });

      setChatContent('');
      alert(lang === 'en' ? '✓ Message sent securely!' : '✓ संदेश सुरक्षित भेज दिया गया है!');
      // Reload messages
      const msgs = await db.getMessages();
      setMessages(msgs);
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    }
  };

  // Payment Confirmation logic
  const handleConfirmPayment = async () => {
    setIsProcessingPayment(true);
    let amountToPay = 0;
    let payType: Transaction['type'] = 'both';
    
    if (paymentType === 'rent') {
      amountToPay = pendingRentDue;
      payType = 'rent';
    } else if (paymentType === 'electricity') {
      amountToPay = pendingElectricDue;
      payType = 'electricity';
    } else {
      amountToPay = totalDue;
      payType = 'both';
    }

    try {
      // Record transaction
      await db.addTransaction({
        tenant_id: tenant.id,
        tenant_name: tenant.name,
        business_type: 'commercial',
        unit_name: tenant.unit_name,
        type: payType,
        total_amount: amountToPay,
        amount_paid: amountToPay,
        previous_reading: payType !== 'rent' ? prevReading : null,
        current_reading: payType !== 'rent' ? currReading : null,
        units_consumed: payType !== 'rent' ? unitsConsumed : null,
        payment_mode: paymentMethod === 'Cash' ? 'Cash' : 'Online',
        manager_name: 'Amit'
      });

      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      
      setTimeout(() => {
        setPaymentSuccess(false);
        setShowPayModal(false);
        setPaymentMethod('');
        // Reload page details
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Payment failed.');
      setIsProcessingPayment(false);
    }
  };

  // Load chat messages
  const chats = messages.filter(
    m => (m.sender_id === tenant.id && m.recipient_id === chatRecipient) ||
         (m.sender_id === chatRecipient && m.recipient_id === tenant.id)
  );

  return (
    <div className="min-h-screen bg-[#060608] text-[#F4F4F5] font-sans antialiased pb-24">
      
      {/* Header bar */}
      <header className="max-w-4xl mx-auto flex justify-between items-center bg-[#0E0F12] p-4 sm:p-5 border-b border-[#1B1C21] sm:rounded-b-xl mb-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 select-none">
            <img src="/logo.png" alt="Shree Balaji Estate Logo" className="w-full h-full object-contain rounded" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-serif font-bold text-slate-100 flex items-center gap-2">
              {tenant.name.split(' (')[0]}
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{t.unitLabel}: {tenant.unit_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Push Notifications Toggle */}
          <button
            onClick={async () => {
              if (!tenant?.id) return;
              const success = await subscribeToPushNotifications(tenant.id, 'commercial');
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
      <main className="max-w-4xl mx-auto px-4 animate-luxury-card">
        
        {/* Verification badge */}
        <div className="mb-6 py-2 px-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] flex items-center gap-1.5 font-light">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{t.aadhaarRequired} (Aadhaar: {tenant.aadhaar})</span>
        </div>

        {/* Tab 1: Home / Dashboard */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Broadcast announcements banner */}
            {(() => {
              const broadcasts = messages.filter(
                m => m.recipient_id === 'broadcast_all' || m.recipient_id === 'broadcast_commercial'
              );
              if (broadcasts.length === 0) return null;
              return (
                <div className="space-y-2.5">
                  {broadcasts.map(ann => (
                    <div key={ann.id} className="bg-gold/5 border border-gold/20 p-4 rounded-xl flex items-start gap-3 shadow-md">
                      <Bell className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-gold">
                          Announcement from {ann.sender_name === 'owner' ? 'Owner' : 'Manager'}
                        </span>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ann.content}</p>
                        <span className="text-[7.5px] text-slate-500 font-mono block mt-1">
                          Posted: {new Date(ann.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            
            {/* Rent Summary Box */}
            <div className="bg-[#0E0F12] border border-[#1B1C21] p-5 sm:p-6 rounded-xl space-y-5">
              <div className="flex justify-between items-center border-b border-[#1B1C21]/60 pb-3">
                <h2 className="text-sm sm:text-base font-serif font-semibold text-slate-200 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gold" />
                  {t.rentSummary}
                </h2>
                
                {/* Due status pill */}
                <span className={`font-bold text-[9px] tracking-wider uppercase px-2 py-0.5 rounded border ${
                  isPaid 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                }`}>
                  {isPaid ? t.paid : `${t.pending}: ₹${totalDue.toLocaleString('en-IN')}`}
                </span>
              </div>

              {/* Dues split columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-[#060608] border border-[#1B1C21] rounded-lg">
                  <span className="text-slate-500 block mb-1">{t.rentLabel}</span>
                  <span className="text-base font-mono font-bold text-slate-200">₹{rentAmount.toLocaleString('en-IN')}</span>
                  {pendingRentDue > 0 ? (
                    <span className="block text-[9px] text-rose-400 font-semibold mt-1">₹{pendingRentDue} unpaid</span>
                  ) : (
                    <span className="block text-[9px] text-emerald-400 font-semibold mt-1">Paid ✓</span>
                  )}
                </div>

                <div className="p-3.5 bg-[#060608] border border-[#1B1C21] rounded-lg">
                  <span className="text-slate-500 block mb-1">{t.electricLabel}</span>
                  <span className="text-base font-mono font-bold text-slate-200">₹{electricityCharge.toLocaleString('en-IN')}</span>
                  {pendingElectricDue > 0 ? (
                    <span className="block text-[9px] text-rose-400 font-semibold mt-1">₹{pendingElectricDue} unpaid</span>
                  ) : (
                    <span className="block text-[9px] text-emerald-400 font-semibold mt-1">Paid ✓</span>
                  )}
                </div>
              </div>

              {/* Action payment button */}
              {!isPaid && (
                <button
                  onClick={() => {
                    setPaymentType(pendingRentDue > 0 && pendingElectricDue > 0 ? 'both' : pendingRentDue > 0 ? 'rent' : 'electricity');
                    setShowPayModal(true);
                  }}
                  className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-[10px] font-bold uppercase tracking-[0.2em] py-3.5 rounded-lg transition-colors cursor-pointer shadow-md"
                >
                  {t.payBtn}
                </button>
              )}
            </div>

            {/* Meter readings details box */}
            <div className="bg-[#0E0F12] border border-[#1B1C21] p-5 sm:p-6 rounded-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-gold" />
                {t.meterDetails}
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-[#060608] border border-[#1B1C21] rounded-lg text-center">
                  <span className="text-[9px] text-slate-500 block uppercase mb-1">{t.prevRead}</span>
                  <span className="font-mono font-bold text-slate-300">{prevReading} kWh</span>
                </div>
                <div className="p-3 bg-[#060608] border border-[#1B1C21] rounded-lg text-center">
                  <span className="text-[9px] text-slate-500 block uppercase mb-1">{t.currRead}</span>
                  <span className="font-mono font-bold text-slate-300">{currReading} kWh</span>
                </div>
                <div className="p-3 bg-[#060608] border border-[#1B1C21] rounded-lg text-center">
                  <span className="text-[9px] text-slate-500 block uppercase mb-1">{t.consumed}</span>
                  <span className="font-mono font-bold text-gold">{unitsConsumed} kWh</span>
                </div>
                <div className="p-3 bg-[#060608] border border-[#1B1C21] rounded-lg text-center">
                  <span className="text-[9px] text-slate-500 block uppercase mb-1">{t.rate}</span>
                  <span className="font-mono font-bold text-[#C5A880]">₹{powerRate}/kWh</span>
                </div>
              </div>
            </div>

            {/* Notices Board */}
            <div className="bg-[#0E0F12] border border-[#1B1C21] p-5 sm:p-6 rounded-xl space-y-4">
              <h2 className="text-sm font-serif font-semibold text-slate-200 flex items-center gap-2">
                <Bell className="w-4 h-4 text-gold" />
                {t.announcements}
              </h2>
              <div className="space-y-3 text-xs text-slate-400 leading-relaxed font-light">
                <p className="p-3 bg-[#060608] border border-[#1B1C21] rounded-lg">{t.notice1}</p>
                <p className="p-3 bg-[#060608] border border-[#1B1C21] rounded-lg">{t.notice2}</p>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Payments Ledger */}
        {activeTab === 'payments' && (
          <div className="bg-[#0E0F12] border border-[#1B1C21] rounded-xl p-5 sm:p-6 space-y-4">
            <h2 className="text-sm sm:text-base font-serif font-semibold text-slate-200 mb-2">
              {t.ledgerTitle}
            </h2>

            {/* Electricity Consumption Analytics Section */}
            {(() => {
              const powerTxs = [...transactions]
                .filter(tx => tx.units_consumed !== null && tx.units_consumed > 0)
                .slice(-6); // Last 6 bills

              if (powerTxs.length === 0) return null;
              
              const maxUnits = Math.max(...powerTxs.map(tx => Number(tx.units_consumed)), 100);
              const latestTx = powerTxs[powerTxs.length - 1];
              const latestUnits = Number(latestTx.units_consumed || 0);
              
              // Baseline threshold for commercial is 1500 kWh
              const baseline = 1500;
              const usagePercent = Math.min(100, (latestUnits / baseline) * 100);
              
              let ringColor = '#10b981'; // Green
              let statusLabel = 'Eco-Friendly';
              let statusText = 'Excellent energy conservation. Keep it up!';
              let bgGlow = 'bg-emerald-500/5';
              let textColor = 'text-emerald-400';
              let borderGlow = 'border-emerald-500/10';

              if (usagePercent > 80) {
                ringColor = '#f43f5e'; // Rose
                statusLabel = 'High Usage Warning';
                statusText = 'Power usage is near baseline. Consider optimizing high-power machinery usage.';
                bgGlow = 'bg-rose-500/5';
                textColor = 'text-rose-400';
                borderGlow = 'border-rose-500/10';
              } else if (usagePercent > 50) {
                ringColor = '#d97706'; // Amber
                statusLabel = 'Moderate Consumption';
                statusText = 'Power usage is standard. Room for optimizing conservation.';
                bgGlow = 'bg-amber-500/5';
                textColor = 'text-amber-400';
                borderGlow = 'border-amber-500/10';
              }

              // SVG Circle properties
              const r = 36;
              const circ = 2 * Math.PI * r;
              const strokeOffset = circ - (usagePercent / 100) * circ;

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Bar Chart */}
                  <div className="bg-[#060608]/50 border border-[#1B1C21] p-4 rounded-xl space-y-3">
                    <h3 className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                      Electricity Consumption Trend (Last 6 Months)
                    </h3>
                    <div className="flex items-end justify-between gap-4 pt-4 h-24">
                      {powerTxs.map(tx => {
                        const heightPct = (Number(tx.units_consumed) / maxUnits) * 100;
                        const dateLabel = new Date(tx.created_at).toLocaleDateString([], { month: 'short' });
                        return (
                          <div key={tx.id} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-[#1B1C21] px-1.5 py-0.5 rounded text-[8px] text-slate-200 font-mono pointer-events-none whitespace-nowrap z-10">
                              {tx.units_consumed} kWh
                            </div>
                            <div 
                              style={{ height: `${Math.max(10, heightPct)}%` }}
                              className="w-full bg-[#C5A880]/85 hover:bg-[#C5A880] rounded-t transition-all duration-300"
                            />
                            <span className="text-[8px] text-slate-500 font-mono mt-1">{dateLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: SVG Circular Progress Ring */}
                  <div className={`border p-4 rounded-xl flex items-center justify-between gap-4 ${bgGlow} ${borderGlow} animate-luxury-card`}>
                    <div className="space-y-1.5 max-w-[60%]">
                      <span className="text-[8.5px] uppercase font-bold tracking-wider text-slate-500">
                        Monthly Energy Efficiency
                      </span>
                      <h4 className={`text-xs font-serif font-bold uppercase tracking-wider ${textColor}`}>
                        {statusLabel}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal font-light">
                        {statusText}
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono pt-1">
                        Latest: <strong className="text-slate-200 font-sans">{latestUnits} kWh</strong> / limit {baseline} kWh
                      </p>
                    </div>

                    {/* Circular Progress Gauge */}
                    <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle cx="50" cy="50" r={r} fill="transparent" stroke="#1B1C21" strokeWidth="6" />
                        
                        {/* Progress ring */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r={r} 
                          fill="transparent" 
                          stroke={ringColor} 
                          strokeWidth="6" 
                          strokeDasharray={circ} 
                          strokeDashoffset={strokeOffset}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      </svg>
                      {/* Central Percentage */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="font-mono text-xs font-bold text-slate-200">
                          {Math.round(usagePercent)}%
                        </span>
                        <span className="text-[7px] text-slate-500 uppercase font-semibold mt-0.5">limit</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {transactions.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">{t.noTx}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="text-[10px] text-slate-500 uppercase border-b border-[#1B1C21]/60">
                    <tr>
                      <th className="py-2.5">{t.dateCol}</th>
                      <th className="py-2.5">{t.typeCol}</th>
                      <th className="py-2.5 text-right">{t.amtCol}</th>
                      <th className="py-2.5 text-center">{t.modeCol}</th>
                      <th className="py-2.5 text-right">{t.receiptCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1B1C21]/60 font-light">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-[#060608]/40">
                        <td className="py-3 font-mono">{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className="py-3 capitalize text-[#C5A880]">{tx.type}</td>
                        <td className="py-3 text-right font-mono font-semibold text-slate-200">₹{tx.amount_paid}</td>
                        <td className="py-3 text-center">{tx.payment_mode}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDownloadDoc(`receipt_${tx.id}.pdf`, `PAYMENT RECEIPT (id: ${tx.id})`)}
                            className="text-[10px] text-gold hover:underline flex items-center gap-1 justify-end ml-auto cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            {t.downloadBtn}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Complaints */}
        {activeTab === 'complaints' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Form */}
            <div className="md:col-span-5 bg-[#0E0F12] border border-[#1B1C21] p-5 rounded-xl space-y-4 h-fit">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-gold" />
                Book Service Visit / Raise Ticket
              </h2>
              
              <form onSubmit={handleSubmitComplaint} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase text-[9px] font-bold">Issue Subject *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Shutter lock jammed"
                    value={compSubject}
                    onChange={(e) => setCompSubject(e.target.value)}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 outline-none focus:border-gold/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase text-[9px] font-bold">Category</label>
                    <select
                      value={compCategory}
                      onChange={(e) => setCompCategory(e.target.value as 'Plumbing' | 'Electrical' | 'Appliance' | 'Housekeeping' | 'Other')}
                      className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 outline-none focus:border-gold/50"
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Appliance">Appliance</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase text-[9px] font-bold">Severity</label>
                    <select
                      value={compSeverity}
                      onChange={(e) => setCompSeverity(e.target.value as 'Urgent' | 'Medium' | 'Low')}
                      className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 outline-none focus:border-gold/50"
                    >
                      <option value="Urgent">Urgent</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase text-[9px] font-bold">Preferred Visit Date & Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Next Saturday, 2 PM to 5 PM"
                    value={compVisitSlot}
                    onChange={(e) => setCompVisitSlot(e.target.value)}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 outline-none focus:border-gold/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase text-[9px] font-bold">Detailed Description *</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Provide details..."
                    value={compDesc}
                    onChange={(e) => setCompDesc(e.target.value)}
                    className="w-full rounded bg-[#060608] border border-[#1B1C21] p-2.5 text-slate-200 outline-none focus:border-gold/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingComplaint}
                  className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-[9px] font-bold uppercase tracking-wider py-3 rounded-lg transition-colors cursor-pointer"
                >
                  {isSubmittingComplaint ? 'Registering...' : 'Log Service Request'}
                </button>
              </form>
            </div>

            {/* List */}
            <div className="md:col-span-7 bg-[#0E0F12] border border-[#1B1C21] p-5 rounded-xl space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-gold" />
                Service Tickets Tracker
              </h2>

              {complaints.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">{t.noComplaints}</p>
              ) : (
                <div className="divide-y divide-[#1B1C21]/60 text-xs">
                  {complaints.map(comp => {
                    const statusText = comp.status;
                    return (
                      <div key={comp.id} className="py-4 space-y-3">
                        <div className="flex justify-between items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-200 text-sm">{comp.subject}</span>
                          <span className={`text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded border ${
                            statusText === 'Resolved' 
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                              : statusText === 'In Progress'
                              ? 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                              : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                          }`}>
                            {statusText}
                          </span>
                        </div>
                        <p className="text-slate-400 font-light leading-relaxed">{comp.desc}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-500 bg-[#060608]/40 border border-[#1B1C21]/50 p-2 rounded-lg">
                          <div>Category: <strong className="text-slate-350">{comp.category || 'Other'}</strong></div>
                          <div>Severity: <strong className="text-slate-350">{comp.severity || 'Medium'}</strong></div>
                          {comp.visit_slot && (
                            <div className="col-span-2">Preferred Slot: <strong className="text-slate-350">{comp.visit_slot}</strong></div>
                          )}
                          {comp.visit_notes && (
                            <div className="col-span-2 mt-1 border-t border-[#1B1C21]/40 pt-1 text-gold">
                              Scheduler Notes: <strong className="text-slate-300 font-sans">{comp.visit_notes}</strong>
                            </div>
                          )}
                        </div>

                        {/* Progress timeline bars */}
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex-1 h-1 rounded bg-rose-500" title="Submitted" />
                          <div className={`flex-1 h-1 rounded ${statusText !== 'Pending' ? 'bg-amber-500' : 'bg-slate-800'}`} title="Scheduled" />
                          <div className={`flex-1 h-1 rounded ${statusText === 'Resolved' ? 'bg-emerald-500' : 'bg-slate-800'}`} title="Completed" />
                        </div>

                        <span className="text-[8px] text-slate-650 font-mono block">Logged: {new Date(comp.created_at).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 4: Documents */}
        {activeTab === 'documents' && (
          <div className="bg-[#0E0F12] border border-[#1B1C21] rounded-xl p-5 sm:p-6 space-y-5">
            <div>
              <h2 className="text-sm sm:text-base font-serif font-semibold text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gold" />
                {t.docsTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-light">{t.docDesc}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="p-4 bg-[#060608] border border-[#1B1C21] rounded-xl flex justify-between items-center">
                <div>
                  <span className="block font-semibold text-slate-200">{t.rentAg}</span>
                  <span className="text-[9px] text-slate-500 font-mono">Format: PDF (Verified)</span>
                </div>
                <button
                  onClick={() => handleDownloadDoc('rent_agreement', 'SHOP LEASE AGREEMENT (दुकान लीज)')}
                  className="p-2 bg-gold/10 hover:bg-gold/25 border border-gold/20 text-gold rounded-lg transition duration-200 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-[#060608] border border-[#1B1C21] rounded-xl flex justify-between items-center">
                <div>
                  <span className="block font-semibold text-slate-200">{t.domicile}</span>
                  <span className="text-[9px] text-slate-500 font-mono">Format: PDF (Verified)</span>
                </div>
                <button
                  onClick={() => handleDownloadDoc('domicile', 'DOMICILE CERTIFICATE (मूल निवास)')}
                  className="p-2 bg-gold/10 hover:bg-gold/25 border border-gold/20 text-gold rounded-lg transition duration-200 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-[#060608] border border-[#1B1C21] rounded-xl flex justify-between items-center">
                <div>
                  <span className="block font-semibold text-slate-200">{t.affidavit}</span>
                  <span className="text-[9px] text-slate-500 font-mono">Format: PDF (Verified)</span>
                </div>
                <button
                  onClick={() => handleDownloadDoc('affidavit', 'AFFIDAVIT (हलफनामा)')}
                  className="p-2 bg-gold/10 hover:bg-gold/25 border border-gold/20 text-gold rounded-lg transition duration-200 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-[#060608] border border-[#1B1C21] rounded-xl flex justify-between items-center">
                <div>
                  <span className="block font-semibold text-slate-200">{t.satyapan}</span>
                  <span className="text-[9px] text-slate-500 font-mono">Format: PDF (Verified)</span>
                </div>
                <button
                  onClick={() => handleDownloadDoc('satyapan', 'PRE SATYAPAN VERIFICATION FORM (सत्यापन प्रपत्र)')}
                  className="p-2 bg-gold/10 hover:bg-gold/25 border border-gold/20 text-gold rounded-lg transition duration-200 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Tab 5: Private Messages */}
        {activeTab === 'messages' && (
          <div className="bg-[#0E0F12] border border-[#1B1C21] rounded-xl p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#1B1C21]/60 pb-3 flex-wrap sm:flex-nowrap gap-2">
              <h2 className="text-sm sm:text-base font-serif font-semibold text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gold" />
                {t.msgTitle}
              </h2>
              
              {/* Recipient toggle tab */}
              <div className="flex bg-[#060608] p-1 border border-[#1B1C21] rounded-lg text-[10px] font-bold uppercase tracking-wider">
                <button 
                  onClick={() => setChatRecipient('manager')}
                  className={`px-3 py-1 rounded cursor-pointer transition ${chatRecipient === 'manager' ? 'bg-gold/15 text-gold' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t.managerOpt.split(' (')[0]}
                </button>
                <button 
                  onClick={() => setChatRecipient('owner')}
                  className={`px-3 py-1 rounded cursor-pointer transition ${chatRecipient === 'owner' ? 'bg-gold/15 text-gold' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t.ownerOpt.split(' (')[0]}
                </button>
              </div>
            </div>

            {/* Chat message threads */}
            <div className="h-64 border border-[#1B1C21] bg-[#060608]/50 rounded-xl p-4 overflow-y-auto space-y-3 flex flex-col justify-start">
              {chats.length === 0 ? (
                <p className="text-xs text-slate-600 text-center my-auto">Start a conversation. Secure and private with management.</p>
              ) : (
                chats.map(m => {
                  const isMe = m.sender_id === tenant.id;
                  return (
                    <div key={m.id} className={`max-w-[85%] rounded-lg p-2.5 text-xs ${
                      isMe 
                        ? 'bg-gold/10 border border-gold/15 text-slate-200 self-end ml-auto' 
                        : 'bg-[#14151B] border border-[#24252D] text-slate-300 self-start'
                    }`}>
                      <span className="block text-[8px] text-slate-500 uppercase font-semibold mb-0.5">{m.sender_name.split(' (')[0]}</span>
                      <p>{m.content}</p>
                      <span className="block text-[7px] text-slate-600 font-mono text-right mt-1">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Send form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 text-xs">
              <input 
                type="text"
                required
                placeholder={t.typeMsg}
                value={chatContent}
                onChange={(e) => setChatContent(e.target.value)}
                className="flex-1 rounded-lg bg-[#060608] border border-[#1B1C21] px-3 py-2.5 text-slate-200 outline-none focus:border-gold/50"
              />
              <button
                type="submit"
                className="p-2.5 bg-gold hover:bg-[#DFD3C3] text-[#060608] rounded-lg cursor-pointer transition flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

      </main>

      {/* Payment Secure Modal popup overlay */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0E0F12] border border-[#1B1C21] rounded-2xl p-6 shadow-2xl relative space-y-5">
            <h3 className="text-base font-serif font-bold text-slate-200 border-b border-[#1B1C21] pb-3 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-gold" />
              {t.paymentModalTitle}
            </h3>

            {/* Payment type configuration selector */}
            <div className="space-y-2 text-xs">
              <span className="block text-slate-500 uppercase text-[9px] font-bold tracking-wider">Select dues type to clear</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentType('rent')}
                  disabled={pendingRentDue === 0}
                  className={`py-2 rounded border font-semibold cursor-pointer transition ${paymentType === 'rent' ? 'bg-gold/15 border-gold/40 text-gold' : 'bg-[#060608] border-[#1B1C21] text-slate-400 hover:text-slate-200 disabled:opacity-30'}`}
                >
                  Rent (₹{pendingRentDue})
                </button>
                <button
                  onClick={() => setPaymentType('electricity')}
                  disabled={pendingElectricDue === 0}
                  className={`py-2 rounded border font-semibold cursor-pointer transition ${paymentType === 'electricity' ? 'bg-gold/15 border-gold/40 text-gold' : 'bg-[#060608] border-[#1B1C21] text-slate-400 hover:text-slate-200 disabled:opacity-30'}`}
                >
                  Power (₹{pendingElectricDue})
                </button>
                <button
                  onClick={() => setPaymentType('both')}
                  disabled={pendingRentDue === 0 || pendingElectricDue === 0}
                  className={`py-2 rounded border font-semibold cursor-pointer transition ${paymentType === 'both' ? 'bg-gold/15 border-gold/40 text-gold' : 'bg-[#060608] border-[#1B1C21] text-slate-400 hover:text-slate-200 disabled:opacity-30'}`}
                >
                  Both (₹{totalDue})
                </button>
              </div>
            </div>

            {/* Payment mode choice */}
            <div className="space-y-2 text-xs">
              <span className="block text-slate-500 uppercase text-[9px] font-bold tracking-wider">{t.selectMode}</span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setPaymentMethod('UPI')}
                  className={`py-2 px-3 rounded border font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 ${paymentMethod === 'UPI' ? 'bg-gold/15 border-gold/40 text-gold' : 'bg-[#060608] border-[#1B1C21] text-slate-400 hover:text-slate-200'}`}
                >
                  <QrCode className="w-4 h-4" />
                  {t.modeUPI}
                </button>
                <button
                  onClick={() => setPaymentMethod('Cash')}
                  className={`py-2 px-3 rounded border font-semibold cursor-pointer transition flex items-center justify-center gap-1.5 ${paymentMethod === 'Cash' ? 'bg-gold/15 border-gold/40 text-gold' : 'bg-[#060608] border-[#1B1C21] text-slate-400 hover:text-slate-200'}`}
                >
                  <DollarSign className="w-4 h-4" />
                  {t.modeCash}
                </button>
              </div>
            </div>

            {/* Simulated UPI QR Code */}
            {paymentMethod === 'UPI' && (
              <div className="p-4 bg-white/5 rounded-xl border border-[#1B1C21] text-center space-y-3">
                <div className="p-3 bg-white rounded-lg w-32 h-32 mx-auto flex items-center justify-center relative shadow-md">
                  {/* CSS Simulator code grid */}
                  <div className="w-28 h-28 bg-[#060608] flex flex-wrap gap-0.5 p-0.5">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className={`w-[25px] h-[25px] ${i%3===0||i===1||i===14?'bg-white':'bg-transparent'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed font-light">{t.upiInstructions}</p>
              </div>
            )}

            {/* Cash instructions */}
            {paymentMethod === 'Cash' && (
              <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 text-center space-y-1">
                <p className="text-[10px] text-amber-300 leading-relaxed">{t.cashInstructions}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 text-xs pt-2">
              <button
                onClick={() => { setShowPayModal(false); setPaymentMethod(''); }}
                className="flex-1 border border-[#1B1C21] hover:bg-slate-900/40 py-3 rounded-lg text-slate-400 cursor-pointer text-center transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={!paymentMethod || isProcessingPayment}
                className="flex-1 bg-[#C5A880] hover:bg-[#DFD3C3] disabled:opacity-40 text-[#060608] py-3 rounded-lg font-bold uppercase tracking-wider text-center cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  t.payConfirmBtn
                )}
              </button>
            </div>

            {/* Payment success feedback inside modal */}
            {paymentSuccess && (
              <div className="absolute inset-0 bg-[#0E0F12] rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-2 animate-luxury-card border border-emerald-500/30">
                <Check className="w-12 h-12 text-emerald-400 bg-emerald-500/10 p-2.5 rounded-full" />
                <h4 className="font-semibold text-slate-200 text-sm">{lang === 'en' ? 'Success!' : 'सफलता!'}</h4>
                <p className="text-xs text-slate-400 font-light">{t.paySuccessMsg}</p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Bottom Sticky Tabs Bar — Mobile-first full-width */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E0F12]/90 backdrop-blur-md border-t border-[#1B1C21] shadow-xl flex items-center" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {[
          { id: 'home', icon: CreditCard, label: lang === 'en' ? 'Home' : 'होम' },
          { id: 'payments', icon: FileText, label: lang === 'en' ? 'Ledger' : 'खाता' },
          { id: 'complaints', icon: Wrench, label: lang === 'en' ? 'Help' : 'शिकायत' },
          { id: 'documents', icon: FileText, label: lang === 'en' ? 'Docs' : 'डॉक्स' },
          { id: 'messages', icon: MessageSquare, label: lang === 'en' ? 'Chat' : 'चैट' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all duration-200 py-2 ${
                isActive
                  ? 'text-gold'
                  : 'text-slate-500 active:text-slate-300'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-gold/10' : ''
              }`}>
                <Icon className="w-[18px] h-[18px]" />
              </div>
              <span className={`text-[8px] uppercase font-semibold tracking-wide leading-none ${
                isActive ? 'text-gold' : 'text-slate-600'
              }`}>{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
