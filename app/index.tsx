import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setToken } from '@/features/auth/authSlice';
import { getAccessToken } from '@/lib/secureStore';

export default function Index() {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = await getAccessToken();
      if (!mounted) return;
      if (token) {
        dispatch(setToken(token));
        setHref('/(dashboard)/(tabs)/feed');
      } else {
        setHref('/(auth)/login');
      }
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  if (!ready || !href) return null;
  return <Redirect href={href} />;
}
