/** University of Nottingham Malaysia — Jalan Broga, Semenyih (approximate campus centre). */
export const UNM_MALAYSIA_CENTER = {
  lat: 2.945,
  lng: 101.874,
  zoom: 16,
  name: 'University of Nottingham Malaysia',
  address: 'Jalan Broga, 43500 Semenyih, Selangor, Malaysia',
} as const

/** Illustrative points of interest — coordinates are approximate for demo UI only. */
export type CampusPin = {
  id: string
  title: string
  description: string
  lat: number
  lng: number
}

export const CAMPUS_PINS: CampusPin[] = [
  {
    id: 'hub',
    title: 'Campus centre',
    description: 'Orientation reference — main arrival area.',
    lat: 2.945,
    lng: 101.874,
  },
  {
    id: 'library',
    title: 'Library & study',
    description: 'Typical lost-and-found drop-off for study gear.',
    lat: 2.9461,
    lng: 101.8732,
  },
  {
    id: 'sports',
    title: 'Sports & recreation',
    description: 'Gym and courts — water bottles and kit common.',
    lat: 2.9436,
    lng: 101.8754,
  },
  {
    id: 'halls',
    title: 'Residential halls',
    description: 'Keys and cards often reported here.',
    lat: 2.9464,
    lng: 101.8756,
  },
  {
    id: 'security',
    title: 'Security / reception',
    description: 'Central lost property handover (demo label).',
    lat: 2.9442,
    lng: 101.8725,
  },
]
