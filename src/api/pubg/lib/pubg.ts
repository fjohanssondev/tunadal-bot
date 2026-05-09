import "dotenv/config"
import { GameMode, Player, PlayerNames, PlayerSeasonResponse, Season } from "@/pubg/types";

const BASE_URL = "https://api.pubg.com/shards/steam"

export const PLAYERS = [
  {
    name: "Fredrik",
    value: "Drag0nslayer1337" as PlayerNames
  },
  {
    name: "Kerkaa",
    value: "Kerkaa" as PlayerNames
  },
  {
    name: "Aspen",
    value: "xerius96" as PlayerNames
  },
  {
    name: "Tim",
    value: "TMB1" as PlayerNames
  },
]

interface SeasonResponse {
  data: Season[]
}

interface PlayerResponse {
  data: Player[]
}

export async function getData<T>(path: string){
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Authorization": `Bearer ${process.env.PUBG_API_KEY}`,
      "Accept": "application/vnd.api+json"
    }
  })

  const data: T = await res.json()
  return data
}

export async function getPlayerData(name: PlayerNames){
  const { data } = await getData<PlayerResponse>(`/players?filter[playerNames]=${name}`)

  return data[0]
}

export async function getCurrentSeason(){
  const { data } = await getData<SeasonResponse>("/seasons")

  return data.find(season => season.attributes.isCurrentSeason)
}

export async function getPlayerStats(name: PlayerNames, mode: GameMode, seasonId?: string) {
  const season = seasonId
    ? { id: seasonId }
    : await getCurrentSeason()

  const { id: player_id } = await getPlayerData(name)

  if (!season) throw new Error("Couldn't find this season")

  const { data } = await getData<PlayerSeasonResponse>(`/players/${player_id}/seasons/${season.id}`)
  
  return data.attributes.gameModeStats[mode]
}