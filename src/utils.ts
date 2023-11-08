import { agent } from "./agent"

export function discordUserIdToUrl(userId: string): string {
  return 'https://discord.com/users/' + userId
}

export async function updateProfileCredentials(did: string, name: string, picture: string) {
  const profileCredential = await agent.dataStoreORMGetVerifiableCredentials({
    where: [
      {
        column: 'type',
        value: ['VerifiableCredential,Profile'],
      },
      {
        column: 'subject',
        value: [did],
      },
    ],
    take: 1,
  })

  if (profileCredential.length === 0) {
    await agent.createVerifiableCredential({
      credential: {
        issuer: {id: did},
        type: ['VerifiableCredential', 'Profile'],
        credentialSubject: {
          id: did,
          name: name,
          picture: picture,
        }, 
      },
      proofFormat: 'jwt',
      save: true,
    })
  } else {
    console.log('profile credential already exists for', did)
  }
}