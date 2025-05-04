/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, filter, finalize, map, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { UserService } from 'app/services/user.service';

@Component({
    templateUrl: './create.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class CreateComponent implements OnInit, OnDestroy {
    isLoading = false;
    form: FormGroup;

    resultInstansi: any[];
    roles$: Observable<any[]> = this._referensiService.roles();

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CreateComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _userService: UserService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            name: ['', [Validators.required]],
            nip: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            instansiId: ['', [Validators.required, this._helperService.requireMatch]],
            jabatanNama: ['', [Validators.required]],
            roles: ['ROLE_USER', [Validators.required]],
            kategori: ['', [Validators.required]], // Menambahkan kontrol kategori
            satuanorganisasi: ['', [Validators.required]], // Menambahkan kontrol kategori
            unitkerja: ['', [Validators.required]] // Menambahkan kontrol kategori
        });

        this.form.get('instansiId').valueChanges
        .pipe(
            debounceTime(300),
            takeUntil(this._unsubscribeAll),
            tap(() => this.isLoading = true),
            map((value) => {
                if (!value || value.length < 2) {
                    this.resultInstansi = null;
                }
                return value;
            }),
            filter(value => value && value.length >= 2),
            switchMap(value => this._referensiService.instansi({ q: value }).pipe(
                finalize(() => this.isLoading = false),
            ))
        ).subscribe((items: any) => {
            this.resultInstansi = items?.content;
            this._changeDetectorRef.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    create(): void {
        const params: any = this.form.getRawValue();
        params.username = params.nip;
        // params.instansiId = params.instansiId.id;
        params.roles = [params.roles];
        this._userService.save(params).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Pengguna berhasil ditambahkan, password akan dikirimkan melalui email', 'Tambah pengguna berhasil');
                    this.form.reset();
                    this.matDialogRef.close(true);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    displayInstansiFn(item: { nama: string; jenis: string }) {
        if (item) { return item.nama; }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
