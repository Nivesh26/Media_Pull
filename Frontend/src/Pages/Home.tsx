import { useState, useEffect } from 'react'
import Header, { type NavTabId } from '../Components/Header'
import Hero from '../Components/Hero'
import Body from '../Components/Body'
import HowItWorks from '../Components/HowItWorks'

const Home = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>('mp3')
  const [mediaType, setMediaType] = useState<'mp4' | 'mp3'>('mp3')

  // Automatically update active tab on scroll
  useEffect(() => {
    const handleScroll = () => {
      const howItWorksElement = document.getElementById('how-it-works')
      if (!howItWorksElement) return

      const rect = howItWorksElement.getBoundingClientRect()
      // When "How It Works" reaches near the header
      if (rect.top <= 220) {
        setActiveTab('how-it-works')
      } else {
        setActiveTab(mediaType)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [mediaType])

  const handleSelectTab = (tab: NavTabId) => {
    setActiveTab(tab)

    if (tab === 'mp4' || tab === 'mp3') {
      setMediaType(tab)
      const converterElement = document.getElementById('converter-section')
      if (converterElement) {
        converterElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else if (tab === 'how-it-works') {
      const howItWorksElement = document.getElementById('how-it-works')
      if (howItWorksElement) {
        howItWorksElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  const handleMediaTypeChange = (type: 'mp4' | 'mp3') => {
    setMediaType(type)
    setActiveTab(type)
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <Header activeTab={activeTab} onSelectTab={handleSelectTab} />
      <Hero />
      <Body mediaType={mediaType} onMediaTypeChange={handleMediaTypeChange} />
      <HowItWorks />
    </div>
  )
}

export default Home