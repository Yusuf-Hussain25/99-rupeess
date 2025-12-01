/**
 * Utility functions for business operations
 */

/**
 * Generate a URL-friendly slug from a business name
 */
export const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Extract area from address string
 * Tries to extract the first meaningful location part from the address
 */
export const extractAreaFromAddress = (address: string): string => {
  if (!address) return 'Patna';
  
  // Remove common suffixes
  const cleaned = address
    .replace(/,?\s*Patna,?\s*Bihar/gi, '')
    .replace(/,?\s*Bihar/gi, '')
    .trim();
  
  // Split by comma and take the first meaningful part
  const parts = cleaned.split(',').map(p => p.trim()).filter(p => p.length > 0);
  
  if (parts.length > 0) {
    // Try to get a meaningful area name (skip generic terms)
    const firstPart = parts[0];
    const genericTerms = ['near', 'opposite', 'opp', 'above', 'below', 'ground floor', '1st floor', '2nd floor'];
    const isGeneric = genericTerms.some(term => firstPart.toLowerCase().includes(term));
    
    if (isGeneric && parts.length > 1) {
      return parts[1];
    }
    return firstPart;
  }
  
  return 'Patna';
};

/**
 * Generate a unique slug for a business
 * Appends a counter if the slug already exists
 */
export const generateBusinessSlug = (name: string, existingSlugs: Set<string>): string => {
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

