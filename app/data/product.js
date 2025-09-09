const product = {
  id: 'luxury-parfum-smokey',
  brand: 'Raven Parfums',
  name: 'Orange Blossom Extrait',
  description: 'A radiant blend evoking Mediterranean gardens. Crisp Italian bergamot sparkles atop soft, white orange blossoms. Elegant, sophisticated & luxurious fragrance.',
  images: [
    {
      original: '/orange_blossom_1.jpg',
      thumbnail: '/orange_blossom_thumb_1.jpg',
    },
    {
      original: '/orange_blossom_2.jpg',
      thumbnail: '/orange_blossom_thumb_2.jpg',
    },
    {
      original: '/orange_blossom_3.jpg',
      thumbnail: '/orange_blossom_thumb_3.jpg',
    },
  ],
  rating: 4.9,
  reviewCount: 178,
  benefits: [
    'Long lasting Eau De Parfum',
    'Classic blend of Whisky, Sandalwood & Vanilla',
    'Elegant, sophisticated & luxurious fragrance',
    'Travel friendly & ideal for gifting purpose',
  ],
  featureIcons: [
    '/feature-crueltyfree.svg',
    '/feature-phthalatesfree.svg',
    '/feature-vegan.svg',
    '/feature-parabenfree.svg',
  ],
  features: ['CRUELTY FREE', 'PHTHALATES FREE', '100% VEGAN', 'PARABEN FREE'],
  variants: [
    { size: '50ml', price: 549 },
    { size: '100ml', price: 599 },
  ],
};

export default product;
