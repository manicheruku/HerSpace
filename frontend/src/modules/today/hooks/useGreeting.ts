import { useMemo } from "react";

import { formatToday, getGreeting } from "@/modules/today/utils/greeting.utils";
import { useAuth } from "@/shared/auth/AuthContext";

interface UseGreetingResult {
  greeting: string;
  date: string;
  firstName: string;
}

export function useGreeting(): UseGreetingResult {
  const { user } = useAuth();

  return useMemo(() => {
    const now = new Date();
    const firstName = user?.name?.trim().split(/\s+/)[0] || "there";
    return {
      greeting: getGreeting(now),
      date: formatToday(now),
      firstName,
    };
  }, [user?.name]);
}
