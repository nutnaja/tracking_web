'use client'

import { 
  Container, 
  Typography, 
  CircularProgress, 
  Box,
  Alert,
  Autocomplete,
  TextField,
  Button,
  Breadcrumbs, 
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
  const [availableLocations, setAvailableLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [clusterInstance, setClusterInstance] = useState(null)
  const router = useRouter()

  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef({
    markers: [],
    clusters: [],
    popups: []
  })

  const [lng] = useState(100.5167)
  const [lat] = useState(13.7567)
  const [zoom] = useState(5)

  const navigateToDetail = (id) => {
    console.log(`กำลังนำทางไปยังรายละเอียดของจุด ${id}`)
    // Uncomment to enable navigation
    // router.push(`/detail/${id}`)
  }

  const formatPropertyValue = (value) => {
    if (value === null || value === undefined) return 'ไม่มีข้อมูล';
    if (typeof value === 'boolean') return value ? 'ใช่' : 'ไม่';
    return value.toString();
  }

  // Clear all popups
  const clearPopups = () => {
    markersRef.current.popups.forEach(popup => popup.remove());
    markersRef.current.popups = [];
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

        const fetchLimit = 100000 // Set a high limit for fetching all data
        let allFeatures = initialData.features || []
        let offset = allFeatures.length
        const limit = 1000

        setProgress(Math.round((allFeatures.length / fetchLimit) * 100))

        while (allFeatures.length < fetchLimit && allFeatures.length < totalMatched) {
          const response = await fetch(`${baseUrl}?api_key=${apiKey}&limit=${limit}&offset=${offset}`)
          if (!response.ok) throw new Error(`Error fetching data: ${response.status}`)

          const data = await response.json()
          const newFeatures = data.features || []

          if (newFeatures.length === 0) break

          allFeatures = allFeatures.concat(newFeatures)
          offset += newFeatures.length

          if (allFeatures.length >= 100000 || allFeatures.length >= totalMatched) {
            break
          }

          setProgress(Math.round((allFeatures.length / Math.min(fetchLimit, totalMatched)) * 100))
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

        // Create a supercluster instance with optimized parameters for large datasets
        const cluster = new Supercluster({
          radius: 50, // Increased radius for better clustering
          maxZoom: 16,
          minPoints: 3, // Points required to form a cluster
          log: false
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
  }, [])

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
    map.current.on('click', () => clearPopups()) // Close popups when clicking on the map

    return () => map.current?.remove()
  }, [lng, lat, zoom])

  const createPopupContent = (feature) => {
    const div = document.createElement('div')
    div.className = 'popup-content'
    div.style.padding = '10px'
    div.style.maxWidth = '300px'
    div.style.maxHeight = '400px'
    div.style.overflowY = 'auto'

    // Create header
    const header = document.createElement('div')
    header.style.borderBottom = '1px solid #ccc'
    header.style.marginBottom = '8px'
    header.style.paddingBottom = '8px'

    // Display name or ID
    const title = document.createElement('h3')
    title.style.margin = '0 0 5px 0'
    title.style.fontSize = '16px'
    title.style.fontWeight = 'bold'
    title.innerText = feature.properties.name || `พิกัด #${feature.properties.id}`
    header.appendChild(title)

    // Display location if available
    if (feature.properties.ct_tn) {
      const location = document.createElement('div')
      location.style.fontSize = '14px'
      location.innerText = `สถานที่: ${feature.properties.ct_tn}`
      header.appendChild(location)
    }

    div.appendChild(header)

    // Properties to display (you can customize this list)
    const propertiesToShow = ['name', 'id', 'ct_tn', 'ct_pn', 'ct_dn', 'ct_da']
    
    // Add table for properties
    const table = document.createElement('table')
    table.style.width = '100%'
    table.style.borderCollapse = 'collapse'
    table.style.fontSize = '14px'

    // Add properties
    Object.entries(feature.properties).forEach(([key, value]) => {
      // Skip some internal properties or properties already shown in the header
      if (!propertiesToShow.includes(key)) return

      const row = document.createElement('tr')
      row.style.borderBottom = '1px solid #eee'
      
      const keyCell = document.createElement('td')
      keyCell.style.padding = '4px'
      keyCell.style.fontWeight = 'bold'
      keyCell.style.width = '40%'
      keyCell.innerText = key
      
      const valueCell = document.createElement('td')
      valueCell.style.padding = '4px'
      valueCell.innerText = formatPropertyValue(value)
      
      row.appendChild(keyCell)
      row.appendChild(valueCell)
      table.appendChild(row)
    })
    
    div.appendChild(table)

    // Add coordinates
    const coordsDiv = document.createElement('div')
    coordsDiv.style.marginTop = '8px'
    coordsDiv.style.fontSize = '12px'
    coordsDiv.style.color = '#666'
    coordsDiv.innerText = `พิกัด: ${feature.geometry.coordinates[1].toFixed(6)}, ${feature.geometry.coordinates[0].toFixed(6)}`
    div.appendChild(coordsDiv)

    // Add button to view details
    const btnContainer = document.createElement('div')
    btnContainer.style.marginTop = '10px'
    btnContainer.style.textAlign = 'right'
    
    const detailsBtn = document.createElement('button')
    detailsBtn.innerText = 'ดูรายละเอียด'
    detailsBtn.style.padding = '6px 12px'
    detailsBtn.style.backgroundColor = '#3388ff'
    detailsBtn.style.color = 'white'
    detailsBtn.style.border = 'none'
    detailsBtn.style.borderRadius = '4px'
    detailsBtn.style.cursor = 'pointer'
    detailsBtn.onclick = (e) => {
      e.stopPropagation()
      navigateToDetail(feature.properties.id)
    }
    
    btnContainer.appendChild(detailsBtn)
    div.appendChild(btnContainer)

    return div
  }

  const createClusterInfoContent = (cluster, pointCount, clusterFeatures) => {
    const div = document.createElement('div')
    div.className = 'cluster-popup-content'
    div.style.padding = '10px'
    div.style.maxWidth = '300px'
    div.style.maxHeight = '400px'
    div.style.overflowY = 'auto'

    // Create header
    const header = document.createElement('div')
    header.style.borderBottom = '1px solid #ccc'
    header.style.marginBottom = '8px'
    header.style.paddingBottom = '8px'

    // Display title
    const title = document.createElement('h3')
    title.style.margin = '0 0 5px 0'
    title.style.fontSize = '16px'
    title.style.fontWeight = 'bold'
    title.innerText = `กลุ่มพิกัด (${pointCount} จุด)`
    header.appendChild(title)

    // Add zoom instruction
    const zoomInstruction = document.createElement('div')
    zoomInstruction.style.fontSize = '12px'
    zoomInstruction.style.color = '#666'
    zoomInstruction.innerText = 'คลิกที่กลุ่มนี้เพื่อซูมเข้าดูข้อมูลภายในกลุ่ม'
    header.appendChild(zoomInstruction)

    div.appendChild(header)

    // List the first few points in the cluster
    const pointList = document.createElement('div')
    
    const maxPoints = 5 // Show only the first 5 points
    const displayedPoints = clusterFeatures.slice(0, maxPoints)
    
    displayedPoints.forEach((feature, index) => {
      const pointItem = document.createElement('div')
      pointItem.style.padding = '5px 0'
      pointItem.style.borderBottom = index < displayedPoints.length - 1 ? '1px solid #eee' : 'none'
      
      const pointName = document.createElement('div')
      pointName.style.fontWeight = 'bold'
      pointName.innerText = feature.properties.name || `พิกัด #${feature.properties.id}`
      
      const pointLocation = document.createElement('div')
      pointLocation.style.fontSize = '12px'
      pointLocation.innerText = feature.properties.ct_tn || 'ไม่ระบุสถานที่'
      
      pointItem.appendChild(pointName)
      pointItem.appendChild(pointLocation)
      pointList.appendChild(pointItem)
    })
    
    if (pointCount > maxPoints) {
      const morePoints = document.createElement('div')
      morePoints.style.marginTop = '8px'
      morePoints.style.fontStyle = 'italic'
      morePoints.innerText = `และอีก ${pointCount - maxPoints} จุดที่ไม่ได้แสดง`
      pointList.appendChild(morePoints)
    }
    
    div.appendChild(pointList)

    return div
  }

  const updateClusters = () => {
    if (!map.current || !clusterInstance) return

    // Clear existing markers and popups
    markersRef.current.markers.forEach(marker => marker.remove())
    markersRef.current.clusters.forEach(marker => marker.remove())
    clearPopups()
    
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
        // This is a cluster
        const pointCount = cluster.properties.point_count
        const clusterId = cluster.properties.cluster_id

        // Size based on point count
        const size = Math.min(pointCount * 3 + 25, 60)
        
        const el = document.createElement('div')
        el.className = 'cluster-marker'
        el.style.width = `${size}px`
        el.style.height = `${size}px`
        el.style.borderRadius = '50%'
        el.style.backgroundColor = '#ff6b6b'
        el.style.color = 'white'
        el.style.textAlign = 'center'
        el.style.lineHeight = `${size}px`
        el.style.fontWeight = 'bold'
        el.style.border = '2px solid white'
        el.style.cursor = 'pointer'
        el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)'
        el.innerHTML = pointCount

        // Get points in this cluster
        const clusterFeatures = clusterInstance.getLeaves(clusterId, 10) // Get up to 10 points in the cluster

        el.addEventListener('click', (e) => {
          // Stop propagation to prevent map click from closing the popup we're about to open
          e.stopPropagation()
          
          // First clear any existing popups
          clearPopups()
          
          // Create popup with information about the cluster
          const popup = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: '300px'
          })
          
          popup.setLngLat(cluster.geometry.coordinates)
            .setDOMContent(createClusterInfoContent(cluster, pointCount, clusterFeatures))
            .addTo(map.current)
          
          markersRef.current.popups.push(popup)
          
          // Zoom in when the cluster is clicked to see more detail
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
        // This is a single point
        const el = document.createElement('div')
        el.className = 'maplibre-marker'
        el.style.width = '12px'
        el.style.height = '12px'
        el.style.borderRadius = '50%'
        el.style.backgroundColor = '#3388ff'
        el.style.border = '2px solid white'
        el.style.cursor = 'pointer'
        el.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)'

        // Add click event to the marker
        el.addEventListener('click', (e) => {
          // Stop propagation to prevent map click from closing the popup we're about to open
          e.stopPropagation()
          
          // Clear any existing popups
          clearPopups()
          
          // Create popup with information about the point
          const popup = new maplibregl.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: '300px'
          })
          
          popup.setLngLat(cluster.geometry.coordinates)
            .setDOMContent(createPopupContent(cluster))
            .addTo(map.current)
          
          markersRef.current.popups.push(popup)
        })

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
              label="ค้นหาสถานที่" 
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

      <Box sx={{ mb: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography>กำลังโหลดข้อมูล... ({progress}%)</Typography>
          </Box>
        ) : (
          <Typography>
            แสดงข้อมูลทั้งหมด {features.length} จุด จาก {totalFeatures} จุด
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