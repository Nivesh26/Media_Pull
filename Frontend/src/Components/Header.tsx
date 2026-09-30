import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RiYoutubeFill } from 'react-icons/ri'
import { HiBars3, HiXMark, HiArrowDownTray } from 'react-icons/hi2'

const navItems = [
  { name: 'YouTube to MP4', href: '/' },
  { name: 'YouTube to MP3', href: '/mp3' },
  { name: 'Shorts Downloader', href: '/shorts' },
  { name: 'Playlist', href: '/playlist' },
  { name: 'How It Works', href: '#how-it-works' },
]

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeItem, setActiveItem] = useState('YouTube to MP4')

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-sm shadow-red-200">
              <RiYoutubeFill className="text-2xl" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                YouTube<span className="text-red-600">Pull</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = activeItem === item.name

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setActiveItem(item.name)}
                  className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'text-red-600 bg-red-50 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </button>
              )
            })}
          </nav>

          {/* Right Action */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <HiArrowDownTray className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <HiXMark className="w-6 h-6" />
              ) : (
                <HiBars3 className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-5 space-y-1 shadow-md">
          {navItems.map((item) => {
            const isActive = activeItem === item.name

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setActiveItem(item.name)
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-red-600 bg-red-50 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.name}
              </button>
            )
          })}

          <div className="pt-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
            >
              <HiArrowDownTray className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header