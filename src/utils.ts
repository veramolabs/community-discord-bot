import { agent } from "./agent"

export function discordUserIdToUrl(userId: string): string {
  return 'https://discord.com/users/' + userId
}
