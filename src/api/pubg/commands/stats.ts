import { Events, SlashCommandBuilder } from "discord.js";
import { client } from "@/index";
import { GameMode, Players } from "@/pubg/types";
import { getPlayerStats } from "@/pubg/lib/pubg";

const command = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("Visa PUBG-stats för en spelare")
  .addStringOption(option =>
    option.setName("spelare")
      .setDescription("Spelarnamn")
      .setRequired(true)
      .addChoices(
        { name: "Kerkaa", value: "Kerkaa" },
        { name: "Drag0nslayer1337", value: "Drag0nslayer1337" }
      )
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

  const player = interaction.options.getString("spelare", true) as Players
  const mode = interaction.options.getString("mode", true) as GameMode
  const season = interaction.options.getString("säsong")

  const stats = await getPlayerStats(player, mode, season ?? undefined)

  await interaction.reply(`${player} - ${mode}: ${stats.kills} kills i ${stats.roundsPlayed} matcher`)
})