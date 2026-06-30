import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Header from './components/Header'
import Gallery from './components/Gallery'
import GalleryDetail from './components/GalleryDetail'
import Footer from './components/Footer'
import TopBar from './components/TopBar'
import { useSettings, useEvents } from './hooks/useEvents'

function SeoUpdater() {
  const { settings } = useSettings()

  useEffect(() => {
    if (!settings) return
    if (settings.seoTitle) document.title = settings.seoTitle
    const setMeta = (name, content) => {
      if (!content) return
      let tag = document.querySelector('meta[name="' + name + '"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', name)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }
    setMeta('description', settings.seoDescription)
    setMeta('keywords', settings.seoKeywords)

    if (settings.faviconUrl) {
      let link = document.querySelector('link[rel="icon"]')
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'icon')
        document.head.appendChild(link)
      }
      link.setAttribute('href', settings.faviconUrl)
    }
  }, [settings])

  return null
}

function App() {
  return (
    <Router>
      <SeoUpdater />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gallery/:eventId" element={<GalleryDetail />} />
      </Routes>
    </Router>
  )
}

function HomePage() {
  const { events } = useEvents()
  // null = no search active; array = filtered results
  const [searchResults, setSearchResults] = useState(null)

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <TopBar events={events} onFilter={setSearchResults} />
      <Header />
      <Gallery searchResults={searchResults} />
      <Footer />
    </div>
  )
}

export default App
