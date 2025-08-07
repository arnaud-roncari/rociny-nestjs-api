import { ProductPlacementType } from '../../commons/enums/product_placement_type';
import { Theme } from '../../commons/enums/theme';

export const BASE_CPM: Record<ProductPlacementType, number> = {
  [ProductPlacementType.story]: 8,
  [ProductPlacementType.reel]: 10,
  [ProductPlacementType.post]: 12,
  [ProductPlacementType.giveaway]: 15,
};

export const THEME_MULTIPLIERS: Record<Theme, number> = {
  beauty: 1.35,
  luxury: 1.6,
  fitness: 1.2,
  tech: 1.1,
  food: 1.15,
  travel: 1.45,
  finance: 1.8,
  fashion: 1.3,
  parenting: 1.1,
  personal_dev: 1.1,
  animals: 1.0,
  education: 0.9,
};

export const AUDIENCE_MULTIPLIERS = [
  { min: 0, max: 10000, multiplier: 1.5 },
  { min: 10000, max: 50000, multiplier: 1.3 },
  { min: 50000, max: 100000, multiplier: 0.9 },
  { min: 100000, max: 500000, multiplier: 0.7 },
  { min: 500000, max: 1000000, multiplier: 0.5 },
  { min: 1000000, max: Infinity, multiplier: 0.3 },
];

export const ENGAGEMENT_MULTIPLIERS = [
  { min: 0, max: 0.5, multiplier: 0.7 },
  { min: 0.5, max: 0.8, multiplier: 0.9 },
  { min: 0.8, max: 1.2, multiplier: 1.0 },
  { min: 1.2, max: 1.5, multiplier: 1.2 },
  { min: 1.5, max: 2.0, multiplier: 1.4 },
  { min: 2.0, max: 3.0, multiplier: 1.6 },
  { min: 3.0, max: 5.0, multiplier: 1.8 },
  { min: 5.0, max: Infinity, multiplier: 2.0 },
];

export const THEME_BENCHMARKS: Record<Theme, number> = {
  beauty: 2.2,
  luxury: 1.8,
  fitness: 2.0,
  tech: 1.1,
  food: 1.5,
  travel: 1.7,
  finance: 1.3,
  fashion: 1.1,
  parenting: 1.6,
  personal_dev: 1.4,
  animals: 1.7,
  education: 2.0,
};

export const CONVERSION_RATES: Record<Theme, number> = {
  beauty: 0.008,
  luxury: 0.006,
  fitness: 0.007,
  tech: 0.005,
  food: 0.009,
  travel: 0.004,
  finance: 0.003,
  fashion: 0.007,
  parenting: 0.008,
  personal_dev: 0.006,
  animals: 0.009,
  education: 0.005,
};

export const CPA_TARGETS: Record<Theme, number> = {
  beauty: 2.5,
  luxury: 4.0,
  fitness: 3.0,
  tech: 5.0,
  food: 2.0,
  travel: 6.0,
  finance: 8.0,
  fashion: 3.5,
  parenting: 2.8,
  personal_dev: 4.5,
  animals: 2.2,
  education: 3.8,
};

type MonthRange = [number, number];
type SeasonalPeriod = { months: MonthRange; boost: number };

export const SEASONAL_BOOSTS: Record<Theme, SeasonalPeriod[]> = {
  beauty: [
    { months: [11, 12], boost: 1.25 },
    { months: [5, 6], boost: 1.15 },
  ],
  luxury: [
    { months: [12, 1], boost: 1.4 },
    { months: [7, 8], boost: 0.9 },
  ],
  fitness: [
    { months: [1, 2], boost: 1.35 },
    { months: [9, 10], boost: 1.2 },
  ],
  tech: [
    { months: [9, 11], boost: 1.3 },
    { months: [4, 5], boost: 1.1 },
  ],
  food: [
    { months: [11, 12], boost: 1.25 },
    { months: [6, 7], boost: 1.15 },
  ],
  travel: [
    { months: [6, 9], boost: 1.45 },
    { months: [1, 3], boost: 1.2 },
  ],
  finance: [
    { months: [1, 1], boost: 1.15 },
    { months: [10, 11], boost: 1.1 },
  ],
  fashion: [
    { months: [3, 4], boost: 1.3 },
    { months: [9, 10], boost: 1.25 },
  ],
  parenting: [
    { months: [8, 9], boost: 1.35 },
    { months: [5, 6], boost: 1.15 },
  ],
  personal_dev: [
    { months: [1, 1], boost: 1.4 },
    { months: [9, 9], boost: 1.25 },
  ],
  animals: [
    { months: [12, 1], boost: 1.3 },
    { months: [6, 7], boost: 1.15 },
  ],
  education: [
    { months: [9, 10], boost: 1.5 },
    { months: [1, 2], boost: 1.2 },
  ],
};
