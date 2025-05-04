    /* eslint-disable @typescript-eslint/explicit-function-return-type */
    /* eslint-disable @typescript-eslint/naming-convention */
    import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
    import { FormBuilder, FormGroup, Validators } from '@angular/forms';
    import { MatDrawerToggleResult } from '@angular/material/sidenav';
    import { Observable, Subject } from 'rxjs';
    import { debounceTime, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
    import { UsersListComponent } from '../list/list.component';
    import { ActivatedRoute, Router } from '@angular/router';
    import { UserService } from 'app/services/user.service';
    import { ReferensiService } from 'app/services/referensi.service';
    import { ToastrService } from 'ngx-toastr';
    import { FuseConfirmationService } from '@fuse/services/confirmation';
    import { MatDialog } from '@angular/material/dialog';
    import { ChangePasswordComponent } from '../change-password/change-password.component';
    import { PenerjemahService } from 'app/services/penerjemah.service';


    @Component({
        templateUrl: './details.component.html',
        encapsulation: ViewEncapsulation.None,
        changeDetection: ChangeDetectionStrategy.OnPush
    })
    export class UsersDetailsComponent implements OnInit, OnDestroy {
        isLoading = false;
        editMode: boolean = true;
        changePasswordMode: boolean = false;
        rwInstansi: any[] = [];
        tagsEditMode: boolean = false;
        form: FormGroup;
        selected: any;
        items: any[];
        resultInstansi: any[];
        roles$: Observable<any[]> = this._referensiService.roles();
        private _unsubscribeAll: Subject<any> = new Subject<any>();

        constructor(
            private _activatedRoute: ActivatedRoute,
            private _changeDetectorRef: ChangeDetectorRef,
            private _usersComponent: UsersListComponent,
            private _userService: UserService,
            private _formBuilder: FormBuilder,
            private _referensiService: ReferensiService,
            private _fuseConfirmationService: FuseConfirmationService,
            private _router: Router,
            private _matDialog: MatDialog,
            private _toastr: ToastrService
        ) {
        }

        ngOnInit(): void {
            this._usersComponent.matDrawer.open();

            this.form = this._formBuilder.group({
                id: [''],
                name: ['', [Validators.required]],
                nip: ['', [Validators.required]],
                email: ['', [Validators.required, Validators.email]],
                instansiId: ['', [Validators.required]],
                namaInstansi:[''],
                jabatanNama: [''],
                satuanorganisasi: [],
                unitkerja:[],
                roles: ['ROLE_ADMIN_KEPEGAWAIAN_INSTANSI', [Validators.required]],
                kategori: ['', [Validators.required]], // Menambahkan kontrol kategori
               
            });

            this._userService.items$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((items: any[]) => {
                    this.items = items;
                    this._changeDetectorRef.markForCheck();
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

            this._userService.item$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((selected: any) => {
                    this._usersComponent.matDrawer.open();
                    this.selected = selected;
                    this.form.controls['name'].setValue(selected.nama);
                    this.form.controls['roles'].setValue(selected.roles[0]);
                    this.form.controls['email'].setValue(selected.email);
                    this.form.controls['nip'].setValue(selected.nip);
                    this.form.controls['kategori'].setValue(selected.kategori);
                    this.form.controls['satuanorganisasi'].setValue(selected.satuanorganisasi);
                    this.form.controls['unitkerja'].setValue(selected.unitkerja);
                    this.form.controls['jabatanNama'].setValue(selected.jabatanNama);
                    
                    this._userService.getRwInstansi(selected.pnsId)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response: any) => {
        console.log('Response:', response);
        if (response && response.success && response.mapData && Array.isArray(response.mapData.data)) {
            const instansiData = response.mapData.data[0]; // Ambil elemen pertama dari array data
            if (instansiData) {
                this.rwInstansi = instansiData;
                this.form.patchValue({ namaInstansi: instansiData.namaInstansi });
                this.form.patchValue({ satuanorganisasi: instansiData.satuanorganisasi });
                this.form.patchValue({ unitkerja: instansiData.unitkerja });
            } else {
                this.rwInstansi = null; // Atau bisa mengatur nilai default lainnya
            }
        } else {
            this.rwInstansi = null; // Jika tidak ada data yang valid
        }
        this._changeDetectorRef.markForCheck();
    }, error => {
        console.error('Error fetching rwInstansi:', error);
    });


                        
                        this.toggleEditMode(false);
                        this._changeDetectorRef.markForCheck();
                    });
            }

        ngOnDestroy(): void {
            this._unsubscribeAll.next(null);
            this._unsubscribeAll.complete();
        }

        toggleDeleteMode(id): void {
            const dialogRef = this._fuseConfirmationService.open({
                'title': 'Hapus Pengguna',
                'message': '<span class="font-medium">Tindakan ini tidak dapat dibatalkan!</span>',
                'icon': {
                    'show': true,
                    'name': 'heroicons_outline:x',
                    'color': 'warn'
                },
                'actions': {
                    'confirm': {
                        'show': true,
                        'label': 'Konfirm hapus',
                        'color': 'warn'
                    },
                    'cancel': {
                        'show': true,
                        'label': 'Batal'
                    }
                },
                'dismissible': true
            });
            dialogRef.afterClosed().subscribe((_result) => {
                if (_result === 'confirmed') {
                    this._userService.delete(id).subscribe(
                        (result: any) => {
                            if (result?.success) {
                                this._toastr.success('Pengguna telah dihapus');
                                this._userService.getList().subscribe();
                                this.toggleEditMode(false);
                            } else {
                                this._toastr.error(result?.message, 'ERROR');
                            }
                        }
                    );
                }
            });
        }

        closeDrawer(): Promise<MatDrawerToggleResult> {
            return this._usersComponent.matDrawer.close();
        }

        toggleEditMode(changePasswordMode: boolean | null = null): void {
            if (changePasswordMode === null) {
                this.changePasswordMode = !this.changePasswordMode;
            }
            else {
                this.changePasswordMode = changePasswordMode;
            }
            this._changeDetectorRef.markForCheck();
        }

        toggleChangePassword(data): void {
            const dialogRef = this._matDialog.open(ChangePasswordComponent, { data, autoFocus: false });
            dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    this._usersComponent.matDrawer.close();
                }
            });
        }

        toggleResetPassword(_item): void {
            const dialogRef = this._fuseConfirmationService.open({
                'title': 'Apakah Anda yakin untuk melakukan reset password pada user `' + _item.nama + '` ?',
                'message': '<span class="font-medium">Password baru akan dikirimkan ke email `' + _item.email + '`</span>',
                'icon': {
                    'show': true,
                    'name': 'heroicons_outline:x',
                    'color': 'warn'
                },
                'actions': {
                    'confirm': {
                        'show': true,
                        'label': 'Konfirm reset',
                        'color': 'warn'
                    },
                    'cancel': {
                        'show': true,
                        'label': 'Batal'
                    }
                },
                'dismissible': true
            });

            dialogRef.afterClosed().subscribe((_result) => {
                if (_result === 'confirmed') {
                    this._userService.reset_password(_item.email, _item.nip).subscribe(
                        (result) => {
                            if (result?.success) {
                                this._toastr.success('Password pada user `' + _item.nama + '` telah dikirimkan ke email ' + _item.email);
                                this._usersComponent.matDrawer.close();
                            } else {
                                this._toastr.error(result?.message, 'ERROR');
                            }
                        }
                    );
                }
            });
        }


        update(): void {
            const params: any = this.form.getRawValue();
            params.id = this.selected.id;
            params.username = params.nip;
            params.instansiId = params.instansiId.id;
            params.roles = [params.roles];
            this._userService.save(params).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Pengguna berhasil diperbaharui', 'Update berhasil');
                        this.toggleEditMode(false);
                        this._userService.getList().subscribe();
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        }

        delete(): void {
            const id = this.selected.id;
            const currentContactIndex = this.items.findIndex(item => item.id === id);
            const nextContactIndex = currentContactIndex + ((currentContactIndex === (this.items.length - 1)) ? -1 : 1);
            const nextContactId = (this.items.length === 1 && this.items[0].id === id) ? null : this.items[nextContactIndex].id;

            this._userService.delete(id)
                .subscribe((isDeleted) => {
                    if (!isDeleted) {
                        return;
                    }
                    if (nextContactId) {
                        this._router.navigate(['../', nextContactId], { relativeTo: this._activatedRoute });
                    }
                    else {
                        this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                    }
                    this.toggleEditMode(false);
                });
            this._changeDetectorRef.markForCheck();
        }

        trackByFn(index: number, item: any): any {
            return item.id || index;
        }

        displayInstansiFn(item: { nama: string; jenis: string }) {
            if (item) { return item.nama; }
        }
    }
