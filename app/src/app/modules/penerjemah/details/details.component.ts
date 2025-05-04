import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { PenerjemahListComponent } from '../list/list.component';
import { EmployeeMenu, Pegawai } from '../penerjemah.types';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { environment } from 'environments/environment';

@Component({
    selector: 'contacts-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PenerjemahDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    jfpItem: any;
    form: FormGroup;
    userStatus: string;
    jfpItems: any[];
    baseUrl = environment.baseUrl;
    menus: any[] = [
        { id: 'pribadi', title: 'Data Utama' },
            { id: 'jabatan', title: 'Riwayat Jabatan' },
            { id: 'golongan', title: 'Riwayat Pangkat / Golongan' },
            { id: 'mutasi', title: 'Riwayat Mutasi' },
            { id: 'pendidikan', title: 'Riwayat Pendidikan Tinggi' },
            { id: 'pelatihan', title: 'Riwayat Pelatihan' },
            { id: 'uji_kompetensi', title: 'Riwayat Uji Kompetensi' },
            { id: 'kegiatan_penerjemahan', title: 'Riwayat Kegiatan Penerjemahan' },
            { id: 'angka_kredit', title: 'Riwayat Angka Kredit' },
            { id: 'penguasaan_bahasa', title: 'Riwayat Kemahiran Berbahasa' },
    ];
    selectedMenu: any = this.menus[0];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _penerjemahListComponent: PenerjemahListComponent,
        private _penerjemahService: PenerjemahService,
        private _formBuilder: FormBuilder,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this._penerjemahListComponent.matDrawer.open();

        // Create the contact form
        this.form = this._formBuilder.group({
            id: [''],
            avatar: [null],
            name: ['', [Validators.required]],
            emails: this._formBuilder.array([]),
            phoneNumbers: this._formBuilder.array([]),
            title: [''],
            company: [''],
            birthday: [null],
            address: [null],
            notes: [null],
            tags: [[]],
            
        });

      
        this._penerjemahService.jfpItem$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                // Open the drawer in case it is closed
                this._penerjemahListComponent.matDrawer.open();
                console.log('Received jfpItem:', item);
                // Get the contact
                this.jfpItem = item;

                this.selectedMenu = this.menus[0];

                this.form.patchValue(item);

                this.toggleEditMode(false);

                this._changeDetectorRef.markForCheck();
                

                
            });
    }

    ngAfterViewInit(): void {
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Dispose the overlays if they are still on the DOM
        if (this._tagsPanelOverlayRef) {
            this._tagsPanelOverlayRef.dispose();
        }
    }

updateStatus() {
  const status = this.jfpItem.isAktif;
  this._changeDetectorRef.detectChanges();
  
  this._penerjemahService.updateStatus(this.jfpItem.pnsId, status).pipe(
    catchError((error) => {
      // Jika ada error, misalnya error 500 (Internal Server Error), abaikan atau log error
      console.error('Internal Server Error:', error);  // Log error ke konsol
      // Mengabaikan error dan melanjutkan eksekusi aplikasi
      return of(null);  // Mengembalikan observable kosong
    })
  ).subscribe(
    (response) => {
      if (response) {
        console.log('Status updated successfully:', response);
        this._changeDetectorRef.detectChanges();
      } else {
        console.log('Status update failed, but no further action needed.');
      }
    },
    (error) => {
      // Penanganan lebih lanjut jika dibutuhkan
      console.log('Error during status update:', error);
    }
  );
}


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._penerjemahListComponent.matDrawer.close();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        }
        else {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }


    /**
     * Upload avatar
     *
     * @param fileList
     */
    uploadAvatar(fileList: FileList): void {
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
        formData.append('file', file);
        // Upload the avatar
        this._penerjemahService.uploadAvatar(formData).subscribe();
    }

    /**
     * Remove the avatar
     */
    removeAvatar(): void {
        // Get the form control for 'avatar'
        const avatarFormControl = this.form.get('avatar');

        // Set the avatar as null
        avatarFormControl.setValue(null);

        // Set the file input value as null
        this._avatarFileInput.nativeElement.value = null;

        // Update the contact
        this.jfpItem.urlPhoto = null;
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
