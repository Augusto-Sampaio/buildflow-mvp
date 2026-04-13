"use client";

import { useState, useEffect } from "react";
import { TaskStatus } from "@/types/project";
import { statusMap } from "@/lib/project-utils";

interface TaskFormProps {
  projectId: string;
  editingTaskId: string | null;
  initialData?: {
    name: string;
    responsible: string;
    plannedProgress: number;
    actualProgress: number;
    status: TaskStatus;
  };
  onSave: (data: {
    name: string;
    responsible: string;
    plannedProgress: number;
    actualProgress: number;
    status: TaskStatus;
  }) => void;
  onCancel: () => void;
}

export default function TaskForm({
  editingTaskId,
  initialData,
  onSave,
  onCancel,
}: TaskFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [responsible, setResponsible] = useState(initialData?.responsible || "");
  const [planned, setPlanned] = useState(initialData?.plannedProgress || 0);
  const [actual, setActual] = useState(initialData?.actualProgress || 0);
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || "not_started");

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialData.name);
      setResponsible(initialData.responsible);
      setPlanned(initialData.plannedProgress);
      setActual(initialData.actualProgress);
      setStatus(initialData.status);
    }
  }, [initialData]);

  const handleSave = () => {
    onSave({
      name,
      responsible,
      plannedProgress: planned,
      actualProgress: actual,
      status,
    });
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-blue-50 space-y-4">
      <h4 className="font-medium">
        {editingTaskId ? "Editar Etapa" : "Nova Etapa"}
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Nome da etapa"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        />
        <input
          type="text"
          placeholder="Responsável"
          value={responsible}
          onChange={(e) => setResponsible(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        />
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Plan %</label>
          <input
            type="number"
            value={planned}
            onChange={(e) => setPlanned(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm w-16"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Real %</label>
          <input
            type="number"
            value={actual}
            onChange={(e) => setActual(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm w-16"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          className="border rounded px-2 py-1 text-sm"
        >
          {Object.entries(statusMap).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          {editingTaskId ? "Salvar Alterações" : "Salvar Etapa"}
        </button>
        <button
          onClick={onCancel}
          className="text-gray-600 text-sm hover:underline"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
