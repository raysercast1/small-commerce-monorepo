import {Product} from '../../../shared/types/shared-types';
import {Inventory} from '../types/inventory-types';

export type FindVariantStoreParams = {
  products: Product[],
  inventory?: Inventory,
  inventories?: Inventory[],
  inventoryId: string
}
/**
 * Find the store ID of a variant based on the provided inventory or inventory ID.
 * @param products - Array of products to search within.
 * @param inventory - Optional inventory object.
 * @param inventories - Optional array of inventory objects.
 * @param inventoryId - ID of the inventory to find.
 * @returns Store ID of the variant or null if not found.
 */
export function findVariantStore({ products, inventory, inventories, inventoryId }: FindVariantStoreParams): string | null {

  const selectedInventory = inventory ?? inventories?.find(inv => inv.id === inventoryId);
  if (!selectedInventory) return null;

  const product = products.find(p =>
    p.variants?.some(v => v.id === selectedInventory.productVariant.id)
  );

  return product?.store.id ?? null;
}
