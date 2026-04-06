import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing-page'

export const metadata: Metadata = {
  title: 'Campus Lost & Found',
  description:
    'The official university portal for tracking and reporting found belongings. Verified, secure, and student-first.',
}

export default function Home() {
  return <LandingPage />
}
