export type DetailContentType =
  | "origins"
  | "builder"
  | "internship"
  | "automation"
  | "experimenter"
  | "product"
  | "future";

export interface ProjectEntry {
  index: string;
  name: string;
  headline: string;
  status: string;
  statusType?: "deployed" | "released" | "paused" | "prototype";
  capability?: string;
  problem: string;
  solution: string;
  challenge?: string;
  outcome?: string;
  reflection?: string;
  contribution?: string;
  technologies: string[];
}

export interface InternshipDetails {
  headline: string;
  role: string;
  company?: string;
  tasks: string[];
  learnings: string[];
  reflection: string;
  relatedProjectName?: string;
  relatedProjectNote?: string;
}

export interface AutomationStep {
  index: string;
  title: string;
  description: string;
}

export interface ExperimentItem {
  area: string;
  focus: string;
  description: string;
  status: "BUILT" | "EXPERIMENT" | "LEARNING" | "EXPLORING";
  tags: string[];
  takeaway?: string;
}

export interface ProductPillar {
  index: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface JourneyStopData {
  id: string;
  index: number; // 0, 1, 2, 3, 4, 5, 6
  tag: string;
  date?: string;
  title: string;
  teaser: string;
  narrative: string;
  contentType: DetailContentType;
  yPosition: number; // Y coordinate in px along the road
  markerX?: number; // Marker X coordinate

  // Stop 01 payload: Origins & Education
  educationContext?: {
    school?: string;
    college?: string;
    status?: string;
  };

  // Stop 02 payload: The Builder (4 projects)
  projects?: ProjectEntry[];

  // Stop 03 payload: Internship
  internshipDetails?: InternshipDetails;

  // Stop 04 payload: The Automation Mind
  automationWorkflow?: {
    question: string;
    intro: string;
    steps: AutomationStep[];
    tools: string[];
    philosophyPoints?: string[];
  };

  // Stop 05 payload: The Experimenter
  experiments?: ExperimentItem[];

  // Stop 06 payload: The Product Thinker
  productProcess?: {
    philosophy: string;
    stages: ProductPillar[];
    takeaway: string;
  };

  // Stop 07 payload: What I'm Building Toward
  futureVision?: {
    academicStatus: string;
    focusAreas: string[];
    closingStatement: string;
    actionLabel: string;
  };
}

export type StopState = "approaching" | "active" | "passed";
