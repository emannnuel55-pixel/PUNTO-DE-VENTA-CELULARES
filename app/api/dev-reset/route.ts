import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const email = 'celularesreparacion957@gmail.com';
    const user = await db.user.findUnique({
      where: { email }
    });

    if (user) {
      const tempPassword = 'Temporal123.';
      const hashedPassword = '$argon2id$v=19$m=19456,t=3,p=1$TFxV74WxCwx/O/WgU3i9rA$E+pexPvxCD+i2WCJLs/FCxpufZC4+nDgxc9NfOcvI2U';
      
      await db.user.update({
        where: { email },
        data: { password: hashedPassword }
      });

      return NextResponse.json({ success: true, message: "Password reset successful.", newPassword: tempPassword });
    } else {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
