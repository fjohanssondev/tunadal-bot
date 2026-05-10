import cron from "node-cron"
import { db } from "@/db"
import { PLAYERS, getPlayerData, getCurrentSeason, getData } from "@/pubg/lib/pubg"
import { GameMode, PlayerSeasonResponse } from "@/pubg/types"

const MODES: GameMode[] = ["solo", "solo-fpp", "duo", "duo-fpp", "squad", "squad-fpp"]

async function syncStats() {
  console.log("Syncing PUBG-stats...")

  const season = await getCurrentSeason()
  if (!season) throw new Error("Couldn't find current season")

  await db.season.updateMany({ where: { isCurrent: true }, data: { isCurrent: false } })
  await db.season.upsert({
    where: { id: season.id },
    create: { id: season.id, isCurrent: true },
    update: { isCurrent: true }
  })

  for (const { value: name } of PLAYERS) {
    const player = await getPlayerData(name)
    const { data } = await getData<PlayerSeasonResponse>(`/players/${player.id}/seasons/${season.id}`)

    await db.player.upsert({
      where: { name },
      create: { name },
      update: {}
    })

    const dbPlayer = await db.player.findUniqueOrThrow({ where: { name } })

    for (const mode of MODES) {
      const stats = data.attributes.gameModeStats[mode]

      const statsData = {
        kills: stats.kills,
        losses: stats.losses,
        assists: stats.assists,
        damageDealt: stats.damageDealt,
        headshotKills: stats.headshotKills,
        roundsPlayed: stats.roundsPlayed,
        wins: stats.wins,
        top10s: stats.top10s,
        revives: stats.revives,
        teamKills: stats.teamKills,
        suicides: stats.suicides,
        longestKill: stats.longestKill,
        rideDistance: stats.rideDistance,
        walkDistance: stats.walkDistance,
        weaponsAcquired: stats.weaponsAcquired,
      }

      await db.pubgStats.upsert({
        where: { playerId_seasonId_mode: { playerId: dbPlayer.id, seasonId: season.id, mode } },
        create: { playerId: dbPlayer.id, seasonId: season.id, mode, ...statsData },
        update: statsData
      })
    }

    console.log(`Synced: ${name}`)
  }

  console.log("Syncronization done!")
}

export function startCron() {
  syncStats().catch(console.error)
  cron.schedule("*/10 * * * *", () => {
    syncStats().catch(console.error)
  })
}