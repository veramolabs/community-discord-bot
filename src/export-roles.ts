import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction, AttachmentBuilder, GuildMemberRoleManager } from 'discord.js'
import { agent } from './agent'
import { discordUserIdToUrl } from './utils'

export const exportRolesCommand = new SlashCommandBuilder()
  .setName('export-roles')
  .setDescription('Issues role credentials')

export async function exportRoles(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return
  if (!interaction.inGuild()) return
  if (interaction.commandName !== exportRolesCommand.name) return

  const issuer = await agent.didManagerGetOrCreate({
    alias: process.env.DISCORD_BOT_DID_ALIAS as string,
    provider: 'did:web'
  })

  const roles = interaction.member.roles as GuildMemberRoleManager

  const promises = roles.cache
    .filter((role) => role.name !== '@everyone')
    .map(async (role): Promise<AttachmentBuilder> => {
      const { name, color, guild } = role

      const vc = await agent.createVerifiableCredential({
        save: false,
        proofFormat: 'jwt',
        credential: {
          id: interaction.id,
          credentialSubject: {
            id: discordUserIdToUrl(interaction.member.user.id),
            name,
            color,
            guildId: guild.id,
            guildName: guild.name,
            guildAvatar: guild.iconURL({ extension: 'png' }) || '',
          },
          issuer: { id: issuer.did },
          issuanceDate: new Date().toISOString(),
          type: ['VerifiableCredential', 'DiscordRole'],
          '@context': ['https://www.w3.org/2018/credentials/v1'],
        },
      })

      return new AttachmentBuilder(
        Buffer.from(vc.proof.jwt),
        {name: `${guild.name}-${role.name}-${interaction.member.user.username}-vc.jwt`},
      )
    })

  const attachments = await Promise.all(promises)

  await interaction.reply({
    ephemeral: true,
    content: 'Exported Role credentials',
    files: attachments,
  })
}
