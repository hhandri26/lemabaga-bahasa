/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/** Angular */
import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import moment from 'moment';

export const MY_FORMATS = {
    parse: {
        dateInput: 'DD MMMM YYYY',
    },
    display: {
        dateInput: 'DD MMMM YYYY',
        monthYearLabel: 'DD MMMM YYYY',
        dateA11yLabel: 'DD MMMM YYYY',
        monthYearA11yLabel: 'DD MMMM YYYY',
    },
};

@Injectable({
    providedIn: 'root'
})
export class HelperService {

    requireMatch(control: AbstractControl) {
        const selection: any = control.value;
        if (typeof selection === 'string') {
            return { incorrect: true };
        }
        return null;
    }

    maxDate() {
        return moment(new Date()).format('YYYY-MM-DD');
    }

    startDate() {
        return new Date(1990, 0, 1);
    }

    diklatType() {
        return [
            { value: 'ATTENDANCE', text: 'Absen' },
            { value: 'MATERIAL', text: 'Materi' },
            { value: 'ASSIGNMENT', text: 'Tugas' },
            { value: 'URL', text: 'Referensi Link' },
            { value: 'POSTTEST', text: 'Post Test' },
            { value: 'PRETEST', text: 'Pre Test' }
        ];
    }

    onFileInputSingle(event, mime) {
        const file = event.target.files[0];
        const size = Math.round(file.size / Math.pow(1024, 1));
        const mimeType = file.type;
        const fileInfo = {
            'name': file.name,
            'size': size + ' KB',
            'type': file.type,
            'lastModified': moment(file.lastModified).format('DD-MM-YYYY HH:MM')
        };

        if (size > 2000) {
            return {
                isSuccess: false,
                msg: 'File "' + file.name + '" tidak dapat di unggah, karena lebih dari 2MB',
                fileInfo
            };
        }

        if (mimeType !== mime) {
            return {
                isSuccess: false,
                msg: 'Format file tidak sesuai, format file harus: *.pdf',
                fileInfo
            };
        }

        return {
            isSuccess: true,
            msg: 'success',
            fileInfo
        };
    }

