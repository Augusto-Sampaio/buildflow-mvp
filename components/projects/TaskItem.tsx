import { Task } from "@/types/project";
import { statusMap } from "@/lib/project-utils";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskItem({ task, onEdit, onDelete }: TaskItemProps) {
  return (
    <div className="border rounded p-3 bg-gray-50 flex justify-between items-start">
      <div>
        <p><strong>{task.name}</strong></p>
        <p className="text-sm text-gray-600">Responsável: {task.responsible}</p>
        <p className="text-sm text-gray-600">Status: {statusMap[task.status]}</p>
        <p className="text-sm text-gray-600">Planejado: {task.plannedProgress}%</p>
        <p className="text-sm text-gray-600">Real: {task.actualProgress}%</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => onEdit(task)}
          className="text-amber-600 hover:text-amber-700 text-xs font-medium"
        >
          Editar etapa
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="text-red-500 hover:text-red-700 text-xs font-medium"
        >
          Excluir etapa
        </button>
      </div>
    </div>
  );
}
