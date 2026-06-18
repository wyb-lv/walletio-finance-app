import { supabaseAuth, supabaseFresh } from '../config/supabase'

export const authService = {
  async signup(email: string, password: string, name: string) {
    const { data, error } = await supabaseAuth.auth.signUp({
      email, password, options: { data: { full_name: name } },
    })
    if (error) throw new Error(error.message)
    return data
  },
  async login(email: string, password: string) {
    const { data, error } = (await supabaseAuth.auth.signInWithPassword({ email, password }))
    if (error) throw new Error(error.message)
    // Return the full session (access_token, refresh_token, expiry, user) for the
    // client to call the API and later refresh without re-entering credentials.
    return data.session
  },
  async refresh(refreshToken: string) {
    // Exchange a still-valid refresh token for a fresh session (new access_token
    // and a rotated refresh_token). Works even when the access token has expired,
    // which is why this endpoint must stay public.
    const client = supabaseFresh()
    const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken })
    if (error) throw new Error(error.message)
    if (!data.session) throw new Error('Invalid refresh token')
    return data.session
  },
  async changePassword(accessToken: string, oldPassword: string, newPassword: string) {
    // Resolve the caller's email from their token so we can verify the old password.
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(accessToken)
    const email = userData.user?.email
    if (userError || !email) throw new Error('Unable to load current user')

    // Verify the old password on an isolated client. A successful sign-in gives this
    // client a session for the user, which we then reuse to set the new password.
    const client = supabaseFresh()
    const { error: signInError } = await client.auth.signInWithPassword({ email, password: oldPassword })
    if (signInError) throw new Error('Old password is incorrect')

    const { error: updateError } = await client.auth.updateUser({ password: newPassword })
    if (updateError) throw new Error(updateError.message)
    return { message: 'Password updated' }
  },
}