/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FuseAlertType } from '@fuse/components/alert';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Subject, takeUntil } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Component({
    selector: 'settings-account',
    templateUrl: './account.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsAccountComponent implements OnInit {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    form: UntypedFormGroup;
    participantId: string;
    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    isLoadingSubmit = false;
    photo: any;
    profile$: Observable<any> = this._userService.user$;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _userService: UserService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

    }

    uploadAvatar(participantId, fileList: FileList): void {
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

        const data = this.readFileAsync(file);
        data.then((photo: any) => {
            // this._participantService.uploadAvatar(participantId, {
            //     photo
            // }).subscribe((item) => {
            //     if(item?.status){
            //         const el = (document.getElementById('photo') as HTMLImageElement);
            //         if (el) {
            //             console.log(item.data);
            //             el.src = item.data.photo;
            //             this._userService.getProfile().subscribe();
            //             this._userService.get().subscribe();
            //             this._changeDetectorRef.markForCheck();
            //         }
            //     }
            // });
        });
    }

    readFileAsync(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    removeAvatar(): void {
        const avatarFormControl = this.form.get('photo');
        avatarFormControl.setValue(null);

        // Set the file input value as null
        this._avatarFileInput.nativeElement.value = null;
        // this.fetch();
    }
}
