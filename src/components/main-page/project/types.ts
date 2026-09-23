import project01Img from "../../../assets/project-01.jpg";
import project02Img from "../../../assets/project-02.jpg";
import project03Img from "../../../assets/project-03.jpg";

export interface ProjectItem {
  id: string;
  index: string;
  title: string;
  category?: string;
  description?: string;
  image?: string;
  href?: string;
}

export interface ProjectCardProps {
  project: ProjectItem;
  isActive?: boolean;
  isOpen?: boolean;
  index?: number;
  position?: ProjectCardPosition;
  shouldReduceMotion?: boolean;
}

export interface ProjectFileHubProps {
  className?: string;
  projects?: ProjectItem[];
  onOpenChange?: (isOpen: boolean) => void;
}

export interface ConstellationMetrics {
  distanceTop: number;
  distanceLower: number;
  distanceSide: number;
}

export interface ProjectCardPosition {
  x: number;
  y: number;
  delayIndex: number;
  rotateX?: number;
  rotateY?: number;
  delay?: number;
}

export interface ConstellationPositionConfig {
  id: string;
  calcPosition: (metrics: ConstellationMetrics) => { x: number; y: number };
  delayIndex: number;
  rotateX: number;
  rotateY: number;
  delay: number;
}

export const CONSTELLATION_CONFIG: ConstellationPositionConfig[] = [
  {
    id: "project-01",
    calcPosition: (m) => ({ x: 0, y: -m.distanceTop }),
    delayIndex: 0,
    rotateX: 0,
    rotateY: 0,
    delay: 0.24,
  },
  {
    id: "project-02",
    calcPosition: (m) => ({ x: -m.distanceSide, y: -m.distanceLower }),
    delayIndex: 1,
    rotateX: 0,
    rotateY: 0,
    delay: 0.24,
  },
  {
    id: "project-03",
    calcPosition: (m) => ({ x: m.distanceSide, y: -m.distanceLower }),
    delayIndex: 2,
    rotateX: 0,
    rotateY: 0,
    delay: 0.24,
  },
];

export const DEFAULT_PROJECT_ITEMS: ProjectItem[] = [
  {
    id: "project-01",
    index: "01",
    title: "Brutalist Pavilion",
    category: "Architecture / Systems",
    description: "Monolithic concrete spatial geometry, brutalist framing, and editorial light studies.",
    image: project01Img,
    href: undefined,
  },
  {
    id: "project-02",
    index: "02",
    title: "Monochrome Hardware",
    category: "Product / Design",
    description: "Precision-milled matte aluminum tactile amplifier with high-fidelity acoustics.",
    image: project02Img,
    href: undefined,
  },
  {
    id: "project-03",
    index: "03",
    title: "Algorithmic Mesh",
    category: "AI / Automation",
    description: "Generative mathematical wireframe installation suspended in deep museum space.",
    image: project03Img,
    href: undefined,
  },
];
