/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

export function ConfirmPasswordValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];
        if (
            matchingControl.errors &&
            !matchingControl.errors.confirmPasswordValidator
        ) {
            return;
        }
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ confirmPasswordValidator: true });
        } else {
            matchingControl.setErrors(null);
        }
    };
}

export const PasswordStrengthValidator = function(control: AbstractControl): ValidationErrors | null {

    const value: string = control.value || '';
    if (!value) {return null;}

    const upperCaseCharacters = /[A-Z]+/g;
    if (upperCaseCharacters.test(value) === false) {return { passwordStrength: 'Minimal mengandung satu karakter huruf besar' };}

    const lowerCaseCharacters = /[a-z]+/g;
    if (lowerCaseCharacters.test(value) === false) {return { passwordStrength: 'Minimal mengandung satu karakter huruf kecil' };}

    const numberCharacters = /[0-9]+/g;
    if (numberCharacters.test(value) === false) {return { passwordStrength: 'Minimal mengandung satu karakter angka' };}

    // let specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/
    // if (specialCharacters.test(value) === false) {
    //     return { passwordStrength: `Harus ada sedikitinya satu spesial karakter` };
    // }
    return null;
};

