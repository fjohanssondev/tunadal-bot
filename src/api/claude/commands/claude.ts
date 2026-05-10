import { Events, SlashCommandBuilder } from "discord.js";
import { client } from "@/client";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export const aiCommand = new SlashCommandBuilder()
  .setName("ask")
  .setDescription("Ställ en fråga till Claude")
  .addStringOption(option =>
    option.setName("fråga")
      .setDescription("Din fråga")
      .setRequired(true)
  )

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return
  if (interaction.commandName !== "ask") return

  await interaction.deferReply()

  try {
    const fråga = interaction.options.getString("fråga", true)

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `Du är en bitter, sarkastisk AI-assistent som svarar på svenska. Du är halvt aggressiv och använder uttryck som "ska jag medicinera dig", "åk in på sjuan", "dra åt helvete" när du tycker frågor är dumma. Du hjälper ändå till i slutändan men med motvilja. Håll det kort och rakt på sak. Inga dramatiska suckar, inga asterisker, ingen överdrift – bara torr sarkasm och raka svar.`,
      messages: [{ role: "user", content: fråga }]
    })

    const svar = message.content
      .filter(block => block.type === "text")
      .map(block => block.text)
      .join("")

    const formatted = `**${interaction.user.displayName}** frågade: *${fråga}*\n\n${svar}`
    const trunkerat = formatted.length > 2000 ? formatted.slice(0, 1997) + "..." : formatted

    await interaction.editReply(trunkerat)
  } catch (error) {
    console.error(error)
    await interaction.editReply("Något gick fel, försök igen.")
  }
})