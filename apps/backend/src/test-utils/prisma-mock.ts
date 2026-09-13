/** A minimal deep-mock of PrismaService for unit tests — no real database involved. */
export type PrismaMock = Record<string, any>;

function modelMock() {
  return {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  };
}

export function createPrismaMock(): PrismaMock {
  const mock: PrismaMock = {
    user: modelMock(),
    category: modelMock(),
    categorySpecTemplate: modelMock(),
    brand: modelMock(),
    product: modelMock(),
    productImage: modelMock(),
    productSpecification: modelMock(),
    cart: modelMock(),
    cartItem: modelMock(),
    order: modelMock(),
    orderItem: modelMock(),
    $queryRaw: jest.fn(),
  };
  // By default, run the transaction callback against the same mock (acts as `tx`).
  mock.$transaction = jest.fn((cb: (tx: PrismaMock) => unknown) => cb(mock));
  return mock;
}
