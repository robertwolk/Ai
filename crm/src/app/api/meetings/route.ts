import { NextRequest, NextResponse } from 'next/server'

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
}

interface BMTLMeeting {
  id_bigint: string
  meeting_name: string
  weekday_tinyint: string
  start_time: string
  duration_time: string
  location_text: string
  location_street: string
  location_city_subsection: string
  location_municipality: string
  location_province: string
  location_postal_code_1: string
  location_info: string
  formats: string
  comments: string
  latitude: string
  longitude: string
  distance_in_km: string
  virtual_meeting_link: string
  virtual_meeting_additional_info: string
}

const WEEKDAYS = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const day = searchParams.get('day') // 1-7 for Sun-Sat, empty for all

  try {
    let latitude = lat
    let longitude = lng
    let locationName = ''

    // Geocode if query provided instead of lat/lng
    if (query && (!lat || !lng)) {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&limit=1&q=${encodeURIComponent(query)}`,
        { headers: { 'User-Agent': 'RecoverTogether/1.0' } }
      )
      const geoData: NominatimResult[] = await geoRes.json()

      if (!geoData || geoData.length === 0) {
        return NextResponse.json({
          meetings: [],
          location: null,
          error: 'Location not found. Try a different city, state, or zip code.',
        })
      }

      latitude = geoData[0].lat
      longitude = geoData[0].lon
      locationName = geoData[0].display_name
    }

    if (!latitude || !longitude) {
      return NextResponse.json({
        meetings: [],
        location: null,
        error: 'Please enter a location to search.',
      })
    }

    // Query BMLT for meetings
    let bmltUrl = `https://bmlt.app/main_server/client_interface/json/?switcher=GetSearchResults&geo_width_km=40&lat_val=${latitude}&long_val=${longitude}&sort_keys=distance_in_km`

    if (day) {
      bmltUrl += `&weekdays[]=${day}`
    }

    const meetingRes = await fetch(bmltUrl, {
      headers: { 'User-Agent': 'RecoverTogether/1.0' },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    let meetings: BMTLMeeting[] = []

    if (meetingRes.ok) {
      const data = await meetingRes.json()
      if (Array.isArray(data)) {
        meetings = data
      }
    }

    // Also try a secondary BMLT root server for better coverage
    try {
      const bmltUrl2 = `https://latest.aws.bmlt.app/main_server/client_interface/json/?switcher=GetSearchResults&geo_width_km=40&lat_val=${latitude}&long_val=${longitude}&sort_keys=distance_in_km${day ? `&weekdays[]=${day}` : ''}`
      const meetingRes2 = await fetch(bmltUrl2, {
        headers: { 'User-Agent': 'RecoverTogether/1.0' },
        signal: AbortSignal.timeout(5000),
      })
      if (meetingRes2.ok) {
        const data2 = await meetingRes2.json()
        if (Array.isArray(data2)) {
          // Merge and deduplicate by name + time
          const existingKeys = new Set(
            meetings.map((m) => `${m.meeting_name}-${m.start_time}-${m.weekday_tinyint}`)
          )
          for (const m of data2) {
            const key = `${m.meeting_name}-${m.start_time}-${m.weekday_tinyint}`
            if (!existingKeys.has(key)) {
              meetings.push(m)
              existingKeys.add(key)
            }
          }
        }
      }
    } catch {
      /* secondary source failed, that's ok */
    }

    // Format meetings for the frontend
    const formatted = meetings.slice(0, 50).map((m) => ({
      id: m.id_bigint,
      name: m.meeting_name || 'AA Meeting',
      day: WEEKDAYS[parseInt(m.weekday_tinyint)] || '',
      dayNum: parseInt(m.weekday_tinyint),
      time: formatTime(m.start_time),
      rawTime: m.start_time,
      duration: m.duration_time,
      location: m.location_text || '',
      address: [
        m.location_street,
        m.location_municipality,
        m.location_province,
        m.location_postal_code_1,
      ]
        .filter(Boolean)
        .join(', '),
      city: m.location_municipality || '',
      state: m.location_province || '',
      zip: m.location_postal_code_1 || '',
      formats: m.formats || '',
      notes: m.comments || '',
      lat: parseFloat(m.latitude),
      lng: parseFloat(m.longitude),
      distance: m.distance_in_km
        ? `${(parseFloat(m.distance_in_km) * 0.621371).toFixed(1)} mi`
        : '',
      distanceNum: m.distance_in_km ? parseFloat(m.distance_in_km) * 0.621371 : 999,
      isVirtual: !!m.virtual_meeting_link,
      virtualLink: m.virtual_meeting_link || '',
      virtualInfo: m.virtual_meeting_additional_info || '',
      locationInfo: m.location_info || '',
    }))

    // Sort by distance
    formatted.sort((a, b) => a.distanceNum - b.distanceNum)

    return NextResponse.json({
      meetings: formatted,
      location: locationName || `${latitude}, ${longitude}`,
      total: meetings.length,
    })
  } catch (error) {
    console.error('Meeting search error:', error)
    return NextResponse.json({
      meetings: [],
      location: null,
      error: 'Failed to search meetings. Please try again.',
    })
  }
}

function formatTime(time: string): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  return `${h}:${minutes.toString().padStart(2, '0')} ${period}`
}
