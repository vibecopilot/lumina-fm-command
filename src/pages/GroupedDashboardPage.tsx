import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function readParam(searchParams: URLSearchParams, key: string): string | null {
  const value = searchParams.get(key);
  return value && value.length > 0 ? value : null;
}

export default function GroupedDashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);

    const t = readParam(url.searchParams, 't');
    const u = readParam(url.searchParams, 'u');
    const s = readParam(url.searchParams, 's');

    console.log("Token:", t);
    console.log("User:", u);
    console.log("Site:", s);

    if (t) {
      localStorage.setItem('token', t);
    }

    if (u) {
      try {
        const userObject = JSON.parse(decodeURIComponent(u));
        localStorage.setItem('user_details', JSON.stringify(userObject));
      } catch (e) {
        console.error("User parse error", e);
      }
    }

    if (s) {
      localStorage.setItem('active_site', s);
    }

    // Remove params safely
    url.searchParams.delete('t');
    url.searchParams.delete('u');
    url.searchParams.delete('s');

    window.history.replaceState(
      {},
      document.title,
      url.pathname
    );

    navigate('/', { replace: true });

  }, [navigate]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4">
          Syncing your session…
        </h2>
        <p className="text-gray-400 mb-6">
          Preparing your Grouped Dashboard.
        </p>
      </div>
    </div>
  );
}