import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLicense } from '@/contexts/LicenseContext'
import { Trophy, Key, ArrowRight, CheckCircle, Users, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const LicenseValidation = () => {
  const navigate = useNavigate()
  const { validateLicenseCode } = useLicense()
  
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [validatedLicense, setValidatedLicense] = useState(null)

  const handleValidate = async (e) => {
    e.preventDefault()
    
    setLoading(true)

    try {
      const result = await validateLicenseCode(code)
      
      if (!result.valid) {
        toast.error(result.error)
        return
      }

      // Licencia válida
      setValidatedLicense(result.license)
      toast.success('¡Licencia válida!')
      
      // Guardar código en localStorage para usarlo en el registro
      localStorage.setItem('pendingLicenseCode', code.toUpperCase().trim())
      
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al validar la licencia')
    } finally {
      setLoading(false)
    }
  }

  const handleContinueToRegister = () => {
    navigate('/register')
  }

  const formatCode = (value) => {
    // Auto-formatear el código a XXXX-XXXX-XXXX
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    const parts = []
    
    for (let i = 0; i < cleaned.length && i < 12; i += 4) {
      parts.push(cleaned.slice(i, i + 4))
    }
    
    return parts.join('-')
  }

  const handleCodeChange = (e) => {
    const formatted = formatCode(e.target.value)
    setCode(formatted)
  }

  if (validatedLicense) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success-50 to-success-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success-600 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Licencia Válida!
              </h2>
              <p className="text-gray-600">
                Tu código ha sido verificado correctamente
              </p>
            </div>

            <div className="bg-gradient-to-r from-success-50 to-success-100 border-2 border-success-300 rounded-xl p-6 mb-6 space-y-4">
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Código</p>
                  <p className="text-lg font-bold text-success-800">{validatedLicense.code}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Trophy className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Plan</p>
                  <p className="text-lg font-semibold text-gray-900">{validatedLicense.type}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Capacidad</p>
                  <p className="text-base text-gray-900">
                    {validatedLicense.availableSlots} de {validatedLicense.maxUsers} plazas disponibles
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleContinueToRegister}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Continuar al Registro
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => {
                setValidatedLicense(null)
                setCode('')
                localStorage.removeItem('pendingLicenseCode')
              }}
              className="mt-3 w-full text-sm text-gray-600 hover:text-gray-800"
            >
              Validar otro código
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Stats Fútbol
            </h2>
            <p className="text-gray-600">
              Ingresa tu código de licencia para comenzar
            </p>
          </div>

          <form onSubmit={handleValidate} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Código de Licencia
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  className="input pl-10 text-center font-mono text-lg tracking-wider"
                  placeholder="XXXX-XXXX-XXXX"
                  maxLength={14}
                  required
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
                Introduce el código de 12 caracteres que recibiste
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 14}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="spinner mr-2"></div>
                  Validando...
                </span>
              ) : (
                'Validar Licencia'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          ¿No tienes un código? Contacta con tu administrador
        </p>
      </div>
    </div>
  )
}

export default LicenseValidation