"use client";

import { useState, useEffect } from "react";
import { ProjectStatus } from "@/types/project";
import { statusMap } from "@/lib/project-utils";

interface ProjectFormProps {
  onSubmit: (data: {
    name: string;
    clientName: string;
    location: string;
    startDate: string;
    endDate: string;
    status: ProjectStatus;
  }) => void;
  initialData?: {
    name: string;
    clientName: string;
    location: string;
    startDate: string;
    endDate: string;
    status: ProjectStatus;
  };
  isEditing: boolean;
  onCancel: () => void;
}

export default function ProjectForm({
  onSubmit,
  initialData,
  isEditing,
  onCancel,
}: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [clientName, setClientName] = useState(initialData?.clientName || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [status, setStatus] = useState<ProjectStatus>(initialData?.status || "not_started");

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialData.name);
      setClientName(initialData.clientName);
      setLocation(initialData.location);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate);
      setStatus(initialData.status);
    } else {
      setName("");
      setClientName("");
      setLocation("");
      setStartDate("");
      setEndDate("");
      setStatus("not_started");
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      clientName,
      location,
      startDate,
      endDate,
      status,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white border rounded-xl p-6 shadow-sm"
    >
      <div>
        <label className="block font-medium mb-2">Nome do Projeto</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
          placeholder="Ex: Torre Residencial A"
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Cliente</label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
          placeholder="Ex: ABC Construtora"
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Local</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
          placeholder="Ex: Recife, PE"
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-2">Data de Início</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Data de Fim</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          className="w-full border rounded-lg px-4 py-2"
        >
          {Object.entries(statusMap).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          {isEditing ? "Salvar Alterações" : "Criar Projeto"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium"
          >
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}
