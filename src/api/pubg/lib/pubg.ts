import "dotenv/config"
import { GameMode, Player, PlayerNames, Season } from "@/pubg/types";
import { db } from "@/db";

const BASE_URL = "https://api.pubg.com/shards/steam"

export const PLAYERS = [
  { name: "Fredrik", value: "Drag0nslayer1337" as PlayerNames },
  { name: "Kerkaa", value: "Kerkaa" as PlayerNames },
  { name: "Aspen", value: "xerius96" as PlayerNames },
  { name: "Tim", value: "TMB1" as PlayerNames },
]

interface SeasonResponse {
  data: Season[]
}

interface PlayerResponse {
  data: Player[]
}

export async function getData<T>(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Authorization": `Bearer ${process.env.PUBG_API_KEY}`,
      "Accept": "application/vnd.api+json"
    }
  })

  const data: T = await res.json()
  return data
}

export async function getPlayerData(name: PlayerNames) {
  const { data } = await getData<PlayerResponse>(`/players?filter[playerNames]=${name}`)
  return data[0]
}

export async function getCurrentSeason() {
  const { data } = await getData<SeasonResponse>("/seasons")
  return data.find(season => season.attributes.isCurrentSeason)
}

async function getCurrentSeasonFromDb() {
  const season = await db.season.findFirst({ where: { isCurrent: true } })
  if (!season) throw new Error("Ingen current season i databasen, vänta på nästa cronjobb-körning")
  return season
}

export async function getPlayerStats(name: PlayerNames, mode: GameMode, seasonId?: string) {
  const season = seasonId ? { id: seasonId } : await getCurrentSeasonFromDb()

  const stats = await db.pubgStats.findFirst({
    where: { player: { name }, seasonId: season.id, mode },
    include: { player: true }
  })

  if (!stats) throw new Error(`Ingen data för ${name} i ${mode}`)

  return stats
}

export async function getPlayersStats(names: PlayerNames[], mode: GameMode, seasonId?: string) {
  const season = seasonId ? { id: seasonId } : await getCurrentSeasonFromDb()

  const stats = await db.pubgStats.findMany({
    where: { player: { name: { in: names } }, seasonId: season.id, mode },
    include: { player: true }
  })

  return stats.map(s => ({ ...s, name: s.player.name }))
}