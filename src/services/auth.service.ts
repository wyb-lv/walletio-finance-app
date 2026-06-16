import { supabaseAuth } from '../config/supabase'

export const authService = {
  async signup(email: string, password: string, name: string) {
    const { data, error } = await supabaseAuth.auth.signUp({
      email, password, options: { data: { full_name: name } },
    })
    if (error) throw new Error(error.message)
    return data
  },
  async login(email: string, password: string) {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    return data
  },
}