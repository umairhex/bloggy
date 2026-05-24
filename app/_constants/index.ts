import {
  LayoutDashboard,
  FileText,
  PenLine,
  Tag,
  Settings,
} from "lucide-react";
import { NavSection } from "@/types";

export const navItems: NavSection[] = [
  {
    label: "Workspace",
    links: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/" },
      { icon: FileText, label: "Projects", badge: "12", href: "/projects" },
      { icon: PenLine, label: "Editor", href: "/editor" },
      { icon: Tag, label: "Publishing", href: "#" },
    ],
  },
  {
    label: "Configuration",
    links: [
      { icon: Settings, label: "Settings", href: "#" },
    ],
  },
];

export const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  Published: "default",
  Scheduled: "secondary",
  Draft: "outline",
};
