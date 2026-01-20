import { Component, output, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CheckoutFormData } from '../../../../shared/types/storefront-types';

@Component({
  selector: 'app-create-checkout-form',
  imports: [ReactiveFormsModule],
  templateUrl: './create-checkout-form.html',
  styleUrls: ['./create-checkout-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateCheckoutForm {
  private readonly fb = inject(FormBuilder);

  formSubmitted = output<CheckoutFormData>();

  useSameAddressForBilling = signal(true);

  checkoutForm: FormGroup = this.fb.group({
    customer: this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    }),
    shippingAddress: this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required]
    }),
    billingAddress: this.fb.group({
      street: [''],
      city: [''],
      state: [''],
      postalCode: [''],
      country: ['']
    }),
    paymentMethod: this.fb.group({
      type: ['whatsapp', Validators.required]
    }),
    shippingMethod: this.fb.group({
      id: ['standard', Validators.required],
      name: ['Standard Shipping'],
      cost: [0]
    })
  });

  onSubmit(): void {
    if (this.checkoutForm.valid) {
      const formValue = this.checkoutForm.value;

      const formData: CheckoutFormData = {
        customer: formValue.customer,
        shippingAddress: formValue.shippingAddress,
        billingAddress: this.useSameAddressForBilling()
          ? formValue.shippingAddress
          : formValue.billingAddress,
        paymentMethod: formValue.paymentMethod,
        shippingMethod: formValue.shippingMethod
      };

      this.formSubmitted.emit(formData);
    } else {
      this.checkoutForm.markAllAsTouched();
    }
  }

  onUseSameAddressChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.useSameAddressForBilling.set(checked);

    const billingAddressGroup = this.checkoutForm.get('billingAddress');
    if (checked) {
      billingAddressGroup?.clearValidators();
    } else {
      billingAddressGroup?.get('street')?.setValidators(Validators.required);
      billingAddressGroup?.get('city')?.setValidators(Validators.required);
      billingAddressGroup?.get('state')?.setValidators(Validators.required);
      billingAddressGroup?.get('postalCode')?.setValidators(Validators.required);
      billingAddressGroup?.get('country')?.setValidators(Validators.required);
    }
    billingAddressGroup?.updateValueAndValidity();
  }
}
