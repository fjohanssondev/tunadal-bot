import "dotenv/config"
import { REST, Routes } from "discord.js"
import { statsCommand } from "./api/pubg/commands/stats"
import { leaderboardCommand } from "./api/pubg/commands/leaderboard"
import { aiCommand } from "./api/claude/commands/claude"

const isDev = !!process.env.DISCORD_GUILD_ID

const token = isDev ? process.env.DISCORD_BOT_TOKEN_DEV! : process.env.DISCORD_BOT_TOKEN!
const clientId = isDev ? process.env.DISCORD_BOT_CLIENT_ID_DEV! : process.env.DISCORD_BOT_CLIENT_ID!

const rest = new REST().setToken(token)

await rest.put(
  isDev
    ? Routes.applicationGuildCommands(clientId, process.env.DISCORD_GUILD_ID!)
    : Routes.applicationCommands(clientId),
  { body: [statsCommand.toJSON(), leaderboardCommand.toJSON(), aiCommand.toJSON()] }
)

console.log("Commands registrerade!")