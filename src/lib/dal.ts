import 'server-only';
import {cache} from 'react';
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { redirect } from 'next/navigation'
// import db from './prisma';
 
export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)
 
  if (!session?.userId) {
    redirect('/auth')
  }
  console.log('Verified session for userId:', session);
  console.log('Verified session for userId:', session.userId);
//   const user = await db.user.findUnique({
//     where: { id: session.userId },
//   });
 
  return session;
})