'use client';

import { useEffect, useState } from 'react';
import { getCurrentProfile, Profile } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';

export default function AdminPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getCurrentProfile().then(p => {
      if (!p || !p.isAdmin) {
        window.location.href = '/';
        return;
      }
      setProfile(p);
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#04111e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Montserrat, sans-serif',
        color: '#4a7a99',
        fontSize: 13,
      }}>
        Loading...
      </div>
    );
  }

  if (!profile) return null;

  return <AdminShell profile={profile} />;
}
