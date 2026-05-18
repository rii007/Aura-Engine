import { NextResponse } from 'next/server';
import { getInventoryData, parseInventoryFilters } from '@/lib/inventory-data';

export function GET(request: Request) {
  const url = new URL(request.url);
  const filters = parseInventoryFilters(url.searchParams);
  return NextResponse.json(getInventoryData(filters));
}
