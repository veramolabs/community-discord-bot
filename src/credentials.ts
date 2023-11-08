import { SlashCommandBuilder, Interaction, hyperlink } from 'discord.js'
import { agent } from './agent'
import { getMessageEmbedFromVC } from './embeds'
import { discordUserIdToUrl } from './utils'

if (!process.env.DISCORD_BOT_DID_ALIAS) throw Error('DISCORD_BOT_DID_ALIAS is missing')

export const credentialsCommand = new SlashCommandBuilder()
  .setName('credentials')
  .setDescription("Show members credentials")
  .addUserOption((option) =>
    option.setName('member').setDescription('Credential subject').setRequired(false),
  )

export async function credentials(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return
  if (!interaction.inGuild()) return
  if (interaction.commandName !== credentialsCommand.name) return

  const { user, client } = interaction

  const recipient = interaction.options.getUser('member')
  const memberId = recipient ? recipient.id : user.id

  const subject = await agent.didManagerGetOrCreate({
    alias: (process.env.DISCORD_BOT_DID_ALIAS as string) + ':discord:' + memberId,
    provider: 'did:web'
  })

  const credentials = await agent.dataStoreORMGetVerifiableCredentials({
    where: [{ column: 'subject', value: [subject.did] }],
    order: [ { column: 'issuanceDate', direction: 'DESC' }]
  })

  const embeds = credentials.slice(0,5).map(({ verifiableCredential }) =>
    getMessageEmbedFromVC(verifiableCredential, true),
  )
  const profile = hyperlink('Profile', 'https://' + process.env.DISCORD_BOT_DID_ALIAS + '/identifier/' + encodeURIComponent(subject.did))

  if (embeds.length > 0) {
    await interaction.reply({
      content: "Issued credentials. " + profile,
      embeds,
      ephemeral: true
    })
  } else {
    await interaction.reply({
      content: "There are no credentials issued to this user. " + profile,
      ephemeral: true,
    })
  }
}