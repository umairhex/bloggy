import {
  LayoutDashboard,
  FileText,
  PenLine,
  Tag,
  BarChart2,
  Users,
  MessageSquare,
  Settings,
} from "lucide-react";
import { NavSection } from "@/types";

export const navItems: NavSection[] = [
  {
    label: "Workspace",
    links: [
      { icon: LayoutDashboard, label: "Dashboard", active: true },
      { icon: FileText, label: "Posts", badge: "12" },
      { icon: PenLine, label: "Editor" },
      { icon: Tag, label: "Topics" },
    ],
  },
  {
    label: "Insights",
    links: [
      { icon: BarChart2, label: "Analytics" },
      { icon: Users, label: "Subscribers" },
      { icon: MessageSquare, label: "Comments" },
    ],
  },
  {
    label: "Settings",
    links: [
      { icon: Settings, label: "Settings" },
    ],
  },
];

export const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  Published: "default",
  Scheduled: "secondary",
  Draft: "outline",
};
