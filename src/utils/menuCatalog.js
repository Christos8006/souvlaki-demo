import menuData from '../data/menu.json'
import { getIngredientOptionsForItem } from '../data/menuOptionPresets'

export { menuData }

/**
 * @param {typeof menuData} categories
 * @param {Record<string, { price: number; onlinePrice: number }>} productPrices
 * @param {Record<string, true>} soldOutIds
 */
export function buildCatalog(categories, productPrices, soldOutIds) {
  return categories.map((cat) => ({
    ...cat,
    items: cat.items.map((item) => resolveItem(item, productPrices, soldOutIds)),
  }))
}

/** Προϊόν με επιλογές υλικών (modal) — όχι π.χ. αναψυκτικά. */
export function productHasIngredientPicker(item) {
  const o = item?.ingredientOptions
  if (!o) return false
  return (o.baseIngredients?.length ?? 0) > 0 || (o.extras?.length ?? 0) > 0
}

export function resolveItem(baseItem, productPrices, soldOutIds) {
  const id = String(baseItem.id)
  const ov = productPrices[id]
  const soldOut = !!soldOutIds[id]
  const ingredientOptions = getIngredientOptionsForItem(baseItem)
  return {
    ...baseItem,
    ...(ov ? { price: ov.price, onlinePrice: ov.onlinePrice } : {}),
    soldOut,
    ingredientOptions,
  }
}
