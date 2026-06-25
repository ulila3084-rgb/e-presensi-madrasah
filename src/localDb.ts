import { AttendanceRecord, DashboardData, ReportData, ReportRow } from "./types";
import { GURU, JADWAL, JAM, getHariFromDate, getMonthName, getYear, guruByKode } from "./constants";

const STORAGE_KEY = "mmu_presensi_records";
const SYNC_URL_KEY = "mmu_apps_script_url";

export function getSyncUrl(): string {
  return localStorage.getItem(SYNC_URL_KEY) || "";
}

export function setSyncUrl(url: string): void {
  localStorage.setItem(SYNC_URL_KEY, url.trim());
}

export function readLocalPresensi(): AttendanceRecord[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse local presensi", e);
    return [];
  }
}

export function writeLocalPresensi(records: AttendanceRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function buildDayRows(hari: string): { mengajar: any[]; piket: any[] } {
  const jadwal = JADWAL[hari] || {};
  const rows: any[] = [];
  const used: Record<string, boolean> = {};

  Object.keys(jadwal).forEach(sesi => {
    jadwal[sesi].forEach(item => {
      const kelas = item[0];
      const mapel = item[1];
      const kode = item[2];
      const guru = guruByKode(kode);

      used[kode] = true;

      rows.push({
        hari: hari,
        kelas: kelas,
        sesi: sesi,
        jam: JAM[sesi],
        mapel: mapel,
        kode: kode,
        nama: guru.nama,
        peran: "Mengajar"
      });
    });
  });

  const piket = GURU
    .filter(g => !used[g[0]])
    .map(g => ({
      hari: hari,
      kelas: "-",
      sesi: "-",
      jam: "13.00 - 16.00 WIB",
      mapel: "Guru Bantu / Piket",
      kode: g[0],
      nama: g[1],
      peran: "Piket"
    }));

  return {
    mengajar: rows,
    piket: piket
  };
}

export function getAttendanceMap(dateISO: string): Record<string, AttendanceRecord> {
  const map: Record<string, AttendanceRecord> = {};

  readLocalPresensi()
    .filter(r => r.tanggalISO === dateISO)
    .forEach(r => {
      const key = [
        r.tanggalISO,
        r.kelas,
        r.sesi,
        r.kode,
        r.peran
      ].join("|");

      map[key] = r;
    });

  return map;
}

export function getDashboardDataLocal(payload: {
  dateISO: string;
  hari?: string;
  pekan?: number;
}): DashboardData {
  const dateISO = payload.dateISO;
  const hari = payload.hari || getHariFromDate(dateISO);
  const pekan = Number(payload.pekan || 1);

  const data = buildDayRows(hari);
  const att = getAttendanceMap(dateISO);

  function attachStatus(row: any): AttendanceRecord {
    const key = [
      dateISO,
      row.kelas,
      row.sesi,
      row.kode,
      row.peran
    ].join("|");

    const r = att[key];

    return {
      ...row,
      tanggalISO: dateISO,
      pekan: pekan,
      bulan: getMonthName(dateISO),
      tahun: getYear(dateISO),
      status: r ? r.status : "",
      jamMasuk: r ? r.jamMasuk : ""
    };
  }

  const mengajar = data.mengajar.map(attachStatus);
  const piket = data.piket.map(attachStatus);
  const all = mengajar.concat(piket);

  const sudah = all.filter(r => r.status).length;
  const belum = all.length - sudah;

  return {
    hari: hari,
    dateISO: dateISO,
    pekan: pekan,
    bulan: getMonthName(dateISO),
    tahun: getYear(dateISO),
    totalMengajar: mengajar.length,
    totalPiket: piket.length,
    totalSemua: all.length,
    sudah: sudah,
    belum: belum,
    persen: all.length ? Math.round((sudah / all.length) * 100) : 0,
    mengajar: mengajar,
    piket: piket
  };
}

export function saveAttendanceLocal(payload: any): { success: boolean; message: string } {
  if (!payload.status) {
    return {
      success: false,
      message: "Status kosong, data tidak disimpan."
    };
  }

  const data = readLocalPresensi();
  const nowStr = new Date().toISOString();

  const status = payload.status || "";
  // format: HH:mm:ss in Asia/Jakarta (roughly standard formatting)
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta"
  };
  const jamMasuk = status === "Masuk"
    ? new Intl.DateTimeFormat("id-ID", options).format(now)
    : "";

  const bulan = getMonthName(payload.tanggalISO);
  const tahun = getYear(payload.tanggalISO);

  const key = [
    payload.tanggalISO,
    payload.kelas,
    payload.sesi,
    payload.kode,
    payload.peran
  ].join("|");

  const existingIndex = data.findIndex(r => [
    r.tanggalISO,
    r.kelas,
    r.sesi,
    r.kode,
    r.peran
  ].join("|") === key);

  const rowRecord: AttendanceRecord = {
    timestamp: nowStr,
    tanggalISO: payload.tanggalISO,
    hari: payload.hari,
    pekan: Number(payload.pekan || 1),
    bulan: bulan,
    tahun: tahun,
    kelas: payload.kelas,
    sesi: payload.sesi,
    jam: payload.jam,
    mapel: payload.mapel,
    kode: payload.kode,
    nama: payload.nama,
    peran: payload.peran,
    status: status,
    jamMasuk: payload.jamMasuk || jamMasuk,
    user: payload.user || "MUDM"
  };

  if (existingIndex !== -1) {
    data[existingIndex] = rowRecord;
  } else {
    data.push(rowRecord);
  }

  writeLocalPresensi(data);

  return {
    success: true,
    message: "Presensi berhasil disimpan secara lokal."
  };
}

