import { createContext, useContext } from "react";

export type View =
  | "today"
  | "salah"
  | "quran"
  | "habits"
  | "plus"
  | "ramadan"
  | "fasting"
  | "dua"
  | "muhasaba"
  | "names"
  | "settings";

export const NavContext = createContext<(v: View) => void>(() => {});
export const useNav = () => useContext(NavContext);
