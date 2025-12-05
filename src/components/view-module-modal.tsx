"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { updateModule, getAssessmentsByModule } from "@/lib/actions/module.action";
import AppEditor from "@/components/editor";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";

interface Module {
  id: string;
  title: string;
  content: string | null;
  courseId: string;
  createdAt: Date;
}

interface Answer {
  id: string;
  content: string;
}

interface Question {
  id: string;
  content: string;
  correctAnswer: string;
  answers: Answer[];
}

interface Assessment {
  id: string;
  title: string;
  questions: Question[];
  createdAt: Date;
}

interface ViewModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module | null;
  onModuleUpdated: () => void;
}

export function ViewModuleModal({
  isOpen,
  onClose,
  module,
  onModuleUpdated,
}: ViewModuleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [expandedAssessments, setExpandedAssessments] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const loadAssessments = async (moduleId: string) => {
    setIsLoading(true);
    try {
      const result = await getAssessmentsByModule(moduleId);
      if (result.success) {
        setAssessments(result.assessments || []);
      }
    } catch (error) {
      console.error("Failed to load assessments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && module) {
      setFormData({
        title: module.title,
        content: module.content || "",
      });
      setIsEditing(false);
      loadAssessments(module.id);
    }
  }, [isOpen, module]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!module) return;

    setIsSaving(true);
    try {
      const result = await updateModule(
        module.id,
        formData.title,
        formData.content || undefined
      );

      if (result.success) {
        setIsEditing(false);
        onModuleUpdated();
      } else {
        alert(result.error || "Failed to save module");
      }
    } catch (error) {
      alert("Failed to save module");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAssessmentExpanded = (assessmentId: string) => {
    const newExpanded = new Set(expandedAssessments);
    if (newExpanded.has(assessmentId)) {
      newExpanded.delete(assessmentId);
    } else {
      newExpanded.add(assessmentId);
    }
    setExpandedAssessments(newExpanded);
  };

  if (!module) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Module Details</DialogTitle>
          <DialogDescription>
            View and edit module information and assessments
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-4">
          {/* Module Title and Content Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Module Information</h3>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
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

                <div className="space-y-2 flex-1 flex flex-col h-96">
                  <Label htmlFor="content">Content</Label>
                  <div className="flex-1 border rounded-md overflow-hidden">
                    <AppEditor
                      content={formData.content}
                      onChange={(content) =>
                        setFormData({ ...formData, content })
                      }
                      placeholder="Add your module content here..."
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        title: module.title,
                        content: module.content || "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Title</Label>
                  <p className="text-lg font-medium mt-1">{module.title}</p>
                </div>

                {formData.content && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Content
                    </Label>
                    <Card className="p-4 mt-2 bg-muted max-h-80 overflow-y-auto">
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                      />
                    </Card>
                  </div>
                )}

                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="w-full"
                >
                  Edit Module
                </Button>
              </div>
            )}
          </div>

          {/* Assessments Section */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Assessments</h3>
              <span className="text-sm text-muted-foreground ml-auto">
                ({assessments.length})
              </span>
            </div>

            {isLoading ? (
              <Card className="p-4 text-center">
                <p className="text-muted-foreground">Loading assessments...</p>
              </Card>
            ) : assessments.length === 0 ? (
              <Card className="p-4 text-center">
                <p className="text-muted-foreground">
                  No assessments added to this module yet.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {assessments.map((assessment) => {
                  const isExpanded = expandedAssessments.has(assessment.id);
                  return (
                    <Card key={assessment.id} className="overflow-hidden">
                      <button
                        onClick={() => toggleAssessmentExpanded(assessment.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors text-left"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{assessment.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {assessment.questions.length} question
                            {assessment.questions.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="border-t p-4 space-y-4 bg-muted/50">
                          {assessment.questions.map((question, qIndex) => (
                            <div key={question.id} className="space-y-2">
                              <div>
                                <span className="text-sm font-semibold text-muted-foreground">
                                  Question {qIndex + 1}
                                </span>
                                <p className="font-medium mt-1">
                                  {question.content}
                                </p>
                              </div>

                              <div className="ml-4 space-y-2">
                                <p className="text-sm font-semibold text-muted-foreground">
                                  Answers:
                                </p>
                                <div className="space-y-1">
                                  {question.answers.map((answer) => (
                                    <div
                                      key={answer.id}
                                      className={`text-sm p-2 rounded border ${
                                        answer.content ===
                                        question.correctAnswer
                                          ? "bg-green-50 border-green-200 text-green-900"
                                          : "bg-gray-50 border-gray-200"
                                      }`}
                                    >
                                      <span className="font-medium">
                                        {answer.content}
                                      </span>
                                      {answer.content ===
                                        question.correctAnswer && (
                                        <span className="ml-2 text-green-700 font-semibold">
                                          ✓ Correct
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="bottom-0 bg-background pt-4 border-t">
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
