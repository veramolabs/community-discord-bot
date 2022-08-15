import { config } from 'dotenv'
config()
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'

import { exportRolesCommand } from './export-roles'
import { kudosCommand } from './kudos'
import { credentialsCommand } from './credentials'

if (!process.env.DISCORD_TOKEN) throw Error('DISCORD_TOKEN is missing')
if (!process.env.DISCORD_APPLICATION_ID) throw Error('DISCORD_APPLICATION_ID is missing')
if (!process.env.DISCORD_GUILD_ID) throw Error('DISCORD_GUILD_ID is missing')

const commands = [
  exportRolesCommand.toJSON(),
  kudosCommand.toJSON(),
  credentialsCommand.toJSON(),
]

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN)

export const registerCommands = async () => {
  
  console.log('Registering commands...')
  
  await rest.put(
    // Routes.applicationCommands(
    //   process.env.DISCORD_APPLICATION_ID as string
    // ),
    Routes.applicationGuildCommands(
      process.env.DISCORD_APPLICATION_ID as string,
      process.env.DISCORD_GUILD_ID as string,
    ),
    { body: commands },
  )

  console.log('Successfully registered application commands.')
}
