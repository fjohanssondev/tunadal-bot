import { EmbedBuilder, Events, SlashCommandBuilder } from "discord.js";
import { client } from "@/client";
import { GameMode, PlayerResult } from "@/pubg/types";
import { getPlayersStats, PLAYERS } from "@/pubg/lib/pubg";
import { gameModeLabels } from "./stats";

const statLabels: Record<string, string> = {
  kd: "K/D",
  kills: "Kills",
  damagePerMatch: "Damage/match",
  headshotPct: "Headshot%",
  top10Pct: "Top 10%",
  longestKill: "Längsta kill",
  rideDistance: "Körsträcka",
  revives: "Revives",
  suicides: "Suicides",
  teamKills: "Teamkills",
  weaponsAcquired: "Vapen plockade",
}

function calculateStat(player: PlayerResult, stat: string): number {
  switch (stat) {
    case "kd": return player.kills / player.losses
    case "damagePerMatch": return player.damageDealt / player.roundsPlayed
    case "headshotPct": return player.headshotKills / player.kills * 100
    case "top10Pct": return player.top10s / player.roundsPlayed * 100
    default: return player[stat as keyof PlayerResult] as number
  }
}

export const leaderboardCommand = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("Visa topplista för varje mode")
  .addStringOption(option =>
    option.setName("mode")
      .setDescription("Spelläge")
      .setRequired(true)
      .addChoices(
        { name: "Squad FPP", value: "squad-fpp" },
        { name: "Duo FPP", value: "duo-fpp" },
        { name: "Solo FPP", value: "solo-fpp" },
        { name: "Squad", value: "squad" },
        { name: "Duo", value: "duo" },
        { name: "Solo", value: "solo" },
      )
  )
  .addStringOption(option =>
    option.setName("statistik")
      .setDescription("Vilken typ av statistik")
      .setRequired(false)
      .addChoices(
        { name: "K/D", value: "kd" },
        { name: "Kills", value: "kills" },
        { name: "Damage/match", value: "damagePerMatch" },
        { name: "Headshot%", value: "headshotPct" },
        { name: "Top 10%", value: "top10Pct" },
        { name: "Längsta kill", value: "longestKill" },
        { name: "Körsträcka", value: "rideDistance" },
        { name: "Revives", value: "revives" },
        { name: "Suicides", value: "suicides" },
        { name: "Teamkills", value: "teamKills" },
        { name: "Vapen plockade", value: "weaponsAcquired" },
      )
  )
  .addStringOption(option =>
    option.setName("säsong")
      .setDescription("Lämna tom för nuvarande säsong")
      .setRequired(false)
  )

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return
  if (interaction.commandName !== "leaderboard") return

  await interaction.deferReply()

  try {
    const mode = interaction.options.getString("mode", true) as GameMode
    const stat = interaction.options.getString("statistik") ?? "kd"
    const season = interaction.options.getString("säsong")

    const stats = await getPlayersStats(PLAYERS.map(p => p.value), mode, season ?? undefined)

    const players = stats
      .map(player => ({
        name: player.name,
        value: calculateStat(player, stat)
      }))
      .sort((a, b) => b.value - a.value)
      .map((player, i) => ({
        name: `${i + 1}. ${player.name}`,
        value: Number.isInteger(player.value) ? String(player.value) : player.value.toFixed(2),
        inline: false
      }))

    const embed = new EmbedBuilder()
      .setTitle(`Leaderboard - ${gameModeLabels[mode]} - ${statLabels[stat]}`)
      .setColor(0xF2A900)
      .addFields(players)

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    console.error(error)
    await interaction.editReply("Något gick fel, försök igen.")
  }
})