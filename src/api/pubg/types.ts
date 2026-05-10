import { getPlayersStats } from "./lib/pubg"

export interface PlayerSeasonResponse {
  data: PlayerSeasonData
  links: {
    self: string
  }
  meta: Record<string, never>
}

export interface PlayerSeasonData {
  type: "playerSeason"
  attributes: {
    gameModeStats: GameModeStats
    bestRankPoint: number
  }
  relationships: PlayerSeasonRelationships
}

export type GameMode = "solo" | "solo-fpp" | "duo" | "duo-fpp" | "squad" | "squad-fpp"

export type GameModeStats = Record<GameMode, ModeStats>

export interface ModeStats {
  assists: number
  boosts: number
  dBNOs: number
  dailyKills: number
  dailyWins: number
  damageDealt: number
  days: number
  headshotKills: number
  heals: number
  killPoints: number
  kills: number
  longestKill: number
  longestTimeSurvived: number
  losses: number
  maxKillStreaks: number
  mostSurvivalTime: number
  rankPoints: number
  rankPointsTitle: string
  revives: number
  rideDistance: number
  roadKills: number
  roundMostKills: number
  roundsPlayed: number
  suicides: number
  swimDistance: number
  teamKills: number
  timeSurvived: number
  top10s: number
  vehicleDestroys: number
  walkDistance: number
  weaponsAcquired: number
  weeklyKills: number
  weeklyWins: number
  winPoints: number
  wins: number
}

export interface PlayerSeasonRelationships {
  matchesSolo: MatchList
  matchesSoloFPP: MatchList
  matchesDuo: MatchList
  matchesDuoFPP: MatchList
  matchesSquad: MatchList
  matchesSquadFPP: MatchList
  season: { data: { type: "season"; id: string } }
  player: { data: { type: "player"; id: string } }
}

interface MatchList {
  data: Match[]
}

export interface Season {
  type: string,
  id: string,
  attributes: {
    isCurrentSeason: boolean,
    isOffseason: boolean
  }
}

export type PlayerResult = Awaited<ReturnType<typeof getPlayersStats>>[number]

type PlayerAttributes = {
  banType: string,
  clanId: string,
  name: PlayerNames
  stats: null,
  titleId: string,
  shardId: Platform,
  patchVersion: string
}

export interface Player {
  type: string
  id: string
  attributes: PlayerAttributes
  relationships: {
    assets: {
      data: any
    },
    matches: {
      data: Match[]
    }
  }
}

type Match = {
  type: string
  id: string
}
export type PlayerNames = "Kerkaa" | "Drag0nslayer1337" | "TMB1" | "xerius96"
type Platform = "steam"