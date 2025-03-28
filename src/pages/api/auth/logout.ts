import type { APIRoute } from 'astro'
import { lucia } from '~/lib/lucia'

export const GET: APIRoute = async ({ redirect, cookies }) => {
  const cookie = cookies.get('lucia-astro-trading-journal-session')

  if (cookie) {
    await lucia.invalidateSession(cookie.value)

    cookies.delete('lucia-astro-trading-journal-session')

    console.log('logged out', cookie.value)
  }

  return redirect('/auth')
}
