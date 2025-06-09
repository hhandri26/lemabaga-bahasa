/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import moment from 'moment';
moment.locale('id');
@Injectable({
    providedIn: 'root'
})
export class PenerjemahService {
    _apiUrl = `${environment.apiUrl}`;
    // Private
    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _jfpItems: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _jfpItem: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _contact: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _contacts: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    private _dataUtama: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _rwGolongans: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _rwGolongan: BehaviorSubject<any | null> = new BehaviorSubject(null);
    
     private _rwInstansis: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _rwInstansi: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _rwPendidikans: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _rwPendidikan: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _rwJabatans: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _rwJabatan: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _rwPelatihans: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _rwPelatihan: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _rwUjiKompetensis: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _rwUjiKompetensi: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _rwAngkaKreditKonversis: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _rwAngkaKreditKonversi: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _rwAngkaKreditAkumulasis: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _rwAngkaKreditAkumulasi: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _rwAngkaKreditPenetapans: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _rwAngkaKreditPenetapan: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _rwKegiatanTranslasis: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _rwKegiatanTranslasi: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _rwAngkaKredits: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _rwAngkaKredit: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _rwUjiKemahiranBerbahasas: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _rwUjiKemahiranBerbahasa: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _penguasaanBahasas: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _penguasaanBahasa: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _Pelatihans: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _Pelatihan: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _historiUsulProfiles: BehaviorSubject<any | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _authService: AuthService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get jfpItems$(): Observable<any[]> { return this._jfpItems.asObservable(); }
    get jfpItem$(): Observable<any> { return this._jfpItem.asObservable(); }
    get dataUtama$(): Observable<any> { return this._dataUtama.asObservable(); }
    get rwPendidikan$(): Observable<any> { return this._rwPendidikans.asObservable(); }
    get rwGolongans$(): Observable<any> { return this._rwGolongans.asObservable(); }
    get rwInstansis$(): Observable<any> { return this._rwInstansis.asObservable(); }
    get rwPelatihan$(): Observable<any> { return this._rwPelatihans.asObservable(); }
    get rwJabatan$(): Observable<any> { return this._rwJabatans.asObservable(); }
    get rwInstansi$(): Observable<any> { return this._rwInstansis.asObservable(); }

    get rwUjiKompetensis$(): Observable<any> { return this._rwUjiKompetensis.asObservable(); }
    get rwUjiKemahiranBerbahasas$(): Observable<any> { return this._rwUjiKemahiranBerbahasas.asObservable(); }
    get rwPelatihans$(): Observable<any> { return this._rwUjiKemahiranBerbahasas.asObservable(); }
    get rwAngkaKredit$(): Observable<any> { return this._rwAngkaKredits.asObservable(); }
    get rwAngkaKreditKonversi$(): Observable<any> { return this._rwAngkaKreditKonversis.asObservable(); }
    get rwAngkaKreditAkumulasi$(): Observable<any> { return this._rwAngkaKreditAkumulasis.asObservable(); }
    get rwAngkaKreditPenetapan$(): Observable<any> { return this._rwAngkaKreditPenetapans.asObservable(); }


    get rwKegiatanTranslasi$(): Observable<any> { return this._rwKegiatanTranslasis.asObservable(); }
    get penguasaanBahasa$(): Observable<any> { return this._penguasaanBahasas.asObservable(); }

    get historiUsulProfiles$(): Observable<any> { return this._historiUsulProfiles.asObservable(); }
    /**
     * Getter for contact
     */
    get contact$(): Observable<any> {
        return this._contact.asObservable();
    }

    /**
     * Getter for contacts
     */
    get contacts$(): Observable<any[]> {
        return this._contacts.asObservable();
    }

    get pagination$(): Observable<any> {
        return this._pagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    __HTTPHeaderBlob(token, responseType: any): { headers: HttpHeaders; responseType: any } {
        return {
            headers: new HttpHeaders(
                {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }), responseType: responseType
        };
    }

    __HTTPHeaderUpload(token) {
        return new HttpHeaders(
            {
                // 'Content-Type': 'multipart/form-data',
                'Accept': '*/*',
                'Authorization': 'Bearer ' + token,
            });
    }

    getJfpList(queryParams): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/public/jfp/filter', queryParams);
    }

