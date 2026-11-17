import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, traderName?: string) {
  const result = await db.insert(users)
    .values({
      uid,
      email,
      traderName: traderName || 'Yohannes Sharew',
    })
    .onConflictDoUpdate({
      target: users.uid,
      set: {
        email,
        updatedAt: new Date().toISOString(),
      },
    })
    .returning();

  return result[0];
}
