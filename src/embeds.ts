import { EmbedBuilder } from 'discord.js'
import { VerifiableCredential } from '@veramo/core'
import { IMessage } from '@veramo/core'

export const getMessageEmbedFromVC = (vc: VerifiableCredential, details = false): EmbedBuilder => {
  switch ((<string[]>vc.type).join(',')) {
    case 'VerifiableCredential,Kudos':
      return getKudosEmbedFromVC(vc, details)
    case 'VerifiableCredential,Attendance':
      return getAttendanceEmbedFromVC(vc, details)
    case 'VerifiableCredential,Award':
      return getAwardEmbedFromVC(vc, details)
    case 'VerifiableCredential,Role':
      return getRoleEmbedFromVC(vc, details)
      default:
      return new EmbedBuilder().setTitle((<string[]>vc.type).join(',')).setDescription(JSON.stringify(vc.credentialSubject))
  }
}

export const getKudosEmbedFromVC = (vc: any, details = false): EmbedBuilder => {
  const embed = new EmbedBuilder()
    .setColor('#73C394')
    .setAuthor({
      name: vc.credentialSubject.authorName,
      iconURL: vc.credentialSubject.authorAvatar
    })
    .setTitle('🏆 Kudos to ' + vc.credentialSubject.name)
    .setDescription(vc.credentialSubject.kudos)
    .setThumbnail(vc.credentialSubject.avatar)

  if (details) {
    embed
      .setFooter({
        text: `${vc.credentialSubject.guildName} #${vc.credentialSubject.channelName}`,
        iconURL: vc.credentialSubject.guildAvatar
      })
      .setTimestamp(new Date(vc.issuanceDate))
  }

  return embed
}

export const getAttendanceEmbedFromVC = (vc: any, details = false): EmbedBuilder => {
  const embed = new EmbedBuilder()
    .setColor('#73C394')
    .setAuthor({
      name: vc.credentialSubject.authorName,
      iconURL: vc.credentialSubject.authorAvatar
    })
    .setTitle(vc.credentialSubject.eventName)
    .setDescription(vc.credentialSubject.name)
    .setThumbnail(vc.credentialSubject.avatar)
    .setImage(vc.credentialSubject.eventPicture)


  if (details) {
    embed
    .setFooter({
      text: `${vc.credentialSubject.guildName} #${vc.credentialSubject.channelName}`,
      iconURL: vc.credentialSubject.guildAvatar
    })
    .setTimestamp(new Date(vc.issuanceDate))
  }

  return embed
}

export const getAwardEmbedFromVC = (vc: any, details = false): EmbedBuilder => {
  const embed = new EmbedBuilder()
    .setColor('#73C394')
    .setAuthor({
      name: vc.credentialSubject.authorName,
      iconURL: vc.credentialSubject.authorAvatar
    })
    .setTitle(`Award: ${vc.credentialSubject.emoji} ${vc.credentialSubject.award}`)
    .setDescription(vc.credentialSubject.name)
    .setThumbnail(vc.credentialSubject.avatar)

  if (details) {
    embed
    .setFooter({
      text: `${vc.credentialSubject.guildName} #${vc.credentialSubject.channelName}`,
      iconURL: vc.credentialSubject.guildAvatar
    })
    .setTimestamp(new Date(vc.issuanceDate))
  }

  return embed
}

export const getRoleEmbedFromVC = (vc: any, details = false): EmbedBuilder => {
  const embed = new EmbedBuilder()
    .setColor(vc.credentialSubject.color)
    .setTitle(`Role: ${vc.credentialSubject.name}`)

  if (details) {
    embed
    .setFooter({
      text: `${vc.credentialSubject.guildName} #${vc.credentialSubject.channelName}`,
      iconURL: vc.credentialSubject.guildAvatar
    })
    .setTimestamp(new Date(vc.issuanceDate))
  }

  return embed
}


export const getEmbedFromMessage = (message: IMessage, details = false): EmbedBuilder => {
  const embed = new EmbedBuilder()
    .setTitle(`Message type: ${message.type}`)

  if (details && message.createdAt) {
    embed
      .setTimestamp(parseInt(message.createdAt, 10))
  }

  return embed
}