import { GITHUB_URL, LINKEDIN_URL } from "../../FloatingContactNav";

export interface SocialLinkItem {
  id: string;
  name: string;
  handle: string;
  href: string;
  ariaLabel: string;
}

export interface SocialControlsProps {
  className?: string;
  items?: SocialLinkItem[];
}

export const DEFAULT_SOCIAL_ITEMS: SocialLinkItem[] = [
  {
    id: "github",
    name: "GitHub",
    handle: "/anshad",
    href: GITHUB_URL,
    ariaLabel: "Anshad on GitHub (opens in a new tab)",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    handle: "/in/anshad",
    href: LINKEDIN_URL,
    ariaLabel: "Anshad on LinkedIn (opens in a new tab)",
  },
];
