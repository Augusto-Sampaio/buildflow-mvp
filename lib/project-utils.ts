export const statusMap: Record<string, string> = {
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  completed: "Concluído",
  delayed: "Atrasado",
};

export function calculateProjectIndicators(tasks: any[]) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  
  const avgPlanned = totalTasks > 0
    ? Math.round(tasks.reduce((acc, t) => acc + t.plannedProgress, 0) / totalTasks)
    : 0;
    
  const avgActual = totalTasks > 0
    ? Math.round(tasks.reduce((acc, t) => acc + t.actualProgress, 0) / totalTasks)
    : 0;
    
  const isDelayed = avgActual < avgPlanned;
  
  return {
    totalTasks,
    completedTasks,
    avgPlanned,
    avgActual,
    isDelayed
  };
}
