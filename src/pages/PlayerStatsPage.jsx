import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useLicense } from '@/contexts/LicenseContext';
import { exportPlayerReport } from '@/utils/pdfExports';
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  Award,
  Target,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react';

const PlayerStatsPage = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentLicense } = useLicense();
  
  const [player, setPlayer] = useState(null);
  const [seasonStats, setSeasonStats] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [competitionStats, setCompetitionStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('es');

  // Traducciones
  const translations = {
    es: {
      title: 'Estadísticas del Jugador',
      backToPlayers: 'Volver a Plantilla',
      personalInfo: 'Información Personal',
      number: 'Dorsal',
      position: 'Posición',
      overallStats: 'Estadísticas Generales',
      matchesPlayed: 'Partidos Jugados',
      matchesStarted: 'Como Titular',
      matchesSubstitute: 'Como Suplente',
      totalMinutes: 'Minutos Totales',
      totalGoals: 'Goles Totales',
      totalAssists: 'Asistencias Totales',
      yellowCards: 'Tarjetas Amarillas',
      redCards: 'Tarjetas Rojas',
      averages: 'Promedios',
      avgMinutesPerMatch: 'Min. por Partido',
      avgGoalsPerMatch: 'Goles por Partido',
      matchHistory: 'Historial de Partidos',
      date: 'Fecha',
      opponent: 'Rival',
      competition: 'Competición',
      result: 'Resultado',
      lineup: 'Alineación',
      minutes: 'Minutos',
      goals: 'Goles',
      assists: 'Asist.',
      cards: 'Tarjetas',
      starter: 'Titular',
      substitute: 'Suplente',
      not_called: 'No convocado',
      win: 'Victoria',
      draw: 'Empate',
      loss: 'Derrota',
      noMatches: 'No hay partidos registrados',
      statsByCompetition: 'Estadísticas por Competición',
      highlights: 'Destacados',
      bestMatch: 'Mejor Partido',
      goalStreak: 'Racha de Goles',
      consecutiveMatches: 'partidos consecutivos',
      lastMatch: 'Último Partido',
      home: 'Local',
      away: 'Visitante',
      errorLoading: 'Error al cargar las estadísticas',
    },
    en: {
      title: 'Player Statistics',
      backToPlayers: 'Back to Squad',
      personalInfo: 'Personal Information',
      number: 'Number',
      position: 'Position',
      overallStats: 'Overall Statistics',
      matchesPlayed: 'Matches Played',
      matchesStarted: 'As Starter',
      matchesSubstitute: 'As Substitute',
      totalMinutes: 'Total Minutes',
      totalGoals: 'Total Goals',
      totalAssists: 'Total Assists',
      yellowCards: 'Yellow Cards',
      redCards: 'Red Cards',
      averages: 'Averages',
      avgMinutesPerMatch: 'Min. per Match',
      avgGoalsPerMatch: 'Goals per Match',
      matchHistory: 'Match History',
      date: 'Date',
      opponent: 'Opponent',
      competition: 'Competition',
      result: 'Result',
      lineup: 'Lineup',
      minutes: 'Minutes',
      goals: 'Goals',
      assists: 'Assists',
      cards: 'Cards',
      starter: 'Starter',
      substitute: 'Substitute',
      not_called: 'Not Called',
      win: 'Win',
      draw: 'Draw',
      loss: 'Loss',
      noMatches: 'No matches recorded',
      statsByCompetition: 'Statistics by Competition',
      highlights: 'Highlights',
      bestMatch: 'Best Match',
      goalStreak: 'Goal Streak',
      consecutiveMatches: 'consecutive matches',
      lastMatch: 'Last Match',
      home: 'Home',
      away: 'Away',
      errorLoading: 'Error loading statistics',
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (playerId && currentLicense) {
      fetchPlayerData();
    }
  }, [playerId, currentLicense]);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);

      // Obtener información del jugador
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (playerError) throw playerError;
      setPlayer(playerData);

      // Obtener estadísticas de temporada desde la vista
      const { data: statsData, error: statsError } = await supabase
        .from('player_season_stats')
        .select('*')
        .eq('player_id', playerId)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Stats error:', statsError);
      }
      setSeasonStats(statsData || null);

      // Obtener historial de partidos
      const { data: historyData, error: historyError } = await supabase
        .from('match_player_stats')
        .select(`
          *,
          matches (
            id,
            opponent,
            match_date,
            competition,
            home_away,
            team_goals,
            opponent_goals,
            result
          )
        `)
        .eq('player_id', playerId)
        .order('matches(match_date)', { ascending: false });

      if (historyError) throw historyError;
      setMatchHistory(historyData || []);

      // Calcular estadísticas por competición
      if (historyData) {
        const compStats = calculateCompetitionStats(historyData);
        setCompetitionStats(compStats);
      }
    } catch (error) {
      console.error('Error fetching player data:', error);
      alert(t.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompetitionStats = (history) => {
    const stats = {};
    
    history.forEach(item => {
      const comp = item.matches.competition || 'Sin competición';
      if (!stats[comp]) {
        stats[comp] = {
          matches: 0,
          minutes: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0
        };
      }
      
      if (item.lineup_status !== 'not_called') {
        stats[comp].matches++;
        stats[comp].minutes += item.minutes_played || 0;
        stats[comp].goals += item.goals || 0;
        stats[comp].assists += item.assists || 0;
        stats[comp].yellowCards += item.yellow_cards || 0;
        stats[comp].redCards += item.red_cards || 0;
      }
    });

    return Object.entries(stats).map(([name, data]) => ({
      name,
      ...data
    }));
  };

  const findBestMatch = () => {
    if (matchHistory.length === 0) return null;
    
    return matchHistory.reduce((best, current) => {
      const currentScore = (current.goals || 0) * 3 + (current.assists || 0) * 2 + (current.minutes_played || 0) / 90;
      const bestScore = (best.goals || 0) * 3 + (best.assists || 0) * 2 + (best.minutes_played || 0) / 90;
      return currentScore > bestScore ? current : best;
    });
  };

  const findGoalStreak = () => {
    let currentStreak = 0;
    let maxStreak = 0;

    matchHistory.forEach(match => {
      if (match.goals > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (match.lineup_status !== 'not_called') {
        currentStreak = 0;
      }
    });

    return maxStreak;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getResultBadge = (result) => {
    const styles = {
      win: 'bg-green-100 text-green-800',
      draw: 'bg-yellow-100 text-yellow-800',
      loss: 'bg-red-100 text-red-800'
    };
    return styles[result] || 'bg-gray-100 text-gray-800';
  };

  const getLineupBadge = (lineup) => {
    const styles = {
      starter: 'bg-blue-100 text-blue-800',
      substitute: 'bg-purple-100 text-purple-800',
      not_called: 'bg-gray-100 text-gray-600'
    };
    return styles[lineup] || 'bg-gray-100 text-gray-800';
  };
  const handleExportPDF = () => {
  if (player) {
    // Preparar datos del jugador para el PDF
    const playerData = {
      name: player.name,
      shirt_number: player.shirt_number,
      position: player.position,
      height_cm: player.height_cm,
      weight_kg: player.weight_kg,
    };
    
    // Preparar estadísticas de temporada
    const statsData = {
  matches_played: seasonStats?.matches_played || 0,
  total_minutes: seasonStats?.total_minutes || 0,
  total_goals: seasonStats?.total_goals || 0,
  total_assists: seasonStats?.total_assists || 0,
  total_yellow_cards: seasonStats?.total_yellow_cards || 0,
  total_red_cards: seasonStats?.total_red_cards || 0,
};

// Exportar PDF
exportPlayerReport(
  playerData,
  statsData,
  matchHistory || [],
  currentLicense?.name || 'Mi Equipo',
  language
);
  }
};

  const bestMatch = findBestMatch();
  const goalStreak = findGoalStreak();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Jugador no encontrado</p>
          <Link to="/players" className="text-blue-600 hover:underline mt-4 inline-block">
            {t.backToPlayers}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/players')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-500 mt-1">{player.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Botón Exportar PDF */}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            PDF
          </button>
          
          {/* Botón Idioma */}
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {language === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'}
          </button>
        </div>
      </div>

      {/* Player Info Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
            {player.shirt_number}
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{player.name}</h2>
            <div className="flex gap-6 text-white/90">
              <div>
                <span className="text-sm opacity-75">{t.position}</span>
                <p className="font-semibold">{player.position}</p>
              </div>
              {player.height_cm && (
                <div>
                  <span className="text-sm opacity-75">Altura</span>
                  <p className="font-semibold">{player.height_cm} cm</p>
                </div>
              )}
              {player.weight_kg && (
                <div>
                  <span className="text-sm opacity-75">Peso</span>
                  <p className="font-semibold">{player.weight_kg} kg</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overall Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">{t.matchesPlayed}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {seasonStats?.matches_played || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {seasonStats?.matches_started || 0} {t.matchesStarted.toLowerCase()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{t.totalMinutes}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {seasonStats?.total_minutes || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ≈ {Math.round((seasonStats?.total_minutes || 0) / 90)} partidos completos
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Target className="h-4 w-4" />
            <span className="text-sm">{t.totalGoals}</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {seasonStats?.total_goals || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {seasonStats?.avg_goals_per_match || 0} por partido
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">{t.totalAssists}</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {seasonStats?.total_assists || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {((seasonStats?.total_assists || 0) / Math.max(seasonStats?.matches_played || 1, 1)).toFixed(2)} por partido
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{t.cards}</span>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {seasonStats?.total_yellow_cards || 0}
              </p>
              <p className="text-xs text-gray-500">🟨</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {seasonStats?.total_red_cards || 0}
              </p>
              <p className="text-xs text-gray-500">🟥</p>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights */}
      {bestMatch && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            {t.highlights}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{t.bestMatch}</h3>
              <p className="font-semibold text-gray-900">{bestMatch.matches.opponent}</p>
              <p className="text-sm text-gray-600">{formatDate(bestMatch.matches.match_date)}</p>
              <div className="flex gap-3 mt-2 text-sm">
                <span className="text-green-600 font-semibold">⚽ {bestMatch.goals}</span>
                <span className="text-blue-600 font-semibold">🅰️ {bestMatch.assists}</span>
                <span className="text-gray-600">{bestMatch.minutes_played}'</span>
              </div>
            </div>

            {goalStreak > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t.goalStreak}</h3>
                <p className="text-3xl font-bold text-green-600">{goalStreak}</p>
                <p className="text-sm text-gray-600">{t.consecutiveMatches}</p>
              </div>
            )}

            {matchHistory[0] && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t.lastMatch}</h3>
                <p className="font-semibold text-gray-900">{matchHistory[0].matches.opponent}</p>
                <p className="text-sm text-gray-600">{formatDate(matchHistory[0].matches.match_date)}</p>
                <div className="flex gap-3 mt-2 text-sm">
                  <span className="text-green-600 font-semibold">⚽ {matchHistory[0].goals}</span>
                  <span className="text-blue-600 font-semibold">🅰️ {matchHistory[0].assists}</span>
                  <span className="text-gray-600">{matchHistory[0].minutes_played}'</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats by Competition */}
      {competitionStats.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">{t.statsByCompetition}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.competition}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t.matchesPlayed}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t.minutes}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t.goals}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t.assists}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">🟨</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">🟥</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {competitionStats.map((comp, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{comp.name}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">{comp.matches}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">{comp.minutes}</td>
                    <td className="px-4 py-3 text-sm text-center text-green-600 font-semibold">{comp.goals}</td>
                    <td className="px-4 py-3 text-sm text-center text-blue-600 font-semibold">{comp.assists}</td>
                    <td className="px-4 py-3 text-sm text-center text-yellow-600">{comp.yellowCards}</td>
                    <td className="px-4 py-3 text-sm text-center text-red-600">{comp.redCards}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Match History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t.matchHistory}
          </h2>
        </div>

        {matchHistory.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {t.noMatches}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.date}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.opponent}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.competition}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t.result}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t.lineup}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t.minutes}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t.goals}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t.assists}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t.cards}</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matchHistory.map((match) => (
                  <tr key={match.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(match.matches.match_date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {match.matches.opponent}
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        match.matches.home_away === 'home' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {match.matches.home_away === 'home' ? t.home : t.away}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {match.matches.competition || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-gray-900">
                        {match.matches.team_goals} - {match.matches.opponent_goals}
                      </span>
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getResultBadge(match.matches.result)}`}>
                        {t[match.matches.result]}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLineupBadge(match.lineup_status)}`}>
                        {t[match.lineup_status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-semibold text-blue-600">
                      {match.minutes_played || 0}'
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-bold text-green-600">
                      {match.goals || 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-bold text-blue-600">
                      {match.assists || 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                      {match.yellow_cards > 0 && <span className="text-yellow-600">🟨{match.yellow_cards}</span>}
                      {match.yellow_cards > 0 && match.red_cards > 0 && ' '}
                      {match.red_cards > 0 && <span className="text-red-600">🟥{match.red_cards}</span>}
                      {match.yellow_cards === 0 && match.red_cards === 0 && '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <Link
                        to={`/matches/${match.match_id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerStatsPage;