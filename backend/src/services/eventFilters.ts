import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const VALID_SORT_FIELDS = ['date', 'price', 'averageRating', 'createdAt', 'title'];
export const VALID_SORT_ORDERS = ['asc', 'desc'];
export const VALID_STATUSES = ['active', 'cancelled', 'draft', 'completed'];
export const VALID_DATE_PRESETS = ['today', 'this_week', 'this_weekend', 'upcoming'];

interface FilterParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: number;
  categoryId?: number;
  search?: string;
  organizerId?: number;
  datePreset?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  available?: boolean;
  soldOut?: boolean;
  isFree?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export function resolveDatePreset(preset: string): DateRange {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today':
      return {
        from: startOfDay,
        to: new Date(startOfDay.getTime() + 86400000 - 1)
      };

    case 'this_week': {
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(startOfDay.getTime() + mondayOffset * 86400000);
      const sunday = new Date(monday.getTime() + 6 * 86400000 + 86400000 - 1);
      return { from: monday, to: sunday };
    }

    case 'this_weekend': {
      const dayOfWeek = now.getDay();
      const fridayOffset = dayOfWeek <= 5 ? 5 - dayOfWeek : dayOfWeek === 6 ? -1 : 0;
      const friday = new Date(startOfDay.getTime() + fridayOffset * 86400000);
      const sunday = new Date(friday.getTime() + 2 * 86400000 + 86400000 - 1);
      return { from: friday, to: sunday };
    }

    case 'upcoming':
      return { from: startOfDay, to: undefined };

    default:
      return { from: undefined, to: undefined };
  }
}

export function validateFilterParams(params: Record<string, any>): { cleaned: FilterParams; errors: string[] } {
  const errors: string[] = [];
  const cleaned: FilterParams = {};

  // page
  cleaned.page = Math.max(1, Math.min(100, parseInt(params.page) || 1));
  if (isNaN(cleaned.page)) cleaned.page = 1;

  // limit
  cleaned.limit = Math.max(1, Math.min(50, parseInt(params.limit) || 12));
  if (isNaN(cleaned.limit)) cleaned.limit = 12;

  // status
  if (params.status && !VALID_STATUSES.includes(params.status)) {
    errors.push(`status debe ser uno de: ${VALID_STATUSES.join(', ')}`);
  } else {
    cleaned.status = params.status || 'active';
  }

  // category
  if (params.category) {
    const cat = parseInt(params.category);
    if (isNaN(cat) || cat < 1) {
      errors.push('category debe ser un entero positivo');
    } else {
      cleaned.categoryId = cat;
    }
  }

  // search
  if (params.search) {
    const s = String(params.search).trim();
    if (s.length > 200) {
      errors.push('search no puede exceder 200 caracteres');
    } else if (s.length > 0) {
      cleaned.search = s;
    }
  }

  // organizerId
  if (params.organizerId) {
    const oid = parseInt(params.organizerId);
    if (isNaN(oid) || oid < 1) {
      errors.push('organizerId debe ser un entero positivo');
    } else {
      cleaned.organizerId = oid;
    }
  }

  // datePreset
  if (params.datePreset) {
    if (!VALID_DATE_PRESETS.includes(params.datePreset)) {
      errors.push(`datePreset debe ser uno de: ${VALID_DATE_PRESETS.join(', ')}`);
    } else {
      cleaned.datePreset = params.datePreset;
    }
  }

  // dateFrom / dateTo
  if (params.dateFrom) {
    const d = new Date(params.dateFrom);
    if (isNaN(d.getTime())) {
      errors.push('dateFrom debe ser una fecha válida ISO 8601');
    } else {
      cleaned.dateFrom = d;
    }
  }
  if (params.dateTo) {
    const d = new Date(params.dateTo);
    if (isNaN(d.getTime())) {
      errors.push('dateTo debe ser una fecha válida ISO 8601');
    } else {
      cleaned.dateTo = d;
    }
  }
  if (cleaned.dateFrom && cleaned.dateTo && cleaned.dateTo < cleaned.dateFrom) {
    errors.push('dateTo debe ser posterior o igual a dateFrom');
  }

  // minPrice
  if (params.minPrice != null) {
    const min = parseFloat(params.minPrice);
    if (isNaN(min) || min < 0) {
      errors.push('minPrice debe ser un número >= 0');
    } else {
      cleaned.minPrice = min;
    }
  }

  // maxPrice
  if (params.maxPrice != null) {
    const max = parseFloat(params.maxPrice);
    if (isNaN(max) || max < 0) {
      errors.push('maxPrice debe ser un número >= 0');
    } else {
      cleaned.maxPrice = max;
    }
  }
  if (cleaned.minPrice != null && cleaned.maxPrice != null && cleaned.maxPrice < cleaned.minPrice) {
    errors.push('maxPrice debe ser mayor o igual a minPrice');
  }

  // minRating
  if (params.minRating != null) {
    const r = parseFloat(params.minRating);
    if (isNaN(r) || r < 0 || r > 5) {
      errors.push('minRating debe estar entre 0 y 5');
    } else {
      cleaned.minRating = r;
    }
  }

  // available
  if (params.available === 'true') cleaned.available = true;
  if (params.available === 'false') cleaned.available = false;

  // soldOut
  if (params.soldOut === 'true') cleaned.soldOut = true;
  if (params.soldOut === 'false') cleaned.soldOut = false;

  // isFree
  if (params.isFree === 'true') cleaned.isFree = true;
  if (params.isFree === 'false') cleaned.isFree = false;

  // Incompatibilidades lógicas
  if (cleaned.available && cleaned.soldOut) {
    errors.push('available y soldOut no pueden ser true simultáneamente');
  }
  if (cleaned.isFree && cleaned.minPrice != null && cleaned.minPrice > 0) {
    errors.push('isFree=true y minPrice>0 son incompatibles');
  }

  // sortBy / sortOrder
  cleaned.sortBy = VALID_SORT_FIELDS.includes(params.sortBy) ? params.sortBy : 'date';
  cleaned.sortOrder = VALID_SORT_ORDERS.includes(params.sortOrder) ? params.sortOrder : 'asc';

  // datePreset override: si hay preset, sobreescribe dateFrom/dateTo
  if (cleaned.datePreset) {
    const { from, to } = resolveDatePreset(cleaned.datePreset);
    cleaned.dateFrom = from;
    cleaned.dateTo = to;
  }

  return { cleaned, errors };
}

