import { InventoryClient } from '@/components/inventory/inventory-client';
import { getInventoryData, parseInventoryFilters } from '@/lib/inventory-data';

export default function InventoryPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const initialQuery = parseInventoryFilters(searchParams ?? {});
  const initialData = getInventoryData(initialQuery);

  return <InventoryClient initialData={initialData} initialQuery={initialQuery} />;
}
