'use client';

import React, { useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { PropertyUnit, UtilityBill } from '@/types';
import SlotGrid from '@/components/parking/SlotGrid';
import { uploadMeterPhoto } from '@/lib/supabase';
import { 
  Home, 
  Store, 
  Car, 
  Zap, 
  Camera, 
  Share2, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  Send, 
  Phone, 
  User, 
  FileText, 
  X,
  AlertCircle,
  TrendingUp,
  Wallet,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FieldDashboard() {
  const { 
    config, 
    units, 
    bills, 
    selectedMonth, 
    recordMeterReadingAndBill, 
    getManagerEarningsSummary 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'rooms' | 'shops' | 'parking'>('rooms');
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);

  // Billing Modal Form State
  const [currReading, setCurrReading] = useState<number | ''>('');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [payMode, setPayMode] = useState<'cash' | 'upi'>('cash');
  const [meterPhoto, setMeterPhoto] = useState<File | null>(null);
  const [meterPhotoPreview, setMeterPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const earnings = getManagerEarningsSummary();

  const rooms = units.filter((u) => u.type === 'room');
  const shops = units.filter((u) => u.type === 'shop');

  // Open Billing Modal
  const handleOpenBilling = (unit: PropertyUnit) => {
    setSelectedUnit(unit);
    // Find if bill exists for this month
    const existingBill = bills.find((b) => b.unit_id === unit.id && b.billing_month === selectedMonth);
    if (existingBill) {
      setCurrReading(existingBill.curr_reading);
      setAmountPaid(existingBill.amount_paid);
      setPayMode(existingBill.payment_mode === 'upi' ? 'upi' : 'cash');
      setMeterPhotoPreview(existingBill.meter_photo_url || '');
    } else {
      setCurrReading(unit.last_meter_reading);
      setAmountPaid('');
      setPayMode('cash');
      setMeterPhoto(null);
      setMeterPhotoPreview('');
    }
    setShowBillModal(true);
  };

  // Handle Photo Selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMeterPhoto(file);
      const url = URL.createObjectURL(file);
      setMeterPhotoPreview(url);
    }
  };

  // Calculations for active modal
  const unitRate = config.elec_rate_per_unit || 9.0;
  const prevReading = selectedUnit ? selectedUnit.last_meter_reading : 0;
  const currentNum = typeof currReading === 'number' ? currReading : prevReading;
  const unitsConsumed = Math.max(0, currentNum - prevReading);
  const elecTotal = Math.round(unitsConsumed * unitRate);
  const baseRent = selectedUnit ? selectedUnit.base_rent : 0;
  const arrears = selectedUnit ? selectedUnit.previous_arrears : 0;
  const totalDue = baseRent + elecTotal + arrears;
  const paidNum = typeof amountPaid === 'number' ? amountPaid : 0;
  const carriedForward = Math.max(0, totalDue - paidNum);

  // WhatsApp Bill URL Generator
  const generateWhatsAppUrl = (unit: PropertyUnit) => {
    const phone = unit.tenant_phone.replace(/\D/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    
    const message = `Namaste ${unit.tenant_name || 'Tenant'},
*Shree Balaji Properties - Bill for ${selectedMonth}*
--------------------------------
• *Unit:* ${unit.unit_number} (${unit.type === 'room' ? 'Room' : 'Commercial Shop'})
• *Base Rent:* ₹${baseRent.toLocaleString('en-IN')}
• *Electricity:* ${unitsConsumed} units (${prevReading} ➔ ${currentNum}) @ ₹${unitRate}/unit = ₹${elecTotal.toLocaleString('en-IN')}
• *Previous Arrears:* ₹${arrears.toLocaleString('en-IN')}
--------------------------------
*TOTAL PAYABLE:* ₹${totalDue.toLocaleString('en-IN')}
${paidNum > 0 ? `• *Amount Received:* ₹${paidNum.toLocaleString('en-IN')} (${payMode.toUpperCase()})\n• *Remaining Balance:* ₹${carriedForward.toLocaleString('en-IN')}` : 'Please complete the payment via Cash or UPI.'}

- Shree Balaji Properties Terminal (sbsuite.in)`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleSaveBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;
    setIsSubmitting(true);

    try {
      let photoUrl = meterPhotoPreview;
      if (meterPhoto) {
        photoUrl = await uploadMeterPhoto(meterPhoto, selectedUnit.unit_number);
      }

      await recordMeterReadingAndBill({
        unit_id: selectedUnit.id,
        billing_month: selectedMonth,
        prev_reading: prevReading,
        curr_reading: currentNum,
        base_rent: baseRent,
        previous_arrears: arrears,
        amount_paid: paidNum,
        payment_mode: payMode,
        meter_photo_url: photoUrl,
      });

      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      setShowBillModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* 1. HERO EARNINGS WIDGET: "Aaj Ki Meri Kamai" */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0E1015] via-[#12141C] to-[#0A0C10] border border-[#232530] p-4 sm:p-5 rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Field Operator: Ritin
              </span>
              <span className="text-slate-500 text-xs">• {selectedMonth}</span>
            </div>
            
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xs text-slate-400 font-medium">आज की मेरी कमाई:</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center">
                <span className="text-[#C5A880] mr-0.5">₹</span>{earnings.todayEarnings.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 bg-[#08090C]/80 border border-[#1B1C22] p-2.5 sm:p-3 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cash in Hand</span>
              <p className="text-base font-bold text-[#DFD3C3]">₹{earnings.cashInHand.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Net Handover</span>
              <p className="text-base font-bold text-blue-400">₹{earnings.netToOwner.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THREE VERTICAL TABS */}
      <div className="flex bg-[#0E0F12] p-1 rounded-xl border border-[#1B1C22]">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'rooms'
              ? 'bg-[#C5A880] text-[#060608] shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>14 Rooms</span>
        </button>

        <button
          onClick={() => setActiveTab('shops')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'shops'
              ? 'bg-[#C5A880] text-[#060608] shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>8 Shops</span>
        </button>

        <button
          onClick={() => setActiveTab('parking')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'parking'
              ? 'bg-[#C5A880] text-[#060608] shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Parking Complex</span>
        </button>
      </div>

      {/* 3. VERTICALS CONTENT */}
      {activeTab === 'parking' ? (
        <SlotGrid isOwner={false} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(activeTab === 'rooms' ? rooms : shops).map((unit) => {
            const bill = bills.find((b) => b.unit_id === unit.id && b.billing_month === selectedMonth);
            const isPaid = bill && bill.payment_status === 'paid';
            const isPartial = bill && bill.payment_status === 'partial';

            return (
              <div
                key={unit.id}
                className="bg-[#0E0F12] border border-[#1B1C22] p-4 rounded-xl shadow-lg hover:border-[#2E313D] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#181920] text-[#C5A880] border border-[#2B2C36]">
                      {unit.unit_number}
                    </span>
                    
                    {unit.is_occupied ? (
                      isPaid ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Paid (₹{bill.amount_paid})
                        </span>
                      ) : isPartial ? (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Partial ({bill.amount_paid}/{bill.total_amount_due})
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Unpaid
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Vacant</span>
                    )}
                  </div>

                  <div className="mt-3">
                    <h4 className="font-serif text-sm font-semibold text-white">
                      {unit.tenant_name || 'No Tenant'}
                    </h4>
                    {unit.tenant_phone ? (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" /> {unit.tenant_phone}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-600 mt-0.5">No contact info</p>
                    )}
                  </div>

                  {/* Financial Metrics */}
                  <div className="mt-3.5 grid grid-cols-3 gap-2 bg-[#08090C] p-2.5 rounded-lg border border-[#17181F] text-center text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Base Rent</span>
                      <p className="font-bold text-slate-200 mt-0.5">₹{unit.base_rent.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Last Meter</span>
                      <p className="font-bold text-[#C5A880] mt-0.5">{unit.last_meter_reading}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Arrears</span>
                      <p className={`font-bold mt-0.5 ${unit.previous_arrears > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        ₹{unit.previous_arrears}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="mt-4 pt-3 border-t border-[#1B1C22] flex items-center gap-2">
                  <button
                    onClick={() => handleOpenBilling(unit)}
                    className="flex-1 bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-[11px] font-bold uppercase tracking-wider py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {bill ? 'Edit Bill' : 'Record Reading'}
                  </button>

                  {unit.tenant_phone && (
                    <a
                      href={generateWhatsAppUrl(unit)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition-colors"
                      title="Send WhatsApp Bill"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. BILLING & SUB-METER MODAL */}
      {showBillModal && selectedUnit && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-[#0E0F12] border border-[#22242D] rounded-2xl p-5 shadow-2xl relative my-auto animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#1B1C22]">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#C5A880]" />
                <div>
                  <h3 className="font-serif font-bold text-slate-200">
                    Record Sub-meter & Bill
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedUnit.unit_number} • {selectedUnit.tenant_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBillModal(false)}
                className="p-1 rounded text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBill} className="mt-4 space-y-4">
              
              {/* Electricity Reading Input */}
              <div className="grid grid-cols-2 gap-3 bg-[#14151B] p-3 rounded-xl border border-[#1B1C22]">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">Previous Reading</label>
                  <p className="text-base font-mono font-bold text-slate-300 mt-1">{prevReading}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#C5A880]">Current Reading *</label>
                  <input
                    type="number"
                    required
                    min={prevReading}
                    placeholder="Enter current"
                    value={currReading}
                    onChange={(e) => setCurrReading(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-1.5 mt-0.5 rounded bg-[#060608] border border-[#2B2C36] font-mono text-sm text-white focus:outline-none focus:border-[#C5A880]"
                    autoFocus
                  />
                </div>
              </div>

              {/* Sub-meter Camera Photo Proof */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center justify-between">
                  <span>Meter Photo Proof</span>
                  <span className="text-slate-600 font-normal">Optional</span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-[#14151B] hover:bg-[#1A1C24] border border-[#23242E] text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Camera className="w-4 h-4 text-[#C5A880]" />
                    {meterPhotoPreview ? 'Change Photo' : 'Snap / Upload Photo'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />

                  {meterPhotoPreview && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#C5A880]/30 shrink-0">
                      <img src={meterPhotoPreview} alt="Meter preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Bill Breakdown Calculator */}
              <div className="p-3.5 rounded-xl bg-[#08090C] border border-[#1B1C22] space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Base Rent:</span>
                  <span className="font-semibold text-slate-200">₹{baseRent.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Electricity ({unitsConsumed} units @ ₹{unitRate}/u):</span>
                  <span className="font-semibold text-[#C5A880]">₹{elecTotal.toLocaleString('en-IN')}</span>
                </div>
                {arrears > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Previous Arrears:</span>
                    <span className="font-semibold text-rose-400">₹{arrears.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#1C1D24] flex justify-between font-bold text-sm">
                  <span className="text-white">Total Amount Due:</span>
                  <span className="text-emerald-400">₹{totalDue.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Recording */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Amount Paid (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2 rounded-lg bg-[#060608] border border-[#2B2C36] font-mono text-sm text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Payment Mode</label>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setPayMode('cash')}
                        className={`py-2 rounded text-xs font-bold uppercase cursor-pointer border ${
                          payMode === 'cash' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-[#060608] text-slate-400 border-[#1B1C22]'
                        }`}
                      >
                        Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayMode('upi')}
                        className={`py-2 rounded text-xs font-bold uppercase cursor-pointer border ${
                          payMode === 'upi' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-[#060608] text-slate-400 border-[#1B1C22]'
                        }`}
                      >
                        UPI
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remaining Arrears Notice */}
                {carriedForward > 0 && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between">
                    <span>Remaining Balance Carry Forward:</span>
                    <span className="font-bold">₹{carriedForward.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                {selectedUnit.tenant_phone && (
                  <a
                    href={generateWhatsAppUrl(selectedUnit)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#C5A880] hover:bg-[#DFD3C3] disabled:opacity-50 text-[#060608] text-xs font-bold uppercase tracking-wider py-3 rounded-lg transition-colors cursor-pointer shadow-lg"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm & Save Bill'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
