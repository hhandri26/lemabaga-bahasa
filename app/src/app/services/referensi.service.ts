/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import moment from 'moment';
import { map, Observable, of, switchMap, tap, throwError } from 'rxjs';
export const DATE_FORMATS = {
    parse: {
        dateInput: 'DD-MM-YYYY',
    },
    display: {
        dateInput: 'DD-MM-YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY'
    },
};

export const YEAR_FORMATS = {
    parse: {
        dateInput: 'YYYY',
    },
    display: {
        dateInput: 'YYYY',
        monthYearLabel: 'YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'YYYY',
    },
};

@Injectable({
    providedIn: 'root'
})
export class ReferensiService {
    _apiUrl = `${environment.apiUrl}/refference`;

    constructor(private _httpClient: HttpClient) {
    }

    groupKursus(): any[] {
        return [
            { id: 'DIKLAT_TEKNIS', nama: 'Diklat Teknis' },
            { id: 'DIKLAT_FUNGSIONAL', nama: 'Diklat Fungsional' },
            { id: 'SEMINAR_WORKSHOP_SEJENISNYA', nama: 'Seminar / Workshop / Sejenisnya' }
        ];
    }

    agama(): any[] {
        return ['ISLAM', 'KRISTEN', 'KATOLIK', 'BUDHA', 'HINDU', 'LAINNYA'];
        return [
            { id: null, nama: 'Semua Agama' },
            { id: 'ISLAM', nama: 'ISLAM' },
            { id: 'KRISTEN', nama: 'KRISTEN' },
            { id: 'KATOLIK', nama: 'KATOLIK' },
            { id: 'BUDHA', nama: 'BUDHA' },
            { id: 'HINDU', nama: 'HINDU' },
            { id: 'LAINNYA', nama: 'LAINNYA' }
        ];
    }

    tipePegawai(): any[] {
        return [
            { id: '', nama: 'Semua Tipe Pegawai' },
            { id: 'PNS', nama: 'PNS' },
            { id: 'CPNS', nama: 'CPNS' },
            { id: 'PPPK', nama: 'PPPK' },
            { id: 'KONTRAK', nama: 'KONTRAK' }
        ];
    }

    jenisJabatan(): any[] {
        return [
            { id: '', nama: 'Semua Jenis Jabatan' },
            { id: 'STRUKTURAL', nama: 'STRUKTURAL' },
            { id: 'JFT', nama: 'JFT' },
            { id: 'JFU', nama: 'JFU' },
            { id: 'RANGKAP', nama: 'RANGKAP' }
        ];
    }

    actionUsulan(): any[] {
        return [
            {
                id: 'ADD', nama: 'Tambah Data'
            },
            {
                id: 'EDIT', nama: 'Perubahan Data'
            },
            {
                id: 'DELETE', nama: 'Hapus Data'
            }
        ];
    }

    statusKonseling(): any[] {
        return [
            { id: 'DIJADWALKAN', name: 'Dijadwalkan' },
            { id: 'SELESAI', name: 'Selesai' }
        ];
    }

    jenisUsulan(): any[] {
        return [
            { id: 'RW_GOL', name: 'Pangkat/Golongan' },
            { id: 'RW_JAB', name: 'Jabatan' },
            { id: 'RW_INSTANSI', name: 'Mutasi' },
            { id: 'RW_KEG_TRANSLASI', name: 'Kegiatan Penerjemahan' },
            { id: 'RW_PELATIHAN', name: 'Pelatihan' },
            { id: 'RW_PENDIDIKAN', name: 'Pendidikan' },
            // { id: 'RW_SERTIFIKAT_BAHASA', name: 'Uji Kemahiran Berbahasa' },
            // { id: 'RW_ANGKA_KREDIT', name: 'Angka Kredit' },
            // { id: 'KONVERSI_ANGKA_KREDIT', name: 'Konversi Angka Kredit' },
            { id: 'RW_UJI_KOMPETENSI', name: 'Uji Kompetensi' },
            { id: 'KEMAHIRAN_BAHASA', name: 'Kemahiran Berbahasa' },
            { id: 'RW_ANGKA_KREDIT_KONVERSI', name: 'Angka Kredit Konversi' },
            { id: 'RW_ANGKA_KREDIT_AKUMULASI', name: 'Angka Kredit Akumulasi' },
            { id: 'RW_ANGKA_KREDIT_PENETAPAN', name: 'Angka Kredit Pentetapan' },
        ];
    }

