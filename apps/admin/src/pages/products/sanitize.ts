/**
 * Strips fields the backend's create/update DTOs don't accept (like each
 * nested image/specification's `id`, which is server-generated) before a
 * submit — the API rejects unknown properties (`forbidNonWhitelisted`) by
 * design, so a stray `id` here would otherwise 400 the whole request.
 */
export function sanitizeProductPayload(values: Record<string, any>) {
  const { images, specifications, category, brand, ...rest } = values;
  return {
    ...rest,
    images: (images ?? []).map(({ id, ...img }: any, i: number) => ({ ...img, sortOrder: i })),
    specifications: (specifications ?? []).map(({ id, ...spec }: any, i: number) => ({
      ...spec,
      sortOrder: i,
    })),
  };
}
