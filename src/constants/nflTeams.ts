export type TeamId =
  | 'cardinals' | 'falcons' | 'ravens' | 'bills' | 'panthers' | 'bears'
  | 'bengals' | 'browns' | 'cowboys' | 'broncos' | 'lions' | 'packers'
  | 'texans' | 'colts' | 'jaguars' | 'chiefs' | 'raiders' | 'chargers'
  | 'rams' | 'dolphins' | 'vikings' | 'patriots' | 'saints' | 'giants'
  | 'jets' | 'eagles' | 'steelers' | 'niners' | 'seahawks' | 'buccaneers'
  | 'titans' | 'commanders'

export interface NflTeam {
  id: TeamId
  name: string
  abbreviation: string
  primary: string
  secondary: string
}

export const NFL_TEAMS: NflTeam[] = [
  { id: 'cardinals', name: 'Arizona Cardinals', abbreviation: 'ARI', primary: '#97233F', secondary: '#000000' },
  { id: 'falcons', name: 'Atlanta Falcons', abbreviation: 'ATL', primary: '#A71930', secondary: '#000000' },
  { id: 'ravens', name: 'Baltimore Ravens', abbreviation: 'BAL', primary: '#241773', secondary: '#9E7C0C' },
  { id: 'bills', name: 'Buffalo Bills', abbreviation: 'BUF', primary: '#00338D', secondary: '#C60C30' },
  { id: 'panthers', name: 'Carolina Panthers', abbreviation: 'CAR', primary: '#0085CA', secondary: '#101820' },
  { id: 'bears', name: 'Chicago Bears', abbreviation: 'CHI', primary: '#0B162A', secondary: '#C83803' },
  { id: 'bengals', name: 'Cincinnati Bengals', abbreviation: 'CIN', primary: '#FB4F14', secondary: '#000000' },
  { id: 'browns', name: 'Cleveland Browns', abbreviation: 'CLE', primary: '#311D00', secondary: '#FF3C00' },
  { id: 'cowboys', name: 'Dallas Cowboys', abbreviation: 'DAL', primary: '#003594', secondary: '#869397' },
  { id: 'broncos', name: 'Denver Broncos', abbreviation: 'DEN', primary: '#FB4F14', secondary: '#002244' },
  { id: 'lions', name: 'Detroit Lions', abbreviation: 'DET', primary: '#0076B6', secondary: '#B0B7BC' },
  { id: 'packers', name: 'Green Bay Packers', abbreviation: 'GB', primary: '#203731', secondary: '#FFB612' },
  { id: 'texans', name: 'Houston Texans', abbreviation: 'HOU', primary: '#03202F', secondary: '#A71930' },
  { id: 'colts', name: 'Indianapolis Colts', abbreviation: 'IND', primary: '#002C5F', secondary: '#A2AAAD' },
  { id: 'jaguars', name: 'Jacksonville Jaguars', abbreviation: 'JAX', primary: '#101820', secondary: '#D7A22A' },
  { id: 'chiefs', name: 'Kansas City Chiefs', abbreviation: 'KC', primary: '#E31837', secondary: '#FFB612' },
  { id: 'raiders', name: 'Las Vegas Raiders', abbreviation: 'LV', primary: '#000000', secondary: '#A5ACAF' },
  { id: 'chargers', name: 'Los Angeles Chargers', abbreviation: 'LAC', primary: '#0080C6', secondary: '#FFC20E' },
  { id: 'rams', name: 'Los Angeles Rams', abbreviation: 'LAR', primary: '#003594', secondary: '#FFA300' },
  { id: 'dolphins', name: 'Miami Dolphins', abbreviation: 'MIA', primary: '#008E97', secondary: '#FC4C02' },
  { id: 'vikings', name: 'Minnesota Vikings', abbreviation: 'MIN', primary: '#4F2683', secondary: '#FFC62F' },
  { id: 'patriots', name: 'New England Patriots', abbreviation: 'NE', primary: '#002244', secondary: '#C60C30' },
  { id: 'saints', name: 'New Orleans Saints', abbreviation: 'NO', primary: '#D3BC8D', secondary: '#101820' },
  { id: 'giants', name: 'New York Giants', abbreviation: 'NYG', primary: '#0B2265', secondary: '#A71930' },
  { id: 'jets', name: 'New York Jets', abbreviation: 'NYJ', primary: '#125740', secondary: '#000000' },
  { id: 'eagles', name: 'Philadelphia Eagles', abbreviation: 'PHI', primary: '#004C54', secondary: '#A5ACAF' },
  { id: 'steelers', name: 'Pittsburgh Steelers', abbreviation: 'PIT', primary: '#FFB612', secondary: '#101820' },
  { id: 'niners', name: 'San Francisco 49ers', abbreviation: 'SF', primary: '#AA0000', secondary: '#B3995D' },
  { id: 'seahawks', name: 'Seattle Seahawks', abbreviation: 'SEA', primary: '#002244', secondary: '#69BE28' },
  { id: 'buccaneers', name: 'Tampa Bay Buccaneers', abbreviation: 'TB', primary: '#D50A0A', secondary: '#34302B' },
  { id: 'titans', name: 'Tennessee Titans', abbreviation: 'TEN', primary: '#0C2340', secondary: '#4B92DB' },
  { id: 'commanders', name: 'Washington Commanders', abbreviation: 'WAS', primary: '#5A1414', secondary: '#FFB612' },
]

export const NFL_TEAMS_BY_ID: Record<TeamId, NflTeam> = NFL_TEAMS.reduce(
  (acc, team) => {
    acc[team.id] = team
    return acc
  },
  {} as Record<TeamId, NflTeam>,
)
