import { useState, useEffect } from 'react'
import Header, { type NavTabId } from '../Components/Header'
import Hero from '../Components/Hero'
import Body from '../Components/Body'
import HowItWorks from '../Components/HowItWorks'
import { HiArrowUp } from 'react-icons/hi2'

const Home = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>('mp3')
  const [mediaType, setMediaType] = useState<'mp4' | 'mp3'>('mp3')
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Automatically update active tab on scroll and show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const howItWorksElement = document.getElementById('how-it-works')
      if (howItWorksElement) {
        const rect = howItWorksElement.getBoundingClientRect()
        // When "How It Works" reaches near the header
        if (rect.top <= 220) {
          setActiveTab('how-it-works')
        } else {
          setActiveTab(mediaType)
        }
      }

      // Show the floating button when scrolled past 280px
      setShowScrollTop(window.scrollY > 280)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [mediaType])

  const scrollToConverter = () => {
    const converterElement = document.getElementById('converter-section')
    if (converterElement) {
      converterElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSelectTab = (tab: NavTabId) => {
    setActiveTab(tab)

    if (tab === 'mp4' || tab === 'mp3') {
      setMediaType(tab)
      scrollToConverter()
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
    <div className="min-h-screen bg-[#fcfcfd] relative">
      <Header activeTab={activeTab} onSelectTab={handleSelectTab} />
      <Hero />
      <Body mediaType={mediaType} onMediaTypeChange={handleMediaTypeChange} />
      <HowItWorks />

      {/* Floating Bottom-Right Circle Button with Up Arrow */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToConverter}
          aria-label="Scroll back to converter"
          title="Back to Converter"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200/90 shadow-xl shadow-gray-300/50 hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group"
        >
          <HiArrowUp className="w-5 h-5 text-gray-600 group-hover:text-red-600 group-hover:-translate-y-0.5 transition-all duration-200" />
        </button>
      )}
    </div>
  )
}

export default Home