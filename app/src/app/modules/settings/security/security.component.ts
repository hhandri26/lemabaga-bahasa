/* eslint-disable @typescript-eslint/naming-convention */
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { FuseAlertType } from '@fuse/components/alert';
import { UserService } from 'app/services/user.service';
import { finalize } from 'rxjs';
import { ConfirmPasswordValidator } from './confirm-password.validator';

@Component({
    selector: 'settings-security',
    templateUrl: './security.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsSecurityComponent implements OnInit {
    form: UntypedFormGroup;
    isLoadingSubmit = false;
    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
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
        // Create the form
        this.form = this._formBuilder.group({
            // current_password: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]],
            password_confirmation: ['', Validators.required],
        }, {
            validators: ConfirmPasswordValidator('password', 'password_confirmation')
        });
    }

    save(): void {
        if (this.form.invalid) {
            return;
        }

        const formInput = this.form.getRawValue();
        // const params: any = {
        //     // current_password: formInput.current_password,
        //     password: formInput.password,
        //     password_confirmation: formInput.password_confirmation
        // };
        // console.log(params);
        const formData = new FormData();
        formData.append('password', formInput.password_confirmation);

        this.form.disable();
        this.isLoadingSubmit = true;
        this._userService.change_password(formData).pipe(
            finalize(() => {
                this.form.enable();
                this.isLoadingSubmit = false;
            }))
            .subscribe({
                next: (response) => {
                    if (response?.success === true) {
                        this.alert = {
                            type: 'success',
                            message: 'Password berhasil diperbaharui'
                        };
                        // this._userService.getProfile().subscribe();
                        // this.fetch();
                    } else {
                        this.alert = {
                            type: 'error',
                            message: response?.message ?? 'Terjadi kesalahan, harap coba lagi'
                        };
                    }
                    this.showAlert = true;
                },
                error: (error) => {
                    this.alert = {
                        type: 'error',
                        message: error?.error.message ?? 'Terjadi kesalahan, harap coba lagi'
                    };
                    this.showAlert = true;
                },
                complete: () => {
                    this.form.enable();
                    this.isLoadingSubmit = false;
                }
            });
    }
}
