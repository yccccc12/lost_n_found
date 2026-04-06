export type ItemEntry = {
  id: string
  name: string
  description: string
  location: string
  date: string
  imageUrl: string
}

export const lostItems: ItemEntry[] = [
  {
    id: 'l1',
    name: 'Blue Jansport Backpack',
    description: 'Medium navy backpack with a small tear near the zipper pull.',
    location: 'Student Union — 2nd floor lounge',
    date: '2026-03-28',
    imageUrl: 'https://picsum.photos/seed/lost1/400/280',
  },
  {
    id: 'l2',
    name: 'AirPods Pro Case',
    description: 'White case with a tiny scratch on the lid; no earbuds inside.',
    location: 'Science Building — Room 204',
    date: '2026-03-27',
    imageUrl: 'https://picsum.photos/seed/lost2/400/280',
  },
  {
    id: 'l3',
    name: 'Student ID Card',
    description: 'Campus ID ending in 4821; holder is black silicone.',
    location: 'Library — Ground floor café',
    date: '2026-03-26',
    imageUrl: 'https://picsum.photos/seed/lost3/400/280',
  },
  {
    id: 'l4',
    name: 'Graphing Calculator (TI-84)',
    description: 'Name written faintly on the back in pencil.',
    location: 'Engineering Lab — Bench 3',
    date: '2026-03-25',
    imageUrl: 'https://picsum.photos/seed/lost4/400/280',
  },
  {
    id: 'l5',
    name: 'Metal Water Bottle',
    description: 'Matte black 32oz bottle with a small dent on the bottom.',
    location: 'Athletic Center — Track bleachers',
    date: '2026-03-24',
    imageUrl: 'https://picsum.photos/seed/lost5/400/280',
  },
  {
    id: 'l6',
    name: 'Prescription Glasses',
    description: 'Round tortoiseshell frames in a soft gray pouch.',
    location: 'Humanities Hall — Lecture Hall B',
    date: '2026-03-22',
    imageUrl: 'https://picsum.photos/seed/lost6/400/280',
  },
]

export const foundItems: ItemEntry[] = [
  {
    id: 'f1',
    name: 'Umbrella (Black)',
    description: 'Compact automatic umbrella; works fine, slightly wet when found.',
    location: 'Bus stop — Main Gate',
    date: '2026-03-29',
    imageUrl: 'https://picsum.photos/seed/found1/400/280',
  },
  {
    id: 'f2',
    name: 'Hoodie (Gray, size M)',
    description: 'University logo on chest; turned in at front desk.',
    location: 'Recreation Center — Front desk',
    date: '2026-03-28',
    imageUrl: 'https://picsum.photos/seed/found2/400/280',
  },
  {
    id: 'f3',
    name: 'MacBook Pro (14")',
    description: 'Space gray laptop in a navy sleeve — turned in after closing.',
    location: 'Main Library — 3rd Floor North Wing',
    date: '2026-10-24',
    imageUrl: 'https://picsum.photos/seed/found-mac-main/800/600',
  },
  {
    id: 'f4',
    name: 'Red Lanyard + Keys',
    description: 'Three keys and a small bottle opener on the ring.',
    location: 'Parking Lot C — Near bike racks',
    date: '2026-03-26',
    imageUrl: 'https://picsum.photos/seed/found4/400/280',
  },
  {
    id: 'f5',
    name: 'Notebook (Spiral)',
    description: 'Green cover, grid paper, first few pages filled with chem notes.',
    location: 'Chemistry Building — Lab coat room',
    date: '2026-03-25',
    imageUrl: 'https://picsum.photos/seed/found5/400/280',
  },
  {
    id: 'f6',
    name: 'Wireless Mouse',
    description: 'Black ergonomic mouse; USB dongle taped to the underside.',
    location: 'Computer Lab — CL-101',
    date: '2026-03-23',
    imageUrl: 'https://picsum.photos/seed/found6/400/280',
  },
  {
    id: 'f7',
    name: 'Scarf (Striped)',
    description: 'Wool blend, blue and gray stripes, folded on a bench.',
    location: 'Quad — Central benches',
    date: '2026-03-21',
    imageUrl: 'https://picsum.photos/seed/found7/400/280',
  },
]

/** Full detail for `/found/[id]` — mock only */
export type FoundItemDetail = ItemEntry & {
  breadcrumb: string[]
  building: string
  area: string
  timeLabel: string
  longDescription: string
  gallery: string[]
  extraImageCount?: number
  verificationIntro: string
  verificationBullets: string[]
  recoveryLocation: string
}

const foundItemDetails: Record<
  string,
  Omit<
    FoundItemDetail,
    keyof ItemEntry | 'id'
  >
