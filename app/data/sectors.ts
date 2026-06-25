// Shape of a branch sector as consumed by the Find-a-Rep UI.
// The sectors themselves — name, description and panel order — live in the
// `reps` content collection (content/reps/sectors/*.yml) so editors maintain
// them in Nuxt Studio; the page derives the ordered list from there.
export interface Sector {
  slug: string
  name: string
  description?: string
}
