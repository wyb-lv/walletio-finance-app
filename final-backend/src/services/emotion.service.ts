import { supabaseForUser } from '../config/supabase'

// Emotions are a global, read-only lookup table (not user-scoped),
// referenced by expenses via emotion_id.
async function getEmotions(accessToken: string) {
    const db = supabaseForUser(accessToken)
    const { data, error } = await db
        .from('emotions')
        .select('*')
        .order('id', { ascending: true })
    if (error) throw new Error(error.message)
    return data
}

export const emotionService = {
    getEmotions,
}