    getJfp(page: number = 0, size: number = 10, sort: string = 'nama', order: 'ASC' | 'DESC' | '' = 'ASC', search: object = {}):
        Observable<any> {
        let params = {
            page: '' + page,
            size: '' + size,
            sortBy: sort,
            sort: order
        };
        params = { ...params, ...search };
        console.log('Sending params to API:', params);  // Add logging
        return this._httpClient.post<{ pagination: any; items: any[] }>(this._apiUrl + '/public/jfp/filter', params).pipe(
            tap((response) => {
                console.log('API Response:', response);  // Add logging
                this._pagination.next({ recordsTotal: response.totalElements, perPage: response.size, draw: response.number });
                this._jfpItems.next(response.content);
            })
        );
    }

    getJfpById(id: string): Observable<any> {
        return this._jfpItems.pipe(
            take(1),
            map((jfpItems) => {

                // Find the contact
                const jfpItem = jfpItems.find(item => item.id === id) || null;

                // Update the contact
                this._jfpItem.next(jfpItem);

                // Return the contact
                return jfpItem;
            }),
            switchMap((jfpItem) => {

                if (!jfpItem) {
                    return throwError('Could not found contact with id of ' + id + '!');
                }

                return of(jfpItem);
            })
        );
    }

    cetak(params): Observable<any> {
        const _params = { ...params, ...{ isDownload: true } };
        return this._httpClient.post<any[]>(this._apiUrl + '/report/nominatif', _params, this.__HTTPHeaderBlob(this._authService.accessToken, 'blob')
        ).pipe(
            map((response: any) => response)
        );
    }

