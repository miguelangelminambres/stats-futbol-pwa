import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLicense } from '@/contexts/LicenseContext'
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  Settings,
  Users,
  Calendar,
  BarChart3,
  Trophy
} from 'lucide-react'

const MainLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { currentLicense, licenses, switchLicense, hasMultipleLicenses } = useLicense()
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navigation = [
    { name: 'Plantilla', href: '/players', icon: Users },
    { name: 'Partidos', href: '/matches', icon: Calendar },
    { name: 'Estadísticas', href: '/stats', icon: BarChart3 },
  ]

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">
                  Stats Fútbol
                </span>
              </Link>

              {currentLicense && (
                <div className="hidden md:block">
                  <span className="text-sm text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                    {currentLicense.name}
                  </span>
                </div>
              )}
            </div>

            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                      transition-colors duration-200
                      ${isActive(item.href)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {hasMultipleLicenses && (
                <select
                  value={currentLicense?.id || ''}
                  onChange={(e) => switchLicense(e.target.value)}
                  className="input py-1.5 text-sm"
                >
                  {licenses.map((license) => (
                    <option key={license.id} value={license.id}>
                      {license.name}
                    </option>
                  ))}
                </select>
              )}

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Configuración</span>
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-danger-700 hover:bg-danger-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              {currentLicense && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                    {currentLicense.name}
                  </span>
                </div>
              )}

              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium
                      ${isActive(item.href)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}

              {hasMultipleLicenses && (
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Cambiar equipo
                  </label>
                  <select
                    value={currentLicense?.id || ''}
                    onChange={(e) => {
                      switchLicense(e.target.value)
                      setMobileMenuOpen(false)
                    }}
                    className="input text-sm"
                  >
                    {licenses.map((license) => (
                      <option key={license.id} value={license.id}>
                        {license.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 space-y-2">
                <p className="text-xs font-medium text-gray-500 px-4">
                  {user?.email}
                </p>

                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <Settings className="h-5 w-5" />
                  <span>Configuración</span>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-danger-700 hover:bg-danger-50 rounded-lg"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="page-container">
        {children}
      </main>
    </div>
  )
}

export default MainLayout
