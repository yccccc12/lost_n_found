'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'
import { CAMPUS_PINS, UNM_MALAYSIA_CENTER, type CampusPin } from '@/lib/campus-map-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

function pinIcon(label: string) {
  return L.divIcon({
    className: 'border-0 bg-transparent',
    html: `<div style="width:36px;height:36px;background:#fb923c;border:2px solid #000;border-radius:10px;box-shadow:4px 4px 0 #000;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:11px;color:#000;font-family:system-ui,sans-serif">${label}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34],
  })
}

export function CampusMapView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    const el = containerRef.current
    if (!el || mapRef.current) return

    const map = L.map(el, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([UNM_MALAYSIA_CENTER.lat, UNM_MALAYSIA_CENTER.lng], UNM_MALAYSIA_CENTER.zoom)

    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    CAMPUS_PINS.forEach((pin, i) => {
      const m = L.marker([pin.lat, pin.lng], {
        icon: pinIcon(String(i + 1)),
      })
        .addTo(map)
        .bindPopup(
          `<strong style="font-family:system-ui">${pin.title}</strong><br/><span style="font-size:12px;color:#444">${pin.description}</span>`,
        )
      markersRef.current.push(m)
    })

    map.whenReady(() => {
      requestAnimationFrame(() => map.invalidateSize())
    })

    return () => {
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [])

  function flyTo(pin: CampusPin) {
    mapRef.current?.flyTo([pin.lat, pin.lng], 17, { duration: 0.8 })
    const idx = CAMPUS_PINS.findIndex((p) => p.id === pin.id)
    if (idx >= 0) markersRef.current[idx]?.openPopup()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-4 border-black bg-orange-500 p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-900/80">Map</p>
        <h2 className="mt-1 font-black tracking-tight text-slate-950 text-2xl sm:text-3xl">
          {UNM_MALAYSIA_CENTER.name}
        </h2>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-900/90">
          {UNM_MALAYSIA_CENTER.address}. Pins are illustrative — use them as a template for real desk
          locations and recovery zones.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(100%,380px)] lg:items-start">
        <div className="space-y-2">
          <div
            ref={containerRef}
            className="relative z-0 h-[min(58vh,520px)] w-full overflow-hidden rounded-2xl border-4 border-black bg-muted shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          />
          <p className="text-xs font-medium text-muted-foreground">
            Map data © OpenStreetMap contributors. Not an official UNM map.
          </p>
        </div>

        <aside className="flex flex-col gap-3">
          <p className="text-xs font-black uppercase tracking-wide text-slate-600">Jump to a zone</p>
          <ul className="flex flex-col gap-2">
            {CAMPUS_PINS.map((pin) => (
              <li key={pin.id}>
                <button
                  type="button"
                  onClick={() => flyTo(pin)}
                  className={cn(
                    'flex w-full flex-col items-start gap-0.5 rounded-2xl border-2 border-black bg-white p-4 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition hover:-translate-y-0.5 hover:bg-orange-50/80',
                  )}
                >
                  <span className="flex items-center gap-2 font-black text-slate-900">
                    <MapPin className="h-4 w-4 shrink-0 text-orange-600" aria-hidden />
                    {pin.title}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{pin.description}</span>
                </button>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-2 border-black bg-white/90 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            onClick={() =>
              mapRef.current?.flyTo(
                [UNM_MALAYSIA_CENTER.lat, UNM_MALAYSIA_CENTER.lng],
                UNM_MALAYSIA_CENTER.zoom,
                { duration: 0.8 },
              )
            }
          >
            Reset view
          </Button>
        </aside>
      </div>
    </div>
  )
}
