export type InventoryCategory = 'Electronics' | 'Apparel' | 'Home Goods' | 'Beauty' | 'Toys' | 'Industrial';
export type InventoryStatus = 'healthy' | 'low' | 'critical' | 'out';
export type SortKey = 'sku' | 'name' | 'category' | 'stock' | 'price';
export type InventorySortField = SortKey | 'inventoryValue' | 'updatedAt' | 'status';

export type InventoryItem = {
  sku: string;
  name: string;
  category: InventoryCategory;
  status: InventoryStatus;
  stock: number;
  price: number;
  inventoryValue: number;
  location: string;
  supplier: string;
  updatedAt: string;
  reorderPoint: number;
};

export type InventoryFilters = {
  search?: string;
  category?: string;
  status?: InventoryStatus | 'all';
  minStock?: number;
  maxStock?: number;
  minPrice?: number;
  maxPrice?: number;
  minValue?: number;
  maxValue?: number;
};

export type InventoryQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  filters?: InventoryFilters;
  sort?: {
    field?: InventorySortField;
    direction?: 'asc' | 'desc';
  };
};

export type InventoryPageResult = {
  items: InventoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type InventoryAnalytics = {
  restockPriority: Array<{ sku: string; name: string; stock: number; category: InventoryCategory; status: InventoryStatus }>;
  summary: {
    totalSkus: number;
    inventoryValue: number;
    outOfStock: number;
  };
  valuationByCategory: Array<{ name: InventoryCategory; value: number }>;
};

const categories: InventoryCategory[] = ['Electronics', 'Apparel', 'Home Goods', 'Beauty', 'Toys', 'Industrial'];
const locations = ['Dallas DC', 'Reno DC', 'Atlanta Hub', 'Chicago Hub', 'Phoenix DC', 'Miami Hub'];
const suppliers = ['Northstar Supply', 'Evergreen Wholesale', 'Atlas Merchants', 'Helio Distribution', 'Summit Trade', 'Vector Logistics'];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function makePrice(index: number, categoryIndex: number) {
  const base = 18 + categoryIndex * 24 + ((index * 11) % 260);
  return Number((base + (index % 7) * 0.73).toFixed(2));
}

function makeStock(index: number) {
  return (index * 17 + 9) % 180;
}

function makeItem(index: number): InventoryItem {
  const categoryIndex = index % categories.length;
  const category = categories[categoryIndex];
  const stock = makeStock(index);
  const reorderPoint = 12 + (index % 18);
  const price = makePrice(index, categoryIndex);
  const inventoryValue = Number((stock * price).toFixed(2));
  const status: InventoryStatus = stock === 0 ? 'out' : stock <= Math.max(4, reorderPoint / 2) ? 'critical' : stock <= reorderPoint ? 'low' : 'healthy';

  return {
    sku: `SKU-${String(index + 1).padStart(6, '0')}`,
    name: `${category} Asset ${String(index + 1).padStart(5, '0')}`,
    category,
    status,
    stock,
    price,
    inventoryValue,
    location: locations[index % locations.length],
    supplier: suppliers[index % suppliers.length],
    updatedAt: new Date(Date.UTC(2025, index % 12, (index % 27) + 1)).toISOString(),
    reorderPoint
  };
}

export const inventoryData: InventoryItem[] = Array.from({ length: 50000 }, (_, index) => makeItem(index));

function normalizeQueryValue(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value ?? undefined;
}

export function parseInventoryFilters(params: URLSearchParams | Record<string, string | string[] | undefined>): InventoryQuery {
  const get = (key: string) => (params instanceof URLSearchParams ? normalizeQueryValue(params.get(key)) : normalizeQueryValue(params[key]));
  const page = Number(get('page') ?? 1);
  const pageSize = Number(get('pageSize') ?? 20);
  const sortField = (get('sortField') ?? get('sortKey') ?? 'stock') as InventorySortField;
  const sortDirection = (get('sortDirection') ?? get('sortDir') ?? 'desc') as 'asc' | 'desc';

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20,
    search: get('search')?.trim() || undefined,
    filters: {
      search: get('search')?.trim() || undefined,
      category: get('category') || undefined,
      status: (get('status') as InventoryStatus | 'all' | undefined) || undefined,
      minStock: get('minStock') ? Number(get('minStock')) : undefined,
      maxStock: get('maxStock') ? Number(get('maxStock')) : undefined,
      minPrice: get('minPrice') ? Number(get('minPrice')) : undefined,
      maxPrice: get('maxPrice') ? Number(get('maxPrice')) : undefined,
      minValue: get('minValue') ? Number(get('minValue')) : undefined,
      maxValue: get('maxValue') ? Number(get('maxValue')) : undefined
    },
    sort: {
      field: sortField,
      direction: sortDirection
    }
  };
}

