import { SlashCommandBuilder, Interaction, Guild, TextChannel, AttachmentBuilder} from 'discord.js'
import { getMessageEmbedFromVC } from './embeds'
import { agent } from './agent'
import { discordUserIdToUrl } from './utils'

if (!process.env.DISCORD_BOT_DID_ALIAS) throw Error('DISCORD_BOT_DID_ALIAS is missing')


export const kudosCommand = new SlashCommandBuilder()
  .setName('kudos')
  .setDescription('Issues kudos credential')
  .addUserOption((option) =>
    option.setName('to').setDescription('Who are you giving kudos to?').setRequired(true),
  )
  .addStringOption((option) =>
    option.setName('kudos').setDescription('Ex: For being so awesome!').setRequired(true),
  )


export async function kudos(interaction: Interaction) {

    if (!interaction.isChatInputCommand()) return
    if (!interaction.inGuild()) return
    if (interaction.commandName !== kudosCommand.name) return
  
    const { user, client, channelId, guildId } = interaction
    const channel = (await client.channels.fetch(channelId)) as TextChannel
    const guild = client.guilds.cache.get(guildId) as Guild
    const recipient = interaction.options.getUser('to')
    const kudos = interaction.options.get('kudos')?.value

    if (!recipient) {
      await interaction.reply('Who are you thanking?')
      return 
    }

    if (!kudos) {
      await interaction.reply('Why are you thanking?')
      return 
    }

    const issuer = await agent.didManagerGetOrCreate({
      alias: process.env.DISCORD_BOT_DID_ALIAS as string,
      provider: 'did:web'
    })

    const holder = discordUserIdToUrl(recipient.id)


    const credentialSubject = {
      name: recipient.username,
      kudos: kudos,
      author: {
        name: user.username,
        avatar: user.avatarURL({ extension: 'png' }) || '',
      },
      channel: {
        id: channel.id,
        name: channel.name,
        nsfw: channel.nsfw,
      },
      guild: {
        id: guild.id,
        name: guild.name,
        avatar: guild.iconURL({ extension: 'png' }) || undefined,
      },
      avatar: recipient.avatarURL({ extension: 'png' }) || '',
      id: holder,
    }

    const vc = await agent.createVerifiableCredential({
      save: true,
      proofFormat: 'jwt',
      credential: {
        id: interaction.id,
        credentialSubject,
        issuer: { id: issuer.did },
        issuanceDate: new Date().toISOString(),
        type: ['VerifiableCredential', 'Kudos'],
        '@context': ['https://www.w3.org/2018/credentials/v1'],
      },
    })

    const publicEmbed = getMessageEmbedFromVC(vc, false)

    // Sending this in a DM
    const privateEmbed = getMessageEmbedFromVC(vc, true)

    try {
      const file = Buffer.from(vc.proof.jwt)
      const attachment = new AttachmentBuilder(file, { name: 'verifiable-credential.jwt' })

      await recipient.send({
        content: 'You received kudos',
        embeds: [privateEmbed],
        files: [attachment],
      })
    } catch (e) {
      //
    }

    interaction.reply({
      embeds: [publicEmbed],
    })
  }

