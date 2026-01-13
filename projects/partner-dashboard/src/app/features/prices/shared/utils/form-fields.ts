import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Price} from '../types/price-types';
import {Metadata} from '../../../../shared/types/shared-types';
import {isObjectNotEmpty} from '../../../../shared/helpers/helpers';

export function enableEditingControls(priceForm: FormGroup): void {
  Object.keys(priceForm.controls).forEach(key => {
    if (key !== 'selectedPriceId') {
      priceForm.controls[key].enable();
    }
  })
}

export function resetFormToDefaults(priceForm: FormGroup, metadataFA: FormArray): void {
  metadataFA.clear();
  priceForm.patchValue({
    cost: null,
    price: null,
    priceOverride: null,
  });
}

export function disableEditingControls(priceForm: FormGroup): void {
  Object.keys(priceForm.controls).forEach(key => {
    if (key !== 'selectedPriceId') {
      priceForm.controls[key].enable();
    }
  });
}

export function createKeyValueGroup(fb: FormBuilder): FormGroup {
  return fb.group({ key: ['', Validators.required], value: ['', Validators.required] });
}

export function populateFormFromPrice(p: Price, fb: FormBuilder, priceForm: FormGroup): void {
  const metadata: Metadata = p.metadata ?? {};
  if (isObjectNotEmpty(metadata)) {
    const metadataControls = Object.entries(metadata).map(([k, v]) => fb.group({ key: k, value: v as unknown }));
    priceForm.setControl('metadata', fb.array(metadataControls));
  } else {
    priceForm.setControl('metadata', fb.array([]));
  }


  priceForm.patchValue({
    cost: p.cost,
    price: p.price,
    priceOverride: p.priceOverride,
  }, { emitEvent: false })  // Use emitEvent: false to prevent infinite loops with valueChanges.
}

export function safeParseForPriceMetadata(metadataString: string): Metadata {
  try {
    return JSON.parse(metadataString) as Metadata;
  } catch (error) {
    console.error('Error parsing metadata:', error);
    return {};
  }
}
