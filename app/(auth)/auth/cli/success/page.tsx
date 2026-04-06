import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CLISuccessHandler } from '@/components/auth/CLISuccessHandler';
import { CLISuccessContent } from '@/components/auth/CLISuccessContent';
import { Suspense } from 'react';

// Force dynamic rendering since this page uses authentication
export const dynamic = 'force-dynamic';

export default async function CLISuccessPage() {
  let user;
  
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

    // If not authenticated, redirect to login
    if (!authUser || userError) {
      console.error('User not authenticated:', userError);
      redirect('/login');
    }
    
    user = authUser;
  } catch (error) {
    console.error('Error in CLI Success Page:', error);
    redirect('/login');
  }

  return (
    <>
      <Suspense fallback={null}>
        <CLISuccessHandler />
      </Suspense>
      <CLISuccessContent userEmail={user.email || ''} />
    </>
  );
}
