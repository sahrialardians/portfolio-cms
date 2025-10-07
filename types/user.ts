import { SocialLink } from "./socialLink"

export type User = {
    id: string,
    clerk_user_id: string,
    full_name: string,
    email: string,
    bio: string,
    avatar_url: string
    social_links: SocialLink[]
}