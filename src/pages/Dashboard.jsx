import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useLicense } from '@/contexts/LicenseContext';
import { 
  Users, 
  Calendar, 
  Target, 
  TrendingUp,
  Trophy,
  Award,
  Activity
} from 'lucide-react';
import {
  ResultsPieChart,
  GoalsBarChart,
  TopScorersChart,
  TopAssistersChart,
  TopMinutesChart
} from '@/components/charts/ChartComponents';
import Paywall from '@/components/Paywall';

const Dashboard = () => {
  const { currentLicense } = useLicense();
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('es');
  const [stats, setStats] = useState({
    players: 0,
    matches: 0,
    totalGoals: 0,
    totalAssists: 0,
    wins: 0,
    draws: 0,
    losses: 0,
  });
  const [topScorers, setTopScorers] = useState([]);
  const [topAssisters, setTopAssisters] = useState([]);
  const [topMinutes, setTopMinutes] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);

  const translations = {
    es: {
      title: 'Panel de Control',
      players: 'Jugadores',
      matches: 'Partidos',
      goals: 'Goles',
      assists: 'Asistencias',
      welcome: 'Bienvenido',
      noData: 'No hay datos disponibles',
      loading: 'Cargando estadísticas...',
      teamStats: 'Estadísticas del Equipo',
      recentPerformance: 'Rendimiento Reciente',
      topPlayers: 'Mejores Jugadores',
    },
    en: {
      title: 'Dashboard',
      players: 'Players',
      matches: 'Matches',
      goals: 'Goals',
      assists: 'Assists',
      welcome: 'Welcome',
      noData: 'No data available',
      loading: 'Loading statistics...',
      teamStats: 'Team Statistics',
      recentPerformance: 'Recent Performance',
      topPlayers: 'Top Players',
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (currentLicense) {
      fetchDashboardData();
    }
  }, [currentLicense]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Obtener estadísticas básicas
      const [playersRes, matchesRes, statsRes] = await Promise.all([
        // Jugadores activos
        supabase
          .from('players')
          .select('id', { count: 'exact', head: true })
          .eq('license_id', currentLicense.id)
          .eq('status', 'active'),
        
        // Partidos
        supabase
          .from('matches')
          .select('*')
          .eq('license_id', currentLicense.id)
          .order('match_date', { ascending: false }),
        
        // Estadísticas de jugadores
        supabase
          .from('player_season_stats')
          .select('*')
          .eq('license_id', currentLicense.id)
      ]);

      const matches = matchesRes.data || [];
      const playerStats = statsRes.data || [];

      // Calcular estadísticas
      const totalGoals = matches.reduce((sum, m) => sum + (m.team_goals || 0), 0);
      const wins = matches.filter(m => m.result === 'win').length;
      const draws = matches.filter(m => m.result === 'draw').length;
      const losses = matches.filter(m => m.result === 'loss').length;

      const totalAssists = playerStats.reduce((sum, p) => sum + (p.total_assists || 0), 0);

      setStats({
        players: playersRes.count || 0,
        matches: matches.length,
        totalGoals,
        totalAssists,
        wins,
        draws,
        losses,
      });

      // Top goleadores (Top 10)
      const { data: playersData } = await supabase
        .from('players')
        .select('id, name, shirt_number')
        .eq('license_id', currentLicense.id)
        .eq('status', 'active');

      const players = playersData || [];

      if (players.length > 0) {
        const { data: statsData } = await supabase
          .from('player_season_stats')
          .select('player_id, total_goals, total_assists, total_minutes')
          .eq('license_id', currentLicense.id);

        const statsFromDB = statsData || [];

        // Combinar jugadores con estadísticas
        const playersWithStats = players.map(player => {
          const playerStat = statsFromDB.find(s => s.player_id === player.id);
          return {
            name: player.name,
            goals: playerStat?.total_goals || 0,
            assists: playerStat?.total_assists || 0,
            minutes: playerStat?.total_minutes || 0
          };
        });

        // Top goleadores
        const scorers = playersWithStats
          .filter(p => p.goals > 0)
          .sort((a, b) => b.goals - a.goals)
          .slice(0, 10);

        setTopScorers(scorers);

        // Top asistentes
        const assisters = playersWithStats
          .filter(p => p.assists > 0)
          .sort((a, b) => b.assists - a.assists)
          .slice(0, 10);

        setTopAssisters(assisters);

        // Top minutos
        const minutesList = playersWithStats
          .filter(p => p.minutes > 0)
          .sort((a, b) => b.minutes - a.minutes)
          .slice(0, 10);

        setTopMinutes(minutesList);
      }

      // Últimos 5 partidos para gráfico
      const last5Matches = matches.slice(0, 5).reverse().map(m => ({
        opponent: m.opponent || 'Unknown',
        goalsFor: m.team_goals || 0,
        goalsAgainst: m.opponent_goals || 0,
      }));

      setRecentMatches(last5Matches);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loader mientras carga la licencia
  if (!currentLicense) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar Paywall si licencia está pending
  if (currentLicense.status === 'pending') {
    return <Paywall />;
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t.loading}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-500 mt-1">
            {t.welcome}, {currentLicense?.name || 'Equipo'}
          </p>
        </div>
        
        <button
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {language === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Jugadores */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{t.players}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.players}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Partidos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{t.matches}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.matches}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Goles */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{t.goals}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalGoals}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Asistencias */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{t.assists}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAssists}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de Resultados */}
        <ResultsPieChart 
          wins={stats.wins}
          draws={stats.draws}
          losses={stats.losses}
          language={language}
        />

        {/* Últimos 5 Partidos */}
        {recentMatches.length > 0 && (
          <GoalsBarChart 
            data={recentMatches}
            language={language}
          />
        )}
      </div>

      {/* Top Jugadores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Goleadores */}
        {topScorers.length > 0 && (
          <TopScorersChart 
            data={topScorers}
            language={language}
          />
        )}

        {/* Top Asistentes */}
        {topAssisters.length > 0 && (
          <TopAssistersChart 
            data={topAssisters}
            language={language}
          />
        )}

        {/* Top Minutos */}
        {topMinutes.length > 0 && (
          <TopMinutesChart 
            data={topMinutes}
            language={language}
          />
        )}
      </div>

      {/* Mensaje si no hay datos */}
      {stats.matches === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Trophy className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {language === 'es' ? '¡Empieza a registrar datos!' : 'Start recording data!'}
          </h3>
          <p className="text-gray-600">
            {language === 'es' 
              ? 'Añade jugadores y registra tu primer partido para ver estadísticas aquí.'
              : 'Add players and record your first match to see statistics here.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;