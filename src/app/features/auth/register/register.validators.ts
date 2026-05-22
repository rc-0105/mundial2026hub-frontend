import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const v = control.value as string;
  if (!v) return null;
  const errors: ValidationErrors = {};
  if (v.length < 8) errors['minlength'] = true;
  if (!/[A-Z]/.test(v)) errors['uppercase'] = true;
  if (!/[0-9]/.test(v)) errors['digit'] = true;
  return Object.keys(errors).length ? errors : null;
}

export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw === cpw ? null : { passwordMismatch: true };
}
