// Utility: returns category-specific size options for product forms and cart flow.

const KIDS_SIZES = [
  '0–3 Months',
  '3–6 Months',
  '6–12 Months',
  '1–2 Years',
  '2–3 Years',
  '3–4 Years',
  '5–6 Years',
  '7–8 Years',
  '9–10 Years',
  '11–12 Years'
];

const ADULT_SIZES = ['S (Small)', 'M (Medium)', 'L (Large)'];

export function getSizeOptions(categoryName) {
  const value = String(categoryName || '').toLowerCase();
  if (value.includes('kid')) return KIDS_SIZES;
  if (value.includes('men')) return ADULT_SIZES;
  if (value.includes('women') || value.includes('woman')) return ADULT_SIZES;
  return [];
}


