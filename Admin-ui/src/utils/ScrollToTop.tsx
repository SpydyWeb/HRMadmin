import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

export default function ScrollToTop() {
  const router = useRouter();

  useEffect(() => {
    const unsub = router.subscribe("onResolved", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    return () => unsub();
  }, [router]);

  return null;
}
