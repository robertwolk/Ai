'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  MapPin,
  Navigation,
  Clock,
  ExternalLink,
  Filter,
  Loader2,
  MapPinOff,
  Video,
  Calendar,
} from 'lucide-react'

interface Meeting {
  id: string
  name: string
  day: string
  dayNum: number
  time: string
  rawTime: string
  duration: string
  location: string
  address: string
  city: string
  state: string
  zip: string
  formats: string
  notes: string
  lat: number
  lng: number
  distance: string
  distanceNum: number
  isVirtual: boolean
  virtualLink: string
  virtualInfo: string
  locationInfo: string
}

interface MeetingResponse {
  meetings: Meeting[]
  location: string | null
  total?: number
  error?: string
}

const DAYS = [
  { label: 'All', value: '' },
  { label: 'Sun', value: '1' },
  { label: 'Mon', value: '2' },
  { label: 'Tue', value: '3' },
  { label: 'Wed', value: '4' },
  { label: 'Thu', value: '5' },
  { label: 'Fri', value: '6' },
  { label: 'Sat', value: '7' },
]

function getTodayDayValue(): string {
  // JS getDay: 0=Sun, 1=Mon... BMLT: 1=Sun, 2=Mon...
  return String(new Date().getDay() + 1)
}

export default function MeetingsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDay, setSelectedDay] = useState('')
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [locationName, setLocationName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)

  const fetchMeetings = useCallback(
    async (params: { q?: string; lat?: string; lng?: string; day?: string }) => {
      setLoading(true)
      setError('')
      setHasSearched(true)

      try {
        const sp = new URLSearchParams()
        if (params.q) sp.set('q', params.q)
        if (params.lat) sp.set('lat', params.lat)
        if (params.lng) sp.set('lng', params.lng)
        if (params.day) sp.set('day', params.day)

        const res = await fetch(`/api/meetings?${sp.toString()}`)
        const data: MeetingResponse = await res.json()

        if (data.error) {
          setError(data.error)
          setMeetings([])
        } else {
          setMeetings(data.meetings)
          setLocationName(data.location || '')
        }
      } catch {
        setError('Failed to search meetings. Please check your connection and try again.')
        setMeetings([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    fetchMeetings({ q: searchQuery.trim(), day: selectedDay })
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    setGeoLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false)
        const { latitude, longitude } = position.coords
        setSearchQuery('My Location')
        fetchMeetings({
          lat: latitude.toString(),
          lng: longitude.toString(),
          day: selectedDay,
        })
      },
      (err) => {
        setGeoLoading(false)
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location access denied. Please enter a location manually.')
        } else {
          setError('Could not determine your location. Please enter a location manually.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleDayChange = (dayValue: string) => {
    setSelectedDay(dayValue)
    // Re-search with new day if we already have results
    if (hasSearched && (searchQuery || locationName)) {
      fetchMeetings({ q: searchQuery.trim() || undefined, day: dayValue })
    }
  }

  const handleTodayFilter = () => {
    const today = getTodayDayValue()
    handleDayChange(selectedDay === today ? '' : today)
  }

  // Derive a short location label for display
  const shortLocation = locationName
    ? locationName.split(',').slice(0, 3).join(',')
    : searchQuery

  const todayValue = getTodayDayValue()

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Find a Meeting</h1>
        <p className="text-sm text-muted-foreground">
          Search for AA meetings near any location in the United States
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="City, state, or zip code..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="px-5 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>
      </form>

      {/* Use My Location Button */}
      <button
        onClick={handleUseLocation}
        disabled={geoLoading || loading}
        className="w-full mb-5 py-2.5 px-4 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-primary/30 hover:bg-secondary/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {geoLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <Navigation className="w-4 h-4 text-primary" />
        )}
        {geoLoading ? 'Finding your location...' : 'Use My Location'}
      </button>

      {/* Day Filters */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filter by Day</span>
          <button
            onClick={handleTodayFilter}
            className={`ml-auto chip text-xs ${selectedDay === todayValue ? 'chip-active' : 'chip-inactive'}`}
          >
            <Calendar className="w-3 h-3" />
            Today
          </button>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {DAYS.map((d) => (
            <button
              key={d.value}
              onClick={() => handleDayChange(d.value)}
              className={`chip text-xs ${selectedDay === d.value ? 'chip-active' : 'chip-inactive'}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location Indicator */}
      {hasSearched && locationName && !loading && (
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground animate-fade-in">
          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="truncate">
            Searching near <span className="font-medium text-foreground">{shortLocation}</span>
          </span>
          {meetings.length > 0 && (
            <span className="ml-auto text-xs flex-shrink-0 whitespace-nowrap">
              {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive animate-fade-in">
          {error}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-3 animate-fade-in">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="meeting-card animate-pulse">
              <div className="h-5 bg-muted rounded w-3/4 mb-3" />
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-4 bg-muted rounded w-2/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* Meeting Results */}
      {!loading && meetings.length > 0 && (
        <div className="space-y-3">
          {meetings.map((meeting, index) => (
            <MeetingCard key={`${meeting.id}-${index}`} meeting={meeting} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && hasSearched && meetings.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <MapPinOff className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No meetings found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Try searching a different location, expanding to all days, or searching a nearby city.
          </p>
        </div>
      )}

      {/* Initial State */}
      {!loading && !hasSearched && (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Find meetings near you</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Enter a city, state, or zip code above, or use your current location to find AA meetings
            nearby.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 mb-4 text-center">
        <p className="text-xs text-muted-foreground/60">
          Powered by meeting data from the recovery community
        </p>
      </div>
    </div>
  )
}

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(meeting.address)}`

  return (
    <div className="meeting-card animate-fade-in">
      {/* Header Row: Name + Distance */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base font-semibold text-foreground leading-tight">{meeting.name}</h3>
        {meeting.distance && (
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
            {meeting.distance}
          </span>
        )}
      </div>

      {/* Day & Time */}
      <div className="flex items-center gap-1.5 text-sm text-foreground mb-1.5">
        <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <span className="font-medium">
          {meeting.day} at {meeting.time}
        </span>
        {meeting.duration && (
          <span className="text-muted-foreground text-xs">({meeting.duration})</span>
        )}
      </div>

      {/* Location Name */}
      {meeting.location && (
        <p className="text-sm text-foreground/80 mb-0.5 ml-5">{meeting.location}</p>
      )}

      {/* Address */}
      {meeting.address && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-2 group"
        >
          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 group-hover:text-primary" />
          <span className="underline-offset-2 group-hover:underline">{meeting.address}</span>
        </a>
      )}

      {/* Location Info (e.g., "Basement entrance on Oak St") */}
      {meeting.locationInfo && (
        <p className="text-xs text-muted-foreground ml-5 mb-2 italic">{meeting.locationInfo}</p>
      )}

      {/* Formats / Tags */}
      {meeting.formats && (
        <div className="flex flex-wrap gap-1 mb-2 ml-5">
          {meeting.formats.split(',').map((fmt, i) => (
            <span
              key={i}
              className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
            >
              {fmt.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {meeting.notes && (
        <p className="text-xs text-muted-foreground ml-5 mb-2">{meeting.notes}</p>
      )}

      {/* Virtual Meeting Link */}
      {meeting.isVirtual && meeting.virtualLink && (
        <a
          href={meeting.virtualLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 bg-accent/10 text-accent text-sm font-medium rounded-lg hover:bg-accent/20 transition-colors"
        >
          <Video className="w-3.5 h-3.5" />
          Join Online
          <ExternalLink className="w-3 h-3" />
        </a>
      )}

      {/* Virtual Info */}
      {meeting.virtualInfo && (
        <p className="text-xs text-muted-foreground mt-1 ml-5">{meeting.virtualInfo}</p>
      )}
    </div>
  )
}
