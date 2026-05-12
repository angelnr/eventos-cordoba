/// <reference types="jest" />

const mockQueryRaw = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    $queryRaw: mockQueryRaw,
    $disconnect: jest.fn(),
  })),
}));

beforeEach(() => {
  mockQueryRaw.mockReset();
});

describe('resolveDatePreset', () => {
  let resolveDatePreset: (preset: string) => any;

  beforeAll(async () => {
    const mod = await import('../services/eventFilters');
    resolveDatePreset = mod.resolveDatePreset;
  });

  it('today: from debe ser inicio del día actual y to el final', () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const result = resolveDatePreset('today');

    expect(result.from!.getTime()).toBe(startOfDay.getTime());
    expect(result.to!.getTime()).toBe(startOfDay.getTime() + 86400000 - 1);
  });

  it('this_week: from debe ser lunes y to domingo', () => {
    const result = resolveDatePreset('this_week');

    expect(result.from!.getDay()).toBe(1); // Monday
    expect(result.to!.getDay()).toBe(0); // Sunday
  });

  it('this_weekend: from debe ser viernes y to domingo', () => {
    const result = resolveDatePreset('this_weekend');

    expect(result.from!.getDay()).toBe(5); // Friday
    expect(result.to!.getDay()).toBe(0); // Sunday
  });

  it('upcoming: from inicio de hoy, to undefined', () => {
    const result = resolveDatePreset('upcoming');

    expect(result.from).toBeDefined();
    expect(result.to).toBeUndefined();
  });

  it('default: from y to undefined', () => {
    const result = resolveDatePreset('invalid_preset');

    expect(result.from).toBeUndefined();
    expect(result.to).toBeUndefined();
  });
});

