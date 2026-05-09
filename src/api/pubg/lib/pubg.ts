import "dotenv/config"
import { BASE_URL } from "@/pubg/index";
import { GameMode, Player, Players, PlayerSeasonResponse, Season } from "@/pubg/types";

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

export async function getPlayerData(name: Players){
  const { data } = await getData<PlayerResponse>(`/players?filter[playerNames]=${name}`)

  return data[0]
}

export async function getCurrentSeason(){
  const { data } = await getData<SeasonResponse>("/seasons")

  return data.find(season => season.attributes.isCurrentSeason)
}

export async function getPlayerStats(name: Players, mode: GameMode, seasonId?: string) {
  const season = seasonId
    ? { id: seasonId }
    : await getCurrentSeason()

  const { id: player_id } = await getPlayerData(name)

  if (!season) throw new Error("Couldn't find this season")

  const { data } = await getData<PlayerSeasonResponse>(`/players/${player_id}/seasons/${season.id}`)
  
  return data.attributes.gameModeStats[mode]
}