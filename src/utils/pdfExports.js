import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = {
  primary: '#2563eb',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
};

export const exportMatchReport = (match, playerStats, teamName, language = 'es') => {
  // ORIENTACION VERTICAL (portrait)
  const doc = new jsPDF('portrait', 'mm', 'a4');
  
  const translations = {
    es: {
      title: 'Informe del Partido',
      opponent: 'Rival',
      date: 'Fecha',
      competition: 'Comp.',
      stadium: 'Estadio',
      location: 'Ubic.',
      round: 'Jorn.',
      teamStats: 'Estadísticas del Equipo',
      goals: 'Goles',
      assists: 'Asist.',
      yellowCards: 'T.Am.',
      redCards: 'T.Roj.',
      starters: 'Titular',
      substitutes: 'Supl.',
      playerStats: 'Estadísticas de Jugadores',
      number: 'Nº',
      player: 'Jugador',
      position: 'Pos.',
      lineup: 'Alin.',
      minutes: 'Min.',
      home: 'Local',
      away: 'Visita',
      win: 'Victoria',
      draw: 'Empate',
      loss: 'Derrota',
      starter: 'Tit.',
      substitute: 'Sup.',
      not_called: 'N/C',
    },
    en: {
      title: 'Match Report',
      opponent: 'Opponent',
      date: 'Date',
      competition: 'Comp.',
      stadium: 'Stadium',
      location: 'Loc.',
      round: 'Round',
      teamStats: 'Team Statistics',
      goals: 'Goals',
      assists: 'Asst.',
      yellowCards: 'Yel.',
      redCards: 'Red',
      starters: 'Start',
      substitutes: 'Subs',
      playerStats: 'Player Statistics',
      number: 'No.',
      player: 'Player',
      position: 'Pos.',
      lineup: 'Line',
      minutes: 'Min.',
      home: 'Home',
      away: 'Away',
      win: 'Win',
      draw: 'Draw',
      loss: 'Loss',
      starter: 'Sta.',
      substitute: 'Sub',
      not_called: 'N/C',
    },
  };

  const t = translations[language];
  const pageWidth = doc.internal.pageSize.width;
  
  // HEADER
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 23, 'F');
  
  doc.setFillColor(255, 255, 255);
  doc.circle(18, 14, 8, 'F');
  doc.setFillColor(37, 99, 235);
  doc.circle(18, 14, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('SF', 18, 16, { align: 'center' });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(t.title, 30, 12);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(teamName, 30, 19);
  
  let yPos = 35;

  // INFO DEL PARTIDO Y RESULTADO EN UNA FILA
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(10, yPos, 90, 28, 2, 2, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(10, yPos, 90, 28, 2, 2, 'S');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7);
  let infoY = yPos + 5;
  
  const matchDate = new Date(match.match_date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-GB');
  const infoLines = [
    `${t.opponent}: ${match.opponent}`,
    `${t.date}: ${matchDate}`,
    `${t.competition}: ${match.competition || '-'}`,
    `${t.stadium}: ${match.stadium || '-'}`,
    `${t.location}: ${match.home_away === 'home' ? t.home : t.away} | ${t.round}: ${match.round || '-'}`,
  ];
  
  infoLines.forEach(line => {
    doc.text(line, 14, infoY);
    infoY += 4.5;
  });
  
  // RESULTADO
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(105, yPos, 95, 28, 2, 2, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(105, yPos, 95, 28, 2, 2, 'S');
  
  doc.setFontSize(28);
  doc.setFont(undefined, 'bold');
  const resultColor = match.result === 'win' ? COLORS.success : match.result === 'draw' ? COLORS.warning : COLORS.danger;
  doc.setTextColor(resultColor);
  doc.text(`${match.team_goals} - ${match.opponent_goals}`, 152, yPos + 14, { align: 'center' });
  
  doc.setFontSize(8);
  const resultLabel = t[match.result];
  if (match.result === 'win') {
    doc.setFillColor(220, 252, 231);
  } else if (match.result === 'draw') {
    doc.setFillColor(254, 243, 199);
  } else {
    doc.setFillColor(254, 226, 226);
  }
  const badgeWidth = doc.getTextWidth(resultLabel) + 6;
  doc.roundedRect(152 - badgeWidth/2, yPos + 19, badgeWidth, 5, 1.5, 1.5, 'F');
  doc.text(resultLabel, 152, yPos + 22.5, { align: 'center' });
  
  yPos += 33;

  // ESTADÍSTICAS DEL EQUIPO
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text(t.teamStats, 10, yPos);
  yPos += 5;
  
  const teamStats = playerStats.reduce((acc, stat) => {
    acc.goals += stat.goals || 0;
    acc.assists += stat.assists || 0;
    acc.yellowCards += stat.yellow_cards || 0;
    acc.redCards += stat.red_cards || 0;
    if (stat.lineup_status === 'starter') acc.starters++;
    if (stat.lineup_status === 'substitute') acc.substitutes++;
    return acc;
  }, { goals: 0, assists: 0, yellowCards: 0, redCards: 0, starters: 0, substitutes: 0 });
  
  const statCards = [
    { label: t.goals, value: teamStats.goals, bg: '#dbeafe' },
    { label: t.assists, value: teamStats.assists, bg: '#dcfce7' },
    { label: t.yellowCards, value: teamStats.yellowCards, bg: '#fef3c7' },
    { label: t.redCards, value: teamStats.redCards, bg: '#fee2e2' },
    { label: t.starters, value: teamStats.starters, bg: '#ede9fe' },
    { label: t.substitutes, value: teamStats.substitutes, bg: '#fce7f3' },
  ];
  
  const cardW = 31;
  const cardH = 14;
  let cardX = 10;
  
  statCards.forEach(stat => {
    const r = parseInt(stat.bg.slice(1,3), 16);
    const g = parseInt(stat.bg.slice(3,5), 16);
    const b = parseInt(stat.bg.slice(5,7), 16);
    doc.setFillColor(r, g, b);
    doc.roundedRect(cardX, yPos, cardW, cardH, 2, 2, 'F');
    
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(String(stat.value), cardX + cardW/2, yPos + 6, { align: 'center' });
    
    doc.setFontSize(5.5);
    doc.setTextColor(75, 85, 99);
    doc.text(stat.label, cardX + cardW/2, yPos + 10.5, { align: 'center' });
    
    cardX += cardW + 1.5;
  });
  
  yPos += cardH + 6;

  // TABLA DE JUGADORES
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text(t.playerStats, 10, yPos);
  yPos += 3;

  const tableData = playerStats
    .filter(stat => stat.lineup_status !== 'not_called')
    .sort((a, b) => {
      if (a.lineup_status === 'starter' && b.lineup_status !== 'starter') return -1;
      if (a.lineup_status !== 'starter' && b.lineup_status === 'starter') return 1;
      return (a.players?.shirt_number || 0) - (b.players?.shirt_number || 0);
    })
    .map(stat => [
      stat.players?.shirt_number || '-',
      stat.players?.name || 'N/A',
      stat.players?.position || '-',
      t[stat.lineup_status] || '-',
      stat.minutes_played || 0,
      stat.goals || 0,
      stat.assists || 0,
      stat.yellow_cards || 0,
      stat.red_cards || 0,
    ]);

  autoTable(doc, {
    startY: yPos,
    head: [[t.number, t.player, t.position, t.lineup, t.minutes, t.goals, t.assists, 'TA', 'TR']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontSize: 6.5,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 1.2,
    },
    bodyStyles: {
      fontSize: 6,
      cellPadding: 1,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 42, halign: 'left' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 12, halign: 'center', fontStyle: 'bold', textColor: [37, 99, 235] },
      5: { cellWidth: 12, halign: 'center', fontStyle: 'bold', textColor: [22, 163, 74] },
      6: { cellWidth: 12, halign: 'center', fontStyle: 'bold', textColor: [59, 130, 246] },
      7: { cellWidth: 10, halign: 'center', fontStyle: 'bold', textColor: [234, 179, 8] },
      8: { cellWidth: 10, halign: 'center', fontStyle: 'bold', textColor: [220, 38, 38] },
    },
    margin: { left: 10, right: 10 },
  });

  // FOOTER
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(249, 250, 251);
  doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.line(0, pageHeight - 10, pageWidth, pageHeight - 10);
  
  doc.setFontSize(6);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Generado el ${new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-GB')} - ${teamName}`,
    pageWidth / 2,
    pageHeight - 5,
    { align: 'center' }
  );

  const filename = `informe_${match.opponent.replace(/\s+/g, '_')}_${match.match_date}.pdf`;
  doc.save(filename);
};

export const exportPlayerReport = (player, seasonStats, matchHistory, teamName, language = 'es') => {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  
  const t = language === 'es' ? {
    title: 'Ficha del Jugador',
    number: 'Dorsal',
    position: 'Posición',
    height: 'Altura',
    weight: 'Peso',
    stats: 'Estadísticas',
    matches: 'Partidos',
    minutes: 'Minutos',
    goals: 'Goles',
    assists: 'Asist.',
    yellow: 'T.Am.',
    red: 'T.Roj.',
    history: 'Historial',
    date: 'Fecha',
    opponent: 'Rival',
    result: 'Res.',
  } : {
    title: 'Player Report',
    number: 'Number',
    position: 'Position',
    height: 'Height',
    weight: 'Weight',
    stats: 'Statistics',
    matches: 'Matches',
    minutes: 'Minutes',
    goals: 'Goals',
    assists: 'Assists',
    yellow: 'Yel.',
    red: 'Red',
    history: 'History',
    date: 'Date',
    opponent: 'Opponent',
    result: 'Res.',
  };
  
  // HEADER
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 23, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(t.title, 15, 12);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(teamName, 15, 19);
  
  let yPos = 35;
  
  // TARJETA JUGADOR
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(10, yPos, pageWidth - 20, 22, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(player.name, 15, yPos + 10);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  let infoText = `${t.number}: ${player.shirt_number} | ${t.position}: ${player.position}`;
  if (player.height_cm) infoText += ` | ${t.height}: ${player.height_cm}cm`;
  if (player.weight_kg) infoText += ` | ${t.weight}: ${player.weight_kg}kg`;
  doc.text(infoText, 15, yPos + 17);
  
  yPos += 28;
  
  // ESTADÍSTICAS
  if (seasonStats) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text(t.stats, 10, yPos);
    yPos += 5;
    
    const stats = [
      { label: t.matches, value: seasonStats.matches_played || 0, bg: '#dbeafe' },
      { label: t.minutes, value: seasonStats.total_minutes || 0, bg: '#cffafe' },
      { label: t.goals, value: seasonStats.total_goals || 0, bg: '#dcfce7' },
      { label: t.assists, value: seasonStats.total_assists || 0, bg: '#d1fae5' },
      { label: t.yellow, value: seasonStats.total_yellow_cards || 0, bg: '#fef3c7' },
      { label: t.red, value: seasonStats.total_red_cards || 0, bg: '#fee2e2' },
    ];
    
    const cW = 31;
    const cH = 14;
    let cX = 10;
    
    stats.forEach(s => {
      const r = parseInt(s.bg.slice(1,3), 16);
      const g = parseInt(s.bg.slice(3,5), 16);
      const b = parseInt(s.bg.slice(5,7), 16);
      doc.setFillColor(r, g, b);
      doc.roundedRect(cX, yPos, cW, cH, 2, 2, 'F');
      
      doc.setTextColor(37, 99, 235);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(String(s.value), cX + cW/2, yPos + 6, { align: 'center' });
      
      doc.setFontSize(5.5);
      doc.setTextColor(75, 85, 99);
      doc.text(s.label, cX + cW/2, yPos + 10.5, { align: 'center' });
      
      cX += cW + 1.5;
    });
    
    yPos += cH + 6;
  }
  
  // HISTORIAL
  if (matchHistory && matchHistory.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text(t.history, 10, yPos);
    yPos += 3;
    
    const historyData = matchHistory.slice(0, 25).map(m => [
      new Date(m.matches.match_date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-GB'),
      m.matches.opponent,
      `${m.matches.team_goals}-${m.matches.opponent_goals}`,
      m.minutes_played || 0,
      m.goals || 0,
      m.assists || 0,
      m.yellow_cards || 0,
      m.red_cards || 0,
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [[t.date, t.opponent, t.result, t.minutes, t.goals, t.assists, 'TA', 'TR']],
      body: historyData,
      theme: 'grid',
      headStyles: { 
        fillColor: [37, 99, 235],
        fontSize: 6.5,
        cellPadding: 1.2,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 6,
        cellPadding: 1,
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 55 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 15, halign: 'center' },
        6: { cellWidth: 12, halign: 'center' },
        7: { cellWidth: 12, halign: 'center' },
      },
      margin: { left: 10, right: 10 },
    });
  }
  
  // FOOTER
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(249, 250, 251);
  doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
  doc.setFontSize(6);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Generado el ${new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-GB')} - ${teamName}`,
    pageWidth / 2,
    pageHeight - 5,
    { align: 'center' }
  );
  
  doc.save(`ficha_${player.name.replace(/\s+/g, '_')}.pdf`);
};

export const exportSeasonReport = (players, matches, teamStats, teamName, language = 'es') => {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  
  const t = language === 'es' ? {
    title: 'Resumen de Temporada',
    teamSummary: 'Estadísticas del Equipo',
    playerStats: 'Estadísticas de Jugadores',
    matches: 'Partidos',
    wins: 'Victorias',
    draws: 'Empates',
    losses: 'Derrotas',
    goalsFor: 'GF',
    goalsAgainst: 'GC',
    goalDiff: 'Dif.',
    winRate: '% Vic.',
    number: 'Nº',
    player: 'Jugador',
    position: 'Pos.',
    mp: 'PJ',
    starter: 'TIT',
    minutes: 'MIN',
    goals: 'GOL',
    assists: 'ASI',
    ga: 'G+A',
    yellow: 'TA',
    red: 'TR',
    totals: 'TOTALES',
    season: 'Temporada 2024/25',
  } : {
    title: 'Season Report',
    teamSummary: 'Team Statistics',
    playerStats: 'Player Statistics',
    matches: 'Matches',
    wins: 'Wins',
    draws: 'Draws',
    losses: 'Losses',
    goalsFor: 'GF',
    goalsAgainst: 'GA',
    goalDiff: 'Diff',
    winRate: 'Win%',
    number: 'No.',
    player: 'Player',
    position: 'Pos.',
    mp: 'MP',
    starter: 'STA',
    minutes: 'MIN',
    goals: 'GLS',
    assists: 'AST',
    ga: 'G+A',
    yellow: 'YC',
    red: 'RC',
    totals: 'TOTALS',
    season: 'Season 2024/25',
  };
  
  // HEADER
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 23, 'F');
  
  doc.setFillColor(255, 255, 255);
  doc.circle(18, 14, 8, 'F');
  doc.setFillColor(37, 99, 235);
  doc.circle(18, 14, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('SF', 18, 16, { align: 'center' });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(t.title, 30, 12);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`${teamName} - ${t.season}`, 30, 19);
  
  let yPos = 35;
  
  // ESTADÍSTICAS DEL EQUIPO
  if (teamStats) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(t.teamSummary, 10, yPos);
    yPos += 5;
    
    const teamData = [[
      teamStats.played || 0,
      teamStats.wins || 0,
      teamStats.draws || 0,
      teamStats.losses || 0,
      teamStats.goalsFor || 0,
      teamStats.goalsAgainst || 0,
      (teamStats.goalDiff > 0 ? '+' : '') + (teamStats.goalDiff || 0),
      (teamStats.winRate || 0) + '%',
    ]];
    
    autoTable(doc, {
      startY: yPos,
      head: [[t.matches, t.wins, t.draws, t.losses, t.goalsFor, t.goalsAgainst, t.goalDiff, t.winRate]],
      body: teamData,
      theme: 'grid',
      headStyles: { 
        fillColor: [37, 99, 235],
        fontSize: 7,
        cellPadding: 2,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3,
        halign: 'center',
        fontStyle: 'bold',
      },
      columnStyles: {
        1: { textColor: [22, 163, 74] },
        2: { textColor: [234, 179, 8] },
        3: { textColor: [220, 38, 38] },
        4: { textColor: [37, 99, 235] },
        5: { textColor: [249, 115, 22] },
      },
      margin: { left: 10, right: 10 },
    });
    
    yPos = doc.lastAutoTable.finalY + 8;
  }
  
  // ESTADÍSTICAS DE JUGADORES
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text(t.playerStats, 10, yPos);
  yPos += 4;
  
  // Calcular totales
  const totals = players.reduce((acc, p) => ({
    matches: acc.matches + (p.matches_played || 0),
    started: acc.started + (p.matches_started || 0),
    minutes: acc.minutes + (p.total_minutes || 0),
    goals: acc.goals + (p.total_goals || 0),
    assists: acc.assists + (p.total_assists || 0),
    ga: acc.ga + (p.goal_assist || 0),
    yellow: acc.yellow + (p.total_yellow_cards || 0),
    red: acc.red + (p.total_red_cards || 0),
  }), { matches: 0, started: 0, minutes: 0, goals: 0, assists: 0, ga: 0, yellow: 0, red: 0 });
  
  // Datos de jugadores
  const playersData = players.map(p => [
    p.shirt_number || '-',
    p.name || 'N/A',
    p.position || '-',
    p.matches_played || 0,
    p.matches_started || 0,
    p.total_minutes || 0,
    p.total_goals || 0,
    p.total_assists || 0,
    p.goal_assist || 0,
    p.total_yellow_cards || 0,
    p.total_red_cards || 0,
  ]);
  
  // Fila de totales
  playersData.push([
    '',
    t.totals,
    `${players.length} jug.`,
    totals.matches,
    totals.started,
    totals.minutes,
    totals.goals,
    totals.assists,
    totals.ga,
    totals.yellow,
    totals.red,
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [[t.number, t.player, t.position, t.mp, t.starter, t.minutes, t.goals, t.assists, t.ga, t.yellow, t.red]],
    body: playersData,
    theme: 'grid',
    headStyles: { 
      fillColor: [37, 99, 235],
      fontSize: 6,
      cellPadding: 1.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 6,
      cellPadding: 1,
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 38, halign: 'left' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 10, halign: 'center' },
      4: { cellWidth: 10, halign: 'center' },
      5: { cellWidth: 14, halign: 'center', textColor: [37, 99, 235] },
      6: { cellWidth: 12, halign: 'center', fontStyle: 'bold', textColor: [22, 163, 74] },
      7: { cellWidth: 12, halign: 'center', fontStyle: 'bold', textColor: [59, 130, 246] },
      8: { cellWidth: 12, halign: 'center', fontStyle: 'bold', textColor: [147, 51, 234] },
      9: { cellWidth: 10, halign: 'center', textColor: [234, 179, 8] },
      10: { cellWidth: 10, halign: 'center', textColor: [220, 38, 38] },
    },
    margin: { left: 10, right: 10 },
    didParseCell: function(data) {
      // Última fila (totales) con estilo especial
      if (data.row.index === playersData.length - 1) {
        data.cell.styles.fillColor = [31, 41, 55];
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });
  
  // FOOTER
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(249, 250, 251);
  doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
  doc.setFontSize(6);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Generado el ${new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-GB')} - ${teamName}`,
    pageWidth / 2,
    pageHeight - 5,
    { align: 'center' }
  );
  
  doc.save(`resumen_temporada_${teamName.replace(/\s+/g, '_')}.pdf`);
};