    getDataUtama(id: string):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/profil/data-utama/' + id).pipe(
            tap((response) => {
                if (response?.success) {
                    this._dataUtama.next(response.mapData.data);
                }
            })
        );
    }

 

    saveDataUtama(body: FormData): Observable<any> {
		return this._httpClient.post<any>(this._apiUrl + '/profil/data-utama/save', body, { headers: this.__HTTPHeaderUpload((this._authService.accessToken)) });
	}
    saveDataUtamaAdmin(body: FormData): Observable<any> {
		return this._httpClient.post<any>(this._apiUrl + '/profil/data-utama/saveadmin', body, { headers: this.__HTTPHeaderUpload((this._authService.accessToken)) });
    }
    saveDataUtamaKepegawaian(body: FormData): Observable<any> {
		return this._httpClient.post<any>(this._apiUrl + '/profil/data-utama/savekepegawaian', body, { headers: this.__HTTPHeaderUpload((this._authService.accessToken)) });
    }
     saveDataUtamaAsesor(body: FormData): Observable<any> {
		return this._httpClient.post<any>(this._apiUrl + '/profil/data-utama/saveasesor', body, { headers: this.__HTTPHeaderUpload((this._authService.accessToken)) });
     }
      saveDataUtamaPengajar(body: FormData): Observable<any> {
		return this._httpClient.post<any>(this._apiUrl + '/profil/data-utama/savepengajar', body, { headers: this.__HTTPHeaderUpload((this._authService.accessToken)) });
	}

    updateDataUtama(body: FormData): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/profil/data-utama/save', body);
    }

    ///////////////// BY ID /////////////////
    getRwJabatanById(id: string): Observable<any> {
        return this._rwJabatans.pipe(
            take(1),
            map((items) => {
                const result = items.find(item => item.id === id) || null;
                this._rwJabatan.next(result);
                return result;
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('id riwayat ' + id + ' tidak ditemukan!');
                }
                return of(item);
            })
        );
    }

    getRwGolonganById(id: string): Observable<any> {
        return this._rwGolongans.pipe(
            take(1),
            map((items) => {
                const result = items.find(item => item.id === id) || null;
                this._rwGolongan.next(result);
                return result;
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('id riwayat ' + id + ' tidak ditemukan!');
                }
                return of(item);
            })
        );
    }

    getRwInstansiById(id: string): Observable<any> {
        return this._rwInstansis.pipe(
            take(1),
            map((items) => {
                const result = items.find(item => item.id === id) || null;
                this._rwInstansi.next(result);
                return result;
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('id riwayat ' + id + ' tidak ditemukan!');
                }
                return of(item);
            })
        );
    }

    getRwPendidikanById(id: string): Observable<any> {
        return this._rwPendidikans.pipe(
            take(1),
            map((items) => {
                const result = items.find(item => item.id === id) || null;
                this._rwPendidikan.next(result);
                return result;
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('id riwayat ' + id + ' tidak ditemukan!');
                }
                return of(item);
            })
        );
    }

    
    getRwPelatihanById(id: string): Observable<any> {
        return this._rwPelatihans.pipe(
            take(1),
            map((items) => {
                const result = items.find(item => item.id === id) || null;
                this._rwPelatihan.next(result);
                return result;
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('id riwayat ' + id + ' tidak ditemukan!');
                }
                return of(item);
            })
        );
    }
    

    getRwAngkaKreditById(id: string): Observable<any> {
        return this._rwAngkaKredits.pipe(
            take(1),
            map((items) => {
                const result = items.find(item => item.id === id) || null;
                this._rwAngkaKredit.next(result);
                return result;
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('id riwayat ' + id + ' tidak ditemukan!');
                }
                return of(item);
            })
        );
    }
    
    getRwAngkaKreditKonversiById(id: string): Observable<any> {
        return this._rwAngkaKreditKonversis.pipe(
            take(1),
            map((items) => {
                const result = items.find(item => item.id === id) || null;
                this._rwAngkaKreditKonversi.next(result);
                return result;
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('id riwayat ' + id + ' tidak ditemukan!');
                }
                return of(item);
            })
        );
    }

    getRwAngkaKreditAkumulasiById(id: string): Observable<any> {
        return this._rwAngkaKreditAkumulasis.pipe(
            take(1),
            map((items) => {
                const result = items.find(item => item.id === id) || null;
                this._rwAngkaKreditAkumulasi.next(result);
                return result;
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('id riwayat ' + id + ' tidak ditemukan!');
                }
                return of(item);
            })
        );
    }

    getRwAngkaKreditPenetapanById(id: string): Observable<any> {
        return this._rwAngkaKreditPenetapans.pipe(
            take(1),
            map((items) => {
                const result = items.find(item => item.id === id) || null;
                this._rwAngkaKreditPenetapan.next(result);
                return result;
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('id riwayat ' + id + ' tidak ditemukan!');
                }
                return of(item);
            })
        );
    }

    getRwUjiKompetensiById(id: string): Observable<any> {
        return this._rwUjiKompetensis.pipe(
            take(1),
            map((items) => {
                const result = items.find(item => item.id === id) || null;
                this._rwUjiKompetensi.next(result);
                return result;
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('id riwayat ' + id + ' tidak ditemukan!');
                }
                return of(item);
            })
        );
    }

    getRwUjiKemahiranBerbahasaById(id: string): Observable<any> {
        return this._rwUjiKemahiranBerbahasas.pipe(
            take(1),
            map((items) => {
                const result = items.find(item => item.id === id) || null;
                this._rwUjiKemahiranBerbahasa.next(result);
                return result;
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('id riwayat ' + id + ' tidak ditemukan!');
                }
                return of(item);
            })
        );
    }

    getRwKegiatanTranslasiById(id: string): Observable<any> {
        return this._rwKegiatanTranslasis.pipe(
            take(1),
            map((items) => {
                const result = items.find(item => item.id === id) || null;
                this._rwKegiatanTranslasi.next(result);
                return result;
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('id riwayat ' + id + ' tidak ditemukan!');
                }
                return of(item);
            })
        );
    }

    getPenguasaanBahasaById(id: string): Observable<any> {
        return this._penguasaanBahasas.pipe(
            take(1),
            map((items) => {
                const result = items.find(item => item.id === id) || null;
                this._penguasaanBahasa.next(result);
                return result;
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('id riwayat ' + id + ' tidak ditemukan!');
                }
                return of(item);
            })
        );
    }
    getPelatihanById(id: string): Observable<any> {
        return this._Pelatihans.pipe(
            take(1),
            map((items) => {
                const result = items.find(item => item.id === id) || null;
                this._Pelatihan.next(result);
                return result;
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('id riwayat ' + id + ' tidak ditemukan!');
                }
                return of(item);
            })
        );
    }


    ///////////////// LIST /////////////////
    getRwJabatan(id: string):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/profil/rw-jabatan/' + id).pipe(
            tap((response) => {
                if (response?.success) {
                    this._rwJabatans.next(response.mapData.data);
                }
            })
        );
    }

    getRwInstansi(id: string):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/profil/rw-instansi/' + id).pipe(
            tap((response) => {
                if (response?.success) {
                    this._rwInstansis.next(response.mapData.data);
                }
            })
        );
    }

    getRwGolongan(id: string):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/profil/rw-golongan/' + id).pipe(
            tap((response) => {
                if (response?.success) {
                    this._rwGolongans.next(response.mapData.data);
                }
            })
        );
    }



    getRwPendidikan(id: string):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/profil/rw-pendidikan/' + id).pipe(
            tap((response) => {
                if (response?.success) {
                    this._rwPendidikans.next(response.mapData.data);
                }
            })
        );
    }

    getRwPelatihan(id: string):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/profil/rw-pelatihan/' + id).pipe(
            tap((response) => {
                if (response?.success) {
                    this._rwPelatihans.next(response.mapData.data);
                }
            })
        );
    }

    getRwAngkaKredit(id: string):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/profil/rw-angka-kredit/' + id).pipe(
            tap((response) => {
                if (response?.success) {
                    this._rwAngkaKredits.next(response.mapData.data);
                }
            })
        );
    }

    getRwUjiKompetensi(id: string):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/profil/rw-uji-kompetensi/' + id).pipe(
            tap((response) => {
                if (response?.success) {
                    this._rwUjiKompetensis.next(response.mapData.data);
                }
            })
        );
    }


    getRwAngkaKreditKonversi(id: string):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/profil/rw-angka-kredit-konversi/' + id).pipe(
            tap((response) => {
                if (response?.success) {
                    this._rwAngkaKreditKonversis.next(response.mapData.data);
                }
            })
        );
    }

    getRwAngkaKreditAkumulasi(id: string):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/profil/rw-angka-kredit-akumulasi/' + id).pipe(
            tap((response) => {
                if (response?.success) {
                    this._rwAngkaKreditAkumulasis.next(response.mapData.data);
                }
            })
        );
    }
     getRwAngkaKreditPenetapan(id: string):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/profil/rw-angka-kredit-penetapan/' + id).pipe(
            tap((response) => {
                if (response?.success) {
                    this._rwAngkaKreditPenetapans.next(response.mapData.data);
                }
            })
        );
    }

    getRwUjiKemahiranBerbahasa(id):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/profil/rw-sertifikat-bahasa/' + id).pipe(
            tap((response) => {
                if (response?.success) {
                    this._rwUjiKemahiranBerbahasas.next(response.mapData.data);
                }
            })
        );
    }

    getRwKegiatanTranslasi(id):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/profil/rw-kegiatan-translasi/' + id).pipe(
            tap((response) => {
                if (response?.success) {
                    this._rwKegiatanTranslasis.next(response.mapData.data);
                }
            })
        );
    }

    getPenguasaanBahasa(id):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/profil/kemahiran-bahasa/' + id).pipe(
            tap((response) => {
                if (response?.success) {
                    this._penguasaanBahasas.next(response.mapData.data);
                }
            })
        );
    }


    getHistoriUsulProfil(params):
        Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/profil/usul/history', params).pipe(
			map((res) => {
				if (res.success) {
					const results = res.mapData.data;
					const rows: any[] = [];
					if (results.length > 0) {
						results.forEach((element: any) => {
							const payloadResults: any[] = [];

							if (element.payload !== null) {
								const payloadAfter = Object.keys(element.payload).map(function(personNamedIndex) {
									return element.payload[personNamedIndex];
								});

								if (element.payloadBefore) {
									let i = 0;
									element.payloadBefore.forEach((row) => {
										payloadResults.push({ keyLabel: row.keyLabel, before: row.keyValue, after: payloadAfter[i]['keyValue'] });
										i++;
									});
								}
							}
							rows.push(
								{
									'id': element.id,
									'messageEvent': element.messageEvent,
									'eventType': element.eventType,
									'createdDate': moment(element.createdDate).fromNow(),
									'payload': payloadResults
								}
							);
						});
						return rows;
					} else {
						return false;
					}
				} else {
					return false;
				}
			})
		);
    }

    ///////////////// SAVE/UPDATE /////////////////
    saveRwJabatan(body: FormData): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-jabatan/usul-save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        } else {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-jabatan/save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        }
    }

     saveRwInstansi(body: FormData): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-instansi/usul-save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        } else {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-instansi/save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        }
    }
    saveRwGolongan(body: FormData): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-golongan/usul-save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        } else {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-golongan/save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        }
    }



    saveRwPendidikan(body: FormData): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-pendidikan/usul-save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        } else {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-pendidikan/save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        }
    }

    saveRwUjiKompetensi(body: FormData): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-uji-kompetensi/usul-save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        } else {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-uji-kompetensi/save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        }
    }


    saveRwAngkaKreditKonversi(body: FormData): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-angka-kredit-konversi/usul-save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        } else {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-angka-kredit-konversi/save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        }
    }

    saveRwAngkaKreditAkumulasi(body: FormData): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-angka-kredit-akumulasi/usul-save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        } else {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-angka-kredit-akumulasi/save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        }
    }
    
    
    saveRwAngkaKreditPenetapan(body: FormData): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-angka-kredit-penetapan/usul-save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        } else {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-angka-kredit-penetapan/save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        }
    }


    saveRwKegiatanTranslasi(body: FormData): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-kegiatan-translasi/usul-save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        } else {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-kegiatan-translasi/save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        }
    }

    saveRwPelatihan(body: FormData): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-pelatihan/usul-save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        } else {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-pelatihan/save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        }
    }

    saveRwUjiKemahiranBerbahasa(body: FormData): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-sertifikat-bahasa/usul-save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        } else {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-sertifikat-bahasa/save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        }
    }

    saveRwKemahiranBahasa(body: FormData): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.post<any>(this._apiUrl + '/profil/kemahiran-bahasa/usul-save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        } else {
            return this._httpClient.post<any>(this._apiUrl + '/profil/kemahiran-bahasa/save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        }
    }

    saveRwAngkaKredit(body: FormData): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-angka-kredit/usul-save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        } else {
            return this._httpClient.post<any>(this._apiUrl + '/profil/rw-angka-kredit/save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        }
    }

    saveKonversiAngkaKredit(body: FormData): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/profil/usul/konversi-angka-kredit/v2', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
    }

    ///////////////// DELETE /////////////////
    deleteRwGolongan(id: string): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-golongan/usul-delete/' + id);
        } else {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-golongan/delete/' + id);
        }
    }


    deleteRwUjiKompetensi(id: string): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-uji-kompetensi/usul-delete/' + id);
        } else {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-uji-kompetensi/delete/' + id);
        }
    }

    deleteRwAngkaKreditKonversi(id: string): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-angka-kredit-konversi/usul-delete/' + id);
        } else {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-angka-kredit-konversi/delete/' + id);
        }
    }
    deleteRwAngkaKreditAkumulasi(id: string): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-angka-kredit-akumulasi/usul-delete/' + id);
        } else {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-angka-kredit-akumulasi/delete/' + id);
        }
    }
     deleteRwAngkaKreditPenetapan(id: string): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-angka-kredit-penetapan/usul-delete/' + id);
        } else {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-angka-kredit-penetapan/delete/' + id);
        }
    }

    deleteRwJabatan(id: string): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-jabatan/usul-delete/' + id);
        } else {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-jabatan/delete/' + id);
        }
    }
    deleteRwInstansi(id: string): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-instansi/usul-delete/' + id);
        } else {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-instansi/delete/' + id);
        }
    }
    deleteRwKegiatanTranslasi(id: string): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-kegiatan-translasi/usul-delete/' + id);
        } else {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-kegiatan-translasi/delete/' + id);
        }
    }

    deleteRwPelatihan(id: string): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-pelatihan/usul-delete/' + id);
        } else {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-pelatihan/delete/' + id);
        }
    }

    deleteRwPendidikan(id: string): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-pendidikan/usul-delete/' + id);
        } else {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-pendidikan/delete/' + id);
        }
    }

    deleteRwUjiKemahiranBerbahasa(id: string): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-sertifikat-bahasa/usul-delete/' + id);
        } else {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-sertifikat-bahasa/delete/' + id);
        }
    }

    deleteAngkaKredit(id: string): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-angka-kredit/usul-delete/' + id);
        } else {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/rw-angka-kredit/delete/' + id);
        }
    }

    deleteKemahiranBahasa(pnsId: string, bahasaId: string): Observable<any> {
        if (this._authService.role === 'ROLE_USER') {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/kemahiran-bahasa/usul-delete/' + pnsId + '?bahasaId=' + bahasaId);
        } else {
            return this._httpClient.delete<any>(this._apiUrl + '/profil/kemahiran-bahasa/delete/' + pnsId + '?bahasaId=' + bahasaId);
        }
    }

    deleteProfil(id):
        Observable<any> {
        return this._httpClient.delete<any>(this._apiUrl + '/profil/delete/' + id).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('delete error!');
                }
                return of(result);
            })
        );
    }

    getDokumen(id): Observable<any> {
        return this._httpClient.get<any[]>(this._apiUrl + `/profil/dokumen/${id}`,
            this.__HTTPHeaderBlob(this._authService.accessToken, 'blob')
        ).pipe(
            map((response: any) => response)
        );
    }

    uploadAvatar(formData):
        Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/profil/photo/upload', formData).pipe();
    }

    getTotalJp(pnsId: string): Observable<any> {
    return this._httpClient.get<any>(`${this._apiUrl}/profil/total-jp/${pnsId}`);
    }
   getNilaiAkKonversi(pnsId: string, jabatanId: string): Observable<any> {
    return this._httpClient.get<any>(`${this._apiUrl}/profil/nilai-ak-konversi/${pnsId}/${jabatanId}`);
   }
    getLatestTmtGolongan(pnsId: string): Observable<any> {
    return this._httpClient.get<any>(`${this._apiUrl}/profil/${pnsId}/latest-tmt`);
    }
    updateStatus(id: string, isAktif: boolean | null): Observable<any> {
  // Mengirimkan permintaan PUT ke backend untuk memperbarui status penerjemah
    return this._httpClient.put(`${this._apiUrl}/profil/${id}/status`, { isAktif });
    }
    updateStatusKepegawaian(id: string, statusKepegawaian: string | null): Observable<any> {
    // Mengirimkan permintaan PUT ke backend untuk memperbarui status kepegawaian
    return this._httpClient.put(`${this._apiUrl}/profil/${id}/statusKepegawaian`, { statusKepegawaian });
    }
    updateStatusJabatan(id: string, statusJabatan: string | null): Observable<any> {
        // Mengirimkan permintaan PUT ke backend untuk memperbarui status kepegawaian
        return this._httpClient.put(`${this._apiUrl}/profil/${id}/statusJabatan`, { statusJabatan });
        }


}
