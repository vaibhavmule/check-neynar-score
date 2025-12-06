"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { APP_URL } from "~/lib/constants";
import { Button } from "~/components/ui/Button";
import { OrangeScoreCard } from "~/components/ui/OrangeScoreCard";
import { GlassScoreCard } from "~/components/ui/GlassScoreCard";

interface UserData {
  fid: number;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  score: number | null;
}

export function SharePageClient({ fid }: { fid: number }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const design = (searchParams.get('design') || 'orange') as 'orange' | 'glass';

  useEffect(() => {
    async function fetchUser() {
      try {
        const baseUrl = APP_URL || window.location.origin;
        const response = await fetch(`${baseUrl}/api/users?fids=${fid}`);
        if (response.ok) {
          const data = await response.json();
          if (data.users?.[0]) {
            setUser(data.users[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [fid]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={design === 'glass' 
        ? { background: 'radial-gradient(circle at 50% 0%, #1a1a1a 0%, #000 100%)' }
        : { background: 'linear-gradient(to bottom right, rgba(255, 122, 61, 0.1), rgba(138, 104, 255, 0.1))' }
      }
    >
      <div className="w-full max-w-md">
        {design === 'orange' ? (
          <OrangeScoreCard
            fid={user?.fid || fid}
            score={user?.score ?? undefined}
            username={user?.username || user?.display_name}
            pfpUrl={user?.pfp_url}
            loading={loading}
            error={!loading && !user ? 'User not found' : null}
            design={design}
          />
        ) : (
          <GlassScoreCard
            fid={user?.fid || fid}
            score={user?.score ?? undefined}
            username={user?.username || user?.display_name}
            pfpUrl={user?.pfp_url}
            loading={loading}
            error={!loading && !user ? 'User not found' : null}
            design={design}
          />
        )}
        
        {/* Launch Mini App Button */}
        <div className="mt-6 text-center">
          <a href={APP_URL || "/"}>
            <Button variant="primary" size="lg" className="w-full max-w-md mx-auto">
              Launch Mini App
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

