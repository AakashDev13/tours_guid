export const CATEGORIES = [
  { value: 'beach', label: 'Beach', icon: '🏖️' },
  { value: 'mountain', label: 'Mountain', icon: '🏔️' },
  { value: 'city', label: 'City', icon: '🏙️' },
  { value: 'heritage', label: 'Heritage', icon: '🏛️' },
  { value: 'adventure', label: 'Adventure', icon: '🧗' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
];

export const BUDGETS = [
  { value: 'budget', label: 'Budget' },
  { value: 'mid', label: 'Mid-range' },
  { value: 'luxury', label: 'Luxury' },
];

export const categoryIcon = (value) => CATEGORIES.find((c) => c.value === value)?.icon || '📍';
