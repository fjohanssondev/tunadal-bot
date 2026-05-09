import "dotenv/config"
import { Events } from "discord.js"
import { client } from "./client"
import "./api/pubg/commands/stats"

client.once(Events.ClientReady, (client) => {
  console.log("Client ready: ", client.user.tag)
})

client.login(process.env.DISCORD_BOT_TOKEN)