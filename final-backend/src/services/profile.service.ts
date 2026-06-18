import { supabaseAuth, supabaseForUser, supabaseAdmin } from '../config/supabase'
import type { UserDTO } from '../dto/DTO'

async function getProfile(accessToken: string): Promise<UserDTO> {
    const db = supabaseForUser(accessToken)
    const user = (await supabaseAuth.auth.getUser(accessToken)).data.user
    const email = user?.email
    const { data, error } = await db.from('profiles').select('*').eq('id', user?.id).single()
    if (error) throw new Error(error.message)
    const userInfo: UserDTO = {
        id: data.id,
        email: email!,
        full_name: data.name,
        avatar_url: data.avatar_url
    }
    return userInfo
}

async function updateProfile(accessToken: string, name?: string, avatar_url?: string | null) {
    const db = supabaseForUser(accessToken)
    // Only touch the fields actually provided so a name-only update never wipes the avatar.
    const updates: Record<string, unknown> = {}
    if (name !== undefined) updates.name = name
    if (avatar_url !== undefined) updates.avatar_url = avatar_url
    if (Object.keys(updates).length === 0) return getProfile(accessToken)

    const userId = (await supabaseAuth.auth.getUser(accessToken)).data.user?.id
    const { error } = await db.from('profiles').update(updates).eq('id', userId)
    if (error) throw new Error(error.message)
    return getProfile(accessToken)
}

const AVATAR_BUCKET = 'avatar'

// Detects the image type from the file's magic bytes so the object is stored
// and served with the correct Content-Type (the picker may return webp/png/jpeg).
function detectImageType(buffer: Buffer): { mime: string; ext: string } {
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return { mime: 'image/jpeg', ext: 'jpeg' }
    }
    if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
        return { mime: 'image/png', ext: 'png' }
    }
    if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
        return { mime: 'image/webp', ext: 'webp' }
    }
    if (buffer.length >= 3 && buffer.toString('ascii', 0, 3) === 'GIF') {
        return { mime: 'image/gif', ext: 'gif' }
    }
    return { mime: 'image/jpeg', ext: 'jpeg' }
}

// Uploads the avatar to {userId}/avatar.<ext>, replacing any existing one
// (a single avatar per user), then stores its public URL on the profile.
async function uploadAvatar(accessToken: string, userId: string, base64: string) {
    const db = supabaseForUser(accessToken)
    // Storage writes are blocked by RLS for the anon-JWT client, so use the
    // service-role client when available (falls back to the user client).
    const storage = (supabaseAdmin ?? db).storage
    const cleaned = base64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(cleaned, 'base64')
    const { mime, ext } = detectImageType(buffer)

    // Remove any previous avatar with a different extension so each user keeps
    // exactly one avatar object even when the image format changes.
    const stale = ['jpeg', 'jpg', 'png', 'webp', 'gif']
        .filter((e) => e !== ext)
        .map((e) => `${userId}/avatar.${e}`)
    await storage.from(AVATAR_BUCKET).remove(stale)

    const path = `${userId}/avatar.${ext}`
    const { error: uploadError } = await storage
        .from(AVATAR_BUCKET)
        .upload(path, buffer, { contentType: mime, upsert: true })
    if (uploadError) throw new Error(uploadError.message)

    const { data: pub } = storage.from(AVATAR_BUCKET).getPublicUrl(path)
    // Cache-bust: the path is reused, so vary the URL to force clients to refetch.
    const avatarUrl = `${pub.publicUrl}?v=${Date.now()}`

    const { error } = await db.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId)
    if (error) throw new Error(error.message)
    return getProfile(accessToken)
}

export const profileService = {
    getProfile,
    updateProfile,
    uploadAvatar
}