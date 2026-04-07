'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ImagePlus, Loader2, Mic, Sparkles, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const inputBrutal =
  'rounded-xl border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2'

const MAX_FILES = 6
const MAX_MB = 8

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

export function ReportItemForm() {
  const formId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const speechRef = useRef<SpeechRecognition | null>(null)

  const [reportType, setReportType] = useState<'lost' | 'found'>('lost')
  const [category, setCategory] = useState('essentials')
  const [itemName, setItemName] = useState('')
  const [when, setWhen] = useState('')
  const [where, setWhere] = useState('')
  const [details, setDetails] = useState('')
  const [email, setEmail] = useState('')

  const [lazyText, setLazyText] = useState('')
  const [speechListening, setSpeechListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [createdItemId, setCreatedItemId] = useState<string | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    setSpeechSupported(!!getSpeechRecognitionCtor())
  }, [])

  useEffect(() => {
    return () => {
      try {
        speechRef.current?.stop()
      } catch {
        /* ignore */
      }
    }
  }, [])

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  function addFiles(incoming: FileList | null) {
    if (!incoming?.length) return
    const next: File[] = [...files]
    for (const file of Array.from(incoming)) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > MAX_MB * 1024 * 1024) continue
      if (next.length >= MAX_FILES) break
      next.push(file)
    }
    setFiles(next)
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)
    setSubmitLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', itemName.trim())
      fd.append('category', category)
      fd.append('description', details.trim())
      fd.append('location', where.trim())
      if (when) fd.append('event_date', when)
      if (email.trim()) fd.append('contact_email', email.trim())
      fd.append('status', reportType)
      for (const file of files) {
        fd.append('files', file)
      }

      const res = await fetch('/api/items/create', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setSubmitError(typeof data?.error === 'string' ? data.error : 'Could not submit your report.')
        return
      }

      setCreatedItemId(typeof data?.item_id === 'string' ? data.item_id : null)
      setSubmitted(true)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  function resetAfterSubmit() {
    setSubmitted(false)
    setCreatedItemId(null)
    setSubmitError(null)
    setReportType('lost')
    setCategory('essentials')
    setItemName('')
    setWhen('')
    setWhere('')
    setDetails('')
    setEmail('')
    setLazyText('')
    setAiError(null)
    setFiles([])
  }

  function toggleSpeech() {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return

    if (speechListening) {
      try {
        speechRef.current?.stop()
      } catch {
        /* ignore */
      }
      setSpeechListening(false)
      return
    }

    const rec = new Ctor()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US'

    rec.onresult = (event) => {
      let chunk = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          chunk += event.results[i][0].transcript
        }
      }
      if (chunk.trim()) {
        setLazyText((prev) => (prev ? `${prev.trim()} ${chunk.trim()}` : chunk.trim()))
      }
    }

    rec.onerror = () => setSpeechListening(false)
    rec.onend = () => {
      speechRef.current = null
      setSpeechListening(false)
    }

    speechRef.current = rec
    try {
      rec.start()
      setSpeechListening(true)
    } catch {
      setSpeechListening(false)
    }
  }

  async function applyLazyFillFromBackend() {
    const text = lazyText.trim()
    if (!text) return

    setAiError(null)
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/parse-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setAiError(typeof data?.error === 'string' ? data.error : 'AI fill failed')
        return
      }

      const f = data?.fields as Record<string, string | null | undefined> | undefined
      if (!f || typeof f !== 'object') {
        setAiError('Unexpected response from AI')
        return
      }

      if (f.report_type === 'lost' || f.report_type === 'found') setReportType(f.report_type)
      if (f.category) setCategory(f.category)
      if (f.item_name) setItemName(f.item_name)
      if (f.location) setWhere(f.location)
      if (f.event_date) setWhen(f.event_date)
      if (f.details) setDetails(f.details)
      if (f.email) setEmail(f.email)
    } catch {
      setAiError('Could not reach the AI service.')
    } finally {
      setAiLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card className="border-4 border-black rounded-2xl bg-orange-50/90 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="font-black text-xl sm:text-2xl">Report submitted</CardTitle>
          <CardDescription className="text-base font-medium text-foreground/80">
            Thanks — we&apos;ve received your report{createdItemId ? ` (reference: ${createdItemId})` : ''}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            onClick={resetAfterSubmit}
          >
            Submit another report
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-8">
      <section
        className="space-y-4 rounded-2xl border-2 border-black bg-amber-50/40 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:p-5"
        aria-label="Quick fill from natural language"
      >
        <div className="flex flex-wrap items-start gap-2">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">Quick fill</h2>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
              Tell us what happened in your own words, then tap <span className="font-semibold text-foreground">Fill with AI</span>{' '}
              and we&apos;ll suggest answers in the form below. Prefer to talk? Use the mic to speak instead of typing when your
              device offers it.
            </p>
          </div>
        </div>

        <div className="relative">
          <Textarea
            id={`${formId}-lazy`}
            value={lazyText}
            onChange={(e) => setLazyText(e.target.value)}
            placeholder='Example: "I lost my black wallet yesterday near the main library third floor. It has a small red tag. Reach me at alex@university.edu."'
            rows={4}
            className={cn(inputBrutal, 'min-h-[120px] resize-y pr-14')}
            aria-label="Natural language description for quick fill"
          />
          <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                'h-10 w-10 rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
                speechListening && 'border-red-600 bg-red-50 animate-pulse',
              )}
              onClick={toggleSpeech}
              disabled={!speechSupported}
              title={
                speechSupported
                  ? speechListening
                    ? 'Stop recording'
                    : 'Speak to fill (speech to text)'
                  : 'Speech recognition not supported in this browser'
              }
              aria-pressed={speechListening}
            >
              <Mic className="h-4 w-4" aria-hidden />
              <span className="sr-only">
                {speechListening ? 'Stop speech input' : 'Start speech input'}
              </span>
            </Button>
            {!speechSupported ? (
              <span className="max-w-[10rem] text-right text-[10px] font-medium text-muted-foreground">
                Mic needs a supported browser
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="gap-2 rounded-xl border-2 border-black bg-white font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-60"
            onClick={applyLazyFillFromBackend}
            disabled={!lazyText.trim() || aiLoading}
          >
            {aiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden />
            )}
            Fill with AI
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="font-semibold text-muted-foreground hover:text-foreground"
            onClick={() => {
              setLazyText('')
              setAiError(null)
            }}
            disabled={aiLoading}
          >
            Clear
          </Button>
        </div>
        {aiError ? (
          <p className="text-sm font-medium text-destructive" role="alert">
            {aiError}
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">1. Report type</h2>
        <RadioGroup
          value={reportType}
          onValueChange={(v) => setReportType(v as 'lost' | 'found')}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <label
            htmlFor={`${formId}-lost`}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-xl border-2 border-black bg-white p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-orange-50/50',
              reportType === 'lost' && 'bg-orange-100/80',
            )}
          >
            <RadioGroupItem value="lost" id={`${formId}-lost`} className="border-2 border-black" />
            <span className="font-bold">I lost something</span>
          </label>
          <label
            htmlFor={`${formId}-found`}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-xl border-2 border-black bg-white p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-sky-50/50',
              reportType === 'found' && 'bg-sky-100/80',
            )}
          >
            <RadioGroupItem value="found" id={`${formId}-found`} className="border-2 border-black" />
            <span className="font-bold">I found something</span>
          </label>
        </RadioGroup>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">2. Item details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`${formId}-name`} className="font-bold">
              Item name <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${formId}-name`}
              name="name"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Black wallet, student ID card"
              className={inputBrutal}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className={cn(inputBrutal, 'h-11')}>
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent className="border-2 border-black">
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="essentials">Essentials &amp; keys</SelectItem>
                <SelectItem value="books">Books &amp; supplies</SelectItem>
                <SelectItem value="clothing">Clothing &amp; accessories</SelectItem>
                <SelectItem value="id">ID &amp; cards</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-when`} className="font-bold">
              Approx. date (optional)
            </Label>
            <Input
              id={`${formId}-when`}
              name="when"
              type="date"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className={cn(inputBrutal, 'h-11')}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">3. Location</h2>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-where`} className="font-bold">
            Building or area <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${formId}-where`}
            name="where"
            required
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="e.g. Main Library, 3rd floor east"
            className={inputBrutal}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">4. Description</h2>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-details`} className="font-bold">
            Details <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id={`${formId}-details`}
            name="details"
            required
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Color, brand, stickers, serial hints — anything that helps identify the item…"
            className={cn(inputBrutal, 'min-h-[140px] resize-y')}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">
          5. Photos <span className="font-semibold normal-case text-muted-foreground">(optional)</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Add photos if you have them — they help others recognize the item, but you can submit without images. Up to{' '}
          {MAX_FILES} images, {MAX_MB}MB each. JPG, PNG, WebP, or GIF.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            className="gap-2 rounded-xl border-2 border-black bg-white font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            onClick={() => fileInputRef.current?.click()}
            disabled={files.length >= MAX_FILES}
          >
            <ImagePlus className="h-4 w-4" aria-hidden />
            Add photos
          </Button>
          <span className="self-center text-xs font-medium text-muted-foreground">
            {files.length}/{MAX_FILES} files
          </span>
        </div>
        {previews.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {previews.map((src, i) => (
              <li
                key={`${src}-${i}`}
                className="group relative overflow-hidden rounded-xl border-2 border-black bg-muted shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-red-50"
                  aria-label={`Remove photo ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              addFiles(e.dataTransfer.files)
            }}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-black/40 bg-white/50 py-12 text-center text-sm font-medium text-muted-foreground transition hover:border-black hover:bg-orange-50/40"
          >
            <ImagePlus className="h-8 w-8 text-foreground/60" aria-hidden />
            Drop images here or tap to browse (optional)
          </button>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">6. Contact (optional)</h2>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-email`} className="font-bold">
            Campus email
          </Label>
          <Input
            id={`${formId}-email`}
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            autoComplete="email"
            className={inputBrutal}
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 border-t-2 border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          By submitting, you agree your report may be used to help match lost and found items on campus.
        </p>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          {submitError ? (
            <p className="text-sm font-medium text-destructive sm:text-right" role="alert">
              {submitError}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={submitLoading}
            className="h-12 gap-2 rounded-xl border-2 border-black bg-slate-900 px-8 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-900 sm:min-w-[200px] disabled:opacity-60"
          >
            {submitLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Submitting…
              </>
            ) : (
              'Submit report'
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
