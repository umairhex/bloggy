import { Project } from "@/types";

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Acme Corporate Blog",
    description: "Production database for our primary marketing site and blog articles.",
    mongodbUri: "mongodb+srv://admin:secret123@acme-prod.mongodb.net/blog",
    createdAt: "May 12, 2026",
    category: "production",
    isArchived: false,
    connectionStatus: "untested",
  },
  {
    id: "proj-2",
    name: "SaaS Portfolio Site",
    description: "Staging database for the corporate portal and user feedback modules.",
    mongodbUri: "mongodb+srv://tester:pass456@portfolio-stage.mongodb.net/feedback",
    createdAt: "Apr 28, 2026",
    category: "staging",
    isArchived: false,
    connectionStatus: "untested",
  },
  {
    id: "proj-3",
    name: "Personal Travel Journal",
    description: "Personal storytelling workspace for travel experiences and photologs.",
    mongodbUri: "mongodb://localhost:27017/journal",
    createdAt: "May 20, 2026",
    category: "development",
    isArchived: false,
    connectionStatus: "untested",
  },
];
