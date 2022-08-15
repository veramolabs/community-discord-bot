import { config } from 'dotenv'
config()
require('cross-fetch/polyfill')
import { Client, GatewayIntentBits } from 'discord.js'

import { exportRoles } from './export-roles'
import { kudos } from './kudos'
import { credentials } from './credentials'

// https://stackoverflow.com/a/67799671/10571155
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
})

client.on('interactionCreate', exportRoles)
client.on('interactionCreate', kudos)
client.on('interactionCreate', credentials)

client.once('ready', () => {
  console.log('Ready!')
  console.log(
    `Invite bot: https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_APPLICATION_ID}&scope=bot%20applications.commands&permissions=2415919104`,
  )
})

client.login(process.env.DISCORD_TOKEN)
