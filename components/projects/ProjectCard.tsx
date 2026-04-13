"use client";

import { Project, Task } from "@/types/project";
import { statusMap, calculateProjectIndicators } from "@/lib/project-utils";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";

interface ProjectCardProps {
  project: Project;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onAddTaskClick: (projectId: string) => void;
  onSaveTask: (projectId: string, taskData: any) => void;
  onEditTask: (projectId: string, task: Task) => void;
  onDeleteTask: (projectId: string, taskId: string) => void;
  onCancelEditTask: () => void;
  addingTaskTo: string | null;
  editingTaskId: string | null;
}

export default function ProjectCard({
  project,
  onEditProject,
  onDeleteProject,
  onAddTaskClick,
  onSaveTask,
  onEditTask,
  onDeleteTask,
  onCancelEditTask,
  addingTaskTo,
  editingTaskId,
}: ProjectCardProps) {
  const { totalTasks, completedTasks, avgPlanned, avgActual, isDelayed } = 
    calculateProjectIndicators(project.tasks);

  const editingTask = project.tasks.find(t => t.id === editingTaskId);
  const taskInitialData = editingTask ? {
    name: editingTask.name,
    responsible: editingTask.responsible,
    plannedProgress: editingTask.plannedProgress,
    actualProgress: editingTask.actualProgress,
    status: editingTask.status,
  } : undefined;

  return (
    <div className="border rounded-xl p-5 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{project.name}</h3>
          <p className="text-gray-600 text-sm">Cliente: {project.clientName}</p>
          <p className="text-gray-600 text-sm">Local: {project.location}</p>
          <p className="text-gray-600 text-sm">
            Status: {statusMap[project.status]}
          </p>
          <p className="text-gray-600 text-sm">
            Período: {project.startDate} → {project.endDate}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => onAddTaskClick(project.id)}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            + Adicionar etapa
          </button>
          <button
            onClick={() => onEditProject(project)}
            className="text-amber-600 text-xs font-medium hover:underline"
          >
            Editar projeto
          </button>
          <button
            onClick={() => onDeleteProject(project.id)}
            className="text-red-600 text-xs font-medium hover:underline"
          >
            Excluir projeto
          </button>
        </div>
      </div>

      {/* Indicadores de Progresso */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div>
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Etapas</p>
          <p className="text-lg font-semibold">{totalTasks}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Concluídas</p>
          <p className="text-lg font-semibold text-green-600">{completedTasks}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Progresso Planejado</p>
          <p className="text-lg font-semibold">{avgPlanned}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Progresso Real</p>
          <p className={`text-lg font-semibold ${isDelayed ? 'text-red-600' : 'text-blue-600'}`}>
            {avgActual}%
          </p>
        </div>
        <div className="col-span-2 md:col-span-4 pt-2 border-t border-gray-200">
          <p className={`text-sm font-medium ${isDelayed ? 'text-red-600' : 'text-green-600'}`}>
            {totalTasks === 0 
              ? "Sem etapas cadastradas" 
              : isDelayed 
                ? "⚠️ Atrasado" 
                : "✅ Dentro do planejado"}
          </p>
        </div>
      </div>

      {/* Formulário de Nova Etapa */}
      {addingTaskTo === project.id && (
        <TaskForm
          projectId={project.id}
          editingTaskId={editingTaskId}
          initialData={taskInitialData}
          onSave={(data) => onSaveTask(project.id, data)}
          onCancel={onCancelEditTask}
        />
      )}

      <div className="mt-4 border-t pt-4">
        <h4 className="font-semibold mb-2 text-gray-800">Etapas</h4>

        {project.tasks.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma etapa cadastrada</p>
        ) : (
          <div className="space-y-2">
            {project.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={(t) => onEditTask(project.id, t)}
                onDelete={(taskId) => onDeleteTask(project.id, taskId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
