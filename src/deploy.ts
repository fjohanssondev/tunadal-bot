import "dotenv/config"
import { REST, Routes } from "discord.js"
import { command } from "./api/pubg/commands/stats"

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!)

await rest.put(
  Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID!),
  { body: [command.toJSON()] }
)

console.log("Commands registrerade!")