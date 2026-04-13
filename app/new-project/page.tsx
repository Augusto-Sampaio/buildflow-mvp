"use client";

import { useEffect, useState } from "react";
import { Project, Task } from "@/types/project";
import ProjectForm from "@/components/projects/ProjectForm";
import ProjectCard from "@/components/projects/ProjectCard";

const STORAGE_KEY = "construction-projects";

export default function NewProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Estado para controle de formulários de etapa
  const [addingTaskTo, setAddingTaskTo] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  useEffect(() => {
    const savedProjects = localStorage.getItem(STORAGE_KEY);

    if (savedProjects) {
      try {
        const parsedProjects: Project[] = JSON.parse(savedProjects);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProjects(parsedProjects);
      } catch (error) {
        console.error("Erro ao carregar projetos do localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const handleProjectSubmit = (data: any) => {
    if (editingProjectId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProjectId ? { ...p, ...data } : p
        )
      );
      setEditingProjectId(null);
    } else {
      const newProject: Project = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
        tasks: [],
      };
      setProjects((prev) => [newProject, ...prev]);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProjectId(project.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
  };

  const handleSaveTask = (projectId: string, taskData: any) => {
    if (editingTaskId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === editingTaskId ? { ...t, ...taskData } : t
                ),
              }
            : p
        )
      );
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        projectId,
        ...taskData,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      };

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p
        )
      );
    }

    setAddingTaskTo(null);
    setEditingTaskId(null);
  };

  const handleEditTask = (projectId: string, task: Task) => {
    setAddingTaskTo(projectId);
    setEditingTaskId(task.id);
  };

  const handleCancelEditTask = () => {
    setAddingTaskTo(null);
    setEditingTaskId(null);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const handleDeleteTask = (projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
          : p
      )
    );
  };

  const editingProject = projects.find((p) => p.id === editingProjectId);

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold">
          {editingProjectId ? "Editar Projeto" : "Novo Projeto"}
        </h1>
        <p className="text-gray-600 mt-2">
          {editingProjectId
            ? "Corrija os dados do projeto abaixo."
            : "Página de teste para cadastrar e visualizar projetos localmente."}
        </p>
      </div>

      <ProjectForm
        onSubmit={handleProjectSubmit}
        initialData={editingProject}
        isEditing={!!editingProjectId}
        onCancel={handleCancelEdit}
      />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Projetos cadastrados</h2>

        {projects.length === 0 ? (
          <p className="text-gray-600">Nenhum projeto cadastrado ainda.</p>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEditProject={handleEditProject}
                onDeleteProject={handleDeleteProject}
                onAddTaskClick={(id) => setAddingTaskTo(id)}
                onSaveTask={handleSaveTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onCancelEditTask={handleCancelEditTask}
                addingTaskTo={addingTaskTo}
                editingTaskId={editingTaskId}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
