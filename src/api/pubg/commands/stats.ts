import { EmbedBuilder, Events, SlashCommandBuilder } from "discord.js";
import { client } from "@/client";
import { GameMode, PlayerNames } from "@/pubg/types";
import { getPlayerStats, PLAYERS } from "@/pubg/lib/pubg";

const gameModeLabels: Record<GameMode, string> = {
  "solo": "Solo",
  "solo-fpp": "Solo FPP",
  "duo": "Duo",
  "duo-fpp": "Duo FPP",
  "squad": "Squad",
  "squad-fpp": "Squad FPP",
}

export const command = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("Visa PUBG-stats för en spelare")
  .addStringOption(option =>
    option.setName("spelare")
      .setDescription("Spelarnamn")
      .setRequired(true)
      .addChoices(PLAYERS)
  )
  .addStringOption(option =>
    option.setName("mode")
      .setDescription("Spelläge")
      .setRequired(true)
      .addChoices(
        { name: "Squad FPP", value: "squad-fpp" },
        { name: "Squad", value: "squad" },
        { name: "Duo FPP", value: "duo-fpp" },
        { name: "Duo", value: "duo" },
        { name: "Solo FPP", value: "solo-fpp" },
        { name: "Solo", value: "solo" },
      )
  )
  .addStringOption(option =>
    option.setName("säsong")
      .setDescription("Lämna tom för nuvarande säsong")
      .setRequired(false)
  )

  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return
  
    await interaction.deferReply()
  
    const player = interaction.options.getString("spelare", true) as PlayerNames
    const mode = interaction.options.getString("mode", true) as GameMode
    const season = interaction.options.getString("säsong")
  
    const stats = await getPlayerStats(player, mode, season ?? undefined)
  
    const embed = new EmbedBuilder()
      .setTitle(`${player} - ${gameModeLabels[mode]}`)
      .setColor(0xF2A900)
      .addFields(
        { name: "Kills", value: `${stats.kills}`, inline: true },
        { name: "Matcher", value: `${stats.roundsPlayed}`, inline: true },
        { name: "Vinster", value: `${stats.wins}`, inline: true },
        { name: "Top 10", value: `${stats.top10s}`, inline: true },
        { name: "K/D", value: `${(stats.kills / stats.losses).toFixed(2)}`, inline: true },
        { name: "Damage/match", value: `${(stats.damageDealt / stats.roundsPlayed).toFixed(0)}`, inline: true },
      )
  
    await interaction.editReply({ embeds: [embed] })
  })