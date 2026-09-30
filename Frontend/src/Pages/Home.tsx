import { useState } from 'react'
import Header, { type NavTabId } from '../Components/Header'
import Hero from '../Components/Hero'
import Body from '../Components/Body'
import HowItWorks from '../Components/HowItWorks'

const Home = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>('mp4')
  const [mediaType, setMediaType] = useState<'mp4' | 'mp3'>('mp4')

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