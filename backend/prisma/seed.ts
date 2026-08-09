import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@t-jardin.local' },
    update: {},
    create: {
      email: 'admin@t-jardin.local',
      passwordHash,
    },
  });

  const plants = [
    {
      slug: 'monstera-deliciosa',
      nameEs: 'Monstera deliciosa',
      nameEn: 'Swiss cheese plant',
      scientificName: 'Monstera deliciosa',
      descriptionEs: 'Icono tropical de hojas perforadas, ideal para rincones luminosos.',
      descriptionEn: 'Tropical icon with fenestrated leaves, ideal for bright corners.',
      careEs: 'Prefiere luz filtrada y riego cuando la capa superior del sustrato esté seca.',
      careEn: 'Prefers filtered light and watering when the top soil is dry.',
      lightEs: 'partial',
      lightEn: 'partial',
      waterEs: 'moderate',
      waterEn: 'moderate',
      humidityEs: 'high',
      humidityEn: 'high',
      imageUrl:
        'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
      category: 'interior',
      price: 350,
      featured: true,
    },
    {
      slug: 'sansevieria',
      nameEs: 'Sansevieria',
      nameEn: 'Snake plant',
      scientificName: 'Dracaena trifasciata',
      descriptionEs: 'Resistente y perfecta para principiantes o espacios con poca luz.',
      descriptionEn: 'Hardy and perfect for beginners or low-light spaces.',
      careEs: 'Poca agua. Evita encharcar; tolera olvidos de riego.',
      careEn: 'Little water. Avoid soggy soil; forgives missed waterings.',
      lightEs: 'shade',
      lightEn: 'shade',
      waterEs: 'low',
      waterEn: 'low',
      humidityEs: 'low',
      humidityEn: 'low',
      imageUrl:
        'https://images.unsplash.com/photo-1593482892290-f54927ae2b7a?auto=format&fit=crop&w=800&q=80',
      category: 'interior',
      price: 220,
      featured: true,
    },
    {
      slug: 'calathea-orbifolia',
      nameEs: 'Calathea orbifolia',
      nameEn: 'Calathea orbifolia',
      scientificName: 'Goeppertia orbifolia',
      descriptionEs: 'Hojas redondas con franjas plateadas que se pliegan al anochecer.',
      descriptionEn: 'Round leaves with silver stripes that fold at nightfall.',
      careEs: 'Humedad constante, riego suave y lejos de corrientes de aire.',
      careEn: 'Steady humidity, gentle watering, and away from drafts.',
      lightEs: 'shade',
      lightEn: 'shade',
      waterEs: 'constant',
      waterEn: 'constant',
      humidityEs: 'high',
      humidityEn: 'high',
      imageUrl:
        'https://images.unsplash.com/photo-1597055181300-cb151fa61b4c?auto=format&fit=crop&w=800&q=80',
      category: 'interior',
      price: 280,
      featured: true,
    },
    {
      slug: 'fico-lyrata',
      nameEs: 'Ficus lyrata',
      nameEn: 'Fiddle-leaf fig',
      scientificName: 'Ficus lyrata',
      descriptionEs: 'Silueta escultórica para salas con buena luz.',
      descriptionEn: 'Sculptural silhouette for rooms with good light.',
      careEs: 'Luz estable, riego moderado y limpieza ocasional de hojas.',
      careEn: 'Steady light, moderate watering, and occasional leaf cleaning.',
      lightEs: 'partial',
      lightEn: 'partial',
      waterEs: 'moderate',
      waterEn: 'moderate',
      humidityEs: 'medium',
      humidityEn: 'medium',
      imageUrl:
        'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80',
      category: 'interior',
      price: 480,
      featured: false,
    },
    {
      slug: 'lavanda',
      nameEs: 'Lavanda',
      nameEn: 'Lavender',
      scientificName: 'Lavandula angustifolia',
      descriptionEs: 'Aromática de sol pleno, ideal para balcones y bordes.',
      descriptionEn: 'Full-sun aromatic, ideal for balconies and borders.',
      careEs: 'Mucho sol, suelo bien drenado y riego espaciado.',
      careEn: 'Plenty of sun, well-drained soil, and spaced watering.',
      lightEs: 'sun',
      lightEn: 'sun',
      waterEs: 'low',
      waterEn: 'low',
      humidityEs: 'low',
      humidityEn: 'low',
      imageUrl:
        'https://images.unsplash.com/photo-1499002238440-d349b76d1d38?auto=format&fit=crop&w=800&q=80',
      category: 'exterior',
      price: 180,
      featured: true,
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
      slug: 'riego-sin-ahogar',
      titleEs: 'Riego sin ahogar',
      titleEn: 'Water without drowning',
      excerptEs: 'La regla del dedo y por qué menos suele ser más.',
      excerptEn: 'The finger rule and why less is often more.',
      contentEs:
        'Antes de regar, introduce un dedo 2–3 cm en el sustrato. Si aún está húmedo, espera. El exceso de agua es la causa más común de raíces blandas en plantas de interior.\n\nUsa macetas con drenaje, vacía el platito después de 15 minutos y ajusta la frecuencia según la estación.',
      contentEn:
        'Before watering, put a finger 2–3 cm into the soil. If it still feels moist, wait. Overwatering is the most common cause of soft roots in houseplants.\n\nUse pots with drainage, empty the saucer after 15 minutes, and adjust frequency with the seasons.',
      imageUrl:
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80',
      published: true,
    },
    {
      slug: 'luz-correcta',
      titleEs: 'Encontrar la luz correcta',
      titleEn: 'Finding the right light',
      excerptEs: 'Directa, filtrada o sombra: cómo leer tu ventana.',
      excerptEn: 'Direct, filtered, or shade: how to read your window.',
      contentEs:
        'Observa la sombra que proyecta tu mano al mediodía. Sombra nítida = luz intensa. Sombra suave = luz filtrada. Sombra apenas visible = poca luz.\n\nGira la planta cada dos semanas para un crecimiento equilibrado y aleja las hojas delicadas del sol de la tarde.',
      contentEn:
        'Look at the shadow your hand casts at midday. Sharp shadow = intense light. Soft shadow = filtered light. Barely visible shadow = low light.\n\nRotate the plant every two weeks for even growth and keep delicate leaves off harsh afternoon sun.',
      imageUrl:
        'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=900&q=80',
      published: true,
    },
    {
      slug: 'hojas-amarillas',
      titleEs: 'Hojas amarillas: qué revisar primero',
      titleEn: 'Yellow leaves: what to check first',
      excerptEs: 'Un checklist corto antes de entrar en pánico.',
      excerptEn: 'A short checklist before you panic.',
      contentEs:
        '1) ¿El sustrato está empapado o polvoriento?\n2) ¿Hay corrientes de aire o cambios bruscos de temperatura?\n3) ¿Las hojas viejas de abajo amarillean de forma natural?\n\nSi el problema persiste, agenda una cita en el Hospital de plantas de T-Jardin.',
      contentEn:
        '1) Is the soil soggy or bone-dry?\n2) Are there drafts or sudden temperature swings?\n3) Are older bottom leaves yellowing naturally?\n\nIf the issue persists, book a visit at T-Jardin’s Plant Hospital.',
      imageUrl:
        'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
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

  console.log('Seed OK — admin@t-jardin.local / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
