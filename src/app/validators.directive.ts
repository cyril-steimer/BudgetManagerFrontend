import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator, Validators} from '@angular/forms';

@Directive({
    selector: '[min]',
    providers: [{provide: NG_VALIDATORS, useExisting: MinValidatorDirective, multi: true}]
})
export class MinValidatorDirective implements Validator {

    @Input('min') min: number;

    validate(c: AbstractControl): { [key: string]: any; } {
        return Validators.min(this.min)(c);
    }
}
