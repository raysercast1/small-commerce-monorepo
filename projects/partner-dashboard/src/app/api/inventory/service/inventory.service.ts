import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {ApiResponse, MakeRequestService} from 'shared-core';
import {
  CreateInventoryParameters,
  InventoryServiceContract,
  UpdateOrDeleteOrGetInventoryParameters,
} from '../contracts/inventory-service.contract';
import {
  AddVariantsToInvRequestBody,
  Inventory,
  InventoryDTO,
  InventoryPayload,
  InventoryUpdateDTO
} from '../../../features/inventory/types/inventory-types';
import {isObjectNotEmpty} from '../../../shared/helpers/helpers';

@Injectable({
  providedIn: 'root'
})
export class InventoryServiceImpl extends InventoryServiceContract {
  private makeRequest = inject(MakeRequestService);
  private apiUrl = `${environment.baseUrl}${environment.domain}inventories`;

  create(createInput: CreateInventoryParameters, inventory: InventoryDTO): Observable<ApiResponse<Inventory>> {
    const modifiedInventory = this.stringifyRequiredObject(inventory);
    const url = `${this.apiUrl}?partnerId=${createInput.partnerId}&storeId=${createInput.storeId}`;
    return this.makeRequest.post<ApiResponse<Inventory>>(url, modifiedInventory);
  }

  getById(getInput: UpdateOrDeleteOrGetInventoryParameters): Observable<ApiResponse<Inventory>> {
    const url = `${this.apiUrl}/${getInput.inventoryId}?partnerId=${getInput.partnerId}&storeId=${getInput.storeId}`;
    return this.makeRequest.get<ApiResponse<Inventory>>(url);
  }

  delete(deleteInput: UpdateOrDeleteOrGetInventoryParameters): Observable<ApiResponse<boolean>> {
    const url = `${this.apiUrl}/${deleteInput.inventoryId}?partnerId=${deleteInput.partnerId}&storeId=${deleteInput.storeId}`;
    return this.makeRequest.delete<ApiResponse<boolean>>(url);
  }

  update(updateInput: UpdateOrDeleteOrGetInventoryParameters, inventory: InventoryUpdateDTO): Observable<ApiResponse<Inventory>> {
    const modifiedInventory = this.stringifyRequiredObject(inventory);
    const url = `${this.apiUrl}/${updateInput.inventoryId}?partnerId=${updateInput.partnerId}&storeId=${updateInput.storeId}`;
    return this.makeRequest.patch<ApiResponse<Inventory>>(url, modifiedInventory);
  }

  getByIds(partnerId: string, inventoryIds: string[]): Observable<ApiResponse<Inventory[]>> {
    const url = `${this.apiUrl}/by-ids-in?partnerId=${partnerId}&inventoryIds=${inventoryIds.join(',')}`;
    return this.makeRequest.get<ApiResponse<Inventory[]>>(url);
  }

  addVariantsToInventories(partnerId: string, body: AddVariantsToInvRequestBody): Observable<ApiResponse<Inventory[]>> {
    const url = `${this.apiUrl}/add-variants-to-inventories?partnerId=${partnerId}`;
    return this.makeRequest.post<ApiResponse<Inventory[]>>(url, body);
  }

  private stringifyRequiredObject(inventoryBase: InventoryDTO | InventoryUpdateDTO): InventoryPayload {
    const modifiedInventory = {...inventoryBase} as InventoryPayload;
    try {
      modifiedInventory.metadata = (inventoryBase.metadata !== undefined && isObjectNotEmpty(inventoryBase.metadata)) ? JSON.stringify(inventoryBase.metadata) : '{}';
    } catch (error) {
      console.error('Error while stringify-ing Inventory:', error);
      throw error;
    }
    return modifiedInventory;
  }
}
