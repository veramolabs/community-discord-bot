import { SlashCommandBuilder, Interaction } from 'discord.js'
import { agent } from './agent'
import { getMessageEmbedFromVC } from './embeds'

if (!process.env.DISCORD_BOT_DID_ALIAS) throw Error('DISCORD_BOT_DID_ALIAS is missing')

export const credentialsCommand = new SlashCommandBuilder()
  .setName('credentials')
  .setDescription("Show members credentials")
  .addUserOption((option) =>
    option.setName('member').setDescription('Credential subject').setRequired(false),
  )

export async function credentials(interaction: Interaction) {
  if (!interaction.isCommand()) return
  if (!interaction.inGuild()) return
  if (interaction.commandName !== credentialsCommand.name) return

  const { user, client } = interaction

  const recipient = interaction.options.getUser('member')
  const memberId = recipient ? recipient.id : user.id

  const holder = await agent.didManagerGetOrCreate({
    alias: process.env.DISCORD_BOT_DID_ALIAS + ':discord:' + memberId,
    provider: 'did:web',
  })

  const credentials = await agent.dataStoreORMGetVerifiableCredentials({
    where: [{ column: 'subject', value: [holder.did] }],
    order: [ { column: 'issuanceDate', direction: 'DESC' }]
  })

  const embeds = credentials.slice(0,5).map(({ verifiableCredential }) =>
    getMessageEmbedFromVC(verifiableCredential, true),
  )

  if (embeds.length > 0) {
    await interaction.reply({
      content: "Issued credentials",
      embeds,
      ephemeral: true
    })
  } else {
    await interaction.reply({
      content: "There are no credentials issued to this user",
      ephemeral: true,
    })
  }
}