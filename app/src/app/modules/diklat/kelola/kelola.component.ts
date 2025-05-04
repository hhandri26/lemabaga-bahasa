/* eslint-disable no-var */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatTabGroup } from '@angular/material/tabs';
import { BehaviorSubject, finalize, Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { HelperService } from 'app/services/helper.service';
import { DiklatService } from 'app/services/diklat.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'environments/environment';
import { ActivatedRoute } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog } from '@angular/material/dialog';
import { CreateSesiComponent } from '../create-sesi/create-sesi.component';
import { CreateAktivitasComponent } from '../create-aktivitas/create-aktivitas.component';
import { CreateAktivitasMateriComponent } from '../create-aktivitas-materi/create-aktivitas-materi.component';
import { CreateAktivitasUrlComponent } from '../create-aktivitas-url/create-aktivitas-url.component';
import { CreateAktivitasTugasMateriComponent } from '../create-aktivitas-tugas-materi/create-aktivitas-tugas-materi.component';
import { CreateTestComponent } from '../create-test/create-test.component';

@Component({
    selector: 'diklat-kelola',
    styleUrls: ['./kelola.component.scss'],
    templateUrl: './kelola.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiklatKelolaComponent implements OnInit, OnDestroy {
    course: any;
    currentStep: number = 0;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    baseUrl = environment.baseUrl;
    courseId = this.route.snapshot.paramMap.get('id');
    sections = new Subject();
    courseData: any = new Subject();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _diklatService: DiklatService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toastr: ToastrService,
        private route: ActivatedRoute,
        private _matDialog: MatDialog,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.fetch();
    }

    fetch() {
        this._diklatService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((course: any) => {
                console.log('====>', course);
                // Get the course
                this.course = course;
                this.sections.next(course.sections);
                this.courseData.next(course);
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    toggleTestSet(data, jenis): void {
        data.jenis = jenis;
        const dialogRef = this._matDialog.open(CreateTestComponent, { data, autoFocus: false, width: '50%' });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('toggleTestSet', result);
            if (result) {
                this._diklatService.getById(this.course.id).subscribe();
            }
        });
    }

    toggleSectionCreate(data): void {
        data.section = null;
        const dialogRef = this._matDialog.open(CreateSesiComponent, { data, autoFocus: false, width: '50%' });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('toggleSectionCreate', result);
            if (result) {
                this._diklatService.getById(this.course.id).subscribe();
            }
        });
    }

    toggleSectionEdit(data, section): void {
        data.section = section;
        const dialogRef = this._matDialog.open(CreateSesiComponent, { data, autoFocus: false, width: '50%' });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('toggleSectionEdit', result);
            if (result) {
                this._diklatService.getById(this.course.id).subscribe();
            }
        });
    }

    toggleAktivtiasCreate(course, section): void {
        const data: any = {};
        data.course = course;
        data.section = section;
        data.activity = null;
        console.log(data);
        // return;
        const dialogRef = this._matDialog.open(CreateAktivitasComponent, { data, autoFocus: false, width: '50%' });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('toggleAktivtiasCreate', result);
            if (result) {
                this._diklatService.getById(this.course.id).subscribe();
            }
        });
    }

    toggleAktivtiasMateriCreate(data): void {
        console.log(data);
        // return;
        const dialogRef = this._matDialog.open(CreateAktivitasMateriComponent, { data, autoFocus: false, width: '50%' });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('toggleAktivtiasMateriCreate', result);
            if (result) {
                this._diklatService.getById(this.course.id).subscribe();
            }
        });
    }

    toggleAktivtiasUrlCreate(data): void {
        console.log(data);
        // return;
        const dialogRef = this._matDialog.open(CreateAktivitasUrlComponent, { data, autoFocus: false, width: '50%' });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('toggleAktivtiasUrlCreate', result);
            if (result) {
                this._diklatService.getById(this.course.id).subscribe();
            }
        });
    }

    toggleAktivtiasAssignMateriCreate(data): void {
        console.log(data);
        // return;
        const dialogRef = this._matDialog.open(CreateAktivitasTugasMateriComponent, { data, autoFocus: false, width: '50%' });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('toggleAktivtiasAssignMateriCreate', result);
            if (result) {
                this._diklatService.getById(this.course.id).subscribe();
            }
        });
    }

    updateFile(fileList: FileList, course): void {
        // Return if canceled
        if (!fileList.length) {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        const file = fileList[0];

        // Return if the file is not allowed
        if (!allowedTypes.includes(file.type)) {
            return;
        }
        const formData = new FormData();
        formData.append('id', course.id);
        formData.append('title', course.title);
        formData.append('summary', course.summary);
        formData.append('startDate', course.startDate);
        formData.append('endDate', course.endDate);
        formData.append('file', file);
        // Upload the avatar
        this._diklatService.courseModify(formData).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Updated');
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    updateDateRangeCourse(dataUpdated, course) {
        if (dataUpdated.startDate !== course.startDate || dataUpdated.endDate !== course.endDate) {
            const formData = new FormData();
            formData.append('id', course.id);
            formData.append('title', course.title);
            formData.append('summary', course.summary);
            formData.append('startDate', dataUpdated.startDate);
            formData.append('endDate', dataUpdated.endDate);
            this._diklatService.courseModify(formData).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
                // this.loadCourse();
                // this.reload();
            })).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Updated');
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        }
    }

    updateCourse(dataUpdated, course, name) {
        if (dataUpdated !== course[name]) {
            const __queryParams = {
                id: course.id,
                title: course.title,
                summary: course.summary,
                startDate: course.startDate,
                endDate: course.endDate
            };
            __queryParams[name] = dataUpdated;

            const formData = new FormData();
            formData.append('id', course.id);
            formData.append('title', __queryParams.title);
            formData.append('summary', __queryParams.summary);
            formData.append('startDate', course.startDate);
            formData.append('endDate', course.endDate);
            this._diklatService.courseModify(formData).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
                // this.loadCourse();
                // this.reload();
            })).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Updated');
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        }
    }

    updateActivityGroup(dataUpdated, activityGroup, name) {
        if (dataUpdated !== activityGroup[name]) {
            const __queryParams = activityGroup;
            __queryParams[name] = dataUpdated;

            console.log('DiklatEditComponent->__queryParams', __queryParams);

            const queryParams = {
                id: __queryParams.id,
                title: __queryParams.title,
                activityGroupDate: __queryParams.activityDate,
                startTime: __queryParams.startTime,
                endTime: __queryParams.endTime,
                pelaksana: __queryParams.pelaksana,
                jp: __queryParams.jp
            };
            console.log('DiklatEditComponent->queryParams', queryParams);
            this._diklatService.activityGroupModify(queryParams).pipe(finalize(() => {
                // this.loadCourse();
            })).subscribe(
                (data) => {
                    console.log('DiklatEditComponent->response', data);
                    if (data.success) {
                        this._toastr.success('Updated');
                    } else {
                        this._toastr.error(data.message);
                    }
                },
                err => this._toastr.error(err.error.message)
            );
        }
    }

    // HAPUS
    toggleDeleteActivityGroup(activity) {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Hapus Aktivitas `' + activity.title + '` ?',
            'message': '<span class="font-medium">Tindakan ini tidak dapat dibatalkan!</span>',
            'icon': {
                'show': true,
                'name': 'heroicons_outline:check',
                'color': 'primary'
            },
            'actions': {
                'confirm': {
                    'show': true,
                    'label': 'Hapus',
                    'color': 'primary'
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
                console.log(activity);
                this._diklatService.activityGroupDelete(activity.id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Hapus aktivitas berhasil');
                            this._diklatService.getById(this.course.id).subscribe();
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    toggleDeleteSectionGroup(section) {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Hapus Aktivitas `' + section.title + '` ?',
            'message': '<span class="font-medium">Tindakan ini tidak dapat dibatalkan!</span>',
            'icon': {
                'show': true,
                'name': 'heroicons_outline:check',
                'color': 'primary'
            },
            'actions': {
                'confirm': {
                    'show': true,
                    'label': 'Hapus',
                    'color': 'primary'
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
                console.log(section);
                this._diklatService.sectionDelete(section.id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Hapus sesi berhasil');
                            this._diklatService.getById(this.course.id).subscribe();
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    toggleDeleteActivityDetail(activityDetail) {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Hapus Aktivitas `' + activityDetail.activityType + '` ?',
            'message': '<span class="font-medium">Tindakan ini tidak dapat dibatalkan!</span>',
            'icon': {
                'show': true,
                'name': 'heroicons_outline:check',
                'color': 'primary'
            },
            'actions': {
                'confirm': {
                    'show': true,
                    'label': 'Hapus',
                    'color': 'primary'
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
                console.log(activityDetail);
                // this._diklatService.activityDetailDelete(activityDetail.id).subscribe(
                //     (result) => {
                //         if (result?.success) {
                //             this._toastr.success('Hapus aktivitas detail berhasil');
                //             // this.form.reset();
                //         } else {
                //             this._toastr.error(result?.message, 'ERROR');
                //         }
                //     }
                // );
            }
        });
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
