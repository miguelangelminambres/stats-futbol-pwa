import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useLicense } from '@/contexts/LicenseContext'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Phone,
  Mail,
  BarChart3,
  Camera
} from 'lucide-react'
import toast from 'react-hot-toast'

const PlayersPage = () => {
  const { currentLicense } = useLicense()
  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    shirt_number: '',
    position: '',
    phone: '',
    email: '',
    height_cm: '',
    weight_kg: '',
    birth_date: '',
    notes: '',
    photo_url: ''
  })

  useEffect(() => {
    if (currentLicense) {
      loadPlayers()
    }
  }, [currentLicense])

  useEffect(() => {
    filterPlayers()
  }, [searchTerm, players])

  const loadPlayers = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('license_id', currentLicense.id)
        .eq('status', 'active')
        .order('shirt_number', { ascending: true })

      if (error) throw error

      setPlayers(data || [])
    } catch (error) {
      console.error('Error al cargar jugadores:', error)
      toast.error('Error al cargar jugadores')
    } finally {
      setLoading(false)
    }
  }

  const filterPlayers = () => {
    if (!searchTerm.trim()) {
      setFilteredPlayers(players)
      return
    }

    const filtered = players.filter(player =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.shirt_number.toString().includes(searchTerm)
    )

    setFilteredPlayers(filtered)
  }

  const handleOpenModal = (player = null) => {
    if (player) {
      setEditingPlayer(player)
      setFormData({
        name: player.name || '',
        shirt_number: player.shirt_number || '',
        position: player.position || '',
        phone: player.phone || '',
        email: player.email || '',
        height_cm: player.height_cm || '',
        weight_kg: player.weight_kg || '',
        birth_date: player.birth_date || '',
        notes: player.notes || '',
        photo_url: player.photo_url || ''
      })
      setPhotoPreview(player.photo_url || null)
    } else {
      setEditingPlayer(null)
      setFormData({
        name: '',
        shirt_number: '',
        position: '',
        phone: '',
        email: '',
        height_cm: '',
        weight_kg: '',
        birth_date: '',
        notes: '',
        photo_url: ''
      })
      setPhotoPreview(null)
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPlayer(null)
    setPhotoPreview(null)
    setFormData({
      name: '',
      shirt_number: '',
      position: '',
      phone: '',
      email: '',
      height_cm: '',
      weight_kg: '',
      birth_date: '',
      notes: '',
      photo_url: ''
    })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar tamaño (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede superar 2MB')
      return
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes')
      return
    }

    try {
      setUploading(true)

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${currentLicense.id}/${Date.now()}.${fileExt}`

      // Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from('player-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('player-photos')
        .getPublicUrl(fileName)

      setFormData({ ...formData, photo_url: publicUrl })
      setPhotoPreview(publicUrl)
      toast.success('Foto subida correctamente')

    } catch (error) {
      console.error('Error al subir foto:', error)
      toast.error('Error al subir la foto')
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (formData.photo_url) {
      try {
        // Extraer el path del archivo de la URL
        const urlParts = formData.photo_url.split('/player-photos/')
        if (urlParts.length > 1) {
          const filePath = urlParts[1].split('?')[0] // Quitar query params
          
          await supabase.storage
            .from('player-photos')
            .remove([filePath])
        }

        setFormData({ ...formData, photo_url: '' })
        setPhotoPreview(null)
        toast.success('Foto eliminada')

      } catch (error) {
        console.error('Error al eliminar foto:', error)
        toast.error('Error al eliminar la foto')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.shirt_number || !formData.position) {
      toast.error('Nombre, número y posición son obligatorios')
      return
    }

    try {
      const playerData = {
        license_id: currentLicense.id,
        name: formData.name,
        shirt_number: parseInt(formData.shirt_number),
        position: formData.position,
        phone: formData.phone || null,
        email: formData.email || null,
        height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        birth_date: formData.birth_date || null,
        notes: formData.notes || null,
        photo_url: formData.photo_url || null,
        status: 'active',
        updated_at: new Date().toISOString()
      }

      if (editingPlayer) {
        const { error } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', editingPlayer.id)

        if (error) throw error

        toast.success('Jugador actualizado correctamente')
      } else {
        playerData.created_at = new Date().toISOString()

        const { error } = await supabase
          .from('players')
          .insert([playerData])

        if (error) throw error

        toast.success('Jugador agregado correctamente')
      }

      handleCloseModal()
      loadPlayers()
    } catch (error) {
      console.error('Error al guardar jugador:', error)
      toast.error('Error al guardar jugador')
    }
  }

  const handleDelete = async (player) => {
    if (!confirm(`¿Estás seguro de eliminar a ${player.name}?`)) {
      return
    }

    try {
      // Eliminar foto si existe
      if (player.photo_url) {
        const urlParts = player.photo_url.split('/player-photos/')
        if (urlParts.length > 1) {
          const filePath = urlParts[1].split('?')[0]
          await supabase.storage
            .from('player-photos')
            .remove([filePath])
        }
      }

      const { error } = await supabase
        .from('players')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', player.id)

      if (error) throw error

      toast.success('Jugador eliminado correctamente')
      loadPlayers()
    } catch (error) {
      console.error('Error al eliminar jugador:', error)
      toast.error('Error al eliminar jugador')
    }
  }

  const getPositionColor = (position) => {
    const colors = {
      'Portero': 'bg-yellow-100 text-yellow-800',
      'Defensa': 'bg-blue-100 text-blue-800',
      'Centrocampista': 'bg-green-100 text-green-800',
      'Delantero': 'bg-red-100 text-red-800'
    }
    return colors[position] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plantilla</h1>
            <p className="text-sm text-gray-500">
              {filteredPlayers.length} jugador{filteredPlayers.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2 justify-center sm:justify-start"
        >
          <Plus className="h-5 w-5" />
          Agregar Jugador
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, posición o número..."
            className="input pl-10"
          />
        </div>
      </div>

      {filteredPlayers.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron jugadores' : 'No hay jugadores'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza agregando jugadores a tu plantilla'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Agregar Primer Jugador
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => (
            <div key={player.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                {/* Foto o Número */}
                <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600">
                  {player.photo_url ? (
                    <img 
                      src={player.photo_url} 
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-white">
                      {player.shirt_number}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {player.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${getPositionColor(player.position)}`}>
                      {player.position}
                    </span>
                    {player.photo_url && (
                      <span className="text-xs text-gray-500">
                        #{player.shirt_number}
                      </span>
                    )}
                  </div>

                  {(player.email || player.phone) && (
                    <div className="mt-2 space-y-1">
                      {player.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{player.email}</span>
                        </div>
                      )}
                      {player.phone && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span>{player.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <Link
                      to={`/players/${player.id}/stats`}
                      className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Estadísticas
                    </Link>
                    <button
                      onClick={() => handleOpenModal(player)}
                      className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
                    >
                      <Edit2 className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(player)}
                      className="text-danger-600 hover:text-danger-700 flex items-center gap-1 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPlayer ? 'Editar Jugador' : 'Agregar Jugador'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Foto de perfil */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl font-bold text-white">
                        {formData.shirt_number || '?'}
                      </div>
                    )}
                  </div>
                  
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-lg">
                    <Camera className="h-5 w-5 text-gray-600" />
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {uploading && (
                    <span className="text-sm text-gray-500">Subiendo...</span>
                  )}
                  {photoPreview && !uploading && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Eliminar foto
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número *
                  </label>
                  <input
                    type="number"
                    name="shirt_number"
                    value={formData.shirt_number}
                    onChange={handleChange}
                    className="input"
                    min="1"
                    max="99"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posición *
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Portero">Portero</option>
                    <option value="Defensa">Defensa</option>
                    <option value="Centrocampista">Centrocampista</option>
                    <option value="Delantero">Delantero</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    name="height_cm"
                    value={formData.height_cm}
                    onChange={handleChange}
                    className="input"
                    min="100"
                    max="250"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    name="weight_kg"
                    value={formData.weight_kg}
                    onChange={handleChange}
                    className="input"
                    step="0.1"
                    min="30"
                    max="150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="input"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={uploading}
                >
                  {editingPlayer ? 'Guardar Cambios' : 'Agregar Jugador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlayersPage