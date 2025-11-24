import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from './AuthContext'

const LicenseContext = createContext({})

export const useLicense = () => {
  const context = useContext(LicenseContext)
  if (!context) {
    throw new Error('useLicense debe usarse dentro de un LicenseProvider')
  }
  return context
}

export const LicenseProvider = ({ children }) => {
  const { user } = useAuth()
  const [licenses, setLicenses] = useState([])
  const [currentLicense, setCurrentLicense] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserLicenses()
    } else {
      setLicenses([])
      setCurrentLicense(null)
      setLoading(false)
    }
  }, [user])

  const loadUserLicenses = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('user_licenses')
        .select(`
          *,
          license:licenses (
            id,
            code,
            name,
            status,
            license_type:license_types (
              name,
              max_users
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (error) throw error

      const userLicenses = data.map(ul => ul.license)
      setLicenses(userLicenses)

      if (userLicenses.length > 0) {
        const savedLicenseId = localStorage.getItem('currentLicenseId')
        const savedLicense = userLicenses.find(l => l.id === savedLicenseId)
        
        setCurrentLicense(savedLicense || userLicenses[0])
      } else {
        setCurrentLicense(null)
      }
    } catch (error) {
      console.error('Error al cargar licencias:', error)
    } finally {
      setLoading(false)
    }
  }

  const switchLicense = (licenseId) => {
    const license = licenses.find(l => l.id === licenseId)
    if (license) {
      setCurrentLicense(license)
      localStorage.setItem('currentLicenseId', licenseId)
    }
  }

  const reloadLicenses = async () => {
    if (user) {
      await loadUserLicenses()
    }
  }

  const getLicenseDetails = async () => {
    if (!currentLicense) return null

    try {
      const { data, error } = await supabase
        .from('licenses')
        .select(`
          *,
          license_type:license_types (*)
        `)
        .eq('id', currentLicense.id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error al obtener detalles de licencia:', error)
      return null
    }
  }

  const validateLicenseCode = async (code) => {
    try {
      if (!code || code.trim() === '') {
        return {
          valid: false,
          error: 'Por favor, ingresa un código de licencia'
        }
      }

      const { data: license, error: licenseError } = await supabase
        .from('licenses')
        .select(`
          *,
          license_type:license_types (
            id,
            name,
            max_users
          )
        `)
        .eq('code', code.toUpperCase().trim())
        .single()

      if (licenseError || !license) {
        return {
          valid: false,
          error: 'Código de licencia no válido'
        }
      }

      if (license.expires_at) {
        const expirationDate = new Date(license.expires_at)
        const now = new Date()
        
        if (expirationDate < now) {
          return {
            valid: false,
            error: 'Esta licencia ha expirado'
          }
        }
      }

      const { count: activeUsers, error: countError } = await supabase
        .from('user_licenses')
        .select('*', { count: 'exact', head: true })
        .eq('license_id', license.id)
        .eq('status', 'active')

      if (countError) throw countError

      const maxUsers = license.license_type?.max_users || 0
      if (activeUsers >= maxUsers) {
        return {
          valid: false,
          error: `Esta licencia ha alcanzado su límite de ${maxUsers} usuarios`
        }
      }

      return {
        valid: true,
        license: {
          id: license.id,
          code: license.code,
          name: license.name,
          type: license.license_type?.name || 'N/A',
          maxUsers: maxUsers,
          activeUsers: activeUsers,
          availableSlots: maxUsers - activeUsers
        }
      }
    } catch (error) {
      console.error('Error al validar licencia:', error)
      return {
        valid: false,
        error: 'Error al validar la licencia. Inténtalo de nuevo.'
      }
    }
  }

  const value = {
    licenses,
    currentLicense,
    loading,
    switchLicense,
    reloadLicenses,
    getLicenseDetails,
    validateLicenseCode,
    hasLicense: currentLicense !== null,
    hasMultipleLicenses: licenses.length > 1,
  }

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  )
}

export default LicenseContext