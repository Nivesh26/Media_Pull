import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiBars3, HiXMark, HiArrowDownTray } from 'react-icons/hi2'

export type NavTabId = 'mp4' | 'mp3' | 'how-it-works'

interface HeaderProps {
  activeTab?: NavTabId
  onSelectTab?: (tab: NavTabId) => void
}

const navItems: { id: NavTabId; name: string }[] = [
  { id: 'mp3', name: 'MP3 Audio' },
  { id: 'mp4', name: 'MP4 Video' },
  { id: 'how-it-works', name: 'How It Works' },
]

const Header = ({ activeTab = 'mp3', onSelectTab }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavClick = (tabId: NavTabId) => {
    if (onSelectTab) {
      onSelectTab(tabId)
    }
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => handleNavClick('mp3')}
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-white shadow-sm shadow-red-200">
              <HiArrowDownTray className="text-xl" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                Media<span className="text-red-600">Pull</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
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
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
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
        </div>
      )}
    </header>
  )
}

export default Header