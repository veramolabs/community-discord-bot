import { createAgent, IDIDManager, IKeyManager, IDataStoreORM } from '@veramo/core'
import { ICredentialIssuer } from '@veramo/credential-w3c'
import { AgentRestClient } from '@veramo/remote-client'

if (!process.env.AGENT_URL) throw Error('AGENT_URL is missing')
if (!process.env.AGENT_API_KEY) throw Error('AGENT_API_KEY is missing')

export const agent = createAgent<IDIDManager & IKeyManager & ICredentialIssuer & IDataStoreORM>({
  plugins: [
    new AgentRestClient({
      url: process.env.AGENT_URL,
      headers: {
        Authorization: 'Bearer ' + process.env.AGENT_API_KEY
      },
      enabledMethods: [
        'keyManagerGetKeyManagementSystems',
        'keyManagerCreate',
        'keyManagerGet',
        'keyManagerDelete',
        'keyManagerImport',
        'keyManagerEncryptJWE',
        'keyManagerDecryptJWE',
        'keyManagerSign',
        'keyManagerSharedSecret',
        'keyManagerSignJWT',
        'keyManagerSignEthTX',
        'didManagerGetProviders',
        'didManagerFind',
        'didManagerGet',
        'didManagerCreate',
        'didManagerGetOrCreate',
        'didManagerImport',
        'didManagerDelete',
        'didManagerAddKey',
        'didManagerRemoveKey',
        'didManagerAddService',
        'didManagerRemoveService',
        'resolveDid',
        'getDIDComponentById',
        'discoverDid',
        'dataStoreGetMessage',
        'dataStoreSaveMessage',
        'dataStoreGetVerifiableCredential',
        'dataStoreSaveVerifiableCredential',
        'dataStoreGetVerifiablePresentation',
        'dataStoreSaveVerifiablePresentation',
        'dataStoreORMGetIdentifiers',
        'dataStoreORMGetIdentifiersCount',
        'dataStoreORMGetMessages',
        'dataStoreORMGetMessagesCount',
        'dataStoreORMGetVerifiableCredentialsByClaims',
        'dataStoreORMGetVerifiableCredentialsByClaimsCount',
        'dataStoreORMGetVerifiableCredentials',
        'dataStoreORMGetVerifiableCredentialsCount',
        'dataStoreORMGetVerifiablePresentations',
        'dataStoreORMGetVerifiablePresentationsCount',
        'handleMessage',
        'packDIDCommMessage',
        'unpackDIDCommMessage',
        'sendDIDCommMessage',
        'sendMessageDIDCommAlpha1',
        'createVerifiableCredential',
        'createVerifiablePresentation',
        'verifyCredential',
        'verifyPresentation',
        'createSelectiveDisclosureRequest',
        'getVerifiableCredentialsForSdr',
        'validatePresentationAgainstSdr',
      ]
    }),
  ],
})
