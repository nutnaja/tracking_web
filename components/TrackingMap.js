'use client'

import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  CircularProgress, 
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Autocomplete,
  TextField,
  Button,
  Chip , 
  Breadcrumbs , 
  Link 
} from '@mui/material'
import { useEffect, useState, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useRouter } from 'next/navigation'
import Supercluster from 'supercluster'

export default function TrackingMap() {
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [totalFeatures, setTotalFeatures] = useState(0)
  const [displayLimit, setDisplayLimit] = useState(1000)
  const [availableLocations, setAvailableLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [clusterInstance, setClusterInstance] = useState(null)
  const router = useRouter()

  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef({
    markers: [],
    clusters: []
  })

  const [lng] = useState(100.5167)
  const [lat] = useState(13.7567)
  const [zoom] = useState(5)

  const handleLimitChange = (event, newLimit) => {
    if (newLimit !== null) {
      setDisplayLimit(newLimit)
    }
  }

  const navigateToShop = (id) => {
    console.log(`กำลังนำทางไปยัง /shop/${id}`)
    router.push(`/shop/${id}`)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const baseUrl = "https://v2k-dev.vallarismaps.com/core/api/features/1.1/collections/658cd4f88a4811f10a47cea7/items"
        const apiKey = "bLNytlxTHZINWGt1GIRQBUaIlqz9X45XykLD83UkzIoN6PFgqbH7M7EDbsdgKVwC"

        const initialResponse = await fetch(`${baseUrl}?api_key=${apiKey}&limit=10`)
        if (!initialResponse.ok) throw new Error(`API returned status: ${initialResponse.status}`)

        const initialData = await initialResponse.json()
        const totalMatched = initialData.numberMatched || 0
        setTotalFeatures(totalMatched)

        const fetchLimit = displayLimit === 'all' ? totalMatched : displayLimit
        let allFeatures = initialData.features || []
        let offset = allFeatures.length
        const limit = 1000

        setProgress(Math.round((allFeatures.length / fetchLimit) * 100))

        while (allFeatures.length < fetchLimit) {
          const response = await fetch(`${baseUrl}?api_key=${apiKey}&limit=${limit}&offset=${offset}`)
          if (!response.ok) throw new Error(`Error fetching data: ${response.status}`)

          const data = await response.json()
          const newFeatures = data.features || []

          if (newFeatures.length === 0) break

          allFeatures = allFeatures.concat(newFeatures)
          offset += newFeatures.length

          if (displayLimit !== 'all' && allFeatures.length >= displayLimit) {
            allFeatures = allFeatures.slice(0, fetchLimit)
            break
          }

          setProgress(Math.round((allFeatures.length / fetchLimit) * 100))
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        const geoJSONFeatures = allFeatures.map(feature => {
          if (!feature.geometry || !feature.geometry.coordinates) {
            return null
          }

          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: feature.geometry.coordinates
            },
            properties: {
              ...feature.properties,
              id: feature.id
            }
          }
        }).filter(f => f !== null)

        setFeatures(geoJSONFeatures)

        const cluster = new Supercluster({
          radius: 40,
          maxZoom: 16
        })
        cluster.load(geoJSONFeatures)
        setClusterInstance(cluster)

        const locations = [...new Set(geoJSONFeatures
          .map(f => f.properties?.ct_tn)
          .filter(location => location !== null && location !== undefined))]

        setAvailableLocations(locations)
      } catch (error) {
        console.error(error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [displayLimit])

  useEffect(() => {
    if (map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [lng, lat],
      zoom
    })

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.current.on('moveend', () => updateClusters())
    map.current.on('zoomend', () => updateClusters())

    return () => map.current?.remove()
  }, [lng, lat, zoom])

  const updateClusters = () => {
    if (!map.current || !clusterInstance) return

    markersRef.current.markers.forEach(marker => marker.remove())
    markersRef.current.clusters.forEach(marker => marker.remove())
    markersRef.current.markers = []
    markersRef.current.clusters = []

    const bounds = map.current.getBounds()
    const zoom = Math.floor(map.current.getZoom())

    const clusters = clusterInstance.getClusters([
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ], zoom)

    clusters.forEach(cluster => {
      if (cluster.properties.cluster) {
        const pointCount = cluster.properties.point_count

        const el = document.createElement('div')
        el.className = 'cluster-marker'
        el.style.width = `${Math.min(pointCount * 3 + 25, 60)}px`
        el.style.height = `${Math.min(pointCount * 3 + 25, 60)}px`
        el.style.borderRadius = '50%'
        el.style.backgroundColor = '#ff6b6b'
        el.style.color = 'white'
        el.style.textAlign = 'center'
        el.style.lineHeight = `${Math.min(pointCount * 3 + 25, 60)}px`
        el.style.fontWeight = 'bold'
        el.style.border = '2px solid white'
        el.style.cursor = 'pointer'
        el.innerHTML = pointCount

        el.addEventListener('click', () => {
          const expansionZoom = Math.min(
            clusterInstance.getClusterExpansionZoom(cluster.properties.cluster_id),
            20
          )
          map.current.flyTo({
            center: cluster.geometry.coordinates,
            zoom: expansionZoom,
            speed: 1
          })
        })

        const marker = new maplibregl.Marker(el)
          .setLngLat(cluster.geometry.coordinates)
          .addTo(map.current)

        markersRef.current.clusters.push(marker)
      } else {
        const el = document.createElement('div')
        el.className = 'maplibre-marker'
        el.style.width = '10px'
        el.style.height = '10px'
        el.style.borderRadius = '50%'
        el.style.backgroundColor = '#3388ff'
        el.style.border = '2px solid white'
        el.style.cursor = 'pointer'

        const marker = new maplibregl.Marker(el)
          .setLngLat(cluster.geometry.coordinates)
          .addTo(map.current)

        markersRef.current.markers.push(marker)
      }
    })
  }

  useEffect(() => {
    if (clusterInstance && map.current) {
      updateClusters()
    }
  }, [clusterInstance])

  const handleClearSearch = () => {
    setSelectedLocation(null)

    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: zoom,
        speed: 1.2
      })
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/">
          หน้าแรก
        </Link>
        <Typography sx={{ color: "text.primary" }}>พิกัดแสดงบนแผนที่</Typography>
      </Breadcrumbs>
      <Typography variant="h4" gutterBottom>พิกัดแสดงบนแผนที่</Typography>

      {/* Search Component */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Autocomplete
          id="location-search"
          options={availableLocations}
          getOptionLabel={(option) => option || ""}
          value={selectedLocation}
          onChange={(event, newValue) => {
            setSelectedLocation(newValue)
            if (newValue && map.current) {
              const locationPoints = features.filter(feature => 
                feature.properties?.ct_tn === newValue
              )

              if (locationPoints.length > 0) {
                const bounds = new maplibregl.LngLatBounds()
                locationPoints.forEach(point => {
                  bounds.extend(point.geometry.coordinates)
                })

                map.current.fitBounds(bounds, {
                  padding: 50,
                  maxZoom: 15
                })
              }
            }
          }}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="ค้นหาสถานที่ (ไม่กรอง)" 
              variant="outlined" 
              size="small"
            />
          )}
        />

        {selectedLocation && (
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleClearSearch}
            size="small"
          >
            ล้างการค้นหา
          </Button>
        )}
      </Box>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            จำนวนจุดที่แสดง:
          </Typography>
          <ToggleButtonGroup
            value={displayLimit}
            exclusive
            onChange={handleLimitChange}
            size="small"
          >
            <ToggleButton value={10}>10</ToggleButton>
            <ToggleButton value={100}>100</ToggleButton>
            <ToggleButton value={1000}>1,000</ToggleButton>
            <ToggleButton value={10000}>10,000</ToggleButton>
            <ToggleButton value="all">ทั้งหมด</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography>กำลังโหลดข้อมูล... ({progress}%)</Typography>
          </Box>
        ) : (
          <Typography>
            แสดงทั้งหมด {features.length} จุด จาก {totalFeatures} จุด
          </Typography>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            เกิดข้อผิดพลาด: {error}
          </Alert>
        )}
      </Box>

      <Box
        ref={mapContainer}
        sx={{
          width: '100%',
          height: '500px',
          borderRadius: '8px',
          mb: 3,
          border: '1px solid #ddd'
        }}
      />
    </Container>
  )
}
