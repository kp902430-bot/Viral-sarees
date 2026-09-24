import { Saree } from '../types';

export interface CategoryItem {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

// Default base categories recognized in Indian handloom saree stores
export const BASE_CATEGORIES: Array<{ id: string; name: string; icon: string; aliases: string[] }> = [
  { 
    id: 'Banarasi Silk', 
    name: 'Banarasi Silk', 
    icon: 'Crown',
    aliases: ['banarasi', 'varanasi', 'kadhwa', 'tanchoi']
  },
  { 
    id: 'Kanjivaram Silk', 
    name: 'Kanjivaram Silk', 
    icon: 'Gem',
    aliases: ['kanjivaram', 'kanchipuram', 'south silk']
  },
  { 
    id: 'Pure Organza', 
    name: 'Pure Organza', 
    icon: 'Feather',
    aliases: ['organza', 'pure organza', 'tissue organza']
  },
  { 
    id: 'Georgette', 
    name: 'Georgette & Chikankari', 
    icon: 'Heart',
    aliases: ['georgette', 'chikankari', 'pure georgette']
  },
  { 
    id: 'Chiffon', 
    name: 'Chiffon', 
    icon: 'Sparkles',
    aliases: ['chiffon', 'pure chiffon']
  },
  { 
    id: 'Paithani Silk', 
    name: 'Paithani Silk', 
    icon: 'Flower',
    aliases: ['paithani', 'maharashtrian silk']
  },
  { 
    id: 'Bandhani', 
    name: 'Bandhani & Bandhej', 
    icon: 'Sun',
    aliases: ['bandhani', 'bandhej', 'leheriya', 'tie dye']
  },
  { 
    id: 'Tissue Silk', 
    name: 'Tissue Silk', 
    icon: 'Star',
    aliases: ['tissue', 'tissue silk', 'metallic silk']
  },
  { 
    id: 'Chanderi Silk', 
    name: 'Chanderi & Cotton', 
    icon: 'Shirt',
    aliases: ['chanderi', 'cotton silk', 'chanderi silk', 'cotton']
  },
];

/**
 * Robust matching between a Saree and a category ID or query.
 * Matches saree.fabric, saree.category, title, or aliases.
 */
export function isSareeMatchingCategory(saree: Saree, categoryId: string): boolean {
  if (!categoryId || categoryId === 'all') return true;

  const target = categoryId.toLowerCase().trim();
  const fabric = (saree.fabric || '').toLowerCase().trim();
  const category = ((saree as any).category || '').toLowerCase().trim();

  // 1. Direct match
  if (fabric === target || category === target) return true;

  // 2. Substring match
  if (fabric && (fabric.includes(target) || target.includes(fabric))) return true;
  if (category && (category.includes(target) || target.includes(category))) return true;

  // 3. Check base category aliases
  const baseEntry = BASE_CATEGORIES.find(
    (b) => b.id.toLowerCase() === target || b.name.toLowerCase() === target
  );

  if (baseEntry) {
    if (baseEntry.aliases.some((alias) => fabric.includes(alias) || category.includes(alias))) {
      return true;
    }
  }

  // Also check if any other base category alias matches target
  for (const b of BASE_CATEGORIES) {
    if (b.aliases.some((alias) => target.includes(alias))) {
      if (fabric.includes(b.id.toLowerCase()) || (category && category.includes(b.id.toLowerCase()))) {
        return true;
      }
      if (b.aliases.some((alias) => fabric.includes(alias) || category.includes(alias))) {
        return true;
      }
    }
  }

  // 4. Tags match
  if (Array.isArray(saree.tags)) {
    const hasTagMatch = saree.tags.some((tag) => {
      const t = tag.toLowerCase().trim();
      return t === target || t.includes(target) || target.includes(t);
    });
    if (hasTagMatch) return true;
  }

  return false;
}

/**
 * Returns dynamic categories list computed directly from the current catalogue sarees.
 * Shows All Sarees first, followed by all categories present in the catalogue + popular collections.
 */
export function getDynamicCategories(sarees: Saree[]): CategoryItem[] {
  const result: CategoryItem[] = [
    { id: 'all', name: 'All Sarees', count: sarees.length, icon: 'Sparkles' }
  ];

  const processedKeys = new Set<string>();

  // 1. First add base categories that have items OR are standard
  BASE_CATEGORIES.forEach((base) => {
    const count = sarees.filter((s) => isSareeMatchingCategory(s, base.id)).length;
    result.push({
      id: base.id,
      name: base.name,
      count,
      icon: base.icon
    });
    processedKeys.add(base.id.toLowerCase());
    processedKeys.add(base.name.toLowerCase());
    base.aliases.forEach((a) => processedKeys.add(a.toLowerCase()));
  });

  // 2. Discover any custom fabric or category added to sarees that isn't already covered
  sarees.forEach((saree) => {
    const customFab = saree.fabric?.trim();
    if (customFab && !processedKeys.has(customFab.toLowerCase())) {
      // Check if it already matched an existing category in result
      const alreadyCovered = result.some((r) => r.id !== 'all' && isSareeMatchingCategory(saree, r.id));
      if (!alreadyCovered) {
        processedKeys.add(customFab.toLowerCase());
        const count = sarees.filter((s) => isSareeMatchingCategory(s, customFab)).length;
        result.push({
          id: customFab,
          name: customFab,
          count,
          icon: 'Sparkles'
        });
      }
    }

    const customCat = (saree as any).category?.trim();
    if (customCat && !processedKeys.has(customCat.toLowerCase())) {
      const alreadyCovered = result.some((r) => r.id !== 'all' && isSareeMatchingCategory(saree, r.id));
      if (!alreadyCovered) {
        processedKeys.add(customCat.toLowerCase());
        const count = sarees.filter((s) => isSareeMatchingCategory(s, customCat)).length;
        result.push({
          id: customCat,
          name: customCat,
          count,
          icon: 'Sparkles'
        });
      }
    }
  });

  return result;
}
