import "dotenv/config"
import { REST, Routes } from "discord.js"
import { statsCommand } from "./api/pubg/commands/stats"
import { leaderboardCommand } from "./api/pubg/commands/leaderboard"

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN_DEV!)

const isDev = !!process.env.DISCORD_GUILD_ID

await rest.put(
  isDev
    ? Routes.applicationGuildCommands(process.env.DISCORD_BOT_CLIENT_ID_DEV!, process.env.DISCORD_GUILD_ID!)
    : Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID_DEV!),
  { body: [statsCommand.toJSON(), leaderboardCommand.toJSON()] }
)

console.log("Commands registrerade!")