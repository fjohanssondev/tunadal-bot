import { Events, SlashCommandBuilder } from "discord.js";
import { client } from "@/client";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/db";
import { readFileSync } from "fs"
import { join } from "path"

export const tunadaSystemPrompt = readFileSync(
  join(__dirname, "../../../prompts/tunadal.txt"),
  "utf-8"
)

const anthropic = new Anthropic();
const MAX_HISTORY = 20;

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
      const channelId = interaction.channelId
  
      const previousMessages = await db.conversationMessage.findMany({
        where: { channelId },
        orderBy: { createdAt: "asc" },
        take: MAX_HISTORY,
      })
  
      const history: Anthropic.MessageParam[] = previousMessages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }))
  
      history.push({ role: "user", content: fråga })
  
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: tunadaSystemPrompt,
        messages: history,
      })
  
      const svar = message.content
        .filter(block => block.type === "text")
        .map(block => block.text)
        .join("")
  
      await db.conversationMessage.createMany({
        data: [
          {
            channelId,
            userId: interaction.user.id,
            username: interaction.user.displayName,
            role: "user",
            content: fråga
          },
          {
            channelId,
            userId: interaction.user.id,
            username: interaction.user.displayName,
            role: "assistant",
            content: svar
          },
        ]
      })
  
      const formatted = `**${interaction.user.displayName}** frågade: *${fråga}*\n\n${svar}`
      const trunkerat = formatted.length > 2000 ? formatted.slice(0, 1997) + "..." : formatted
  
      await interaction.editReply(trunkerat)
    } catch (error) {
      console.error(error)
      await interaction.editReply("Något gick fel, försök igen.")
    }
  })