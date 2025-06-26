/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const ROLE_ADMIN: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Dashboard',
        type : 'basic',
        link : '/dashboard'
    },
    {
        id   : 'penerjemah',
        title: 'Daftar JFP',
        type : 'basic',
        link : '/penerjemah'
    },
    {
        id   : 'verifikasi',
        title: 'Verifikasi',
        type : 'collapsable',
        children: [
            {
                id   : 'verifikasi.riwayat',
                title: 'Usulan Perubahan Data',
                type : 'basic',
                link : '/verifikasi-riwayat'
            },
            {
                id   : 'verifikasi.formasi',
                title: 'Usulan Formasi',
                type : 'basic',
                link : '/verifikasi-formasi'
            },
            {
                id   : 'verifikasi.pengangkatan',
                title: 'Berkas Pengangkatan',
                type : 'basic',
                link : '/verifikasi-pengangkatan'
            },
        ]
    },
    {
        id   : 'undangan-kegiatan',
        title: 'Undangan Kegiatan',
        type : 'basic',
        link : '/undangan-kegiatan'
    },
    {
        id   : 'diklat',
        title: 'Pelatihan dan Bimbingan Teknis',
        type : 'basic',
        link : '/diklat'
    },
    {
        id   : 'quiz',
        title: 'Soal',
        type : 'basic',
        link : '/quiz'
    },
    {
        id   : 'survey',
        title: 'Survey',
        type : 'basic',
        link : '/survey'
    },
    {
        id   : 'forum',
        title: 'Forum',
        type : 'basic',
        link : '/forum'
    },
    {
        id   : 'konseling',
        title: 'Konseling',
        type : 'basic',
        link : '/konseling'
    },
    {
        id   : 'agenda',
        title: 'Agenda',
        type : 'basic',
        link : '/agenda'
    },
    {
        id   : 'rekapitulasi',
        title: 'Rekapitulasi',
        type : 'collapsable',
        children: [
            {
                id   : 'rekapitulasi.monev',
                title: 'Monev',
                type : 'basic',
                link : '/rekapitulasi-monev'
            },
            {
                id   : 'rekapitulasi.formasi',
                title: 'Formasi',
                type : 'basic',
                link : '/rekapitulasi-formasi'
            },
            {
                id   : 'rekapitulasi.angka.kredit',
                title: 'Capaian Angka Kredit',
                type : 'basic',
                link : '/rekapitulasi-angka-kredit'
            },
        ]
    },
    {
        id   : 'referensi',
        title: 'Kelola Referensi',
        type : 'collapsable',
        children: [
            {
                id   : 'referensi.instansi',
                title: 'Instansi',
                type : 'basic',
                link : '/referensi-instansi'
            },
            {
                id   : 'referensi.satuan-organisasi',
                title: 'Satuan Organisasi',
                type : 'basic',
                link : '/referensi-satuan-organisasi'
            },
            {
                id   : 'referensi.bobot',
                title: 'Bobot Penilaian Kinerja',
                type : 'basic',
                link : '/referensi-bobot'
            },
            {
                id   : 'referensi.dokumen',
                title: 'Template Dokumen',
                type : 'basic',
                link : '/referensi-dokumen'
            },
            {
                id   : 'referensi.pendidikan',
                title: 'Pendidikan',
                type : 'basic',
                link : '/referensi-pendidikan'
            },
            {
                id   : 'referensi.bahasa',
                title: 'Bahasa',
                type : 'basic',
                link : '/referensi-bahasa'
            },
            {
                id   : 'referensi.jenis-kegiatan',
                title: 'Jenis Kegiatan Translasi',
                type : 'basic',
                link : '/referensi-kegiatan-translasi'
            },
            {
                id   : 'referensi.jenis-sertifikat',
                title: 'Jenis Sertifikat',
                type : 'basic',
                link : '/referensi-jenis-sertifikat'
            },
            {
                id   : 'referensi.diklat-kelompok',
                title: 'Kelompok Diklat',
                type : 'basic',
                link : '/referensi-diklat-kelompok'
            },
            {
                id   : 'referensi.diklat-tema',
                title: 'Tema Diklat',
                type : 'basic',
                link : '/referensi-diklat-tema'
            },
            {
                id   : 'referensi.tipe-survei',
                title: 'Tipe Survei',
                type : 'basic',
                link : '/referensi-tipe-survei'
            },
             {
                id   : 'referensi.pelatihan',
                title: 'Pelatihan',
                type : 'basic',
                link : '/referensi-pelatihan'
            },
        ]
    },
    {
        id   : 'pengguna',
        title: 'Pengguna',
        type : 'basic',
        link : '/pengguna'
    },
         {
        id   : 'E-Monev',
        title: 'E-Monev',
        type : 'collapsable',
             children: [
              {
                id   : 'kuisioner',
                title: 'Susun Kuesioner',
                type : 'basic',
                link : '/kuisoner'
                 },
              {
                id   : 'survey-kuisoner',
                title: 'Pengolahan Survey',
                type : 'basic',
                link : '/survey-kuisoner'
                 },
               {
                id   : 'dashboard',
                title: 'Dashboard',
                type : 'basic',
                link : ''
                 },
               {
                id   : 'E-Sertifikat',
                title: 'E-Sertifikat',
                type : 'basic',
                link : ''
                 },
        ],
    },
];

export const ROLE_ADMIN_KEPEGAWAIAN_INSTANSI: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Dashboard',
        type : 'basic',
        link : '/dashboard'
    },
    {
        id   : 'formasi',
        title: 'Usulan Formasi Baru',
        type : 'basic',
        link : '/formasi'
    },
    {
        id   : 'pengangkatan',
        title: 'Pengangkatan PFP',
        type : 'basic',
        link : '/pengangkatan'
    },
    {
        id   : 'monev.isian',
        title: 'Evaluasi',
        type : 'basic',
        link : '/monev-isian'
    }
];

export const ROLE_INSTRUKTUR: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Dashboard',
        type : 'basic',
        link : '/dashboard'
    },
    {
        id   : 'quiz',
        title: 'Soal',
        type : 'basic',
        link : '/quiz'
    },
    {
        id   : 'diklat',
        title: 'DIKLAT & Kursus',
        type : 'basic',
        link : '/diklat'
    },
];

export const ROLE_USER: FuseNavigationItem[] = [
    {
        id   : 'dashboard',
        title: 'Dashboard',
        type : 'basic',
        link : '/dashboard'
    },
    {
        id   : 'profil',
        title: 'Profil & Riwayat Anda',
        type : 'basic',
        link : '/profil'
    },
    {
        id   : 'undangan',
        title: 'Undangan Kegiatan',
        type : 'basic',
        link : '/undangan'
    },
    {
        id   : 'diklat',
        title: 'Pelatihan dan Bimbingan Teknis',
        type : 'basic',
        link : '/diklat'
    },
    {
        id   : 'forum',
        title: 'Forum',
        type : 'basic',
        link : '/forum'
    },
    {
        id   : 'survey-user',
        title: 'Survey',
        type : 'basic',
        link : '/survey-user'
    },
        {
        id   : 'survey-user-kuisoner',
        title: 'Survey Kuisioner',
        type : 'basic',
        link : '/survey-user-kuisoner'
    },
];
