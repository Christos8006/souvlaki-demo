/**
 * Προκαθορισμένα υλικά ανά τύπο πιάτου. Στο menu.json βάλτε "optionsPreset": "κλειδί".
 * Προϊόντα χωρίς preset → προσθήκη στο καλάθι χωρίς modal (π.χ. αναψυκτικό).
 */

export const INGREDIENT_PRESETS = {
  pitaGyrosPork: {
    baseIngredients: [
      { id: 'nt', label: 'Ντομάτα' },
      { id: 'kr', label: 'Κρεμμύδι' },
      { id: 'pat', label: 'Πατάτες μέσα' },
      { id: 'tz', label: 'Τζατζίκι' },
    ],
    extras: [
      { id: 'x_tyri', label: 'Επιπλέον τυρί', price: 0.5 },
      { id: 'x_pat', label: 'Επιπλέον πατάτες μέσα', price: 0.4 },
      { id: 'x_tz', label: 'Επιπλέον τζατζίκι', price: 0.3 },
    ],
  },
  pitaGyrosChicken: {
    baseIngredients: [
      { id: 'nt', label: 'Ντομάτα' },
      { id: 'kr', label: 'Κρεμμύδι' },
      { id: 'pat', label: 'Πατάτες μέσα' },
      { id: 'sos', label: 'Σως' },
    ],
    extras: [
      { id: 'x_tyri', label: 'Επιπλέον τυρί', price: 0.5 },
      { id: 'x_pat', label: 'Επιπλέον πατάτες μέσα', price: 0.4 },
      { id: 'x_sos', label: 'Επιπλέον σως', price: 0.2 },
    ],
  },
  pitaSouvlaki: {
    baseIngredients: [
      { id: 'nt', label: 'Ντομάτα' },
      { id: 'kr', label: 'Κρεμμύδι' },
      { id: 'pat', label: 'Πατάτες μέσα' },
    ],
    extras: [
      { id: 'x_tyri', label: 'Επιπλέον τυρί', price: 0.5 },
      { id: 'x_pat', label: 'Επιπλέον πατάτες μέσα', price: 0.4 },
      { id: 'x_sos', label: 'Επιπλέον σως', price: 0.2 },
    ],
  },
  pitaMustard: {
    baseIngredients: [
      { id: 'nt', label: 'Ντομάτα' },
      { id: 'kr', label: 'Κρεμμύδι' },
      { id: 'pat', label: 'Πατάτες μέσα' },
      { id: 'mst', label: 'Μουστάρδα' },
    ],
    extras: [
      { id: 'x_tyri', label: 'Επιπλέον τυρί', price: 0.5 },
      { id: 'x_pat', label: 'Επιπλέον πατάτες μέσα', price: 0.4 },
    ],
  },
  pitaKotobekon: {
    baseIngredients: [
      { id: 'nt', label: 'Ντομάτα' },
      { id: 'mp', label: 'Μπέικον' },
      { id: 'sos', label: 'Σως' },
    ],
    extras: [
      { id: 'x_tyri', label: 'Επιπλέον τυρί', price: 0.5 },
      { id: 'x_pat', label: 'Επιπλέον πατάτες μέσα', price: 0.4 },
    ],
  },
  patatopita: {
    baseIngredients: [
      { id: 'pat', label: 'Πατάτες' },
      { id: 'sos', label: 'Σως' },
    ],
    extras: [{ id: 'x_tyri', label: 'Επιπλέον τυρί', price: 0.5 }],
  },
  pitaLoukaniko: {
    baseIngredients: [
      { id: 'mst', label: 'Μουστάρδα' },
      { id: 'kt', label: 'Κέτσαπ' },
    ],
    extras: [{ id: 'x_kr', label: 'Κρεμμύδι τριμμένο', price: 0.2 }],
  },
  sexyPita: {
    baseIngredients: [
      { id: 'nt', label: 'Ντομάτα' },
      { id: 'kr', label: 'Κρεμμύδι' },
      { id: 'pat', label: 'Πατάτες μέσα' },
      { id: 'sos', label: 'Σπέσιαλ σως' },
    ],
    extras: [
      { id: 'x_tyri', label: 'Επιπλέον τυρί', price: 0.5 },
      { id: 'x_pat', label: 'Επιπλέον πατάτες', price: 0.5 },
    ],
  },
  burgerLoaded: {
    baseIngredients: [
      { id: 'mar', label: 'Μαρούλι' },
      { id: 'nt', label: 'Ντομάτα' },
      { id: 'tyr', label: 'Τυρί' },
      { id: 'mp', label: 'Μπέικον' },
      { id: 'kt', label: 'Κέτσαπ / σως' },
    ],
    extras: [
      { id: 'x_diplo', label: 'Διπλό τυρί', price: 0.6 },
      { id: 'x_mp', label: 'Επιπλέον μπέικον', price: 0.5 },
    ],
  },
  burgerClassic: {
    baseIngredients: [
      { id: 'mar', label: 'Μαρούλι' },
      { id: 'nt', label: 'Ντομάτα' },
      { id: 'kr', label: 'Κρεμμύδι' },
      { id: 'tyr', label: 'Τυρί' },
      { id: 'kt', label: 'Κέτσαπ / μουστάρδα' },
    ],
    extras: [{ id: 'x_tyri', label: 'Επιπλέον τυρί', price: 0.5 }],
  },
  hotDog: {
    baseIngredients: [
      { id: 'mst', label: 'Μουστάρδα' },
      { id: 'kt', label: 'Κέτσαπ' },
    ],
    extras: [{ id: 'x_kr', label: 'Κρεμμύδι', price: 0.2 }],
  },
  skepasti: {
    baseIngredients: [
      { id: 'pat', label: 'Πατάτες' },
      { id: 'sos', label: 'Σως' },
      { id: 'pita', label: 'Πίτα συνοδευτικό' },
    ],
    extras: [
      { id: 'x_tyri', label: 'Επιπλέον τυρί', price: 0.5 },
      { id: 'x_sos', label: 'Επιπλέον σως', price: 0.2 },
    ],
  },
  meridaGyros: {
    baseIngredients: [
      { id: 'pat', label: 'Πατάτες' },
      { id: 'pita', label: 'Πίτα' },
      { id: 'dip', label: 'Σως / τζατζίκι' },
    ],
    extras: [
      { id: 'x_pat', label: 'Επιπλέον πατάτες', price: 1.0 },
      { id: 'x_pita', label: 'Επιπλέον πίτα', price: 0.5 },
    ],
  },
  meridaGrill: {
    baseIngredients: [
      { id: 'pat', label: 'Πατάτες' },
      { id: 'pita', label: 'Πίτα' },
      { id: 'sos', label: 'Σως' },
    ],
    extras: [
      { id: 'x_pat', label: 'Επιπλέον πατάτες', price: 1.0 },
      { id: 'x_pita', label: 'Επιπλέον πίτα', price: 0.5 },
    ],
  },
  meridaFried: {
    baseIngredients: [
      { id: 'pat', label: 'Πατάτες' },
      { id: 'dip', label: 'Σως βουτύματος' },
    ],
    extras: [{ id: 'x_pat', label: 'Επιπλέον πατάτες', price: 1.0 }],
  },
  meridaPlate: {
    baseIngredients: [
      { id: 'pat', label: 'Πατάτες' },
      { id: 'pita', label: 'Πίτα' },
      { id: 'sos', label: 'Σως' },
    ],
    extras: [
      { id: 'x_pat', label: 'Επιπλέον πατάτες', price: 1.5 },
      { id: 'x_pita', label: 'Επιπλέον πίτα (2η μερίδα)', price: 0.8 },
    ],
  },
  saladExtras: {
    baseIngredients: [],
    extras: [
      { id: 'x_feta', label: 'Επιπλέον φέτα', price: 0.8 },
      { id: 'x_elies', label: 'Επιπλέον ελιές', price: 0.4 },
      { id: 'x_dress', label: 'Επιπλέον dressing', price: 0.3 },
    ],
  },
}

export function getPresetByKey(key) {
  if (!key || typeof key !== 'string') return null
  return INGREDIENT_PRESETS[key] || null
}

export function getIngredientOptionsForItem(item) {
  if (!item?.optionsPreset) return null
  const p = getPresetByKey(item.optionsPreset)
  if (!p) return null
  const bases = p.baseIngredients || []
  const extras = p.extras || []
  if (bases.length === 0 && extras.length === 0) return null
  return { baseIngredients: bases, extras }
}
