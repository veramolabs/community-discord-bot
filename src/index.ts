import { config } from 'dotenv'
config()
require('cross-fetch/polyfill')
import { Client, GatewayIntentBits, User, MessageReaction, Partials } from 'discord.js'
import express from 'express'

import { registerCommands } from './register-commands'

import { exportRoles } from './export-roles'
import { kudos } from './kudos'
import { credentials } from './credentials'
import { attendance } from './attendance'
import { getIdentity } from './profile'
import { createReactionCredential } from './reaction'

// https://stackoverflow.com/a/67799671/10571155
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Reaction],
})

client.on('interactionCreate', exportRoles)
client.on('interactionCreate', kudos)
client.on('interactionCreate', credentials)
client.on('interactionCreate', attendance)

client.on('messageReactionAdd', async (reaction, user) => {
  console.log('reaction', JSON.stringify(reaction, null, 2))
	if (reaction.partial) {
		try {
			await reaction.fetch()
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error)
			return
		}
  }
  console.log('reaction2', JSON.stringify(reaction, null, 2))

  const reactionAuthor = await getIdentity(user as User)
  await createReactionCredential(reaction as MessageReaction, reactionAuthor)
})


client.once('ready', async () => {
  console.log('Ready!')
  await registerCommands()

  console.log(
    `Invite bot: https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_APPLICATION_ID}&scope=bot%20applications.commands&permissions=2415919104`,
  )
})

const app = express()

app.get('/', async (req, res) => {
  res.send('hello')
})

app.listen(process.env.PORT, () => {
  console.log('Express running on ' + process.env.PORT)
  client.login(process.env.DISCORD_TOKEN)
})