export function saveBulkAttendanceLocal(rows: any[]): { success: boolean; message: string } {
  let count = 0;

  rows.forEach(r => {
    if (r.status) {
      saveAttendanceLocal(r);
      count++;
    }
  });

  return {
    success: true,
    message: count + " data presensi berhasil disimpan secara lokal."
  };
}

export function getReportLocal(filter: {
  mode: "harian" | "pekanan" | "bulanan";
  dateISO: string;
  hari?: string;
  pekan?: number;
  bulan?: string;
  tahun?: string;
}): ReportData {
  const mode = filter.mode || "harian";
  const dateISO = filter.dateISO;
  const hari = filter.hari || getHariFromDate(dateISO);
  const pekan = Number(filter.pekan || 1);
  const bulan = filter.bulan || getMonthName(dateISO);
  const tahun = String(filter.tahun || getYear(dateISO));

  let rows = readLocalPresensi().filter(r => String(r.tahun) === tahun);

  if (mode === "harian") {
    rows = rows.filter(r => r.tanggalISO === dateISO);
  }

  if (mode === "pekanan") {
    rows = rows.filter(r => Number(r.pekan) === pekan && r.bulan === bulan);
  }

  if (mode === "bulanan") {
    rows = rows.filter(r => r.bulan === bulan);
  }

  const rec: Record<string, ReportRow> = {};

  GURU.forEach(g => {
    rec[g[0]] = {
      kode: g[0],
      nama: g[1],
      Masuk: 0,
      Izin: 0,
      Sakit: 0,
      Alpa: 0,
      GuruBantu: 0
    };
  });

  rows.forEach(r => {
    if (!rec[r.kode]) {
      rec[r.kode] = {
        kode: r.kode,
        nama: r.nama,
        Masuk: 0,
        Izin: 0,
        Sakit: 0,
        Alpa: 0,
        GuruBantu: 0
      };
    }

    if (r.status === "Masuk") rec[r.kode].Masuk++;
    else if (r.status === "Izin") rec[r.kode].Izin++;
    else if (r.status === "Sakit") rec[r.kode].Sakit++;
    else if (r.status === "Alpa") rec[r.kode].Alpa++;

    if (r.peran === "Piket" && r.status === "Masuk") {
      rec[r.kode].GuruBantu++;
    }
  });

  function buildReportTitle(m: string, h: string, dIso: string, p: number, b: string, t: string) {
    if (m === "harian") {
      return "Laporan Rekap Harian - " + h + ", " + dIso;
    }
    if (m === "pekanan") {
      return "Laporan Rekap Pekanan - Pekan " + p + " / " + b + " " + t;
    }
    if (m === "bulanan") {
      return "Laporan Rekap Bulanan - " + b + " " + t;
    }
    return "Laporan Rekap";
  }

  return {
    mode: mode,
    hari: hari,
    dateISO: dateISO,
    pekan: pekan,
    bulan: bulan,
    tahun: tahun,
    title: buildReportTitle(mode, hari, dateISO, pekan, bulan, tahun),
    rows: Object.values(rec)
  };
}
