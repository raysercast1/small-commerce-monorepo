import {Observable} from 'rxjs';
import {ApiResponse} from 'shared-core';
import {Inventory, InventoryDTO, InventoryUpdateDTO, AddVariantsToInvRequestBody} from '../../../features/inventory/types/inventory-types';

export interface CreateInventoryParameters {
  partnerId: string;
  storeId: string;
}

export interface UpdateOrDeleteOrGetInventoryParameters extends CreateInventoryParameters {
  inventoryId: string;
}

export abstract class InventoryServiceContract {
  abstract create(createInput: CreateInventoryParameters, inventory: InventoryDTO): Observable<ApiResponse<Inventory>>;
  abstract getById(getInput: UpdateOrDeleteOrGetInventoryParameters): Observable<ApiResponse<Inventory>>;
  abstract getByIds(partnerId: string, inventoryIds: string[]): Observable<ApiResponse<Inventory[]>>;
  abstract update(updateInput: UpdateOrDeleteOrGetInventoryParameters, inventory: InventoryUpdateDTO): Observable<ApiResponse<Inventory>>;
  abstract delete(deleteInput: UpdateOrDeleteOrGetInventoryParameters): Observable<ApiResponse<boolean>>;
  abstract addVariantsToInventories(partnerId: string, body: AddVariantsToInvRequestBody): Observable<ApiResponse<Inventory[]>>;
}


