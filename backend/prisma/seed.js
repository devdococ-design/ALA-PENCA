const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Default admin password: change-me
  const passwordHash = await bcrypt.hash('change-me', 10);
  await prisma.user.upsert({
    where: { email: 'admin@ala-penca.local' },
    update: { passwordHash },
    create: {
      email: 'admin@ala-penca.local',
      passwordHash,
    },
  });

  const plants = [
    {
      slug: 'sample-item-one',
      nameEs: 'Ítem de ejemplo 1',
      nameEn: 'Sample item 1',
      scientificName: 'Placeholder one',
      descriptionEs: 'Descripción de marcador para el catálogo. Reemplázala con tu contenido.',
      descriptionEn: 'Placeholder catalog description. Replace with your own content.',
      careEs: 'Notas de cuidado de ejemplo.',
      careEn: 'Sample care notes.',
      lightEs: 'partial',
      lightEn: 'partial',
      waterEs: 'moderate',
      waterEn: 'moderate',
      humidityEs: 'medium',
      humidityEn: 'medium',
      imageUrl:
        'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
      category: 'interior',
      price: 100,
      featured: true,
    },
    {
      slug: 'sample-item-two',
      nameEs: 'Ítem de ejemplo 2',
      nameEn: 'Sample item 2',
      scientificName: 'Placeholder two',
      descriptionEs: 'Segundo ítem de muestra para probar listados y fichas.',
      descriptionEn: 'Second sample item to exercise listings and detail pages.',
      careEs: 'Riego y luz de ejemplo.',
      careEn: 'Sample light and watering notes.',
      lightEs: 'shade',
      lightEn: 'shade',
      waterEs: 'low',
      waterEn: 'low',
      humidityEs: 'low',
      humidityEn: 'low',
      imageUrl:
        'https://images.unsplash.com/photo-1593482892290-f54927ae2b7a?auto=format&fit=crop&w=800&q=80',
      category: 'interior',
      price: 150,
      featured: true,
    },
    {
      slug: 'sample-item-three',
      nameEs: 'Ítem de ejemplo 3',
      nameEn: 'Sample item 3',
      scientificName: 'Placeholder three',
      descriptionEs: 'Tercer marcador; úsalo como base para tu catálogo real.',
      descriptionEn: 'Third placeholder; use it as a base for your real catalog.',
      careEs: 'Ajusta estos campos desde el admin.',
      careEn: 'Adjust these fields from the admin panel.',
      lightEs: 'sun',
      lightEn: 'sun',
      waterEs: 'low',
      waterEn: 'low',
      humidityEs: 'low',
      humidityEn: 'low',
      imageUrl:
        'https://images.unsplash.com/photo-1499002238440-d349b76d1d38?auto=format&fit=crop&w=800&q=80',
      category: 'exterior',
      price: 200,
      featured: false,
    },
  ];

  for (const plant of plants) {
    await prisma.plant.upsert({
      where: { slug: plant.slug },
      update: plant,
      create: plant,
    });
  }

  const posts = [
    {
      slug: 'getting-started',
      titleEs: 'Primeros pasos',
      titleEn: 'Getting started',
      excerptEs: 'Cómo personalizar esta plantilla.',
      excerptEn: 'How to customize this starter template.',
      contentEs:
        'Edita traducciones, el seed y el contenido en /admin.\n\nCambia la marca, colores y tipografías desde el panel de diseño.',
      contentEn:
        'Edit translations, the seed data, and content in /admin.\n\nUpdate branding, colors, and fonts from the design panel.',
      imageUrl:
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80',
      published: true,
    },
    {
      slug: 'sample-tip',
      titleEs: 'Tip de ejemplo',
      titleEn: 'Sample tip',
      excerptEs: 'Artículo de marcador para el blog.',
      excerptEn: 'Placeholder article for the blog.',
      contentEs:
        'Este es un tip de muestra. Sustitúyelo por guías o noticias reales de ALA-PENCA.',
      contentEn:
        'This is a sample tip. Replace it with real guides or news for ALA-PENCA.',
      imageUrl:
        'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=900&q=80',
      published: true,
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  const galleryCount = await prisma.galleryItem.count();
  if (galleryCount === 0) {
    await prisma.galleryItem.createMany({
      data: [
        {
          imageUrl:
            'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?auto=format&fit=crop&w=1200&q=80',
          descriptionEs: 'Imagen de galería de ejemplo 1.',
          descriptionEn: 'Sample gallery image 1.',
          sortOrder: 0,
        },
        {
          imageUrl:
            'https://images.unsplash.com/photo-1485955900006-10f4d32477c2?auto=format&fit=crop&w=900&q=80',
          descriptionEs: 'Imagen de galería de ejemplo 2.',
          descriptionEn: 'Sample gallery image 2.',
          sortOrder: 1,
        },
        {
          imageUrl:
            'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
          descriptionEs: 'Imagen de galería de ejemplo 3.',
          descriptionEn: 'Sample gallery image 3.',
          sortOrder: 2,
        },
      ],
    });
  }

  console.log('Seed OK — admin@ala-penca.local / change-me');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
