import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AuthSignInComponent implements OnInit, OnDestroy {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            usernameOrEmail: [null, [Validators.required]],
            password: [null, Validators.required],
            rememberMe: [null],
            fcmId: [null]
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value)
            .subscribe({
                error: (message) => {
                    this.alert = {
                        type: 'error',
                        message: message
                    };
                    this.showAlert = true;
                    this.signInForm.enable();
                },
                complete: () => {
                    this.signInNgForm.resetForm();
                    this.signInForm.enable();
                    // this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe();
                    this._router.navigateByUrl('/signed-in-redirect');
                }
                // () => {
                //     this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe();
                //     // Set the redirect url.
                //     // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                //     // to the correct page after a successful sign in. This way, that url can be set via
                //     // routing file and we don't have to touch here.
                //     // const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

                //     // Navigate to the redirect url
                //     this._router.navigateByUrl('/signed-in-redirect');

                // },
                // (response) => {

                //     // Re-enable the form
                //     this.signInForm.enable();

                //     // Reset the form
                //     this.signInNgForm.resetForm();

                //     // Set the alert
                //     this.alert = {
                //         type: 'error',
                //         message: response.error.message
                //     };

                //     // Show the alert
                //     this.showAlert = true;
                // }
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
