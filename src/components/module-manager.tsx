"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { createModule, updateModule, deleteModule } from "@/lib/actions/module.action";
import AppEditor from "@/components/editor";
import { Plus } from "lucide-react";
import { DropdownMenuDialog } from "./dropdown-menu";
import { AssessmentModal } from "./assessment-modal";
import { ViewModuleModal } from "./view-module-modal";

interface Module {
  id: string;
  title: string;
  content: string | null;
  courseId: string;
  createdAt: Date;
}

interface ModuleManagerProps {
  courseId: string;
  modules: Module[];
  onModulesChange: () => void;
}

export function ModuleManager({
  courseId,
  modules,
  onModulesChange,
}: ModuleManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [selectedModuleForAssessment, setSelectedModuleForAssessment] =
    useState<string | null>(null);
  const [viewingModule, setViewingModule] = useState<Module | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const resetForm = () => {
    setFormData({ title: "", content: "" });
    setEditingModule(null);
  };

  const handleOpenCreateDialog = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setFormData({
        title: module.title,
        content: module.content || "",
      });
    } else {
      resetForm();
    }
    setIsCreateOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateOpen(false);
    resetForm();
  };

  const handleOpenViewModal = (module: Module) => {
    setViewingModule(module);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;

      if (editingModule) {
        result = await updateModule(
          editingModule.id,
          formData.title,
          formData.content || undefined
        );
      } else {
        result = await createModule(
          courseId,
          formData.title,
          formData.content || undefined
        );
      }

      if (result.success) {
        handleCloseCreateDialog();
        onModulesChange();
      } else {
        alert(result.error || "Something went wrong");
      }
    } catch (error) {
      alert("Failed to save module");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return;

    setIsDeleting(moduleId);
    try {
      const result = await deleteModule(moduleId);

      if (result.success) {
        onModulesChange();
      } else {
        alert(result.error || "Failed to delete module");
      }
    } catch (error) {
      alert("Failed to delete module");
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  const getDropdownOptions = (module: Module, isDeleting: string | null) => [
    {
      label: "View",
      onSelect: () => {
        handleOpenViewModal(module);
      },
    },
    {
      label: "Delete",
      onSelect: () => {
        handleDelete(module.id);
      },
      disabled: isDeleting === module?.id,
    },
    {
      label: "Add Assesment",
      onSelect: () => {
        setSelectedModuleForAssessment(module.id);
        setAssessmentModalOpen(true);
      },
      disabled: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Course Modules</h2>
        <Button onClick={() => handleOpenCreateDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Module
        </Button>
      </div>

      {modules.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No modules yet. Create one to get started.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {modules.map((module) => {
            const options = getDropdownOptions(module, isDeleting);
            return (
              <Card key={module.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{module.title}</h3>
                    {/* {module.content && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {module.content}
                    </p>
                  )} */}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <DropdownMenuDialog options={options} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingModule ? "Edit Module" : "Add New Module"}
            </DialogTitle>
            <DialogDescription>
              {editingModule
                ? "Update the module details"
                : "Create a new module for this course"}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex-1 overflow-y-auto"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Module Title *</Label>
              <Input
                id="title"
                placeholder="Enter module title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
              <Label htmlFor="content">Content</Label>
              <div className="flex-1 border rounded-md overflow-hidden">
                <AppEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Add your module content here..."
                />
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseCreateDialog}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Module"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ViewModuleModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        module={viewingModule}
        onModuleUpdated={onModulesChange}
      />

      {selectedModuleForAssessment && (
        <AssessmentModal
          isOpen={assessmentModalOpen}
          onClose={() => {
            setAssessmentModalOpen(false);
            setSelectedModuleForAssessment(null);
          }}
          moduleId={selectedModuleForAssessment}
          onAssessmentCreated={onModulesChange}
        />
      )}
    </div>
  );
}
