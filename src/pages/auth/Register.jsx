import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLicense } from '@/contexts/LicenseContext'
import { supabase } from '@/lib/supabaseClient'
import { Trophy, Mail, Lock, User, Eye, EyeOff, Key } from 'lucide-react'
import toast from 'react-hot-toast'

const Register = () => {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const { validateLicenseCode } = useLicense()
  
  const [licenseInfo, setLicenseInfo] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Verificar que haya un código de licencia validado
    const pendingCode = localStorage.getItem('pendingLicenseCode')
    
    if (!pendingCode) {
      toast.error('Primero debes validar un código de licencia')
      navigate('/license')
      return
    }

    // Validar el código de nuevo por seguridad
    const revalidateLicense = async () => {
      const result = await validateLicenseCode(pendingCode)
      
      if (!result.valid) {
        toast.error(result.error)
        localStorage.removeItem('pendingLicenseCode')
        navigate('/license')
        return
      }
      
      setLicenseInfo(result.license)
    }

    revalidateLicense()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validaciones
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Por favor, completa todos los campos')
      return
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await signUp(
        formData.email,
        formData.password,
        {
          name: formData.name
        }
      )

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('Este email ya está registrado')
        } else {
          toast.error(authError.message)
        }
        return
      }

      const userId = authData.user.id

      // 2. Crear usuario en la tabla users (NUEVO PASO)
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          name: formData.name,
          email: formData.email,
          password: formData.password, // En producción deberías hashear esto
          role: 'coach',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (userError) {
        console.error('Error al crear usuario en tabla users:', userError)
        throw userError
      }

      // 3. Vincular usuario a la licencia en user_licenses
      const { error: linkError } = await supabase
        .from('user_licenses')
        .insert([
          {
            user_id: userId,
            license_id: licenseInfo.id,
            status: 'active',
            activated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        ])

      if (linkError) {
        console.error('Error al vincular licencia:', linkError)
        throw linkError
      }

      // 4. Si es el primer usuario, actualizar el estado de la licencia a 'active'
      if (licenseInfo.activeUsers === 0) {
        const { error: updateError } = await supabase
          .from('licenses')
          .update({
            status: 'active',
            activated_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', licenseInfo.id)

        if (updateError) {
          console.error('Error al actualizar licencia:', updateError)
          // No lanzamos error aquí porque el usuario ya está creado
        }
      }

      // 5. Limpiar código pendiente
      localStorage.removeItem('pendingLicenseCode')

      toast.success('¡Registro exitoso! Por favor, inicia sesión')
      navigate('/login')

    } catch (error) {
      console.error('Error en registro:', error)
      toast.error(error.message || 'Error al crear la cuenta. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (!licenseInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Crear Cuenta
            </h2>
            <p className="text-gray-600">
              Completa tus datos para registrarte
            </p>
          </div>

          {/* Info de licencia */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Licencia: {licenseInfo.code}</span>
            </div>
            <p className="text-xs text-gray-600">
              Plan {licenseInfo.type} • {licenseInfo.availableSlots} plazas disponibles
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Tu nombre"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="Repite tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="spinner mr-2"></div>
                  Creando cuenta...
                </span>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register