'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, Tenant, Transaction, Message } from '../db';
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
  FileText,
  MessageSquare,
  Download,
  LogOut,
  Send,
  QrCode,
  Check,
  Car,
  Info
} from 'lucide-react';

type Lang = 'en' | 'hi';
type Tab = 'home' | 'payments' | 'documents' | 'messages';

export default function ParkingPortal() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Database States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Payment Modal States
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'rent' | 'electricity' | 'both'>('both');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | ''>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Messaging state
  const [chatRecipient, setChatRecipient] = useState<'manager' | 'owner'>('manager');
  const [chatContent, setChatContent] = useState('');
  const [chatTrigger, setChatTrigger] = useState(0); // For reloading messages
  
  // EV Cost Estimator state
  const [avgHours, setAvgHours] = useState(3);

  // Selected slot state for interactive map
  const [selectedSlotNum, setSelectedSlotNum] = useState<number | null>(12);

  // Load tenant session and database states
  const loadDatabase = async (tenantId: string) => {
    try {
      const allTenants = await db.getTenants();
      const currentTenant = allTenants.find(t => t.id === tenantId);
      
      let activeTenant = currentTenant;
      if (currentTenant && currentTenant.role === 'parking') {
        setTenant(currentTenant);
      } else {
        const fallback = allTenants.find(t => t.role === 'parking');
        if (fallback) {
          activeTenant = fallback;
          setTenant(fallback);
          localStorage.setItem('sb_current_tenant_id', fallback.id);
        }
      }

      if (activeTenant) {
        const txs = await db.getTransactions();
        setTransactions(txs.filter(tx => tx.tenant_id === activeTenant.id));

        const msgs = await db.getMessages();
        setMessages(msgs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tenantId = localStorage.getItem('sb_current_tenant_id') || 't5';
    loadDatabase(tenantId);
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
  const isEvUser = tenant.ev_charger;
  const powerRate = tenant.electricity_rate || 12;
  const prevReading = tenant.previous_reading || 0;
  const currReading = tenant.current_reading || 0;
  const unitsConsumed = currReading > prevReading ? currReading - prevReading : 0;
  const electricityCharge = isEvUser ? (unitsConsumed * powerRate) : 0;
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
  const pendingElectricDue = isEvUser ? Math.max(0, electricityCharge - Math.max(0, currentMonthPaid - rentAmount)) : 0;
  const totalDue = pendingRentDue + pendingElectricDue;
  const isPaid = totalDue <= 0;

  // Language mapping
  const t = {
    en: {
      dashboard: 'Parking Subscription Portal',
      logout: 'Logout',
      langLabel: 'हिंदी',
      regVerified: 'Vehicle RC and Aadhaar Card verified for registration.',
      homeTab: 'Home',
      payTab: 'Payments',
      docTab: 'Documents',
      msgTab: 'Messages',
      welcome: 'Welcome,',
      slotLabel: 'Allocated Parking Slot',
      vehicleLabel: 'Vehicle Number',
      rentSummary: 'Parking Charges Summary',
      rentLabel: 'Slot Subscription Fee',
      electricLabel: 'EV Charging Power Bill',
      totalBill: 'Total Outstanding Dues',
      statusLabel: 'Pass Status',
      activePass: 'Active ✓',
      pendingPass: 'Renewal Required',
      payBtn: 'Pay Subscription',
      evDetails: 'EV Charging Readings',
      prevRead: 'Prev Reading',
      currRead: 'Curr Reading',
      consumed: 'Power Used',
      rate: 'Rate per unit',
      digitalPass: 'Digital Entry Pass',
      passDesc: 'Scan this QR code at Shree Balaji smart entry terminals for automated gate access.',
      ledgerTitle: 'Parking Transaction History',
      dateCol: 'Date',
      typeCol: 'Type',
      amtCol: 'Amount',
      modeCol: 'Mode',
      receiptCol: 'Receipt',
      downloadBtn: 'Download',
      noTx: 'No subscription transactions found.',
      docsTitle: 'Registered Parking Documents',
      vehicleRc: 'Vehicle RC Copy (पंजीकरण प्रमाण पत्र)',
      rentAg: 'Parking Agreement (पार्किंग अनुबंध)',
      domicile: 'Domicile Copy (मूल निवास)',
      aadhaarDoc: 'Aadhaar Card Copy (आधार कार्ड)',
      docDesc: 'Download copies of verification files registered under your slot.',
      msgTitle: 'Private Messages & Support',
      msgTo: 'Message Recipient',
      managerOpt: 'Property Manager (Amit)',
      ownerOpt: 'Property Owner (Balaji)',
      typeMsg: 'Type your message...',
      sendBtn: 'Send Message',
      paymentModalTitle: 'Process Secure Payment',
      payRent: 'Pay Subscription Only',
      payElectric: 'Pay EV Charger Only',
      payBoth: 'Pay Subscription + EV',
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
      dashboard: 'स्मार्ट पार्किंग पोर्टल',
      logout: 'लॉगआउट',
      langLabel: 'English',
      regVerified: 'पंजीकरण के लिए वाहन आर.सी. और आधार कार्ड सत्यापित है।',
      homeTab: 'होम',
      payTab: 'भुगतान',
      docTab: 'दस्तावेज़',
      msgTab: 'संदेश',
      welcome: 'स्वागत है,',
      slotLabel: 'आवंटित पार्किंग स्लॉट',
      vehicleLabel: 'वाहन नंबर',
      rentSummary: 'पार्किंग शुल्क विवरण',
      rentLabel: 'पार्किंग स्लॉट मासिक शुल्क',
      electricLabel: 'ईवी चार्जिंग बिजली शुल्क',
      totalBill: 'कुल देय राशि',
      statusLabel: 'गेट पास की स्थिति',
      activePass: 'सक्रिय है ✓',
      pendingPass: 'रिन्यूअल आवश्यक',
      payBtn: 'भुगतान करें',
      evDetails: 'ईवी चार्जिंग मीटर रीडिंग',
      prevRead: 'पिछली रीडिंग',
      currRead: 'मौजूदा रीडिंग',
      consumed: 'कुल प्रयुक्त यूनिट्स',
      rate: 'बिजली दर',
      digitalPass: 'डिजिटल गेट पास (QR)',
      passDesc: 'स्वचालित प्रवेश के लिए बालाजी स्मार्ट गेट पर इस क्यू.आर. कोड को स्कैन करें।',
      ledgerTitle: 'पार्किंग भुगतान इतिहास',
      dateCol: 'तारीख',
      typeCol: 'प्रकार',
      amtCol: 'राशि',
      modeCol: 'माध्यम',
      receiptCol: 'रसीद',
      downloadBtn: 'डाउनलोड',
      noTx: 'कोई पुराना भुगतान रिकॉर्ड नहीं मिला।',
      docsTitle: 'पंजीकृत पार्किंग दस्तावेज़',
      vehicleRc: 'वाहन आर.सी. कॉपी (Vehicle RC)',
      rentAg: 'पार्किंग एग्रीमेंट (Agreement)',
      domicile: 'मूल निवास प्रमाण पत्र (Domicile)',
      aadhaarDoc: 'आधार कार्ड कॉपी (Aadhaar Copy)',
      docDesc: 'पार्किंग स्लॉट के तहत पंजीकृत अपने सत्यापित दस्तावेज़ डाउनलोड करें।',
      msgTitle: 'निजी संदेश और सहायता',
      msgTo: 'संदेश प्राप्तकर्ता',
      managerOpt: 'प्रॉपर्टी मैनेजर (अमित)',
      ownerOpt: 'प्रॉपर्टी मालिक (बालाजी)',
      typeMsg: 'अपना संदेश लिखें...',
      sendBtn: 'संदेश भेजें',
      paymentModalTitle: 'सुरक्षित भुगतान प्रक्रिया',
      payRent: 'केवल पार्किंग स्लॉट शुल्क',
      payElectric: 'केवल ईवी चार्जर बिल',
      payBoth: 'पार्किंग शुल्क + ईवी चार्जर',
      selectMode: 'भुगतान का माध्यम चुनें',
      modeUPI: 'UPI ट्रांसफर (QR कोड)',
      modeCash: 'मैनेजर (अमित) को नकद',
      upiInstructions: 'भुगतान पूरा करने के लिए किसी भी UPI ऐप (GPay/PhonePe/Paytm) से इस QR कोड को स्कैन करें।',
      cashInstructions: 'कृपया नकद राशि मैनेजर अमित को सौंपें। मैनेजर के लॉग करते ही रसीद अपडेट हो जाएगी।',
      payConfirmBtn: 'भुगतान की पुष्टि करें',
      payProcessing: 'लेनदेन सत्यापित किया जा रहा है...',
      paySuccessMsg: 'भुगतान सफलतापूर्वक पूरा हुआ! डेटाबेस रिकॉर्ड अपडेट हो गया है।'
    }
  }[lang];

  // Document download action simulation
  const handleDownloadDoc = (docName: string, docTitle: string) => {
    const docContent = `SHREE BALAJI PROPERTIES - SMART PARKING\nTransit Camp, Rudrapur, Uttarakhand\n---------------------------------------------\nDOCUMENT: ${docTitle}\nTENANT NAME: ${tenant.name}\nSLOT NUMBER: ${tenant.unit_name}\nVEHICLE RC: ${tenant.vehicle_rc || 'N/A'}\nAADHAAR ID: ${tenant.aadhaar}\nDATE GENERATED: ${new Date().toLocaleDateString()}\nSTATUS: ACTIVE & VERIFIED\n---------------------------------------------\nThis is a secure system-generated copy.`;
    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${docName.replace('.pdf', '')}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    let payType: Transaction['type'] = 'parking';
    
    if (paymentType === 'rent') {
      amountToPay = pendingRentDue;
      payType = 'parking';
    } else if (paymentType === 'electricity') {
      amountToPay = pendingElectricDue;
      payType = 'electricity';
    } else {
      amountToPay = totalDue;
      payType = isEvUser ? 'both' : 'parking';
    }

    try {
      // Record transaction
      await db.addTransaction({
        tenant_id: tenant.id,
        tenant_name: tenant.name,
        business_type: 'parking',
        unit_name: tenant.unit_name,
        type: payType,
        total_amount: amountToPay,
        amount_paid: amountToPay,
        previous_reading: payType !== 'parking' ? prevReading : null,
        current_reading: payType !== 'parking' ? currReading : null,
        units_consumed: payType !== 'parking' ? unitsConsumed : null,
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
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{t.slotLabel}: {tenant.unit_name}</p>
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
      <main className="max-w-4xl mx-auto px-4 animate-luxury-card">
        
        {/* Verification badge */}
        <div className="mb-6 py-2 px-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] flex items-center gap-1.5 font-light">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{t.regVerified} (Vehicle RC: {tenant.vehicle_rc} | Aadhaar: {tenant.aadhaar})</span>
        </div>

        {/* Tab 1: Home / Dashboard */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Broadcast announcements banner */}
            {(() => {
              const broadcasts = messages.filter(
                m => m.recipient_id === 'broadcast_all' || m.recipient_id === 'broadcast_parking'
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

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Side: Subscription Info */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Subscription Summary */}
                <div className="bg-[#0E0F12] border border-[#1B1C21] p-5 sm:p-6 rounded-xl space-y-5">
                  <div className="flex justify-between items-center border-b border-[#1B1C21]/60 pb-3">
                    <h2 className="text-sm sm:text-base font-serif font-semibold text-slate-200 flex items-center gap-2">
                      <Car className="w-4 h-4 text-gold" />
                      {t.rentSummary}
                    </h2>
                    
                    {/* Status badge */}
                    <span className={`font-bold text-[9px] tracking-wider uppercase px-2 py-0.5 rounded border ${
                      isPaid 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                    }`}>
                      {isPaid ? t.activePass : t.pendingPass}
                    </span>
                  </div>

                  {/* Split detail rows */}
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-2 border-b border-[#1B1C21]/60">
                      <span className="text-slate-500">{t.rentLabel}</span>
                      <span className="font-mono text-slate-200 font-bold">₹{rentAmount}</span>
                    </div>
                    {isEvUser && (
                      <div className="flex justify-between py-2 border-b border-[#1B1C21]/60">
                        <span className="text-slate-500">{t.electricLabel}</span>
                        <span className="font-mono text-slate-200 font-bold">₹{electricityCharge}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm font-bold text-gold pt-2">
                      <span>{t.totalBill}:</span>
                      <span className="font-mono">₹{totalDue}</span>
                    </div>
                  </div>

                  {/* Pay Button */}
                  {!isPaid && (
                    <button
                      onClick={() => {
                        setPaymentType(isEvUser && pendingRentDue > 0 && pendingElectricDue > 0 ? 'both' : pendingRentDue > 0 ? 'rent' : 'electricity');
                        setShowPayModal(true);
                      }}
                      className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-[10px] font-bold uppercase tracking-[0.2em] py-3.5 rounded-lg transition-colors cursor-pointer shadow-md"
                    >
                      {t.payBtn}
                    </button>
                  )}
                </div>

                {/* EV details (Only for EV Users) */}
                {isEvUser && (
                  <div className="bg-[#0E0F12] border border-[#1B1C21] p-5 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-gold" />
                      {t.evDetails}
                    </h3>
                    
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 bg-[#060608] border border-[#1B1C21] rounded-lg">
                        <span className="text-[8px] text-slate-500 block mb-0.5">{t.prevRead}</span>
                        <span className="font-mono font-bold text-slate-300">{prevReading}</span>
                      </div>
                      <div className="p-2 bg-[#060608] border border-[#1B1C21] rounded-lg">
                        <span className="text-[8px] text-slate-500 block mb-0.5">{t.currRead}</span>
                        <span className="font-mono font-bold text-slate-300">{currReading}</span>
                      </div>
                      <div className="p-2 bg-[#060608] border border-[#1B1C21] rounded-lg">
                        <span className="text-[8px] text-slate-500 block mb-0.5">{t.consumed}</span>
                        <span className="font-mono font-bold text-gold">{unitsConsumed} kWh</span>
                      </div>
                      <div className="p-2 bg-[#060608] border border-[#1B1C21] rounded-lg">
                        <span className="text-[8px] text-slate-500 block mb-0.5">{t.rate}</span>
                        <span className="font-mono font-bold text-[#C5A880]">₹{powerRate}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* EV Cost Estimator */}
                {isEvUser && (
                  <div className="bg-[#0E0F12] border border-[#1B1C21] p-5 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-gold" />
                      Simple EV Charge Estimator
                    </h3>
                    <div className="space-y-4 text-xs font-light text-slate-300">
                      <div className="flex justify-between items-center">
                        <span>Daily Charging Duration:</span>
                        <span className="font-mono text-gold font-bold">{avgHours} hours/day</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="12"
                        step="1"
                        value={avgHours}
                        onChange={(e) => setAvgHours(Number(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-gold"
                      />
                      <div className="bg-[#060608]/60 border border-[#1B1C21]/60 p-3 rounded-lg flex flex-col gap-2">
                        <div className="flex justify-between font-mono text-[10px] text-slate-400">
                          <span>Estimating Formula:</span>
                          <span>Avg Hours × 3.3 kW × 30 Days × ₹{powerRate}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-slate-200 border-t border-[#1B1C21]/45 pt-2">
                          <span>Est. Monthly Electricity:</span>
                          <span className="font-mono text-emerald-400">₹{(avgHours * 3.3 * 30 * powerRate).toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Right Side: Slot Map & Digital Entry Pass */}
              <div className="md:col-span-5 space-y-6">
                
                {/* Parking Slot Map */}
                <div className="bg-[#0E0F12] border border-[#1B1C21] p-5 rounded-xl space-y-4 w-full">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-[#1B1C21]/60 pb-2 w-full text-left">
                    <Car className="w-4 h-4 text-gold" />
                    Parking Slots Layout Map
                  </h3>
                  
                  <p className="text-[10px] text-slate-500 font-light">
                    Click on any parking slot to query its real-time occupancy and charger status. Your slot is <strong className="text-gold">P-12</strong>.
                  </p>

                  {/* Grid layout */}
                  <div className="grid grid-cols-5 gap-2 pt-2">
                    {Array.from({ length: 15 }).map((_, idx) => {
                      const slotNum = idx + 1;
                      const isMySlot = slotNum === 12;
                      const isSelected = selectedSlotNum === slotNum;
                      
                      // Simulated status styling
                      const isOccupied = [1, 3, 5, 8, 10, 14].includes(slotNum);
                      const isReserved = [2, 4, 7, 11, 15].includes(slotNum);
                      const isAvailable = [6, 9, 13].includes(slotNum);

                      let borderClass = 'border-[#1B1C21]';
                      let bgClass = 'bg-slate-950/40 text-slate-600';
                      
                      if (isMySlot) {
                        bgClass = isSelected ? 'bg-gold/15 text-gold font-bold shadow-[0_0_12px_rgba(197,168,128,0.25)]' : 'bg-gold/5 text-gold';
                        borderClass = 'border-gold';
                      } else if (isSelected) {
                        bgClass = isOccupied ? 'bg-rose-500/10 text-rose-450 font-bold' : isReserved ? 'bg-blue-500/10 text-blue-450 font-bold' : 'bg-emerald-500/10 text-emerald-450 font-bold';
                        borderClass = isOccupied ? 'border-rose-500/40' : isReserved ? 'border-blue-500/40' : 'border-emerald-500/40';
                      } else {
                        if (isOccupied) {
                          bgClass = 'bg-slate-950/60 text-slate-500';
                        } else if (isReserved) {
                          bgClass = 'bg-slate-950/40 text-slate-600';
                        } else if (isAvailable) {
                          bgClass = 'bg-slate-950/20 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={slotNum}
                          type="button"
                          onClick={() => setSelectedSlotNum(slotNum)}
                          className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center font-mono transition-all duration-300 transform hover:scale-105 cursor-pointer ${bgClass} ${borderClass}`}
                        >
                          <span className="block text-[7px] font-sans opacity-75">Slot</span>
                          <span className="text-xs">P-{slotNum}</span>
                          {isMySlot && <Car className="w-3 h-3 text-gold mt-1 animate-pulse" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Slot Detail Box */}
                  {selectedSlotNum !== null && (() => {
                    const slotNum = selectedSlotNum;
                    const isMySlot = slotNum === 12;
                    const isOccupied = [1, 3, 5, 8, 10, 14].includes(slotNum);
                    const isReserved = [2, 4, 7, 11, 15].includes(slotNum);
                    const isAvailable = [6, 9, 13].includes(slotNum);

                    return (
                      <div className="bg-[#060608]/80 border border-[#1B1C21] p-3 rounded-lg text-[10px] space-y-2 animate-luxury-card text-left">
                        <div className="flex justify-between items-center border-b border-[#1B1C21]/60 pb-1.5">
                          <span className="font-bold uppercase tracking-wider text-slate-350">Slot P-{slotNum} Details</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-sans uppercase tracking-widest ${
                            isMySlot ? 'bg-gold/10 text-gold border border-gold/20' :
                            isOccupied ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            isReserved ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {isMySlot ? 'Your Space' : isOccupied ? 'Occupied' : isReserved ? 'Reserved' : 'Available'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-slate-400 font-light">
                          <div>Type: <strong className="text-slate-200">{isMySlot || isOccupied ? 'Premium Subscription' : isReserved ? 'Guest Parking' : 'Open Subscription'}</strong></div>
                          <div>EV Charging: <strong className="text-slate-200">{slotNum % 3 === 0 || isMySlot ? 'Equipped' : 'Not Available'}</strong></div>
                          {isMySlot && <div className="col-span-2 text-gold">This is your registered slot for vehicle <strong>{tenant.vehicle_rc}</strong>.</div>}
                          {isOccupied && !isMySlot && <div className="col-span-2 text-slate-550">Currently leased under active contract.</div>}
                          {isReserved && <div className="col-span-2 text-slate-550">Reserved for transient guest vehicles. Subscriptions disabled.</div>}
                          {isAvailable && <div className="col-span-2 text-emerald-400 font-medium animate-pulse">Available for immediate subscription! Contact manager.</div>}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Simulated Entry QR Pass */}
                <div className="bg-[#0E0F12] border border-[#1B1C21] p-6 rounded-xl flex flex-col items-center text-center space-y-5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 self-start border-b border-[#1B1C21]/60 pb-2 w-full text-left">
                    <QrCode className="w-4 h-4 text-gold" />
                    {t.digitalPass}
                  </h2>

                  {/* QR Code simulating frame */}
                  <div className="p-4 bg-white rounded-xl shadow-lg border border-slate-200 flex items-center justify-center w-36 h-36 relative">
                    <div className="w-28 h-28 bg-[#060608] flex flex-wrap gap-1 p-1">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-[25px] h-[25px] ${
                            (i * 3 + 7) % 4 === 0 || i === 0 || i === 3 || i === 12 || i === 15 
                              ? 'bg-white' 
                              : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed font-light px-2">
                    {t.passDesc}
                  </p>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Payments History */}
        {activeTab === 'payments' && (
          <div className="bg-[#0E0F12] border border-[#1B1C21] rounded-xl p-5 sm:p-6 space-y-4">
            <h2 className="text-sm sm:text-base font-serif font-semibold text-slate-200 mb-2">
              {t.ledgerTitle}
            </h2>

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
                            onClick={() => handleDownloadDoc(`receipt_${tx.id}.pdf`, `PARKING RECEIPT (id: ${tx.id})`)}
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

        {/* Tab 3: Documents */}
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
                  <span className="block font-semibold text-slate-200">{t.vehicleRc}</span>
                  <span className="text-[9px] text-slate-500 font-mono">Format: PDF (Verified)</span>
                </div>
                <button
                  onClick={() => handleDownloadDoc('vehicle_rc.pdf', 'VEHICLE RC COPY (वाहन आर.सी.)')}
                  className="p-2 bg-gold/10 hover:bg-gold/25 border border-gold/20 text-gold rounded-lg transition duration-200 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-[#060608] border border-[#1B1C21] rounded-xl flex justify-between items-center">
                <div>
                  <span className="block font-semibold text-slate-200">{t.aadhaarDoc}</span>
                  <span className="text-[9px] text-slate-500 font-mono">Format: PDF (Verified)</span>
                </div>
                <button
                  onClick={() => handleDownloadDoc('aadhaar_card.pdf', 'AADHAAR CARD (आधार कार्ड)')}
                  className="p-2 bg-gold/10 hover:bg-gold/25 border border-gold/20 text-gold rounded-lg transition duration-200 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-[#060608] border border-[#1B1C21] rounded-xl flex justify-between items-center">
                <div>
                  <span className="block font-semibold text-slate-200">{t.rentAg}</span>
                  <span className="text-[9px] text-slate-500 font-mono">Format: PDF (Verified)</span>
                </div>
                <button
                  onClick={() => handleDownloadDoc('parking_agreement.pdf', 'PARKING AGREEMENT (पार्किंग अनुबंध)')}
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
                  onClick={() => handleDownloadDoc('domicile.pdf', 'DOMICILE CERTIFICATE (मूल निवास)')}
                  className="p-2 bg-gold/10 hover:bg-gold/25 border border-gold/20 text-gold rounded-lg transition duration-200 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Tab 4: Messages */}
        {activeTab === 'messages' && (
          <div className="bg-[#0E0F12] border border-[#1B1C21] rounded-xl p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#1B1C21]/60 pb-3 flex-wrap sm:flex-nowrap gap-2">
              <h2 className="text-sm sm:text-base font-serif font-semibold text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gold" />
                {t.msgTitle}
              </h2>
              
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

            {/* Chat threads */}
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

            {/* Send Message */}
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

      {/* Payment Secure Modal */}
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
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentType('rent')}
                  disabled={pendingRentDue === 0}
                  className={`py-2 rounded border font-semibold cursor-pointer transition ${paymentType === 'rent' ? 'bg-gold/15 border-gold/40 text-gold' : 'bg-[#060608] border-[#1B1C21] text-slate-400 hover:text-slate-200 disabled:opacity-30'}`}
                >
                  Subscription (₹{pendingRentDue})
                </button>
                {isEvUser ? (
                  <button
                    onClick={() => setPaymentType('electricity')}
                    disabled={pendingElectricDue === 0}
                    className={`py-2 rounded border font-semibold cursor-pointer transition ${paymentType === 'electricity' ? 'bg-gold/15 border-gold/40 text-gold' : 'bg-[#060608] border-[#1B1C21] text-slate-400 hover:text-slate-200 disabled:opacity-30'}`}
                  >
                    EV Charging (₹{pendingElectricDue})
                  </button>
                ) : (
                  <div className="py-2 border border-dashed border-[#1B1C21] text-slate-600 rounded text-center">No EV Charger</div>
                )}
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

            {/* Payment success feedback */}
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
