/**
 * Strips fields the backend's create/update DTOs don't accept — each nested
 * image/specification comes back from GET with server-generated `id` and
 * `productId` fields that ProductImageDto/ProductSpecificationDto don't
 * declare. The API rejects unknown properties (`forbidNonWhitelisted`) by
 * design, so feeding a loaded record straight back on save would otherwise
 * 400 the whole request.
 */
export function sanitizeProductPayload(values: Record<string, any>) {
  const { images, specifications, category, brand, ...rest } = values;
  return {
    ...rest,
    images: (images ?? []).map(({ id, productId, ...img }: any, i: number) => ({ ...img, sortOrder: i })),
    specifications: (specifications ?? []).map(({ id, productId, ...spec }: any, i: number) => ({
      ...spec,
      sortOrder: i,
    })),
  };
}
