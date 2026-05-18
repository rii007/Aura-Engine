import { NextResponse } from 'next/server';
import { buildAnalytics, inventoryData } from '@/lib/inventory-data';

export function GET() {
  return NextResponse.json(buildAnalytics(inventoryData));
}
