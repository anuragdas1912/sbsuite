'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { PropertyUnit, MasterConfig } from '@/types';
import SlotGrid from '@/components/parking/SlotGrid';
import { 
  Building2, 
  TrendingUp, 
  IndianRupee, 
  ShieldCheck, 
  Users, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Home, 
  Store, 
  Car, 
  FileText, 
  Edit3, 
  Save, 
  X,
  History,
  Phone,
  Receipt,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OwnerDashboard() {
  const { 
    config, 
    units, 
    bills, 
    parkingSlots, 
    dailyParkingLogs, 
    settlements, 
    selectedMonth, 
    updateMasterConfig, 
    updateUnit, 
    settleHandover, 
    getManagerEarningsSummary 
  } = useAppStore();

  const [activeSection, setActiveSection] = useState<'telemetry' | 'units' | 'parking' | 'tariffs' | 'settlements'>('telemetry');
  
  // Master Config Form
  const [elecRate, setElecRate] = useState(config.elec_rate_per_unit);
  const [monthlyFee, setMonthlyFee] = useState(config.monthly_parking_fee);
  const [monthlyOwnerCut, setMonthlyOwnerCut] = useState(config.monthly_owner_cut);
  const [monthlyManagerCut, setMonthlyManagerCut] = useState(config.monthly_manager_cut);
  const [dailyFee, setDailyFee] = useState(config.daily_parking_fee);
  const [dailyOwnerRatio, setDailyOwnerRatio] = useState(config.daily_owner_ratio * 100);
  const [dailyManagerRatio, setDailyManagerRatio] = useState(config.daily_manager_ratio * 100);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Unit Editor Modal
  const [editingUnit, setEditingUnit] = useState<PropertyUnit | null>(null);
  const [editTenantName, setEditTenantName] = useState('');
  const [editTenantPhone, setEditTenantPhone] = useState('');
  const [editBaseRent, setEditBaseRent] = useState<number>(0);
  const [editArrears, setEditArrears] = useState<number>(0);
  const [editIsOccupied, setEditIsOccupied] = useState(true);
  const [isSavingUnit, setIsSavingUnit] = useState(false);

  // Settlement Modal
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleNotes, setSettleNotes] = useState('');
  const [isSettling, setIsSettling] = useState(false);

  const summary = getManagerEarningsSummary();

  // Telemetry Calculations
  const rooms = units.filter((u) => u.type === 'room');
  const shops = units.filter((u) => u.type === 'shop');
  
  const occupiedRooms = rooms.filter((r) => r.is_occupied).length;
  const occupiedShops = shops.filter((s) => s.is_occupied).length;
  const activeParking = parkingSlots.filter((p) => p.is_occupied).length;

  const totalRentBilled = bills.reduce((acc, b) => acc + (b.total_amount_due || 0), 0);
  const totalRentCollected = bills.reduce((acc, b) => acc + (b.amount_paid || 0), 0);
  const totalArrears = units.reduce((acc, u) => acc + (u.previous_arrears || 0), 0);

  const totalDailyParking = dailyParkingLogs.reduce((acc, l) => acc + (l.fee_charged || 0), 0);
  const totalMonthlyParking = parkingSlots.filter((p) => p.mode === 'monthly' && p.is_occupied).length * config.monthly_parking_fee;
  const totalGrossRevenue = totalRentCollected + totalDailyParking + totalMonthlyParking;

  // Handle Master Config Save
  const handleSaveTariffs = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      await updateMasterConfig({
        elec_rate_per_unit: Number(elecRate),
        monthly_parking_fee: Number(monthlyFee),
        monthly_owner_cut: Number(monthlyOwnerCut),
        monthly_manager_cut: Number(monthlyManagerCut),
        daily_parking_fee: Number(dailyFee),
        daily_owner_ratio: Number(dailyOwnerRatio) / 100,
        daily_manager_ratio: Number(dailyManagerRatio) / 100,
      });
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      alert('Master tariffs updated successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to update tariffs.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Open Unit Editor
  const handleEditUnit = (unit: PropertyUnit) => {
    setEditingUnit(unit);
    setEditTenantName(unit.tenant_name || '');
    setEditTenantPhone(unit.tenant_phone || '');
    setEditBaseRent(unit.base_rent);
    setEditArrears(unit.previous_arrears);
    setEditIsOccupied(unit.is_occupied);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    setIsSavingUnit(true);
    try {
      await updateUnit(editingUnit.id, {
        tenant_name: editTenantName,
        tenant_phone: editTenantPhone,
        base_rent: editBaseRent,
        previous_arrears: editArrears,
        is_occupied: editIsOccupied,
      });
      setEditingUnit(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update unit.');
    } finally {
      setIsSavingUnit(false);
    }
  };

  // Handle Settlement
  const handleConfirmSettlement = async () => {
    setIsSettling(true);
    try {
      await settleHandover(settleNotes);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      setShowSettleModal(false);
      setSettleNotes('');
    } catch (err) {
      console.error(err);
      alert('Failed to settle handover.');
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. EXECUTIVE COMMAND HEADER & SECTION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1B1C22] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
              Executive Telemetry
            </h2>
            <span className="px-2 py-0.5 rounded bg-[#C5A880]/15 text-[#DFD3C3] text-[10px] font-bold uppercase tracking-wider border border-[#C5A880]/30">
              Owner Mode
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full oversight of 14 Rooms, 8 Shops, Parking Complex & Field Reconciliations.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#0E0F12] p-1 rounded-xl border border-[#1B1C22] no-scrollbar overflow-x-auto text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveSection('telemetry')}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'telemetry' ? 'bg-[#C5A880] text-[#060608]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Telemetry
          </button>
          <button
            onClick={() => setActiveSection('units')}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'units' ? 'bg-[#C5A880] text-[#060608]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Rooms & Shops ({units.length})
          </button>
          <button
            onClick={() => setActiveSection('parking')}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'parking' ? 'bg-[#C5A880] text-[#060608]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Parking
          </button>
          <button
            onClick={() => setActiveSection('tariffs')}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'tariffs' ? 'bg-[#C5A880] text-[#060608]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Master Tariffs
          </button>
          <button
            onClick={() => setActiveSection('settlements')}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'settlements' ? 'bg-[#C5A880] text-[#060608]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Settlements ({settlements.length})
          </button>
        </div>
      </div>

      {/* 2. SECTION: TELEMETRY & RECONCILIATION */}
      {activeSection === 'telemetry' && (
        <div className="space-y-6">
          
          {/* Top 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Total Gross Collections */}
            <div className="bg-[#0E0F12] border border-[#1B1C22] p-4 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Gross Collected</span>
                <IndianRupee className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white mt-1.5">
                ₹{totalGrossRevenue.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Rooms + Shops + Parking combined
              </p>
            </div>

            {/* Total Arrears / Pending Dues */}
            <div className="bg-[#0E0F12] border border-[#1B1C22] p-4 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Arrears</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-bold text-rose-400 mt-1.5">
                ₹{totalArrears.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Outstanding carry forward across tenants
              </p>
            </div>

            {/* Occupancy Rate */}
            <div className="bg-[#0E0F12] border border-[#1B1C22] p-4 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Occupancy</span>
                <Users className="w-4 h-4 text-[#C5A880]" />
              </div>
              <p className="text-2xl font-bold text-white mt-1.5">
                {occupiedRooms + occupiedShops} <span className="text-sm font-normal text-slate-500">/ {units.length}</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {occupiedRooms}/14 Rooms • {occupiedShops}/8 Shops
              </p>
            </div>

            {/* Live Cash in Ritin's Hand */}
            <div className="bg-[#0E0F12] border border-[#1B1C22] p-4 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Cash in Hand (Ritin)</span>
                <Receipt className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-400 mt-1.5">
                ₹{summary.cashInHand.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Net to Handover: ₹{summary.netToOwner.toLocaleString('en-IN')}
              </p>
            </div>

          </div>

          {/* Manager Settlement & Handover Audit Banner */}
          <div className="bg-gradient-to-r from-[#0E1015] to-[#141620] border border-[#2B2D3A] p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C5A880]" />
                <h3 className="font-serif font-bold text-base text-white">
                  Field Handover Reconciliation (Ritin)
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Audit live cash collection against Ritin's auto-computed commission.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Total Cash Collected:</span>
                  <p className="font-bold text-white">₹{summary.cashInHand.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Ritin's Commission:</span>
                  <p className="font-bold text-emerald-400">₹{summary.todayEarnings.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Net Payable to Owner:</span>
                  <p className="font-bold text-[#C5A880] text-sm">₹{summary.netToOwner.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSettleModal(true)}
              className="px-5 py-3 rounded-xl bg-[#C5A880] hover:bg-[#DFD3C3] text-[#060608] text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Handover Settled
            </button>
          </div>

          {/* Quick Verticals Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Rooms Overview */}
            <div className="bg-[#0E0F12] border border-[#1B1C22] p-4 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-serif font-semibold text-white flex items-center gap-1.5 text-sm">
                  <Home className="w-4 h-4 text-[#C5A880]" /> 14 Residential Rooms
                </span>
                <span className="text-xs text-slate-500">{occupiedRooms}/14 Occupied</span>
              </div>
              <div className="space-y-2">
                {rooms.slice(0, 5).map((room) => (
                  <div key={room.id} className="flex items-center justify-between text-xs py-1.5 border-b border-[#17181F]">
                    <span className="font-mono text-[#C5A880] font-bold">{room.unit_number}</span>
                    <span className="text-slate-300">{room.tenant_name || 'Vacant'}</span>
                    <span className="font-mono text-slate-400">₹{room.base_rent}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shops Overview */}
            <div className="bg-[#0E0F12] border border-[#1B1C22] p-4 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-serif font-semibold text-white flex items-center gap-1.5 text-sm">
                  <Store className="w-4 h-4 text-[#C5A880]" /> 8 Commercial Shops
                </span>
                <span className="text-xs text-slate-500">{occupiedShops}/8 Occupied</span>
              </div>
              <div className="space-y-2">
                {shops.slice(0, 5).map((shop) => (
                  <div key={shop.id} className="flex items-center justify-between text-xs py-1.5 border-b border-[#17181F]">
                    <span className="font-mono text-[#C5A880] font-bold">{shop.unit_number}</span>
                    <span className="text-slate-300">{shop.tenant_name || 'Vacant'}</span>
                    <span className="font-mono text-slate-400">₹{shop.base_rent}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 3. SECTION: FULL UNITS DIRECTORY */}
      {activeSection === 'units' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-white">
              Property & Unit Directory (22 Total)
            </h3>
            <span className="text-xs text-slate-400">Click &apos;Edit Unit&apos; to change base rent or tenant</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {units.map((unit) => (
              <div
                key={unit.id}
                className="bg-[#0E0F12] border border-[#1B1C22] p-4 rounded-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#C5A880] bg-[#17181F] px-2 py-0.5 rounded border border-[#2B2C36]">
                      {unit.unit_number} ({unit.type.toUpperCase()})
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      unit.is_occupied ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {unit.is_occupied ? 'Occupied' : 'Vacant'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="font-semibold text-white text-sm">{unit.tenant_name || '—'}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-500" /> {unit.tenant_phone || 'No phone'}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 bg-[#08090C] p-2 rounded-lg text-xs border border-[#17181F]">
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Base Rent</span>
                      <p className="font-bold text-slate-200 mt-0.5">₹{unit.base_rent.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Arrears</span>
                      <p className={`font-bold mt-0.5 ${unit.previous_arrears > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        ₹{unit.previous_arrears}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleEditUnit(unit)}
                  className="mt-3 w-full py-1.5 rounded-lg bg-[#14151B] hover:bg-[#1C1E26] border border-[#23242E] text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#C5A880]" />
                  Edit Unit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SECTION: PARKING MATRIX */}
      {activeSection === 'parking' && (
        <SlotGrid isOwner={true} />
      )}

      {/* 5. SECTION: MASTER TARIFFS CONFIG */}
      {activeSection === 'tariffs' && (
        <div className="max-w-2xl bg-[#0E0F12] border border-[#1B1C22] p-5 sm:p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 pb-4 border-b border-[#1B1C22]">
            <Sliders className="w-5 h-5 text-[#C5A880]" />
            <div>
              <h3 className="font-serif font-bold text-white text-base">Master Tariffs & Split Configuration</h3>
              <p className="text-xs text-slate-400">These rates apply across all units and parking logs dynamically.</p>
            </div>
          </div>

          <form onSubmit={handleSaveTariffs} className="mt-5 space-y-5">
            
            {/* Electricity Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Electricity Sub-meter Rate (₹ per Unit)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={elecRate}
                onChange={(e) => setElecRate(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg bg-[#060608] border border-[#1B1C22] font-mono text-sm text-white focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            {/* Monthly Parking Splits */}
            <div className="pt-3 border-t border-[#17181F] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                Monthly Parking Settings (₹700 Standard)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Total Pass Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(Number(e.target.value))}
                    className="w-full p-2 rounded bg-[#060608] border border-[#1B1C22] text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Owner Cut (₹)</label>
                  <input
                    type="number"
                    required
                    value={monthlyOwnerCut}
                    onChange={(e) => setMonthlyOwnerCut(Number(e.target.value))}
                    className="w-full p-2 rounded bg-[#060608] border border-[#1B1C22] text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Ritin Cut (₹)</label>
                  <input
                    type="number"
                    required
                    value={monthlyManagerCut}
                    onChange={(e) => setMonthlyManagerCut(Number(e.target.value))}
                    className="w-full p-2 rounded bg-[#060608] border border-[#1B1C22] text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Daily Parking Splits */}
            <div className="pt-3 border-t border-[#17181F] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                Daily Parking Settings (80% Owner / 20% Manager)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Daily Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={dailyFee}
                    onChange={(e) => setDailyFee(Number(e.target.value))}
                    className="w-full p-2 rounded bg-[#060608] border border-[#1B1C22] text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Owner Ratio (%)</label>
                  <input
                    type="number"
                    required
                    value={dailyOwnerRatio}
                    onChange={(e) => setDailyOwnerRatio(Number(e.target.value))}
                    className="w-full p-2 rounded bg-[#060608] border border-[#1B1C22] text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Manager Ratio (%)</label>
                  <input
                    type="number"
                    required
                    value={dailyManagerRatio}
                    onChange={(e) => setDailyManagerRatio(Number(e.target.value))}
                    className="w-full p-2 rounded bg-[#060608] border border-[#1B1C22] text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingConfig}
              className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] disabled:opacity-50 text-[#060608] text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2 mt-4"
            >
              <Save className="w-4 h-4" />
              {isSavingConfig ? 'Updating...' : 'Save Master Tariffs'}
            </button>
          </form>
        </div>
      )}

      {/* 6. SECTION: SETTLEMENTS LEDGER */}
      {activeSection === 'settlements' && (
        <div className="bg-[#0E0F12] border border-[#1B1C22] p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
              <History className="w-5 h-5 text-[#C5A880]" />
              Settlement & Handover History
            </h3>
            <span className="text-xs text-slate-500">{settlements.length} Audited Logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1B1C22] text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Manager</th>
                  <th className="py-2.5 px-3">Total Collected</th>
                  <th className="py-2.5 px-3">Commission Deducted</th>
                  <th className="py-2.5 px-3">Net Received (Owner)</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17181F]">
                {settlements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-600">
                      No settlements recorded yet. Use &apos;Mark Handover Settled&apos; on Telemetry tab.
                    </td>
                  </tr>
                ) : (
                  settlements.map((set) => (
                    <tr key={set.id} className="hover:bg-[#13141A] transition-colors">
                      <td className="py-3 px-3 text-slate-400">
                        {new Date(set.created_at || '').toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">{set.manager_name}</td>
                      <td className="py-3 px-3 font-mono text-slate-300">₹{set.total_collected.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-mono text-emerald-400">₹{set.manager_commission.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#C5A880]">₹{set.net_to_owner.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {set.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Edit Unit Details */}
      {editingUnit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0E0F12] border border-[#22242D] rounded-2xl p-5 shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#1B1C22]">
              <h3 className="font-serif font-bold text-white">Edit Unit: {editingUnit.unit_number}</h3>
              <button onClick={() => setEditingUnit(null)} className="text-slate-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Tenant Name</label>
                <input
                  type="text"
                  value={editTenantName}
                  onChange={(e) => setEditTenantName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full p-2.5 rounded bg-[#060608] border border-[#1B1C22] text-white text-xs focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Tenant Phone</label>
                <input
                  type="tel"
                  value={editTenantPhone}
                  onChange={(e) => setEditTenantPhone(e.target.value)}
                  placeholder="10-digit phone"
                  className="w-full p-2.5 rounded bg-[#060608] border border-[#1B1C22] text-white text-xs focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Base Rent (₹)</label>
                  <input
                    type="number"
                    required
                    value={editBaseRent}
                    onChange={(e) => setEditBaseRent(Number(e.target.value))}
                    className="w-full p-2.5 rounded bg-[#060608] border border-[#1B1C22] text-white text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Arrears Balance (₹)</label>
                  <input
                    type="number"
                    value={editArrears}
                    onChange={(e) => setEditArrears(Number(e.target.value))}
                    className="w-full p-2.5 rounded bg-[#060608] border border-[#1B1C22] text-white text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="occupiedCheck"
                  checked={editIsOccupied}
                  onChange={(e) => setEditIsOccupied(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#C5A880] cursor-pointer"
                />
                <label htmlFor="occupiedCheck" className="text-xs text-slate-300 cursor-pointer">
                  Unit is currently occupied
                </label>
              </div>

              <button
                type="submit"
                disabled={isSavingUnit}
                className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] disabled:opacity-50 text-[#060608] text-xs font-bold uppercase tracking-widest py-3 rounded-lg transition-colors cursor-pointer shadow-lg mt-2"
              >
                {isSavingUnit ? 'Saving...' : 'Save Unit Details'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Settle Handover Confirmation */}
      {showSettleModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0E0F12] border border-[#22242D] rounded-2xl p-5 shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#1B1C22]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif font-bold text-white">Reconcile & Settle Handover</h3>
              </div>
              <button onClick={() => setShowSettleModal(false)} className="text-slate-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="bg-[#14151B] p-3 rounded-xl border border-[#1B1C22] space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Manager Name:</span>
                  <span className="font-bold text-white">Ritin</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Cash in Hand:</span>
                  <span className="font-bold text-white">₹{summary.cashInHand.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ritin&apos;s Commission:</span>
                  <span className="font-bold text-emerald-400">₹{summary.todayEarnings.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-[#1F212B] flex justify-between font-bold text-sm">
                  <span className="text-[#C5A880]">Net Cash Handed to Owner:</span>
                  <span className="text-white">₹{summary.netToOwner.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Settlement Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Cleared full day cash handover"
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#060608] border border-[#1B1C22] text-white text-xs focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <button
                onClick={handleConfirmSettlement}
                disabled={isSettling}
                className="w-full bg-[#C5A880] hover:bg-[#DFD3C3] disabled:opacity-50 text-[#060608] text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-colors cursor-pointer shadow-lg mt-3"
              >
                {isSettling ? 'Settling...' : 'Confirm Settlement & Clear Balance'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