describe('validateFilterParams', () => {
  let validateFilterParams: (params: Record<string, any>) => any;

  beforeAll(async () => {
    const mod = await import('../services/eventFilters');
    validateFilterParams = mod.validateFilterParams;
  });

  it('debe usar valores por defecto para page y limit', () => {
    const { cleaned, errors } = validateFilterParams({});

    expect(cleaned.page).toBe(1);
    expect(cleaned.limit).toBe(12);
    expect(errors).toHaveLength(0);
  });

  it('debe clamp page entre 1 y 100', () => {
    const { cleaned: low } = validateFilterParams({ page: '-5' });
    expect(low.page).toBe(1);

    const { cleaned: high } = validateFilterParams({ page: '999' });
    expect(high.page).toBe(100);
  });

  it('debe clamp limit entre 1 y 50', () => {
    const { cleaned: low } = validateFilterParams({ limit: '-1' });
    expect(low.limit).toBe(1);

    const { cleaned: high } = validateFilterParams({ limit: '999' });
    expect(high.limit).toBe(50);
  });

  it('debe reportar error si status es inválido', () => {
    const { errors } = validateFilterParams({ status: 'INVALID_STATUS' });

    expect(errors).toContain('status debe ser uno de: SCHEDULED, CANCELLED, FINISHED, FULL');
  });

  it('debe aceptar status válido', () => {
    const { cleaned, errors } = validateFilterParams({ status: 'SCHEDULED' });

    expect(cleaned.status).toBe('SCHEDULED');
    expect(errors).toHaveLength(0);
  });

  it('debe reportar error si category no es entero positivo', () => {
    const { errors } = validateFilterParams({ category: 'abc' });

    expect(errors).toContain('category debe ser un entero positivo');
  });

  it('debe parsear category correctamente', () => {
    const { cleaned } = validateFilterParams({ category: '3' });

    expect(cleaned.categoryId).toBe(3);
  });

  it('debe reportar error si search excede 200 caracteres', () => {
    const { errors } = validateFilterParams({ search: 'a'.repeat(201) });

    expect(errors).toContain('search no puede exceder 200 caracteres');
  });

  it('debe aceptar search válido', () => {
    const { cleaned } = validateFilterParams({ search: 'música' });

    expect(cleaned.search).toBe('música');
  });

  it('debe reportar error si organizerId no es entero positivo', () => {
    const { errors } = validateFilterParams({ organizerId: 'cero' });

    expect(errors).toContain('organizerId debe ser un entero positivo');
  });

  it('debe parsear organizerId', () => {
    const { cleaned } = validateFilterParams({ organizerId: '42' });

    expect(cleaned.organizerId).toBe(42);
  });

  it('debe reportar error si datePreset es inválido', () => {
    const { errors } = validateFilterParams({ datePreset: 'yesterday' });

    expect(errors).toContain('datePreset debe ser uno de: today, this_week, this_weekend, upcoming');
  });

  it('debe aceptar datePreset válido', () => {
    const { cleaned } = validateFilterParams({ datePreset: 'today' });

    expect(cleaned.datePreset).toBe('today');
    expect(cleaned.dateFrom).toBeDefined();
    expect(cleaned.dateTo).toBeDefined();
  });

  it('debe reportar error si dateFrom no es fecha válida', () => {
    const { errors } = validateFilterParams({ dateFrom: 'not-a-date' });

    expect(errors).toContain('dateFrom debe ser una fecha válida ISO 8601');
  });

  it('debe parsear dateFrom', () => {
    const { cleaned } = validateFilterParams({ dateFrom: '2025-06-01T00:00:00.000Z' });

    expect(cleaned.dateFrom).toBeDefined();
    expect(cleaned.dateFrom!.toISOString()).toBe('2025-06-01T00:00:00.000Z');
  });

  it('debe reportar error si dateTo es anterior a dateFrom', () => {
    const { errors } = validateFilterParams({
      dateFrom: '2025-12-31T00:00:00.000Z',
      dateTo: '2025-01-01T00:00:00.000Z',
    });

    expect(errors).toContain('dateTo debe ser posterior o igual a dateFrom');
  });

  it('debe reportar error si minPrice es negativo', () => {
    const { errors } = validateFilterParams({ minPrice: '-5' });

    expect(errors).toContain('minPrice debe ser un número >= 0');
  });

  it('debe reportar error si maxPrice < minPrice', () => {
    const { errors } = validateFilterParams({ minPrice: '50', maxPrice: '10' });

    expect(errors).toContain('maxPrice debe ser mayor o igual a minPrice');
  });

  it('debe reportar error si minRating fuera de 0-5', () => {
    const { errors } = validateFilterParams({ minRating: '6' });

    expect(errors).toContain('minRating debe estar entre 0 y 5');
  });

  it('debe parsear minRating', () => {
    const { cleaned } = validateFilterParams({ minRating: '3.5' });

    expect(cleaned.minRating).toBe(3.5);
  });

  it('debe reportar error si available y soldOut son true simultáneamente', () => {
    const { errors } = validateFilterParams({ available: 'true', soldOut: 'true' });

    expect(errors).toContain('available y soldOut no pueden ser true simultáneamente');
  });

  it('debe reportar error si isFree=true y minPrice>0', () => {
    const { errors } = validateFilterParams({ isFree: 'true', minPrice: '10' });

    expect(errors).toContain('isFree=true y minPrice>0 son incompatibles');
  });

  it('debe usar sortBy=date por defecto y sortOrder=asc', () => {
    const { cleaned } = validateFilterParams({});

    expect(cleaned.sortBy).toBe('date');
    expect(cleaned.sortOrder).toBe('asc');
  });

  it('debe parsear sortBy y sortOrder válidos', () => {
    const { cleaned } = validateFilterParams({ sortBy: 'price', sortOrder: 'desc' });

    expect(cleaned.sortBy).toBe('price');
    expect(cleaned.sortOrder).toBe('desc');
  });
});

