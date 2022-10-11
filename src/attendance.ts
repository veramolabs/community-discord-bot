import { SlashCommandBuilder, Channel, Interaction, Guild, PermissionFlagsBits, ChannelType, VoiceChannel } from 'discord.js'
import { getMessageEmbedFromVC } from './embeds'
import { agent } from './agent'
import { discordUserIdToUrl } from './utils'

if (!process.env.DISCORD_BOT_DID_ALIAS) throw Error('DISCORD_BOT_DID_ALIAS is missing')

export const attendanceCommand = new SlashCommandBuilder()
  .setName('attendance')
  .setDescription('Issue Attendance credentials')
  .addChannelOption((option) =>
    option
      .setRequired(true)
      .setName('channel')
      .setDescription('Issue Attendance credentials to all members in this channel'),
  )
  .addStringOption((option) => option.setName('event').setDescription('Event name').setRequired(true))
  .addStringOption((option) => option.setName('picture').setDescription('Picture URL').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)


export async function attendance(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return
  if (!interaction.inGuild()) return
  if (interaction.commandName !== attendanceCommand.name) return

  const { user, client, guildId } = interaction
  const guild = client.guilds.cache.get(guildId) as Guild

  const channel = interaction.options.getChannel('channel') as VoiceChannel
  const event = interaction.options.getString('event')
  const picture = interaction.options.getString('picture')


  if (channel?.type !== ChannelType.GuildVoice) {
    interaction.reply({
      content: 'You can only issue attendance credentials to voice channels',
      ephemeral: true,
    })
    return 
  }

  const members = channel.members
  members.each(async (member) => {
    const issuer = await agent.didManagerGetOrCreate({
      alias: process.env.DISCORD_BOT_DID_ALIAS as string,
      provider: 'did:web',
    })

    const credentialSubject = {
      id: discordUserIdToUrl(member.user.id),
      name: member.user.username,
      avatar: member.user.avatarURL({ extension: 'png' }),
      channelId: channel.id,
      channelName: channel.name,
      guildId: guild.id,
      guildName: guild.name,
      guildAvatar: guild.iconURL({ extension: 'png' }) || undefined,
      authorId: discordUserIdToUrl(user.id),
      authorName: user.username,
      authorAvatar: user.avatarURL(),
      eventName: event,
      eventPicture: picture,
    }

    const vc = await agent.createVerifiableCredential({
      save: true,
      proofFormat: 'jwt',
      credential: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'Attendance'],
        issuer: { id: issuer.did },
        issuanceDate: new Date().toISOString(),
        credentialSubject,
      },
    })

    try {
      const privateEmbed = getMessageEmbedFromVC(vc, true)
      await member.send({
        content: 'You received attendance credential',
        embeds: [privateEmbed],
      })
    } catch (e) {
      //
    }
  })

  await interaction.reply({
    content: `Issued ${members.size} credentials`,
    ephemeral: true,
  })


}