function compareValues(left: string | number, right: string | number, direction: 'asc' | 'desc') {
  if (left === right) {
    return 0;
  }

  const modifier = direction === 'asc' ? 1 : -1;

  if (typeof left === 'number' && typeof right === 'number') {
    return left > right ? modifier : -modifier;
  }

  return String(left).localeCompare(String(right)) * modifier;
}

function applyInventoryFilters(items: InventoryItem[], query: InventoryQuery) {
  const filters = query.filters ?? {};
  const search = (filters.search ?? query.search ?? '').trim().toLowerCase();

  return items.filter((item) => {
    const matchesSearch = search
      ? [item.sku, item.name, item.category, item.location, item.supplier, item.status].some((value) => value.toLowerCase().includes(search))
      : true;
    const matchesCategory = filters.category && filters.category !== 'All' ? item.category === filters.category : true;
    const matchesStatus = filters.status && filters.status !== 'all' ? item.status === filters.status : true;
    const matchesMinStock = filters.minStock !== undefined ? item.stock >= filters.minStock : true;
    const matchesMaxStock = filters.maxStock !== undefined ? item.stock <= filters.maxStock : true;
    const matchesMinPrice = filters.minPrice !== undefined ? item.price >= filters.minPrice : true;
    const matchesMaxPrice = filters.maxPrice !== undefined ? item.price <= filters.maxPrice : true;
    const matchesMinValue = filters.minValue !== undefined ? item.inventoryValue >= filters.minValue : true;
    const matchesMaxValue = filters.maxValue !== undefined ? item.inventoryValue <= filters.maxValue : true;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesMinStock &&
      matchesMaxStock &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesMinValue &&
      matchesMaxValue
    );
  });
}

function sortInventory(items: InventoryItem[], sort?: InventoryQuery['sort']) {
  const field = sort?.field ?? 'stock';
  const direction = sort?.direction ?? 'desc';

  return [...items].sort((left, right) => {
    switch (field) {
      case 'inventoryValue':
        return compareValues(left.inventoryValue, right.inventoryValue, direction);
      case 'updatedAt':
        return compareValues(left.updatedAt, right.updatedAt, direction);
      case 'status':
        return compareValues(left.status, right.status, direction);
      case 'sku':
      case 'name':
      case 'category':
      case 'stock':
      case 'price':
      default:
        return compareValues(left[field], right[field], direction);
    }
  });
}

export function getInventoryData(query: InventoryQuery): InventoryPageResult {
  const filtered = applyInventoryFilters(inventoryData, query);
  const sorted = sortInventory(filtered, query.sort);
  const pageSize = clamp(Math.trunc(query.pageSize ?? 20), 1, 50000);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = clamp(Math.trunc(query.page ?? 1), 1, totalPages);
  const start = (page - 1) * pageSize;

  return {
    items: sorted.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages
  };
}

export function filterInventory(items: InventoryItem[], filters: InventoryQuery) {
  const result = getInventoryData({
    ...filters,
    filters: {
      ...filters.filters,
      search: filters.search ?? filters.filters?.search
    }
  });

  return {
    ...result,
    items: result.items.filter((item) => items.some((candidate) => candidate.sku === item.sku))
  };
}

export function buildAnalytics(items: InventoryItem[]): InventoryAnalytics {
  const sortedByRisk = [...items]
    .sort((left, right) => left.stock - right.stock || left.inventoryValue - right.inventoryValue)
    .slice(0, 10)
    .map((item) => ({
      sku: item.sku,
      name: item.name,
      stock: item.stock,
      category: item.category,
      status: item.status
    }));

  const summary = items.reduce(
    (accumulator, item) => {
      accumulator.totalSkus += 1;
      accumulator.inventoryValue += item.inventoryValue;
      if (item.status === 'out') {
        accumulator.outOfStock += 1;
      }
      return accumulator;
    },
    {
      totalSkus: 0,
      inventoryValue: 0,
      outOfStock: 0
    }
  );

  const valuationByCategory = categories.map((category) => ({
    name: category,
    value: Number(
      items.filter((item) => item.category === category).reduce((total, item) => total + item.inventoryValue, 0).toFixed(2)
    )
  }));

  return {
    restockPriority: sortedByRisk,
    summary: {
      totalSkus: summary.totalSkus,
      inventoryValue: Number(summary.inventoryValue.toFixed(2)),
      outOfStock: summary.outOfStock
    },
    valuationByCategory
  };
}