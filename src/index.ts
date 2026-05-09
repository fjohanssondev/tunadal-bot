import { Client, Events, GatewayIntentBits } from "discord.js"

export const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.once(Events.ClientReady, (client) => {
  console.log("Client ready: ", client.user.tag)
})

client.login(process.env.DISCORD_TOKEN)