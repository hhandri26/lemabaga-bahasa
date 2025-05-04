export interface Pagination {
    perPage: number;
    draw: number;
    page: number;
    recordsTotal: number;
    recordsFiltered: number;
    total: number;
}

export interface EmployeeMenu {
    id?: string;
    title?: string;
}

export interface Pegawai {
    id: string;
    nama: string;
    gelarDepan: string;
    gelarBelakang: string;
    tipePegawai: string;
    nip: string;
    photo: string;
    namaJabatan: string;
    unor: string;
    pnsId: string;
    rwPelatihan?: Pelatihan[];
}

export interface Pelatihan {
    id: String;
    dokumen_id: String;
institusi:String;
lingkup_pelatihan:String;
nama:String;
tahun:String;
pns_id:String;
jp:String;
namapelatihan:String;
nilai:String;
pelatihan_id:String;
peringkat:String;
predikat:String;
tmt_pelatihan:String;
}
export interface DataUtama {
    id: string;
    nama: string;
    gelarDepan: null;
    gelarBelakang: string;
    tipePegawai: string;
    dataPribadi: DataPribadi;
    dataKepegawaian: DataKepegawaian;
    dataInstansi: DataInstansi;
}

export interface DataInstansi {
    id: string;
    satuanorganisasi?: string;
    unitkerja?: string;
    instansiId?: string;
    unorId?: string;
    noSk?: string;
    skTanggal?: string;
}

export interface DataKepegawaian {
    nip: string;
    dataAsn: { [key: string]: null | string };
    noKarpeg: string;
    jabatan: Jabatan;
    unor: Unor;
}

export interface Jabatan {
    id: string;
    jenis: string;
    nama: string;
    tmt: string;
}

export interface Unor {
    id: string;
    nama: string;
    namaJabatan: string;
    eselonId: string;
    eselonNama: string;
    structureNames: string[];
}

export interface DataPribadi {
    tglLahir: string;
    jenisKelamin: string;
    tempatLahir: TempatLahir;
    agama: string;
    nik: string;
    alamat: string;
    noHp: string;
    noNpwp: string;
    noBpjs: string;
    email: string;
    pendidikan: Pendidikan;
}

export interface Pendidikan {
    id: string;
    nama: string;
    tkId: string;
    tkNama: string;
    tglLulus: string;
    institusi: null;
    noIjasah: null;
    dokumen: null;
}

export interface TempatLahir {
    lokasiId: string;
    lokasiJenis: null;
    lokasiNama: string;
}

export interface PayloadGolongan {
    riwayatId?: string;
    golonganId?: string;
    jenisKpId?: string;
    tmtGolongan?: string;
    skNomor?: string;
    skTanggal?: string;
}

export interface PayloadJabatan {
    riwayatId?: string;
    jenisJabatan?: string;
    jabatanId?: string;
    tmtJabatan?: string;
    instansiId?: string;
    unorId?: string;
    noSk?: string;
    skTanggal?: string;
}
export interface PayloadInstansi {
    riwayatId?: string;
    satuanorganisasi?: string;
    unitkerja?: string;
    instansiId?: string;
    unorId?: string;
    noSk?: string;
    skTanggal?: string;
}
export interface PayloadPendidikan {
    riwayatId?: string;
    tingkatPendidikan?: string;
    institusiNama?: string;
    tglLulus?: string;
    nomorIjasah?: string;
    gelarDepan?: string;
    gelarBelakang?: string;
}

export interface PayloadDiklatStruktural {
    riwayatId?: string;
    jenisDiklatId?: string;
    jenisDiklatNama?: string;
    nomor?: string;
    tanggal?: string;
}

export interface PayloadKursus {
    riwayatId?: string;
    jenisKursusId?: string;
    groupKursus?: string;
    durasiInHours?: string;
    institusiPenyelenggara?: string;
    namaKursus?: string;
    nomorSertifikat?: string;
    tanggalKursus?: string;
    tahun?: string;
}

export interface PayloadPmk {
    riwayatId?: string;
    skNomor?: string;
    skTanggal?: string;
    mkTahun?: string;
    mkBulan?: string;
    nilai?: string;
    tglAwal?: string;
    tglSelesai?: string;
    tglBkn?: string;
    pengalaman?: string;
    nomorBkn?: string;
}

export interface PayloadKeluarga {
    riwayatId?: string;
    tempatLahirId?: string;
}

export interface PayloadSkp {
    riwayatId?: string;
    jenisJabatan?: string;
    jabatanId?: string;
    unorId?: string;
    golonganId?: string;
    tahun?: string;
    nilai?: string;
    orientasiPelayanan?: string;
    integritas?: string;
    komitmen?: string;
}

export interface PayloadPenghargaan {
    riwayatId?: string;
    skNomor?: string;
    skTanggal?: string;
    tahun?: string;
    jenisPenghargaanId?: string;
    penghargaanNama?: string;
}
