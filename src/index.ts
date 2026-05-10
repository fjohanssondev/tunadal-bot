import "dotenv/config"
import { Events } from "discord.js"
import { client } from "./client"
import "./api/pubg/commands/stats"
import "./api/pubg/commands/leaderboard"
import { startCron } from "@/lib/cron"

client.once(Events.ClientReady, (client) => {
  console.log("Client ready: ", client.user.tag)
  startCron()
})

client.login(process.env.DISCORD_BOT_TOKEN_DEV)