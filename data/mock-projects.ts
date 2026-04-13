import { Project } from "@/types/project";

export const mockProjects: Project[] = [
  {
    id: "1",
    name: "Torre Residencial A",
    clientName: "ABC Construtora",
    location: "Recife, PE",
    startDate: "2026-04-01",
    endDate: "2026-12-20",
    status: "in_progress",
    createdAt: new Date().toISOString(),
    tasks: [
      {
        id: "1",
        projectId: "1",
        name: "Fundação",
        responsible: "Augusto",
        plannedProgress: 100,
        actualProgress: 80,
        status: "in_progress",
        startDate: "2026-04-01",
        endDate: "2026-05-15",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        projectId: "1",
        name: "Estrutura",
        responsible: "Willams",
        plannedProgress: 40,
        actualProgress: 20,
        status: "in_progress",
        startDate: "2026-05-16",
        endDate: "2026-07-30",
        createdAt: new Date().toISOString(),
      },
    ],
  },
];
