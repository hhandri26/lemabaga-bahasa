/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, filter, finalize, map, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { UserService } from 'app/services/user.service';

@Component({
    templateUrl: './change-password.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
    isLoading = false;
    form: FormGroup;

    resultInstansi: any[];
    roles$: Observable<any[]> = this._referensiService.roles();

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<ChangePasswordComponent>,
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
			password: new FormControl('', Validators.compose([
				Validators.required,
				Validators.minLength(6)
			])),
			confirmpassword: new FormControl('', Validators.compose([
				Validators.required,
				// Validators.minLength(6)
			])),
		}, {
			validators: this.password.bind(this)
		});
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    password(formGroup: FormGroup) {
		const { value: password } = formGroup.get('password');
		const { value: confirmPassword } = formGroup.get('confirmpassword');
		return password === confirmPassword ? null : { passwordNotMatch: true };
	}

    save(): void {
        const params: any = this.form.getRawValue();
        params.password = params.confirmpassword;
        params.userId = this._data.id;
        this._userService.change_password(params).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Password berhasil diubah');
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
