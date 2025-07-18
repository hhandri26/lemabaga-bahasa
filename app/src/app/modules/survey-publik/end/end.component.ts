import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { Subject } from 'rxjs';
import { SurveyKuisonerService } from 'app/services/survey-kuisoner.service';

@Component({
    selector: 'survey-publik-end',
    templateUrl: './end.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class SurveyPublikEndComponent implements OnInit, OnDestroy {
    // @ViewChild('surveyPublikNgForm') surveyPublikNgForm: NgForm;

    // alert: { type: FuseAlertType; message: string } = {
    //     type: 'success',
    //     message: ''
    // };
    // surveyPublikForm: UntypedFormGroup;
    // showAlert: boolean = false;
    // surveyKuisonerId: string;
    // private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        // private _authService: AuthService,
        private _surveyKuisonerService: SurveyKuisonerService,
        private _formBuilder: UntypedFormBuilder,
        private _route: ActivatedRoute,
        private _router: Router    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // this.surveyKuisonerId = this._route.snapshot.paramMap.get('id')!;
        // // Create the form
        // this.surveyPublikForm = this._formBuilder.group({
        //     nama: [null, [Validators.required]],
        //     email: [null, Validators.required],
        //     participantType: ["OTHERS", Validators.required],
        //     // rememberMe: [null],
        //     // fcmId: [null]
        // });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Survey Publik
     */
    // start(): void {
    //     // Return if the form is invalid
    //     if (this.surveyPublikForm.invalid) {
    //         return;
    //     }

    //     // Disable the form
    //     this.surveyPublikForm.disable();

    //     // Hide the alert
    //     this.showAlert = false;

    //     const payload = {
    //         surveyKuisonerId: this.surveyKuisonerId,
    //         participants: [this.surveyPublikForm.value]
    //     };

    //     // Sign in
    //     this._surveyKuisonerService.addPublicParticipantKuisoner(payload)
    //         .subscribe({
    //             next: (res) => {
    //                 this.surveyPublikNgForm.resetForm();
    //                 this.surveyPublikForm.enable();

    //                 const participantType = res?.mapData?.participantType;
    //                 const hash = res?.mapData?.hash;
                    
    //                 if (hash) {
    //                     this._router.navigate(
    //                         ['/survey-user-kuisoner/start', hash],
    //                         { queryParams: { participantType: participantType } }
    //                       );
    //                 } else {
    //                     this.alert = {
    //                         type: 'error',
    //                         message: 'Error ketika memulai survey.'
    //                     };
    //                     this.showAlert = true;
    //                 }
    //             },
    //             error: (message) => {
    //                 this.alert = {
    //                     type: 'error',
    //                     message: message
    //                 };
    //                 this.showAlert = true;
    //                 this.surveyPublikForm.enable();
    //             }
    //         });

    // }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        // this._unsubscribeAll.next(null);
        // this._unsubscribeAll.complete();
    }
}
