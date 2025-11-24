import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLicense } from '@/contexts/LicenseContext'
import { supabase } from '@/lib/supabaseClient'
import { Users, Calendar, Trophy, TrendingUp } from 'lucide-react'
import Loading from '@/components/common/Loading'

const Dashboard = () => {
  const { currentLicense } = useLicense()
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activePlayers: 0,
    totalMatches: 0,
    wins: 0,
    draws: 0,
    losses: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentLicense) {
      loadStats()
    }
  }, [currentLicense])

  const loadStats = async () => {
    try {
      setLoading(true)

      const { count: totalPlayers } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('license_id', currentLicense.id)

      const { count: activePlayers } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('license_id', currentLicense.id)
        .eq('status', 'active')

      const { data: matches } = await supabase
        .from('matches')
        .select('result')
        .eq('license_id', currentLicense.id)

      const totalMatches = matches?.length || 0
      const wins = matches?.filter(m => m.result === 'win').length || 0
      const draws = matches?.filter(m => m.result === 'draw').length || 0
      const losses = matches?.filter(m => m.result === 'loss').length || 0

      setStats({
        totalPlayers: totalPlayers || 0,
        activePlayers: activePlayers || 0,
        totalMatches,
        wins,
        draws,
        losses,
      })
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading message="Cargando estadísticas..." />
  }

  const winPercentage = stats.totalMatches > 0 
    ? Math.round((stats.wins / stats.totalMatches) * 100)
    : 0

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Bienvenido a {currentLicense?.name}
        </h1>
        <p className="page-description">
          Resumen de las estadísticas de tu equipo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Jugadores
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.activePlayers}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.totalPlayers} en total
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Partidos
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalMatches}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Total jugados
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Victorias
              </p>
              <p className="text-3xl font-bold text-success-700">
                {stats.wins}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.draws} empates, {stats.losses} derrotas
              </p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
              <Trophy className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                % Victorias
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {winPercentage}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Efectividad
              </p>
            </div>
            <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-danger-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/players" className="card-hover">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Gestionar Plantilla
              </h3>
              <p className="text-sm text-gray-600">
                Añade, edita o elimina jugadores de tu equipo
              </p>
            </div>
          </div>
        </Link>

        <Link to="/matches" className="card-hover">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Registrar Partido
              </h3>
              <p className="text-sm text-gray-600">
                Crea un nuevo partido y registra las estadísticas
              </p>
            </div>
          </div>
        </Link>

        <Link to="/stats" className="card-hover">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-warning-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Ver Estadísticas
              </h3>
              <p className="text-sm text-gray-600">
                Consulta el rendimiento de cada jugador
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