> = {
  f1: {
    breadcrumb: ['Essentials', 'Weather', 'Umbrella (Black)'],
    building: 'Main Gate kiosk',
    area: 'Covered waiting area',
    timeLabel: 'Found at 8:10 AM',
    longDescription:
      'Automatic compact umbrella, black canopy with a small scuff on one rib. Dry when logged; left on bench during rain.',
    gallery: [
      'https://picsum.photos/seed/found1/800/600',
      'https://picsum.photos/seed/found1b/400/300',
      'https://picsum.photos/seed/found1c/400/300',
    ],
    extraImageCount: 1,
    verificationIntro:
      'To protect everyone on campus, we verify the owner before releasing high-traffic items.',
    verificationBullets: [
      'Valid student or staff ID required at pickup.',
      'Describe the button style or any unique wear on the handle.',
    ],
    recoveryLocation:
      'Held at the Central Campus Lost & Found Hub (Student Union basement). Bring ID; desk hours Mon–Fri 9am–5pm.',
  },
  f2: {
    breadcrumb: ['Clothing', 'Hoodies', 'Gray Hoodie'],
    building: 'Recreation Center',
    area: 'Front desk secure storage',
    timeLabel: 'Found at 6:45 PM',
    longDescription:
      'Gray pullover with university logo on chest, size M. Laundered lightly; no name tag inside.',
    gallery: [
      'https://picsum.photos/seed/found2/800/600',
      'https://picsum.photos/seed/found2b/400/300',
    ],
    verificationIntro: 'Clothing claims require a quick identity check.',
    verificationBullets: [
      'Show your campus ID.',
      'Confirm the size and logo placement.',
    ],
    recoveryLocation:
      'Pickup at Recreation Center front desk during staffed hours. After hours, items move to the Central Hub next business day.',
  },
  f3: {
    breadcrumb: ['Electronics', 'Laptops', 'MacBook Pro'],
    building: 'Main Library',
    area: '3rd Floor North Wing',
    timeLabel: 'Found at 4:30 PM',
    longDescription:
      '14" Space Gray MacBook Pro in a navy padded sleeve. Minor wear on two corners; screen and keyboard appear undamaged. Serial verification will be performed at pickup. Charger was not turned in with the device.',
    gallery: [
      'https://picsum.photos/seed/found-mac-main/800/600',
      'https://picsum.photos/seed/found-mac-b/800/600',
      'https://picsum.photos/seed/found-mac-c/800/600',
      'https://picsum.photos/seed/found-mac-d/800/600',
    ],
    extraImageCount: 2,
    verificationIntro:
      'High-value electronics use an enhanced verification process so devices return to the correct owner.',
    verificationBullets: [
      'Valid student or staff ID required.',
      'You must describe unique identifiers (stickers, engravings, wallpaper, or file names we can confirm).',
      'Serial number match may be required — have your proof of purchase or Apple ID device list ready.',
    ],
    recoveryLocation:
      'This item is held at the Central Campus Lost & Found Hub, Student Union Room B12. Ask for the electronics vault; staff will verify identity before release. Hours: Monday–Friday 9:00 AM–5:00 PM. Bring a charged phone or secondary ID if possible.',
  },
  f4: {
    breadcrumb: ['Essentials', 'Keys', 'Red Lanyard'],
    building: 'Parking Lot C',
    area: 'Bike rack zone',
    timeLabel: 'Found at 11:20 AM',
    longDescription:
      'Three keys on a red woven lanyard with a small bottle opener. No ID card attached.',
    gallery: [
      'https://picsum.photos/seed/found4/800/600',
      'https://picsum.photos/seed/found4b/400/300',
    ],
    verificationIntro: 'Key bundles require proof you can describe the set accurately.',
    verificationBullets: [
      'Describe the number of keys and any charms.',
      'Campus ID required at pickup.',
    ],
    recoveryLocation:
      'Central Campus Lost & Found Hub during business hours. Same-day hold; unclaimed items follow campus policy after 30 days.',
  },
  f5: {
    breadcrumb: ['Books', 'Sciences', 'Chemistry Notebook'],
    building: 'Chemistry Building',
    area: 'Lab coat room cubby',
    timeLabel: 'Found at 2:00 PM',
    longDescription:
      'Spiral notebook, green cover, grid paper. First pages contain organic chemistry lecture notes in blue ink.',
    gallery: [
      'https://picsum.photos/seed/found5/800/600',
    ],
    verificationIntro: 'We may ask you to identify a detail from the notes without seeing the book.',
    verificationBullets: [
      'Valid ID required.',
      'Be ready to name a heading or diagram from your own notes.',
    ],
    recoveryLocation:
      'Chemistry department office (Room 118) for pickup Tue/Thu 10am–2pm, or Central Hub any weekday.',
  },
  f6: {
    breadcrumb: ['Electronics', 'Accessories', 'Wireless Mouse'],
    building: 'Computer Lab CL-101',
    area: 'Bench nearest window',
    timeLabel: 'Found at 5:15 PM',
    longDescription:
      'Black ergonomic wireless mouse; USB receiver taped to the underside with clear tape.',
    gallery: [
      'https://picsum.photos/seed/found6/800/600',
      'https://picsum.photos/seed/found6b/400/300',
    ],
    verificationIntro: 'Describe the tape placement or receiver serial if visible to you.',
    verificationBullets: ['Campus ID required.', 'Brand and approximate purchase window helpful.'],
    recoveryLocation:
      'Central Campus Lost & Found Hub. Short hold; claim within posted window.',
  },
  f7: {
    breadcrumb: ['Clothing', 'Accessories', 'Striped Scarf'],
    building: 'Quad',
    area: 'Central benches',
    timeLabel: 'Found at 3:40 PM',
    longDescription:
      'Wool-blend scarf, blue and gray stripes, folded neatly. Slight pilling on one edge.',
    gallery: [
      'https://picsum.photos/seed/found7/800/600',
    ],
    verificationIntro: 'Soft items are released after identity check.',
    verificationBullets: ['Valid ID.', 'Describe fold pattern or any stain you remember.'],
    recoveryLocation:
      'Central Campus Lost & Found Hub, Student Union basement, Mon–Fri 9am–5pm.',
  },
}

export function getFoundItemDetail(id: string): FoundItemDetail | null {
  const base = foundItems.find((i) => i.id === id)
  if (!base) return null
  const extra = foundItemDetails[id]
  if (!extra) return null
  return { ...base, ...extra, id: base.id }
}