    lingkupPelatihan(): any[] {
        return [
            { id: 'NASIONAL', name: 'Nasional' },
            { id: 'INTERNASIONAL', name: 'Internasional' },
        ];
    }

    yearList() {
        const currentYear = new Date().getFullYear(); const years = [];
        let startYear = 2022;
        while (startYear <= currentYear) {
            years.push(startYear++);
        }
        return years;
    }

    monthList(
        locales?: string | string[],
        format: 'long' | 'short' = 'long'
    ): string[] {
        const year = new Date().getFullYear(); // 2020
        const monthList = [...Array(12).keys()]; // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        const formatter = new Intl.DateTimeFormat(locales, {
            month: format
        });
        const months = [];
        const getMonthName = (monthIndex: number) =>
            formatter.format(new Date(year, monthIndex));
        monthList.map(getMonthName).forEach((item, index) => {
            months.push({ id: index, name: item });
        });
        return months;
    }

    statusKegiatanList() {
        return [
            { id: 'SUDAH_BERLANGSUNG', name: 'Sudah Berlangsung' },
            { id: 'SEDANG_BERLANGSUNG', name: 'Sedang Berlangsung' },
            { id: 'AKAN_DATANG', name: 'Akan Datang' }
        ];
    }

    tkPendidikanList() {
        return [
            { id: 'S3', name: 'S3' },
            { id: 'S2', name: 'S2' },
            { id: 'S1', name: 'S1' },
            { id: 'D3', name: 'D3' },
            { id: 'D1', name: 'D1' },
            { id: 'D2', name: 'D2' },
            { id: 'SMA', name: 'SMA / SLTA' },
            { id: 'SMP', name: 'SMP / SLTP' },
            { id: 'SD', name: 'SD' },
        ];
    }

    tipeAgendaList() {
        return [
            { id: 'PUBLIC', name: 'Publik' },
            { id: 'PRIVATE', name: 'Pribadi' }
        ];
    }

    jenisAktivitasDiklatList() {
        return [
            { id: 'MATERIAL', name: 'MATERIAL' },
            { id: 'ASSIGNMENT', name: 'ASSIGNMENT' },
            { id: 'URL', name: 'SHARE URL' },
            { id: 'ATTENDANCE', name: 'ATTENDANCE' },
            // { id: 'QUIZ', name: 'Quiz' },
        ];
    }

    jenisMaterialList() {
        return [
            { id: 'DOCUMENT', name: 'Dokumen' },
            { id: 'VIDEO', name: 'Video' },
            { id: 'YOUTUBE', name: 'Url Youtube' }
        ];
    }

    klasifikasiBototList() {
        return [
            { id: 'SANGAT_KURANG', name: 'Sangat Kurang' },
            { id: 'KURANG', name: 'Kurang' },
            { id: 'CUKUP', name: 'Cukup' },
            { id: 'BAIK', name: 'Baik' },
            { id: 'SANGAT_BAIK', name: 'Sangat Baik' }
        ];
    }

    kegiatanTranslasiList(): any[] {
        return [
            { id: 'TULIS', name: 'Tulis' },
            { id: 'NON_TULIS', name: 'Non Tulis' },
        ];
    }

    jenisInstansiList() {
        return [
            { id: 'P', name: 'Pusat' },
            { id: 'D', name: 'Daerah' }
        ];
    }

    tahun(): any[] {
        const max = new Date().getFullYear();
        const min = max - 40;
        const years = [];

        for (let i = max; i >= min; i--) {
            years.push(i);
        }
        return years;
    }

    lulus(): any[] {
        return [
            { id: true, name: 'Ya' },
            { id: false, name: 'Tidak' },
        ];
    }

    lokasi(byName):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/lokasi', { params: byName }).pipe(
            tap((result: any) => result?.data),
            switchMap((result) => {
                if (!result) {
                    return throwError('keyword ' + byName.byName + ' tidak ditemukan!');
                }
                return of(result);
            })
        );
    }

    pegawai(byNip):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/pegawai/' + byNip).pipe(
            tap((result: any) => result?.data),
            switchMap((result) => {
                if (!result) {
                    return throwError('NIP ' + byNip + ' tidak ditemukan!');
                }
                return of(result);
            })
        );
    }

    instansi(params = { q: '' }): Observable<any[]> {
        return this._httpClient.get<any[]>(this._apiUrl + '/instansi', { params }).pipe(
            switchMap(result => {
                if (!result || result.length === 0) {
                    return throwError(() => new Error('Data instansi tidak ditemukan!'));
                }
                return of(result);
            })
        );
    }
    
    // pelatihan(params = { q: '' }):
    //     Observable<any> {
    //     return this._httpClient.get<any>(this._apiUrl + '/pelatihan', { params });
    // }
    // instansi(byName):
    //     Observable<any> {
    //     return this._httpClient.get<any>(this._apiUrl + '/instansi', { params: byName }).pipe(
    //         tap((result: any) => result?.data),
    //         switchMap((result) => {
    //             if (!result) {
    //                 return throwError('keyword ' + byName.byName + ' tidak ditemukan!');
    //             }
    //             return of(result);
    //         })
    //     );
    // }

    unitKerja(params = { q: '' }):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/unit-kerja', { params }).pipe(
            switchMap((result) => {
                if (!result) {
                    return throwError('unit kerja tidak ditemukan!');
                }
                return of(result);
            })
        );
    }

    jenisKursus(byName):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/jenis-kursus', { params: byName }).pipe(
            tap((result: any) => result?.data),
            switchMap((result) => {
                if (!result) {
                    return throwError('keyword ' + byName.byName + ' tidak ditemukan!');
                }
                return of(result);
            })
        );
    }

    unor(byName):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/unor', { params: byName }).pipe(
            tap((result: any) => result?.data),
            switchMap((result) => {
                if (!result) {
                    return throwError('keyword ' + byName.byName + ' tidak ditemukan!');
                }
                return of(result);
            })
        );
    }

    jenisSertifikat():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/jenis-sertifikat').pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('data reference tidak ditemukan!');
                }
                return of(result);
            })
        );
    }
    // pelatihan():
    //     Observable<any> {
    //     return this._httpClient.get<any>(this._apiUrl + '/pelatihan').pipe(
    //         tap((result: any) => result),
    //         switchMap((result) => {
    //             if (!result) {
    //                 return throwError('data reference tidak ditemukan!');
    //             }
    //             return of(result);
    //         })
    //     );
    // }
    golongan():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/golongan').pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('data reference tidak ditemukan!');
                }
                return of(result);
            })
        );
    }

    jabatan():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/jabatan').pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('jabatan tidak ditemukan!');
                }
                return of(result);
            })
        );
    }

    tipeSurvei():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/tipe-survei').pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('tipe survei tidak ditemukan!');
                }
                return of(result);
            })
        );
    }

       pelatihan():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/pelatihan').pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('pelatihan tidak ditemukan!');
                }
                return of(result);
            })
        );
    }

    jenisKegiatanTranslasi():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/jenis-kegiatan-translasi').pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('kegiatan translasi tidak ditemukan!');
                }
                return of(result.content);
            })
        );
    }

    jenisBahasa():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/bahasa').pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('kegiatan translasi tidak ditemukan!');
                }
                return of(result.content);
            })
        );
    }
    

    roles():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/roles').pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('data reference tidak ditemukan!');
                }
                return of(result);
            })
        );
    }

    unorLevel(level):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/unor-by-level', { params: level }).pipe(
            tap((result: any) => result?.data),
            switchMap((result) => {
                if (!result?.status) {
                    return throwError('data reference tidak ditemukan!');
                }
                return of(result?.data);
            })
        );
    }

    jenisKp():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/jenis-kp').pipe(
            tap((result: any) => result?.data),
            switchMap((result) => {
                if (!result?.status) {
                    return throwError('data reference tidak ditemukan!');
                }
                return of(result?.data);
            })
        );
    }

    kabupaten(params): Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/kab-kota', { params }).pipe(
            tap((result: any) => result?.content),
            switchMap((result) => {
                if (!result?.totalElements) {
                    return throwError('data reference tidak ditemukan!');
                }
                return of(result?.content);
            })
        );
    }

    provinsi(params): Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/propinsi', { params }).pipe(
            tap((result: any) => result?.content),
            switchMap((result) => {
                if (!result?.totalElements) {
                    return throwError('data reference tidak ditemukan!');
                }
                return of(result?.content);
            })
        );
    }

    uraianTugas(jabatanId): Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/uraian-tugas/byJabatan/' + jabatanId).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('data reference tidak ditemukan!');
                }
                return of(result);
            })
        );
    }

    satuanOrganisasi(params): Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/satuan-organisasi', { params }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('data reference tidak ditemukan!');
                }
                return of(result);
            })
        );
    }

    jenisPenghargaan():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/jenis-penghargaan').pipe(
            tap((result: any) => result?.data),
            switchMap((result) => {
                if (!result?.status) {
                    return throwError('data reference tidak ditemukan!');
                }
                return of(result?.data);
            })
        );
    }

    tkPendidikan():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/tk-pendidikan').pipe(
            tap((result: any) => result?.data),
            switchMap((result) => {
                if (!result?.status) {
                    return throwError('data reference tidak ditemukan!');
                }
                return of(result?.data);
            })
        );
    }

    pendidikan(params = { q: null }):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/pendidikan', { params });
    }

    jenisDiklat():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/jenis-diklat').pipe(
            tap((result: any) => result?.data),
            switchMap((result) => {
                if (!result?.status) {
                    return throwError('data reference tidak ditemukan!');
                }
                return of(result?.data);
            })
        );
    }

    jenisForum():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/forum/category').pipe(
            switchMap((result) => {
                if (!result?.success) {
                    return throwError('data reference tidak ditemukan!');
                }
                return of(result?.mapData.content);
            })
        );
    }

    groupDiklat():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/course/groups').pipe(
            tap((result: any) => result)
        );
    }

    groupTopic():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/course/topics').pipe(
            tap((result: any) => result)
        );
    }

    instructures():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/course/instructures').pipe(
            tap((result: any) => result)
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onFileInputSingle(event, mime, maxSize) {
        const file = event.target.files[0];
        const size = Math.round(file.size / Math.pow(1024, 1));
        const mimeType = file.type;
        const fileInfo = {
            'name': file.name,
            'size': size + ' KB',
            'type': file.type,
            'lastModified': moment(file.lastModified).format('DD-MM-YYYY HH:MM')
        };

        if (size > maxSize) {
            return {
                isSuccess: false,
                msg: 'File "' + file.name + '" tidak dapat di unggah, karena lebih dari ' + maxSize / 1000 + ' MB',
                fileInfo
            };
        }

        // if (mimeType !== mime) {
        //     return {
        //         isSuccess: false,
        //         msg: 'Format file tidak sesuai, format file harus ' + mime,
        //         fileInfo
        //     };
        // }

        return {
            isSuccess: true,
            msg: 'success',
            fileInfo
        };
    }
}
