export interface Guru {
  kode: string;
  nama: string;
}

export interface AttendanceRecord {
  row?: number;
  timestamp?: string;
  tanggalISO: string;
  hari: string;
  pekan: number;
  bulan: string;
  tahun: string;
  kelas: string;
  sesi: string;
  jam: string;
  mapel: string;
  kode: string;
  nama: string;
  peran: "Mengajar" | "Piket";
  status: "Masuk" | "Izin" | "Sakit" | "Alpa" | "";
  jamMasuk: string;
  user: string;
}

export interface DashboardData {
  hari: string;
  dateISO: string;
  pekan: number;
  bulan: string;
  tahun: string;
  totalMengajar: number;
  totalPiket: number;
  totalSemua: number;
  sudah: number;
  belum: number;
  persen: number;
  mengajar: AttendanceRecord[];
  piket: AttendanceRecord[];
}

export interface ReportRow {
  kode: string;
  nama: string;
  Masuk: number;
  Izin: number;
  Sakit: number;
  Alpa: number;
  GuruBantu: number;
}

export interface ReportData {
  mode: "harian" | "pekanan" | "bulanan";
  hari: string;
  dateISO: string;
  pekan: number;
  bulan: string;
  tahun: string;
  title: string;
  rows: ReportRow[];
}