    mimeDocument() {
        return [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        // return {
        // 	'.doc': 'application/msword',
        // 	'.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // 	'.pdf': 'application/pdf',
        // 	'.ppt': 'application/vnd.ms-powerpoint',
        // 	'.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // 	'.xls': 'application/vnd.ms-excel',
        // 	'.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // };
    }

    mimeVideo() {
        return [
            'video/mp4'
        ];
    }

    onFileInputMultiple(files, mime) {
        const results = [];
        for (let i = 0; i < files.length; i++) {
            const size = Math.round(files[i].size / Math.pow(1024, 1));
            const mimeType = files[i].type;
            const fileInfo = {
                'name': files[i].name,
                'size': size + ' KB',
                'type': files[i].type,
                'lastModified': moment(files[i].lastModified).format('DD-MM-YYYY HH:MM')
            };

            const isMimeMatch = mime.find(element => element === mimeType);

            if (size > 10000) {
                return {
                    isSuccess: false,
                    msg: 'ERROR : File "' + files[i].name + '" lebih dari 10MB',
                    fileInfo
                };
                // } else if (mimeType !== mime) {
            } else if (!isMimeMatch) {
                return {
                    isSuccess: false,
                    msg: 'ERROR : File "' + files[i].name + '" tidak sesuai dengan format yg ditentukan',
                    fileInfo
                };
            } else {
                return {
                    isSuccess: true,
                    msg: 'success',
                    fileInfo
                };
            }
        };
        // return results;
    }

    publishList() {
        return [
            { id: true, name: 'PUBLISH' },
            { id: false, name: 'UN-PUBLISH' }
        ];
    }

    blankoList() {
        return [
            { id: false, name: 'Dengan Banko' },
            { id: true, name: 'Tidak dengan banko' }
        ];
    }

    categoryBeritaList() {
        return [
            // { id: 4, name: 'STATIC' },
            { id: 5, name: 'NEWS' },
            // { id: 8, name: 'PENGUMUMAN' }
        ];
    }

    isLulus() {
        return [
            { id: true, name: 'Lulus' },
            { id: false, name: 'Tidak Lulus' }
        ];
    }

    isUjiKompetensi() {
        return [
            { id: true, name: 'Sudah Uji Kompetensi' },
            { id: false, name: 'Belum Uji Kompetensi' }
        ];
    }

    statusKegiatanList() {
        return [
            { id: 'SUDAH_BERLANGSUNG', name: 'Sudah Berlangsung' },
            { id: 'SEDANG_BERLANGSUNG', name: 'Sedang Berlangsung' },
            { id: 'AKAN_DATANG', name: 'Akan Datang' }
        ];
    }

    statusUndanganList() {
        return [
            { id: 'MENUNGGU_KONFIRMASI', name: 'Menunggu Konfirmasi' },
            { id: 'KONFIRMASI_AKAN_HADIR', name: 'Konfirmasi Akan Hadir' },
            { id: 'KONFIRMASI_TIDAK_HADIR', name: 'Konfirmasi Tidak Hadir' },
            { id: 'KONFIRMASI_DITOLAK', name: 'Konfirmasi Ditolak' },
            { id: 'KONFIRMASI_DISETUJUI', name: 'Konfirmasi Disetujui' },
            { id: 'TIDAK_PERLU_KONFIRMASI', name: 'Tidak Perlu Konfirmasi' }
        ];
    }

    glossariumIstilahList() {
        return [
            { id: true, name: 'Istilah Asing' },
            { id: false, name: 'Istilah Indonesia' }
        ];
    }

    bahasaList() {
        return [
            { id: 'en', name: 'Bahasa Asing' },
            { id: 'id', name: 'Bahasa Indonesia' }
        ];
    }

    jenisSertifikatList() {
        return [
            { id: 'TOEFL', name: 'TOEFL' },
            { id: 'IELTS', name: 'IELTS' },
            { id: 'TOEIC', name: 'TOEIC' },
            { id: 'HSK', name: 'HSK' },
            { id: 'JLPT', name: 'JLPT' },
            { id: 'TOPIK', name: 'TOPIK' },
            { id: 'DELF', name: 'DELF' },
            { id: 'TESTDAF', name: 'TESTDAF' }
        ];
    }

    jenisUsulList() {
        return [
            { id: null, name: 'Semua usulan' },
            { id: 'RW_GOL', name: 'Pangkat/Golongan' },
            { id: 'RW_JAB', name: 'Jabatan' },
            { id: 'RW_INSTANSI', name: 'Instansi' },
            { id: 'RW_KEG_TRANSLASI', name: 'Kegiatan Penerjemahan' },
            { id: 'RW_PELATIHAN', name: 'Pelatihan' },
            { id: 'RW_PENDIDIKAN', name: 'Pendidikan' },
            // { id: 'RW_SERTIFIKAT_BAHASA', name: 'Uji Kemahiran Berbahasa' },
            // { id: 'RW_ANGKA_KREDIT', name: 'Angka Kredit' },
            // { id: 'KONVERSI_ANGKA_KREDIT', name: 'Konversi Angka Kredit' },
            { id: 'RW_ANGKA_KREDIT_KONVERSI', name: 'Angka Kredit Konversi' },
            { id: 'RW_ANGKA_KREDIT_AKUMULASI', name: 'Angka Kredit Akumulasi' },
            { id: 'RW_ANGKA_KREDIT_PENETAPAN', name: 'Angka Kredit Pentetapan' },
            { id: 'RW_UJI_KOMPETENSI', name: 'Uji Kompetensi' },
            { id: 'KEMAHIRAN_BAHASA', name: 'Riwayat Kemahiran Berbahasa' },
        ];
    }

    lingkupPelatihanList() {
        return [
            { id: 'NASIONAL', name: 'Nasional' },
            { id: 'INTERNASIONAL', name: 'Internasional' },
        ];
    }

    agamaList() {
        return [
            { id: 'IS', name: 'Islam' },
            { id: 'KR', name: 'Kristen' },
            { id: 'KA', name: 'Khatolik' },
            { id: 'HI', name: 'Hindu' },
            { id: 'BU', name: 'Budha' },
            { id: 'KH', name: 'Khonghucu' },
            { id: 'LN', name: 'Lain-lain' }
        ];
    }

    jenisKelaminList() {
        return [
            { id: 'M', name: 'Pria' },
            { id: 'F', name: 'Wanita' }
        ];
    }

    typeForumList() {
        return [
            { id: 'PRIVATE', name: 'Private' },
            { id: 'PUBLIC', name: 'Public' }
        ];
    }

    jenisKegiatanList() {
        return [
            { id: 'DIKLAT_FUNGSIONAL', name: 'Diklat Fungsional' },
            { id: 'DIKLAT_TEKNIS', name: 'Diklat Teknis' },
            { id: 'UJI_KOMPETENSI', name: 'Uji Kompetensi' },
            { id: 'BIMBINGAN_TEKNIS', name: 'Bimbingan Teknis' },
            { id: 'KURSUS', name: 'Kursus' }
        ];
    }

    jenisKegiatanDiklatList() {
        return [
            { id: 'DIKLAT_FUNGSIONAL', name: 'Diklat Fungsional' },
            { id: 'DIKLAT_TEKNIS', name: 'Diklat Teknis' },
            { id: 'UJI_KOMPETENSI', name: 'Uji Kompetensi' },
            { id: 'BIMBINGAN_TEKNIS', name: 'Bimbingan Teknis' },
            { id: 'KURSUS', name: 'Kursus' }
        ];
    }

    jenisPengangkatanList() {
        return [
            { id: 'PENGANGKATAN_PERTAMA', name: 'Pertama' },
            { id: 'PENGANGKATAN_ALIH_JABATAN', name: 'Alih Jabatan' },
            { id: 'PROMOSI', name: 'Promosi' }
        ];
    }

    statusKawinList() {
        return [
            { id: 'BELUM_KAWIN', name: 'Belum Kawin' },
            { id: 'MENIKAH', name: 'Menikah' },
            { id: 'CERAI', name: 'Cerai' },
            { id: 'JANDA_DUDA', name: 'Janda / Duda' },
            { id: 'UNKNOWN', name: 'Tidak diketahui' }
        ];
    }

    calculateAge(birthday) {
        const dBirthday = new Date(birthday);
        const ageDifMs = Date.now() - dBirthday.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    pad(num: number, size: number): string {
        let s = num + '';
        while (s.length < size) { s = '0' + s; }
        return s;
    }

    toInteger(value: any): number {
        return parseInt(`${value}`, 10);
    }

    getDateFromStringID(dateInStr: string = ''): Date {
        if (dateInStr && dateInStr.length > 0) {
            const dateParts = dateInStr.trim().split('-');
            const year = this.toInteger(dateParts[2]);
            const month = this.toInteger(dateParts[1]);
            const day = this.toInteger(dateParts[0]);
            return new Date(year, (month - 1), day);
        }
        return new Date();
    }

    // date format 'yyyy-mm-dd'
    convertDateFormat(date) {
        return moment(date).format('DD-MM-YYYY');
    }

    convertDateTimeFormat(dateTime) {
        return moment(dateTime).format('lll');
    }

    replaceUnderscore(val: string) {
        return val.split('_').join(' ');
    }

    fromNow(datetime) {
        return moment(datetime).locale('id').fromNow();
    }

    timeDiff(dueDateTime, setDateTime) {
        const ms = moment(dueDateTime, 'YYYY-MM-DD HH:mm').diff(moment(setDateTime, 'YYYY-MM-DD HH:mm'));
        const d = moment.duration(ms);
        return Math.floor(d.asHours()) + moment.utc(ms).format(':mm');
    }

    isLate(dueDateTime, setDateTime) {
        const ms = moment(dueDateTime, 'YYYY-MM-DD HH:mm').diff(moment(setDateTime, 'YYYY-MM-DD HH:mm'));
        const d = moment.duration(ms);
        return (d ? false : true);
    }

    tieringResultPenilaian(nilai) {
        let result = 'SANGAT BAIK';
        switch (true) {
            case (+nilai <= 50):
                result = 'BURUK';
                break;
            case (+nilai <= 60):
                result = 'SEDANG';
                break;
            case (+nilai <= 75):
                result = 'CUKUP';
                break;
            case (+nilai <= 90.99):
                result = 'BAIK';
                break;
        }
        return result;
    }
}
