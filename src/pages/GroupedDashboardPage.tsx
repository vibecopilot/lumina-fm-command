import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

export default function UrlParamSync({ children }: Props) {
  const location = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    const t = searchParams.get("t");
    const u = searchParams.get("u");
    const s = searchParams.get("s");

    console.log("SSO Sync Running");

    // Save token
    if (t) {
      localStorage.setItem("token", t);
      console.log("Token saved:", t);
    }

    // Save user
    if (u) {
      try {
        const decoded = decodeURIComponent(u);
        const userObject = JSON.parse(decoded);

        localStorage.setItem(
          "user_details",
          JSON.stringify(userObject)
        );

        console.log("User saved:", userObject);

      } catch (error) {
        console.error("User parse error:", error);
      }
    }

    // Save site
    if (s) {
      localStorage.setItem("active_site", s);
      console.log("Site saved:", s);
    }

    // Clean URL
    if (t || u || s) {
      searchParams.delete("t");
      searchParams.delete("u");
      searchParams.delete("s");

      const cleanUrl =
        location.pathname +
        (searchParams.toString()
          ? `?${searchParams.toString()}`
          : "") +
        location.hash;

      window.history.replaceState({}, document.title, cleanUrl);
    }

    setReady(true);

  }, []);

  // Wait until localStorage is set
  if (!ready) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">
          Syncing session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}