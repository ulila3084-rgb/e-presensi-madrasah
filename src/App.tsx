import React, { useState, useEffect } from "react";
import ClockWidget from "./components/ClockWidget";
import LoginScreen from "./components/LoginScreen";
import DashboardTab from "./components/DashboardTab";
import InputTab from "./components/InputTab";
import ReportTab from "./components/ReportTab";
import SettingsTab from "./components/SettingsTab";
import { getDashboardDataLocal, saveBulkAttendanceLocal, getReportLocal, getSyncUrl } from "./localDb";
import { getHariFromDate, BULAN_LIST, APP_TITLE, SCHOOL_SUBTITLE } from "./constants";
import { DashboardData, ReportData, AttendanceRecord } from "./types";
import { LayoutDashboard, ClipboardEdit, FileSpreadsheet, Settings, LogOut, CheckCircle, Wifi, WifiOff } from "lucide-react";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("mmu_logged_in") === "true";
  });

  const [activeTab, setActiveTab] = useState<"dashboard" | "input" | "laporan" | "settings">("dashboard");

  // Filters State
  const [dateISO, setDateISO] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [hari, setHari] = useState<string>(() => {
    return getHariFromDate(new Date().toISOString().slice(0, 10));
  });
  const [pekan, setPekan] = useState<number>(1);
  const [bulan, setBulan] = useState<string>(() => {
    const d = new Date();
    return BULAN_LIST[d.getMonth()];
  });
  const [tahun, setTahun] = useState<string>(() => {
    return new Date().getFullYear().toString();
  });

  // Core Data States
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);

  // Check if sync URL is configured
  useEffect(() => {
    const url = getSyncUrl();
    setSyncEnabled(!!url);
  }, [activeTab]);

  // Synchronize 'hari' when 'dateISO' changes
  const handleDateChange = (newDate: string) => {
    setDateISO(newDate);
    const calculatedHari = getHariFromDate(newDate);
    setHari(calculatedHari);
  };

  // Load dashboard data whenever date, day, or week filter changes
  const loadData = async () => {
    setIsSyncing(true);
    try {
      const syncUrl = getSyncUrl();
      if (syncUrl) {
        // Attempt Apps Script API call if configured
        const payload = {
          url: syncUrl,
          payload: { dateISO, hari, pekan }
        };

        const response = await fetch("/api/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const cloudData = await response.json();
          if (cloudData && cloudData.mengajar) {
            setDashboardData(cloudData);
            // Also cache to local database for seamless offline access
            saveBulkAttendanceLocal(cloudData.mengajar.concat(cloudData.piket));
            setIsSyncing(false);
            return;
          }
        }
      }

      // Local Database fallback
      const localData = getDashboardDataLocal({ dateISO, hari, pekan });
      setDashboardData(localData);
    } catch (err) {
      console.error("Gagal sinkronisasi, memuat data lokal:", err);
      const localData = getDashboardDataLocal({ dateISO, hari, pekan });
      setDashboardData(localData);
    } finally {
      setIsSyncing(false);
    }
  };

  // Load report data
  const loadReport = async (mode: "harian" | "pekanan" | "bulanan" = "harian") => {
    setIsSyncing(true);
    try {
      const syncUrl = getSyncUrl();
      if (syncUrl) {
        // Let's call report proxy
        const reportFilter = {
          mode,
          dateISO,
          hari,
          pekan,
          bulan,
          tahun
        };

        const response = await fetch("/api/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: syncUrl,
            payload: { action: "getReport", filter: reportFilter }
          })
        });

        if (response.ok) {
          const cloudReport = await response.json();
          if (cloudReport && cloudReport.rows) {
            setReportData(cloudReport);
            setIsSyncing(false);
            return;
          }
        }
      }

      // Local Database Fallback
      const localReport = getReportLocal({
        mode,
        dateISO,
        hari,
        pekan,
        bulan,
        tahun
      });
      setReportData(localReport);
    } catch (err) {
      console.error("Gagal sinkronisasi laporan, memuat rekap lokal:", err);
      const localReport = getReportLocal({
        mode,
        dateISO,
        hari,
        pekan,
        bulan,
        tahun
      });
      setReportData(localReport);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, dateISO, hari, pekan]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "laporan") {
      loadReport(reportData?.mode || "harian");
    }
  }, [isAuthenticated, activeTab, dateISO, hari, pekan, bulan, tahun]);

  const handleLoginSuccess = () => {
    localStorage.setItem("mmu_logged_in", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar dari aplikasi?");
    if (confirmLogout) {
      localStorage.removeItem("mmu_logged_in");
      setIsAuthenticated(false);
    }
  };

  const handleSaveAttendance = async (records: AttendanceRecord[]) => {
    setIsSyncing(true);
    try {
      // 1. Save to local storage instantly
      saveBulkAttendanceLocal(records);

      // 2. Sync to cloud Spreadsheet if configured
      const syncUrl = getSyncUrl();
      if (syncUrl) {
        const payload = {
          url: syncUrl,
          payload: { action: "saveBulkAttendance", rows: records }
        };

        const response = await fetch("/api/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("Koneksi server gagal");
        }

        alert("Presensi berhasil disinkronkan ke Spreadsheet Google!");
      } else {
        alert("Presensi berhasil disimpan secara lokal (Perangkat Ini)!");
      }

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Gagal sinkronisasi awan. Data Anda aman disimpan secara lokal di HP.");
      // Fallback reload
      await loadData();
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800">
      {/* HEADER SECTION */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 no-print shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-extrabold text-base sm:text-lg border border-teal-100 shadow-sm">
              MMU
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-800">
                {APP_TITLE}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">
                  {SCHOOL_SUBTITLE}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase">
                  {syncEnabled ? (
                    <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-100">
                      <Wifi className="w-3 h-3" /> Sheets Aktif
                    </span>
                  ) : (
                    <span className="text-teal-650 bg-teal-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-teal-100">
                      <WifiOff className="w-3 h-3" /> Mode Lokal
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <ClockWidget />
        </div>
      </header>

      {/* FILTER BOX */}
      <div className="bg-white border-b border-slate-100 py-4 no-print shadow-xs relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Tanggal Presensi
              </label>
              <input
                type="date"
                value={dateISO}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Hari Pembelajaran
              </label>
              <select
                value={hari}
                onChange={(e) => setHari(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                {["SABTU", "AHAD", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"].map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Pekan Ke
              </label>
              <select
                value={pekan}
                onChange={(e) => setPekan(Number(e.target.value))}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                {[1, 2, 3, 4, 5].map((p) => (
                  <option key={p} value={p}>
                    Pekan {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Bulan Rekap
              </label>
              <select
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                {BULAN_LIST.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1 flex gap-2">
              <button
                type="button"
                onClick={loadData}
                className="flex-1 h-10 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                Muat Data
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="h-10 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-150 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                title="Keluar Akun"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-8">
        {dashboardData ? (
          <>
            {activeTab === "dashboard" && <DashboardTab data={dashboardData} />}
            {activeTab === "input" && (
              <InputTab
                initialRecords={dashboardData.mengajar.concat(dashboardData.piket)}
                onSave={handleSaveAttendance}
                isSyncing={isSyncing}
              />
            )}
            {activeTab === "laporan" && reportData && (
              <ReportTab
                report={reportData}
                onModeChange={(m) => loadReport(m)}
                onLoadReport={() => loadReport(reportData.mode)}
              />
            )}
            {activeTab === "settings" && <SettingsTab onSyncUrlChanged={loadData} />}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 font-bold text-sm">Menyiapkan basis data presensi...</p>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-150 py-2 px-4 flex justify-around items-center z-40 shadow-lg sm:hidden no-print">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer transition-all ${
            activeTab === "dashboard" ? "text-teal-650 scale-105" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dasbor
        </button>

        <button
          onClick={() => setActiveTab("input")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer transition-all ${
            activeTab === "input" ? "text-teal-650 scale-105" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <ClipboardEdit className="w-5 h-5" />
          Input
        </button>

        <button
          onClick={() => setActiveTab("laporan")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer transition-all ${
            activeTab === "laporan" ? "text-teal-650 scale-105" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          Rekap
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer transition-all ${
            activeTab === "settings" ? "text-teal-650 scale-105" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Settings className="w-5 h-5" />
          Setelan
        </button>
      </nav>

      {/* DESKTOP FLOATING LEFT SIDE NAV */}
      <nav className="hidden sm:flex fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl py-2.5 px-6 items-center gap-6 z-40 shadow-xl no-print hover:shadow-2xl transition-all">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 text-xs font-bold cursor-pointer transition-all px-3.5 py-2 rounded-xl ${
            activeTab === "dashboard" ? "bg-teal-50 text-teal-800" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>

        <button
          onClick={() => setActiveTab("input")}
          className={`flex items-center gap-2 text-xs font-bold cursor-pointer transition-all px-3.5 py-2 rounded-xl ${
            activeTab === "input" ? "bg-teal-50 text-teal-800" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <ClipboardEdit className="w-4 h-4" />
          Input Presensi
        </button>

        <button
          onClick={() => setActiveTab("laporan")}
          className={`flex items-center gap-2 text-xs font-bold cursor-pointer transition-all px-3.5 py-2 rounded-xl ${
            activeTab === "laporan" ? "bg-teal-50 text-teal-800" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Laporan Rekap
        </button>

        <span className="w-px h-5 bg-slate-200" />

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 text-xs font-bold cursor-pointer transition-all px-3.5 py-2 rounded-xl ${
            activeTab === "settings" ? "bg-teal-50 text-teal-800" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Settings className="w-4 h-4" />
          Pengaturan
        </button>
      </nav>
    </div>
  );
}