export function buildFilterWhere(params: FilterParams): any {
  const conditions: any[] = [];

  conditions.push({ status: params.status || 'active' });

  if (params.categoryId) {
    conditions.push({ categoryId: params.categoryId });
  }

  if (params.organizerId) {
    conditions.push({ organizerId: params.organizerId });
  }

  if (params.search) {
    conditions.push({
      OR: [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { location: { contains: params.search, mode: 'insensitive' } }
      ]
    });
  }

  // Rango de fecha
  const dateCondition: any = {};
  if (params.dateFrom) dateCondition.gte = params.dateFrom;
  if (params.dateTo) dateCondition.lte = params.dateTo;
  if (Object.keys(dateCondition).length > 0) {
    conditions.push({ date: dateCondition });
  }

  // Rango de precio
  const priceCondition: any = {};
  if (params.minPrice != null) priceCondition.gte = params.minPrice;
  if (params.maxPrice != null) priceCondition.lte = params.maxPrice;
  if (Object.keys(priceCondition).length > 0) {
    conditions.push({ price: priceCondition });
  }

  // Rating mínimo
  if (params.minRating != null) {
    conditions.push({ averageRating: { gte: params.minRating } });
  }

  // Eventos gratuitos
  if (params.isFree) {
    conditions.push({ price: 0 });
  }

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];
  return { AND: conditions };
}

export async function getAvailabilityIds(params: FilterParams): Promise<number[] | null> {
  const status = params.status || 'active';

  if (params.available && params.soldOut) {
    return [];
  }

  let results: Array<{ id: number }>;

  if (params.available) {
    results = await prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM events
      WHERE status = ${status}
      AND "currentBookings" < capacity
    `;
  } else if (params.soldOut) {
    results = await prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM events
      WHERE status = ${status}
      AND "currentBookings" >= capacity
    `;
  } else {
    return null;
  }

  return results.map(r => r.id);
}

export function buildAppliedFiltersSummary(params: FilterParams): Record<string, any> {
  const applied: Record<string, any> = {};

  if (params.categoryId) applied.category = params.categoryId;
  if (params.search) applied.search = params.search;
  if (params.dateFrom) applied.dateFrom = params.dateFrom instanceof Date
    ? params.dateFrom.toISOString()
    : params.dateFrom;
  if (params.dateTo) applied.dateTo = params.dateTo instanceof Date
    ? params.dateTo.toISOString()
    : params.dateTo;
  if (params.datePreset) applied.datePreset = params.datePreset;
  if (params.minPrice != null) applied.minPrice = params.minPrice;
  if (params.maxPrice != null) applied.maxPrice = params.maxPrice;
  if (params.minRating != null) applied.minRating = params.minRating;
  if (params.available) applied.available = true;
  if (params.soldOut) applied.soldOut = true;
  if (params.isFree) applied.isFree = true;
  if (params.organizerId) applied.organizerId = params.organizerId;
  if (params.sortBy !== 'date') applied.sortBy = params.sortBy;
  if (params.sortOrder !== 'asc') applied.sortOrder = params.sortOrder;

  return applied;
}
