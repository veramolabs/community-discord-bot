import { IIdentifier } from '@veramo/core'
import Discord from 'discord.js'
import { agent } from './agent'

export const createReactionCredential = async (reaction: Discord.MessageReaction, reactionAuthor: IIdentifier) => {
  if (!reaction.message.author) return
  const credentials = await agent.dataStoreORMGetVerifiableCredentials({
    where: [
      { column: 'type', value: ['VerifiableCredential,Kudos']},
      { column: 'id', value: [reaction.message.id]},
    ]
  })

  if (credentials.length < 0) return

  const credentialSubject = {
    hash: credentials[0].hash,
    emoji: reaction.emoji.name
  }

  await agent.createVerifiableCredential({
    save: true,
    proofFormat: 'jwt',
    credential: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'Reaction'],
      issuer: { id: reactionAuthor.did },
      issuanceDate: new Date().toISOString(),
      credentialSubject
    }
  })


}