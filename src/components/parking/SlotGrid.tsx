'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ParkingSlot } from '@/types';
import { 
  Car, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  PlusCircle, 
  ShieldCheck, 
  IndianRupee,
  Phone,
  User,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SlotGridProps {
  isOwner?: boolean;
}

export default function SlotGrid({ isOwner = false }: SlotGridProps) {
  const { 
    config, 
    parkingSlots, 
    dailyParkingLogs, 
    recordDailyParking, 
    renewMonthlyParking 
  } = useAppStore();

  // Modals state
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);

  // Daily parking form
  const [dailyVehicleNo, setDailyVehicleNo] = useState('');
  const [dailyVehicleType, setDailyVehicleType] = useState('4-wheeler');
  const [dailyPayMode, setDailyPayMode] = useState<'cash' | 'upi'>('cash');
  const [isSubmittingDaily, setIsSubmittingDaily] = useState(false);

  // Monthly renew form
  const [monthlyVehicleNo, setMonthlyVehicleNo] = useState('');
  const [monthlyOwnerName, setMonthlyOwnerName] = useState('');
  const [monthlyOwnerPhone, setMonthlyOwnerPhone] = useState('');
  const [monthlyPayMode, setMonthlyPayMode] = useState<'cash' | 'upi'>('cash');
  const [isSubmittingMonthly, setIsSubmittingMonthly] = useState(false);

  // Filter Monthly vs Daily slots
  const monthlySlots = parkingSlots.filter((s) => s.mode === 'monthly');
  const dailySlots = parkingSlots.filter((s) => s.mode === 'daily');

  const todayStr = new Date().toISOString().split('T')[0];
  const dailyLogsToday = dailyParkingLogs.filter((l) => l.in_time.startsWith(todayStr));

  const handleOpenRenew = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setMonthlyVehicleNo(slot.vehicle_number || '');
    setMonthlyOwnerName(slot.owner_name || '');
    setMonthlyOwnerPhone(slot.owner_phone || '');
    setShowRenewModal(true);
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setIsSubmittingMonthly(true);

    try {
      await renewMonthlyParking({
        slot_id: selectedSlot.id,
        vehicle_number: monthlyVehicleNo,
        owner_name: monthlyOwnerName,
        owner_phone: monthlyOwnerPhone,
        payment_mode: monthlyPayMode,
      });

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      setShowRenewModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to renew parking pass.');
    } finally {
      setIsSubmittingMonthly(false);
    }
  };

  const handleDailySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyVehicleNo.trim()) return;
    setIsSubmittingDaily(true);

    try {
      await recordDailyParking({
        vehicle_number: dailyVehicleNo,
        vehicle_type: dailyVehicleType,
        payment_mode: dailyPayMode,
      });

      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
      setDailyVehicleNo('');
      setShowDailyModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to log daily vehicle.');
    } finally {
      setIsSubmittingDaily(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0E0F12] border border-[#1B1C22] p-3.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monthly Passes</span>
            <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
          </div>
          <p className="text-xl font-bold text-white mt-1">
            {monthlySlots.filter((s) => s.is_occupied).length} <span className="text-xs text-slate-500 font-normal">/ {monthlySlots.length} Active</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">₹{config.monthly_parking_fee}/mo (₹{config.monthly_manager_cut} to Ritin)</p>
        </div>

        <div className="bg-[#0E0F12] border border-[#1B1C22] p-3.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Daily Walk-ins Today</span>
            <Car className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400 mt-1">{dailyLogsToday.length} Vehicles</p>
          <p className="text-[10px] text-slate-500 mt-0.5">₹{config.daily_parking_fee}/entry (80/20 Split)</p>
        </div>

        <div className="bg-[#0E0F12] border border-[#1B1C22] p-3.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today's Total Cut</span>
            <IndianRupee className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-white mt-1">
            ₹{(dailyLogsToday.length * config.daily_parking_fee).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Owner: ₹{Math.round(dailyLogsToday.length * config.daily_parking_fee * config.daily_owner_ratio)} | Ritin: ₹{Math.round(dailyLogsToday.length * config.daily_parking_fee * config.daily_manager_ratio)}
          </p>
        </div>

        <div className="bg-[#0E0F12] border border-[#1B1C22] p-3.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quick Action</span>
          <button
            onClick={() => setShowDailyModal(true)}
            className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-[11px] font-bold uppercase tracking-wider py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            + Park Vehicle
          </button>
        </div>
      </div>

      {/* SECTION 1: Monthly Parking Matrix */}
      <div className="bg-[#0E0F12] border border-[#1B1C22] p-4 sm:p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#C5A880]" />
            <h3 className="text-sm sm:text-base font-serif font-semibold text-slate-200">
              Monthly Pass Matrix (₹{config.monthly_parking_fee}/mo)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-[#14151B] px-2.5 py-1 rounded-md border border-[#1B1C22]">
            Split: ₹{config.monthly_owner_cut} Owner / ₹{config.monthly_manager_cut} Ritin
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {monthlySlots.map((slot) => {
            const isExpired = slot.valid_until && new Date(slot.valid_until) < new Date();
            const daysLeft = slot.valid_until
              ? Math.ceil((new Date(slot.valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div
                key={slot.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  slot.is_occupied
                    ? isExpired
                      ? 'bg-rose-950/10 border-rose-800/40'
                      : 'bg-[#121318] border-[#22242D]'
                    : 'bg-[#0A0B0E] border-dashed border-[#1B1C22]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#C5A880] bg-[#C5A880]/10 px-2 py-0.5 rounded border border-[#C5A880]/20">
                    {slot.slot_number}
                  </span>
                  {slot.is_occupied ? (
                    isExpired ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        <AlertCircle className="w-3 h-3" /> Expired
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> {daysLeft}d Left
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium uppercase">Vacant Slot</span>
                  )}
                </div>

                <div className="mt-3 space-y-1">
                  <p className="font-mono text-sm font-bold text-white tracking-wide">
                    {slot.vehicle_number || 'No Vehicle Assigned'}
                  </p>
                  <p className="text-xs text-slate-300 truncate">
                    {slot.owner_name || '—'}
                  </p>
                  {slot.owner_phone && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {slot.owner_phone}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-[#1E2028] flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {slot.valid_until ? `Valid: ${slot.valid_until}` : 'Ready to assign'}
                  </span>
                  <button
                    onClick={() => handleOpenRenew(slot)}
                    className="px-2.5 py-1 rounded bg-[#C5A880]/15 hover:bg-[#C5A880]/25 text-[#DFD3C3] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {slot.is_occupied ? 'Renew' : 'Assign'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Daily Walk-In Parking Terminal */}
      <div className="bg-[#0E0F12] border border-[#1B1C22] p-4 sm:p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-serif font-semibold text-slate-200">
              Daily Flexible Parking Bays (₹{config.daily_parking_fee}/entry)
            </h3>
          </div>
          <button
            onClick={() => setShowDailyModal(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Check-In Vehicle
          </button>
        </div>

        {/* Live Daily Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1B1C22] text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-3">Vehicle No</th>
                <th className="py-2.5 px-3">Time In</th>
                <th className="py-2.5 px-3">Fee</th>
                <th className="py-2.5 px-3">Split Breakdown</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17181F]">
              {dailyLogsToday.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-600 font-light">
                    No daily parking entries logged today. Click '+ Check-In Vehicle' above.
                  </td>
                </tr>
              ) : (
                dailyLogsToday.map((log) => (
                  <tr key={log.id} className="hover:bg-[#13141A] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-white flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-slate-500" />
                      {log.vehicle_number}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(log.in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-400">
                      ₹{log.fee_charged}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      Owner: ₹{log.owner_cut} | Ritin: ₹{log.manager_cut}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        log.payment_mode === 'upi' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {log.payment_mode}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Parked
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Quick Daily Parking Check-In */}
      {showDailyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0E0F12] border border-[#22242D] rounded-2xl p-5 shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#1B1C22]">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif font-bold text-slate-200">Daily Vehicle Check-In</h3>
              </div>
              <button
                onClick={() => setShowDailyModal(false)}
                className="p-1 rounded text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDailySubmit} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Vehicle Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL 3C AB 1234"
                  value={dailyVehicleNo}
                  onChange={(e) => setDailyVehicleNo(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-lg bg-[#060608] border border-[#1B1C22] text-white font-mono text-sm focus:outline-none focus:border-[#C5A880]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Vehicle Type</label>
                  <select
                    value={dailyVehicleType}
                    onChange={(e) => setDailyVehicleType(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#060608] border border-[#1B1C22] text-white text-xs focus:outline-none focus:border-[#C5A880]"
                  >
                    <option value="4-wheeler">Car (4-Wheeler)</option>
                    <option value="2-wheeler">Bike / Scooter</option>
                    <option value="commercial">Commercial Van</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Payment Mode</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDailyPayMode('cash')}
                      className={`py-2 rounded text-xs font-bold uppercase tracking-wider cursor-pointer border ${
                        dailyPayMode === 'cash' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-[#060608] text-slate-400 border-[#1B1C22]'
                      }`}
                    >
                      Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setDailyPayMode('upi')}
                      className={`py-2 rounded text-xs font-bold uppercase tracking-wider cursor-pointer border ${
                        dailyPayMode === 'upi' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-[#060608] text-slate-400 border-[#1B1C22]'
                      }`}
                    >
                      UPI
                    </button>
                  </div>
                </div>
              </div>

              {/* Realtime Split Preview Box */}
              <div className="p-3 rounded-lg bg-[#14151B] border border-[#1B1C22] space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Entry Fee:</span>
                  <span className="font-bold text-white">₹{config.daily_parking_fee}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Owner Cut (80%):</span>
                  <span className="font-bold text-blue-400">₹{Math.round(config.daily_parking_fee * config.daily_owner_ratio)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ritin Commission (20%):</span>
                  <span className="font-bold text-emerald-400">₹{Math.round(config.daily_parking_fee * config.daily_manager_ratio)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingDaily}
                className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] disabled:opacity-50 text-[#060608] text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors cursor-pointer shadow-lg"
              >
                {isSubmittingDaily ? 'Logging...' : 'Confirm Vehicle Check-In'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Monthly Pass Renewal / Assignment */}
      {showRenewModal && selectedSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0E0F12] border border-[#22242D] rounded-2xl p-5 shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#1B1C22]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C5A880]" />
                <h3 className="font-serif font-bold text-slate-200">
                  Renew Monthly Pass ({selectedSlot.slot_number})
                </h3>
              </div>
              <button
                onClick={() => setShowRenewModal(false)}
                className="p-1 rounded text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Vehicle Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL 3C AB 1234"
                  value={monthlyVehicleNo}
                  onChange={(e) => setMonthlyVehicleNo(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-lg bg-[#060608] border border-[#1B1C22] text-white font-mono text-sm focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Owner Name / Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma (R-101)"
                    value={monthlyOwnerName}
                    onChange={(e) => setMonthlyOwnerName(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#060608] border border-[#1B1C22] text-white text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Owner Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={monthlyOwnerPhone}
                    onChange={(e) => setMonthlyOwnerPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#060608] border border-[#1B1C22] text-white text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMonthlyPayMode('cash')}
                    className={`py-2 rounded text-xs font-bold uppercase tracking-wider cursor-pointer border ${
                      monthlyPayMode === 'cash' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-[#060608] text-slate-400 border-[#1B1C22]'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthlyPayMode('upi')}
                    className={`py-2 rounded text-xs font-bold uppercase tracking-wider cursor-pointer border ${
                      monthlyPayMode === 'upi' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-[#060608] text-slate-400 border-[#1B1C22]'
                    }`}
                  >
                    UPI
                  </button>
                </div>
              </div>

              {/* Monthly Split Box */}
              <div className="p-3 rounded-lg bg-[#14151B] border border-[#1B1C22] space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Monthly Fee (30 Days):</span>
                  <span className="font-bold text-white">₹{config.monthly_parking_fee}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Owner Cut:</span>
                  <span className="font-bold text-blue-400">₹{config.monthly_owner_cut}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ritin Commission:</span>
                  <span className="font-bold text-emerald-400">₹{config.monthly_manager_cut}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingMonthly}
                className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] disabled:opacity-50 text-[#060608] text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors cursor-pointer shadow-lg"
              >
                {isSubmittingMonthly ? 'Renewing...' : 'Confirm 30-Day Renewal'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