describe('buildFilterWhere', () => {
  let buildFilterWhere: (params: any) => any;

  beforeAll(async () => {
    const mod = await import('../services/eventFilters');
    buildFilterWhere = mod.buildFilterWhere;
  });

  it('debe retornar {} para parámetros vacíos', () => {
    const where = buildFilterWhere({});
    expect(where).toEqual({});
  });

  it('debe retornar objeto plano para una condición', () => {
    const where = buildFilterWhere({ status: 'SCHEDULED' });
    expect(where).toEqual({ status: 'SCHEDULED' });
  });

  it('debe retornar { AND: [...] } para múltiples condiciones', () => {
    const where = buildFilterWhere({ status: 'SCHEDULED', categoryId: 5 });
    expect(where.AND).toHaveLength(2);
  });

  it('debe generar OR en search para title, description y location', () => {
    const where = buildFilterWhere({ search: 'concierto' });
    expect(where.OR).toHaveLength(3);
    expect(where.OR[0]).toEqual({ title: { contains: 'concierto', mode: 'insensitive' } });
    expect(where.OR[1]).toEqual({ description: { contains: 'concierto', mode: 'insensitive' } });
    expect(where.OR[2]).toEqual({ location: { contains: 'concierto', mode: 'insensitive' } });
  });

  it('debe generar price: 0 para isFree', () => {
    const where = buildFilterWhere({ isFree: true });
    expect(where).toEqual({ price: 0 });
  });

  it('debe generar rango de fecha', () => {
    const from = new Date('2025-01-01');
    const to = new Date('2025-12-31');
    const where = buildFilterWhere({ dateFrom: from, dateTo: to });

    expect(where.date.gte).toEqual(from);
    expect(where.date.lte).toEqual(to);
  });

  it('debe generar rango de precio', () => {
    const where = buildFilterWhere({ minPrice: 10, maxPrice: 100 });

    expect(where.price.gte).toBe(10);
    expect(where.price.lte).toBe(100);
  });

  it('debe generar minRating', () => {
    const where = buildFilterWhere({ minRating: 4 });

    expect(where.averageRating.gte).toBe(4);
  });
});

describe('buildAppliedFiltersSummary', () => {
  let buildAppliedFiltersSummary: (params: any) => any;

  beforeAll(async () => {
    const mod = await import('../services/eventFilters');
    buildAppliedFiltersSummary = mod.buildAppliedFiltersSummary;
  });

  it('debe retornar sin filtros extra si solo hay valores por defecto', () => {
    const applied = buildAppliedFiltersSummary({});
    // sortBy es undefined, y undefined !== 'date' es true, así que se asigna sortBy: undefined
    expect(applied.sortBy).toBeUndefined();
  });

  it('debe incluir filtros no default', () => {
    const applied = buildAppliedFiltersSummary({
      categoryId: 2,
      search: 'test',
      isFree: true,
      available: true,
    });

    expect(applied.category).toBe(2);
    expect(applied.search).toBe('test');
    expect(applied.isFree).toBe(true);
    expect(applied.available).toBe(true);
  });

  it('no debe incluir sortBy=date porque es default', () => {
    const applied = buildAppliedFiltersSummary({ sortBy: 'date' });
    expect(applied.sortBy).toBeUndefined();
  });

  it('debe incluir sortBy si no es date', () => {
    const applied = buildAppliedFiltersSummary({ sortBy: 'price' });
    expect(applied.sortBy).toBe('price');
  });
});

describe('getAvailabilityIds', () => {
  let getAvailabilityIds: (params: any) => Promise<number[] | null>;

  beforeAll(async () => {
    const mod = await import('../services/eventFilters');
    getAvailabilityIds = mod.getAvailabilityIds;
  });

  it('debe retornar [] si available y soldOut son true', async () => {
    const result = await getAvailabilityIds({ available: true, soldOut: true });

    expect(result).toEqual([]);
  });

  it('debe retornar null si ni available ni soldOut', async () => {
    const result = await getAvailabilityIds({});

    expect(result).toBeNull();
  });

  it('debe retornar IDs de eventos disponibles (currentBookings < capacity)', async () => {
    mockQueryRaw.mockResolvedValue([{ id: 1 }, { id: 3 }]);

    const result = await getAvailabilityIds({ available: true });

    expect(result).toEqual([1, 3]);
    expect(mockQueryRaw).toHaveBeenCalledTimes(1);
  });

  it('debe retornar IDs de eventos agotados (currentBookings >= capacity)', async () => {
    mockQueryRaw.mockResolvedValue([{ id: 2 }]);

    const result = await getAvailabilityIds({ soldOut: true });

    expect(result).toEqual([2]);
    expect(mockQueryRaw).toHaveBeenCalledTimes(1);
  });

  it('debe filtrar por status si se proporciona', async () => {
    mockQueryRaw.mockResolvedValue([{ id: 1 }]);

    await getAvailabilityIds({ available: true, status: 'SCHEDULED' });

    // El valor interpolado se pasa como argumento separado en tagged template
    const callValues = mockQueryRaw.mock.calls[0].slice(1);
    expect(callValues).toContain('SCHEDULED');
  });
});
export {};
