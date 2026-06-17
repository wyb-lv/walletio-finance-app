import { supabaseAuth, supabaseForUser } from '../config/supabase'
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

async function updateProfile(accessToken: string, name: string, avatar_url: string | null) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db.from('profiles').update({ name, avatar_url }).eq('id', (await supabaseAuth.auth.getUser(accessToken)).data.user?.id).single()
    if (error) throw new Error(error.message)
    const userInfo = await getProfile(accessToken)
    return userInfo
}    

export const profileService = {
    getProfile,
    updateProfile
}