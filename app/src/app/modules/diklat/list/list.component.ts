import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject, combineLatest, Subject, takeUntil } from 'rxjs';
import { Category, Course } from '../diklat.types';
// import { DiklatService } from '../diklat.service';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog } from '@angular/material/dialog';
import { CreateComponent } from '../create/create.component';
import { PesertaComponent } from '../peserta/peserta.component';
import { KehadiranComponent } from '../kehadiran/kehadiran.component';
import { SertifikatComponent } from '../sertifikat/sertifikat.component';
import { PenilaianComponent } from '../penilaian/penilaian.component';
import { DiklatService } from 'app/services/diklat.service';
import { HelperService } from 'app/services/helper.service';
import { environment } from 'environments/environment';
import { InstrukturComponent } from '../instruktur/instruktur.component';
import { ToastrService } from 'ngx-toastr';
import { SetBobotComponent } from '../set-bobot/set-bobot.component';
import { SetTemplateSertifikatComponent } from '../set-template-sertifikat/set-template-sertifikat.component';

@Component({
    selector: 'diklat-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiklatListComponent implements OnInit, OnDestroy {
    categories = this._helperService.jenisKegiatanList();
    courses: any;
    filteredCourses: any;
    role: string = this._authService.role;
    filters: {
        categorySlug$: BehaviorSubject<string>;
        query$: BehaviorSubject<string>;
        hideCompleted$: BehaviorSubject<boolean>;
    } = {
            categorySlug$: new BehaviorSubject('all'),
            query$: new BehaviorSubject(''),
            hideCompleted$: new BehaviorSubject(false)
        };

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _authService: AuthService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _diklatService: DiklatService,
        private _helperService: HelperService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _matDialog: MatDialog,
        private _toastr: ToastrService,
    ) {
    }

    ngOnInit(): void {

        // Get the courses
        this._diklatService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((courses: any) => {
                this.courses = this.filteredCourses = courses;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Filter the courses
        combineLatest([this.filters.categorySlug$, this.filters.query$, this.filters.hideCompleted$])
            .subscribe(([categorySlug, query, hideCompleted]) => {

                // Reset the filtered courses
                this.filteredCourses = this.courses;

                // Filter by category
                if (categorySlug !== 'all') {
                    this.filteredCourses = this.filteredCourses.filter(course => course.category === categorySlug);
                }

                // Filter by search query
                if (query !== '') {
                    this.filteredCourses = this.filteredCourses.filter(course => course.title.toLowerCase().includes(query.toLowerCase())
                        || course.description.toLowerCase().includes(query.toLowerCase())
                        || course.category.toLowerCase().includes(query.toLowerCase()));
                }

                // Filter by completed
                if (hideCompleted) {
                    this.filteredCourses = this.filteredCourses.filter(course => course.progress.completed === 0);
                }
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    getFilePath(file): any {
        if (file !== null) {
            return environment.baseUrl + file;
        } else {
            return './assets/images/cards/01-320x200.jpg';
        }
    }

    toggleCreate(): void {
        const dialogRef = this._matDialog.open(CreateComponent, { autoFocus: false });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._diklatService.getList().subscribe();
            }
        });
    }

    toggleEdit(data): void {
        const dialogRef = this._matDialog.open(CreateComponent, { autoFocus: false, data });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._diklatService.getList().subscribe();
            }
        });
    }

    toggleInstruktur(data): void {
        const dialogRef = this._matDialog.open(InstrukturComponent, { autoFocus: false, data });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._diklatService.getList().subscribe();
            }
        });
    }

    togglePeserta(data): void {
        const dialogRef = this._matDialog.open(PesertaComponent, { autoFocus: false, data });
        dialogRef.afterClosed().subscribe(() => {
            // if (result) {
            //     this._referensiInstansiService.getList().subscribe();
            // }
        });
    }

    toggleKelola(data): void {
        const dialogRef = this._matDialog.open(PesertaComponent, { autoFocus: false, data });
        dialogRef.afterClosed().subscribe(() => {
            // if (result) {
            //     this._referensiInstansiService.getList().subscribe();
            // }
        });
    }

    toggleBobot(data): void {
        const dialogRef = this._matDialog.open(SetBobotComponent, { autoFocus: false, data });
        dialogRef.afterClosed().subscribe(() => {
            this._diklatService.getList().subscribe();
        });
    }

    toggleTemplateSertifikat(data): void {
        const dialogRef = this._matDialog.open(SetTemplateSertifikatComponent, { autoFocus: false, data });
        dialogRef.afterClosed().subscribe(() => {
            this._diklatService.getList().subscribe();
        });
    }

    togglePenilaian(data): void {
        const dialogRef = this._matDialog.open(PenilaianComponent, { autoFocus: false, data });
        dialogRef.afterClosed().subscribe(() => {
            // if (result) {
            //     this._referensiInstansiService.getList().subscribe();
            // }
        });
    }

    toggleKehadiran(data): void {
        const dialogRef = this._matDialog.open(KehadiranComponent, { autoFocus: false, data });
        dialogRef.afterClosed().subscribe(() => {
            // if (result) {
            //     this._referensiInstansiService.getList().subscribe();
            // }
        });
    }

    toggleSertifikat(data): void {
        const dialogRef = this._matDialog.open(SertifikatComponent, { autoFocus: false, data });
        dialogRef.afterClosed().subscribe(() => {
            // if (result) {
            //     this._referensiInstansiService.getList().subscribe();
            // }
        });
    }

    toggleDelete(id): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Hapus Diklat',
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
                this._diklatService.courseDelete(id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Diklat berhasil dihapus');
                            this._diklatService.getList().subscribe();
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    filterByQuery(query: string): void {
        this.filters.query$.next(query);
    }

    filterByCategory(change: MatSelectChange): void {
        this.filters.categorySlug$.next(change.value);
    }

    toggleCompleted(change: MatSlideToggleChange): void {
        this.filters.hideCompleted$.next(change.checked);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
