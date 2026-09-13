/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// NOTE: this is development/demo seed data only. The admin password below is
// intentionally simple and MUST be changed before any non-local deployment.
const ADMIN_EMAIL = 'admin@eacomputers.com';
const ADMIN_DEV_PASSWORD = 'ChangeMe123!';
const CUSTOMER_EMAIL = 'customer@example.com';
const CUSTOMER_DEV_PASSWORD = 'Customer123!';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function placeholderImage(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/800`;
}

async function main() {
  console.log('🌱 Seeding EA Computers demo data...');

  // ---------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------
  const adminPasswordHash = await bcrypt.hash(ADMIN_DEV_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      name: 'EA Computers Admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log(`👤 Admin ready: ${ADMIN_EMAIL} / ${ADMIN_DEV_PASSWORD} (development only — change this!)`);

  const customerPasswordHash = await bcrypt.hash(CUSTOMER_DEV_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: CUSTOMER_EMAIL },
    update: {},
    create: {
      email: CUSTOMER_EMAIL,
      name: 'Demo Customer',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
    },
  });
  console.log(`👤 Demo customer ready: ${CUSTOMER_EMAIL} / ${CUSTOMER_DEV_PASSWORD}`);

  // ---------------------------------------------------------------------
  // Brands
  // ---------------------------------------------------------------------
  const brandNames = [
    'ASUS',
    'MSI',
    'Gigabyte',
    'Dell',
    'HP',
    'Lenovo',
    'Intel',
    'AMD',
    'NVIDIA',
    'Corsair',
    'Kingston',
    'Samsung',
    'WD',
    'Logitech',
    'Razer',
  ];
  const brands: Record<string, { id: string }> = {};
  for (const name of brandNames) {
    const brand = await prisma.brand.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), isActive: true },
    });
    brands[name] = brand;
  }
  console.log(`🏷️  ${brandNames.length} brands ready`);

  // ---------------------------------------------------------------------
  // Categories (with one hierarchical group: PC Components > CPUs/GPUs/RAM/Motherboards)
  // ---------------------------------------------------------------------
  const pcComponents = await prisma.category.upsert({
    where: { slug: 'pc-components' },
    update: {},
    create: {
      name: 'PC Components',
      slug: 'pc-components',
      description: 'Build or upgrade your own desktop PC.',
      isActive: true,
    },
  });

  const childCategoryDefs = [
    { name: 'Graphics Cards', slug: 'graphics-cards', description: 'Dedicated GPUs for gaming, rendering and AI workloads.' },
    { name: 'Processors', slug: 'processors', description: 'Desktop CPUs from Intel and AMD.' },
    { name: 'Motherboards', slug: 'motherboards', description: 'Motherboards for every socket and form factor.' },
    { name: 'RAM', slug: 'ram', description: 'Desktop and laptop memory modules.' },
  ];
  const topLevelCategoryDefs = [
    { name: 'Laptops', slug: 'laptops', description: 'Laptops for gaming, business and everyday use.' },
    { name: 'Desktop PCs', slug: 'desktop-pcs', description: 'Pre-built desktop computers, ready to go.' },
    { name: 'SSD', slug: 'ssd', description: 'Solid-state drives — SATA and NVMe.' },
    { name: 'HDD', slug: 'hdd', description: 'Traditional hard disk drives for bulk storage.' },
    { name: 'Power Supplies', slug: 'power-supplies', description: 'PSUs for every build, from 450W to 1200W+.' },
    { name: 'PC Cases', slug: 'pc-cases', description: 'ATX, Micro-ATX and Mini-ITX cases.' },
    { name: 'Cooling', slug: 'cooling', description: 'Air and liquid CPU coolers, case fans.' },
    { name: 'Monitors', slug: 'monitors', description: 'Gaming, professional and office monitors.' },
    { name: 'Keyboards', slug: 'keyboards', description: 'Mechanical and membrane keyboards.' },
    { name: 'Mice', slug: 'mice', description: 'Gaming and productivity mice.' },
    { name: 'Headsets', slug: 'headsets', description: 'Gaming and office headsets.' },
    { name: 'Networking', slug: 'networking', description: 'Routers, switches, Wi-Fi and networking cards.' },
    { name: 'Accessories', slug: 'accessories', description: 'Cables, mounts and other computer accessories.' },
  ];

  const categories: Record<string, { id: string }> = { 'pc-components': pcComponents };
  for (const def of childCategoryDefs) {
    categories[def.slug] = await prisma.category.upsert({
      where: { slug: def.slug },
      update: {},
      create: { ...def, parentId: pcComponents.id, isActive: true },
    });
  }
  for (const def of topLevelCategoryDefs) {
    categories[def.slug] = await prisma.category.upsert({
      where: { slug: def.slug },
      update: {},
      create: { ...def, isActive: true },
    });
  }
  console.log(`📁 ${1 + childCategoryDefs.length + topLevelCategoryDefs.length} categories ready`);

  // Suggested spec fields per category (purely an admin UX hint).
  const specTemplates: Record<string, { name: string; unit?: string }[]> = {
    'graphics-cards': [{ name: 'VRAM', unit: 'GB' }, { name: 'Memory Type' }, { name: 'Interface' }, { name: 'Power Draw', unit: 'W' }],
    processors: [{ name: 'Cores' }, { name: 'Threads' }, { name: 'Base Clock', unit: 'GHz' }, { name: 'Socket' }],
    motherboards: [{ name: 'Socket' }, { name: 'Chipset' }, { name: 'Form Factor' }, { name: 'Memory Slots' }],
    ram: [{ name: 'Capacity', unit: 'GB' }, { name: 'Speed', unit: 'MHz' }, { name: 'Type' }],
    laptops: [{ name: 'CPU' }, { name: 'RAM', unit: 'GB' }, { name: 'Storage' }, { name: 'Display' }, { name: 'GPU' }],
  };
  for (const [slug, fields] of Object.entries(specTemplates)) {
    const category = categories[slug];
    if (!category) continue;
    for (const [i, field] of fields.entries()) {
      await prisma.categorySpecTemplate.upsert({
        where: { categoryId_name: { categoryId: category.id, name: field.name } },
        update: {},
        create: { categoryId: category.id, name: field.name, unit: field.unit, sortOrder: i },
      });
    }
  }

  // ---------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------
  type SeedProduct = {
    name: string;
    categorySlug: string;
    brand: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    sku: string;
    description: string;
    isFeatured?: boolean;
    specs: { group?: string; name: string; value: string }[];
  };

  const products: SeedProduct[] = [
    {
      name: 'ASUS ROG Strix RTX 5070 Ti OC 16GB',
      categorySlug: 'graphics-cards',
      brand: 'ASUS',
      price: 289999,
      compareAtPrice: 319999,
      stock: 8,
      sku: 'ASUS-RTX5070TI-16G-STRIX',
      description:
        'Built for 1440p/4K gaming, the ROG Strix RTX 5070 Ti pairs a massive triple-fan cooler with factory overclocked performance.',
      isFeatured: true,
      specs: [
        { group: 'Performance', name: 'GPU', value: 'RTX 5070 Ti' },
        { group: 'Performance', name: 'VRAM', value: '16GB' },
        { group: 'Performance', name: 'Memory Type', value: 'GDDR7' },
        { group: 'Connectivity', name: 'Interface', value: 'PCIe 5.0' },
        { group: 'Power', name: 'Power Draw', value: '300W' },
      ],
    },
    {
      name: 'MSI Gaming X Trio RTX 5070 12GB',
      categorySlug: 'graphics-cards',
      brand: 'MSI',
      price: 249999,
      stock: 12,
      sku: 'MSI-RTX5070-12G-GXT',
      description: 'Triple-fan cooling and a robust VRM design make this card ideal for high-refresh 1440p gaming.',
      isFeatured: true,
      specs: [
        { name: 'GPU', value: 'RTX 5070' },
        { name: 'VRAM', value: '12GB' },
        { name: 'Memory Type', value: 'GDDR7' },
        { name: 'Interface', value: 'PCIe 5.0' },
        { name: 'Power Draw', value: '250W' },
      ],
    },
    {
      name: 'Gigabyte AORUS RX 8800 XT Master 16GB',
      categorySlug: 'graphics-cards',
      brand: 'Gigabyte',
      price: 219999,
      stock: 6,
      sku: 'GB-RX8800XT-16G-AORUS',
      description: 'A powerhouse AMD GPU with WINDFORCE cooling for silent, high-performance 1440p/4K gaming.',
      specs: [
        { name: 'GPU', value: 'RX 8800 XT' },
        { name: 'VRAM', value: '16GB' },
        { name: 'Memory Type', value: 'GDDR6' },
        { name: 'Interface', value: 'PCIe 4.0' },
      ],
    },
    {
      name: 'Intel Core i7-14700K',
      categorySlug: 'processors',
      brand: 'Intel',
      price: 89999,
      stock: 20,
      sku: 'INTEL-I7-14700K',
      description: '20-core desktop processor delivering excellent gaming and multi-threaded productivity performance.',
      isFeatured: true,
      specs: [
        { name: 'Cores', value: '20 (8P + 12E)' },
        { name: 'Threads', value: '28' },
        { name: 'Base Clock', value: '3.4GHz' },
        { name: 'Socket', value: 'LGA1700' },
      ],
    },
    {
      name: 'AMD Ryzen 7 9800X3D',
      categorySlug: 'processors',
      brand: 'AMD',
      price: 99999,
      stock: 15,
      sku: 'AMD-R7-9800X3D',
      description: 'AMD\'s 3D V-Cache flagship for gamers — class-leading frame rates in the most demanding titles.',
      isFeatured: true,
      specs: [
        { name: 'Cores', value: '8' },
        { name: 'Threads', value: '16' },
        { name: 'Base Clock', value: '4.7GHz' },
        { name: 'Socket', value: 'AM5' },
      ],
    },
    {
      name: 'ASUS ROG Strix B850-F Gaming WiFi',
      categorySlug: 'motherboards',
      brand: 'ASUS',
      price: 54999,
      stock: 10,
      sku: 'ASUS-B850F-STRIX',
      description: 'A feature-packed AM5 motherboard with PCIe 5.0, WiFi 7 and robust power delivery.',
      specs: [
        { name: 'Socket', value: 'AM5' },
        { name: 'Chipset', value: 'B850' },
        { name: 'Form Factor', value: 'ATX' },
        { name: 'Memory Slots', value: '4x DDR5' },
      ],
    },
    {
      name: 'Corsair Vengeance 32GB (2x16GB) DDR5-6000',
      categorySlug: 'ram',
      brand: 'Corsair',
      price: 24999,
      stock: 30,
      sku: 'CORSAIR-VENG-32GB-6000',
      description: 'High-speed DDR5 memory kit tuned for the latest AMD and Intel platforms.',
      specs: [
        { name: 'Capacity', value: '32GB' },
        { name: 'Speed', value: '6000MHz' },
        { name: 'Type', value: 'DDR5' },
      ],
    },
    {
      name: 'Kingston FURY Beast 16GB (2x8GB) DDR4-3200',
      categorySlug: 'ram',
      brand: 'Kingston',
      price: 8999,
      stock: 40,
      sku: 'KINGSTON-FURY-16GB-3200',
      description: 'Reliable, plug-and-play DDR4 memory for mainstream builds.',
      specs: [
        { name: 'Capacity', value: '16GB' },
        { name: 'Speed', value: '3200MHz' },
        { name: 'Type', value: 'DDR4' },
      ],
    },
    {
      name: 'Samsung 990 PRO 2TB NVMe SSD',
      categorySlug: 'ssd',
      brand: 'Samsung',
      price: 34999,
      stock: 25,
      sku: 'SAMSUNG-990PRO-2TB',
      description: 'Blazing-fast PCIe 4.0 NVMe SSD for gaming rigs and creative workstations.',
      isFeatured: true,
      specs: [
        { name: 'Capacity', value: '2TB' },
        { name: 'Interface', value: 'PCIe 4.0 NVMe' },
        { name: 'Read Speed', value: '7450 MB/s' },
      ],
    },
    {
      name: 'WD Blue 1TB SATA SSD',
      categorySlug: 'ssd',
      brand: 'WD',
      price: 11999,
      stock: 35,
      sku: 'WD-BLUE-1TB-SATA',
      description: 'A dependable, affordable SSD upgrade for everyday computing.',
      specs: [
        { name: 'Capacity', value: '1TB' },
        { name: 'Interface', value: 'SATA III' },
      ],
    },
    {
      name: 'WD Blue 2TB Desktop Hard Drive',
      categorySlug: 'hdd',
      brand: 'WD',
      price: 13999,
      stock: 20,
      sku: 'WD-BLUE-2TB-HDD',
      description: 'High-capacity 7200RPM storage for media libraries and backups.',
      specs: [
        { name: 'Capacity', value: '2TB' },
        { name: 'RPM', value: '7200' },
      ],
    },
    {
      name: 'Corsair RM850x 850W 80+ Gold PSU',
      categorySlug: 'power-supplies',
      brand: 'Corsair',
      price: 27999,
      stock: 18,
      sku: 'CORSAIR-RM850X',
      description: 'Fully modular, whisper-quiet 80+ Gold power supply for demanding builds.',
      specs: [
        { name: 'Wattage', value: '850W' },
        { name: 'Efficiency', value: '80+ Gold' },
        { name: 'Modular', value: 'Fully Modular' },
      ],
    },
    {
      name: 'NZXT H5 Flow Mid Tower Case',
      categorySlug: 'pc-cases',
      brand: 'ASUS',
      price: 17999,
      stock: 14,
      sku: 'NZXT-H5-FLOW',
      description: 'High-airflow mid-tower case with clean cable management and tempered glass side panel.',
      specs: [
        { name: 'Form Factor', value: 'ATX Mid Tower' },
        { name: 'Side Panel', value: 'Tempered Glass' },
      ],
    },
    {
      name: 'Corsair iCUE H150i Elite 360mm AIO Cooler',
      categorySlug: 'cooling',
      brand: 'Corsair',
      price: 32999,
      stock: 10,
      sku: 'CORSAIR-H150I-ELITE',
      description: '360mm liquid cooler with RGB fans, keeping even the hottest CPUs in check.',
      specs: [
        { name: 'Radiator Size', value: '360mm' },
        { name: 'Fans', value: '3x 120mm' },
      ],
    },
    {
      name: 'Samsung Odyssey G7 27" 240Hz QHD Monitor',
      categorySlug: 'monitors',
      brand: 'Samsung',
      price: 89999,
      stock: 9,
      sku: 'SAMSUNG-ODYSSEY-G7-27',
      description: 'A curved 240Hz QHD panel built for competitive and immersive gaming alike.',
      isFeatured: true,
      specs: [
        { name: 'Size', value: '27"' },
        { name: 'Resolution', value: '2560x1440' },
        { name: 'Refresh Rate', value: '240Hz' },
      ],
    },
    {
      name: 'Dell UltraSharp U2724DE 27" 4K Monitor',
      categorySlug: 'monitors',
      brand: 'Dell',
      price: 109999,
      stock: 7,
      sku: 'DELL-U2724DE',
      description: 'A color-accurate 4K display designed for professionals and creators.',
      specs: [
        { name: 'Size', value: '27"' },
        { name: 'Resolution', value: '3840x2160' },
      ],
    },
    {
      name: 'Logitech G Pro X Mechanical Keyboard',
      categorySlug: 'keyboards',
      brand: 'Logitech',
      price: 24999,
      stock: 22,
      sku: 'LOGITECH-GPROX',
      description: 'Tournament-ready tenkeyless mechanical keyboard with swappable switches.',
      specs: [{ name: 'Switch Type', value: 'Hot-swappable Mechanical' }],
    },
    {
      name: 'Razer DeathAdder V3 Gaming Mouse',
      categorySlug: 'mice',
      brand: 'Razer',
      price: 12999,
      stock: 30,
      sku: 'RAZER-DEATHADDER-V3',
      description: 'An ergonomic, ultra-lightweight mouse trusted by esports professionals.',
      specs: [{ name: 'Sensor', value: '30,000 DPI Optical' }],
    },
    {
      name: 'HyperX Cloud III Gaming Headset',
      categorySlug: 'headsets',
      brand: 'Kingston',
      price: 15999,
      stock: 25,
      sku: 'HYPERX-CLOUD-III',
      description: 'Comfortable, durable and great-sounding — a staple for long gaming sessions.',
      specs: [{ name: 'Connection', value: '3.5mm / USB' }],
    },
    {
      name: 'TP-Link Archer AX73 WiFi 6 Router',
      categorySlug: 'networking',
      brand: 'ASUS',
      price: 22999,
      stock: 16,
      sku: 'TPLINK-AX73',
      description: 'A high-throughput dual-band WiFi 6 router for demanding home networks.',
      specs: [{ name: 'Standard', value: 'WiFi 6 (802.11ax)' }],
    },
    {
      name: 'ASUS ROG Zephyrus G14 (2025)',
      categorySlug: 'laptops',
      brand: 'ASUS',
      price: 379999,
      compareAtPrice: 419999,
      stock: 5,
      sku: 'ASUS-ZEPHYRUS-G14-2025',
      description: 'A compact 14" gaming laptop with flagship performance and a stunning OLED display.',
      isFeatured: true,
      specs: [
        { name: 'CPU', value: 'AMD Ryzen 9' },
        { name: 'RAM', value: '32GB' },
        { name: 'Storage', value: '1TB NVMe SSD' },
        { name: 'Display', value: '14" 2.8K OLED 120Hz' },
        { name: 'GPU', value: 'RTX 5070' },
      ],
    },
    {
      name: 'Dell XPS 14',
      categorySlug: 'laptops',
      brand: 'Dell',
      price: 329999,
      stock: 6,
      sku: 'DELL-XPS-14',
      description: 'A premium ultrabook combining a stunning display with all-day battery life.',
      specs: [
        { name: 'CPU', value: 'Intel Core Ultra 7' },
        { name: 'RAM', value: '16GB' },
        { name: 'Storage', value: '512GB NVMe SSD' },
        { name: 'Display', value: '14.5" 3.2K OLED' },
      ],
    },
    {
      name: 'Lenovo Legion Pro 5',
      categorySlug: 'laptops',
      brand: 'Lenovo',
      price: 299999,
      stock: 8,
      sku: 'LENOVO-LEGION-PRO-5',
      description: 'A powerhouse gaming laptop with a high-refresh display and serious cooling.',
      specs: [
        { name: 'CPU', value: 'AMD Ryzen 7' },
        { name: 'RAM', value: '16GB' },
        { name: 'Storage', value: '1TB NVMe SSD' },
        { name: 'GPU', value: 'RTX 5060' },
      ],
    },
    {
      name: 'HP Pavilion Desktop',
      categorySlug: 'desktop-pcs',
      brand: 'HP',
      price: 189999,
      stock: 10,
      sku: 'HP-PAVILION-DESKTOP',
      description: 'A dependable pre-built desktop for home, office and everyday computing.',
      specs: [
        { name: 'CPU', value: 'Intel Core i5' },
        { name: 'RAM', value: '16GB' },
        { name: 'Storage', value: '512GB SSD' },
      ],
    },
    {
      name: 'EA Computers Ryzen Gaming Rig',
      categorySlug: 'desktop-pcs',
      brand: 'AMD',
      price: 349999,
      stock: 4,
      sku: 'EAC-RYZEN-GAMING-RIG',
      description:
        'Our in-house built gaming desktop — Ryzen 7, RTX 5070, 32GB RAM and a 1TB NVMe SSD, ready to game out of the box.',
      isFeatured: true,
      specs: [
        { name: 'CPU', value: 'AMD Ryzen 7 9700X' },
        { name: 'GPU', value: 'RTX 5070' },
        { name: 'RAM', value: '32GB DDR5' },
        { name: 'Storage', value: '1TB NVMe SSD' },
      ],
    },
    {
      name: 'USB-C to HDMI Adapter',
      categorySlug: 'accessories',
      brand: 'ASUS',
      price: 2499,
      stock: 0,
      sku: 'ACC-USBC-HDMI',
      description: 'Connect your USB-C laptop to any HDMI display in 4K.',
      specs: [{ name: 'Output', value: '4K @ 60Hz' }],
    },
  ];

  for (const p of products) {
    const category = categories[p.categorySlug];
    const brand = brands[p.brand];
    if (!category) {
      console.warn(`⚠️  Skipping "${p.name}" — unknown category "${p.categorySlug}"`);
      continue;
    }
    const slug = slugify(p.name);
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.stock,
        sku: p.sku,
        categoryId: category.id,
        brandId: brand?.id,
        isFeatured: p.isFeatured ?? false,
        isActive: true,
        images: {
          create: [
            { url: placeholderImage(p.sku + '-1'), alt: p.name, sortOrder: 0 },
            { url: placeholderImage(p.sku + '-2'), alt: p.name, sortOrder: 1 },
          ],
        },
        specifications: {
          create: p.specs.map((s, i) => ({ group: s.group, name: s.name, value: s.value, sortOrder: i })),
        },
      },
    });
  }
  console.log(`📦 ${products.length} demo products ready`);

  console.log('✅ Seed complete.');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
