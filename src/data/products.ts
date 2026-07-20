import type { Category, Product } from '../types'

export const CATEGORIES: Category[] = [
  { id: 'essen', label: 'Essen' },
  { id: 'alkoholfrei', label: 'Alkoholfreie Getraenke' },
  { id: 'bier-spritzer', label: 'Bier & Spritzer' },
  { id: 'longdrinks', label: 'Longdrinks' },
]

export const PRODUCTS: Product[] = [
  {
    id: 'cola',
    name: 'Cola',
    priceCents: 400,
    category: 'alkoholfrei',
    imagePath: '/products/cup.svg',
  },
  {
    id: 'almdudler',
    name: 'Almdudler',
    priceCents: 400,
    category: 'alkoholfrei',
    imagePath: '/products/cup.svg',
  },
  {
    id: 'frucade',
    name: 'Frucade',
    priceCents: 400,
    category: 'alkoholfrei',
    imagePath: '/products/cup.svg',
  },
  {
    id: 'eistee',
    name: 'Eistee',
    priceCents: 400,
    category: 'alkoholfrei',
    imagePath: '/products/cup.svg',
  },

  {
    id: 'bier-05',
    name: 'Bier 0,5 l',
    priceCents: 550,
    category: 'bier-spritzer',
    imagePath: '/products/beer.svg',
  },
  {
    id: 'bier-03',
    name: 'Bier 0,3 l',
    priceCents: 400,
    category: 'bier-spritzer',
    imagePath: '/products/beer.svg',
  },
  {
    id: 'spritzer',
    name: 'Spritzer',
    priceCents: 350,
    category: 'bier-spritzer',
    imagePath: '/products/glass-full.svg',
  },
  {
    id: 'grosser-spritzer',
    name: 'Grosser Spritzer',
    priceCents: 700,
    category: 'bier-spritzer',
    imagePath: '/products/glass-full.svg',
  },

  {
    id: 'kaesekrainer',
    name: 'Kaesekrainer',
    priceCents: 600,
    category: 'essen',
    imagePath: '/products/sausage.svg',
  },
  {
    id: 'kaesekrainer-hotdog',
    name: 'Kaesekrainer Hotdog',
    priceCents: 650,
    category: 'essen',
    imagePath: '/products/burger.svg',
  },
  {
    id: 'frankfurter',
    name: 'Frankfurter',
    priceCents: 500,
    category: 'essen',
    imagePath: '/products/meat.svg',
  },
  {
    id: 'gfb',
    name: 'GFB',
    priceCents: 850,
    category: 'essen',
    imagePath: '/products/sausage.svg',
  },
  {
    id: 'bfb',
    name: 'BFB',
    priceCents: 700,
    category: 'essen',
    imagePath: '/products/sausage.svg',
  },

  {
    id: 'cuba-libre',
    name: 'Cuba Libre',
    priceCents: 900,
    category: 'longdrinks',
    imagePath: '/products/glass-cocktail.svg',
  },
]
