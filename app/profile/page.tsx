"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import ProfileForm from '@/components/profile/ProfileForm';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/login');
          return;
        }
        setUser(session.user);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setProfile(profileData);
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9B1B1B]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
        <ProfileForm user={user} profile={profile} />
      </div>
    </div>
  );
}