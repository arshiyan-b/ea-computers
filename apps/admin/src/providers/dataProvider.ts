import type { DataProvider, CrudFilters, CrudSorting } from '@refinedev/core';
import { API_URL, request } from './http';

// Resources whose public GET endpoints only return active rows unless the
// caller is an authenticated admin *and* explicitly asks for inactive ones
// too — the admin panel always wants the full picture.
const INCLUDE_INACTIVE_RESOURCES = new Set(['products', 'categories', 'brands']);

// Resource name -> REST base path. Everything else defaults to `/${resource}`.
const RESOURCE_PATHS: Record<string, string> = {
  orders: '/admin/orders',
  users: '/admin/users',
  // Inventory is a read-only, stock-focused view over the same Products API.
  inventory: '/products',
};

function basePath(resource: string): string {
  return RESOURCE_PATHS[resource] ?? `/${resource}`;
}

// The backend validates query params with `forbidNonWhitelisted: true` (a
// deliberate security choice — see the spec's whitelist-validation
// requirement), so filters must be allow-listed per resource here rather
// than forwarded blindly. An unlisted filter (e.g. Refine's default
// search-as-you-type on a Select's label field) is silently dropped instead
// of tripping a 400 from the API.
const ALLOWED_FILTER_FIELDS: Record<string, string[]> = {
  products: ['search', 'category', 'brand', 'minPrice', 'maxPrice', 'stock', 'featured'],
  categories: ['parentId', 'topLevelOnly'],
  brands: [],
  orders: ['status'],
  users: [],
};

function applyFilters(resource: string, params: URLSearchParams, filters?: CrudFilters) {
  if (!filters) return;
  const allowed = ALLOWED_FILTER_FIELDS[resource] ?? [];
  for (const filter of filters) {
    if (
      'field' in filter &&
      allowed.includes(filter.field) &&
      filter.value !== undefined &&
      filter.value !== '' &&
      filter.value !== null
    ) {
      params.set(filter.field, String(filter.value));
    }
  }
}

function applySorting(params: URLSearchParams, sorters?: CrudSorting) {
  const sorter = sorters?.[0];
  if (sorter) {
    params.set('sort', sorter.field);
    params.set('order', sorter.order);
  }
}

export const dataProvider: DataProvider = {
  getApiUrl: () => API_URL,

  getList: async ({ resource, pagination, filters, sorters }) => {
    const params = new URLSearchParams();
    params.set('page', String(pagination?.current ?? 1));
    params.set('limit', String(pagination?.pageSize ?? 20));
    applySorting(params, sorters);
    applyFilters(resource, params, filters);
    if (INCLUDE_INACTIVE_RESOURCES.has(resource)) {
      params.set('includeInactive', 'true');
    }

    const res = await request<{ data: any[]; meta: { total: number } }>(
      `${basePath(resource)}?${params.toString()}`,
    );
    return { data: res.data, total: res.meta.total };
  },

  getOne: async ({ resource, id }) => {
    const data = await request<any>(`${basePath(resource)}/${id}`);
    return { data };
  },

  getMany: async ({ resource, ids }) => {
    const results = await Promise.all(ids.map((id) => request<any>(`${basePath(resource)}/${id}`)));
    return { data: results };
  },

  create: async ({ resource, variables }) => {
    const data = await request<any>(basePath(resource), {
      method: 'POST',
      body: JSON.stringify(variables),
    });
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    // Order status changes go through a dedicated endpoint/shape.
    if (resource === 'orders') {
      const data = await request<any>(`${basePath(resource)}/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(variables),
      });
      return { data };
    }
    const data = await request<any>(`${basePath(resource)}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(variables),
    });
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    const data = await request<any>(`${basePath(resource)}/${id}`, { method: 'DELETE' });
    return { data };
  },

  custom: async ({ url, method, payload }) => {
    const data = await request<any>(url.replace(API_URL, ''), {
      method: method?.toUpperCase() ?? 'GET',
      body: payload ? JSON.stringify(payload) : undefined,
    });
    return { data };
  },
};
