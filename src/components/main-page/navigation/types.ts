export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
}

// Data-driven navigation configuration with exactly 4 options
export const DEFAULT_NAV_ITEMS: NavItemConfig[] = [
  { id: "home", label: "Home", href: "#" },
  { id: "work", label: "Work", href: "#work" },
  { id: "about", label: "About", href: "#about" },
  { id: "contact", label: "Contact", href: "#contact" },
];

export interface FloatingNavProps {
  items?: NavItemConfig[];
  activeId?: string;
  initialActiveId?: string;
  onSelect?: (id: string) => void;
  className?: string;
  isRevealed?: boolean;
}

