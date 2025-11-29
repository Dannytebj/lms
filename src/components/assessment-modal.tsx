"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { createAssessment } from "@/lib/actions/module.action";
import { Trash2, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Question {
  id: string;
  content: string;
  correctAnswer: string;
  answers: Array<{ id: string; content: string }>;
}

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  onAssessmentCreated: () => void;
}

export function AssessmentModal({
  isOpen,
  onClose,
  moduleId,
  onAssessmentCreated,
}: AssessmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      content: "",
      correctAnswer: "",
      answers: [
        { id: "1-1", content: "" },
        { id: "1-2", content: "" },
      ],
    },
  ]);

  const resetForm = () => {
    setTitle("");
    setQuestions([
      {
        id: "1",
        content: "",
        correctAnswer: "",
        answers: [
          { id: "1-1", content: "" },
          { id: "1-2", content: "" },
        ],
      },
    ]);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleAddQuestion = () => {
    const newId = String(Math.max(...questions.map((q) => parseInt(q.id))) + 1);
    setQuestions([
      ...questions,
      {
        id: newId,
        content: "",
        correctAnswer: "",
        answers: [
          { id: `${newId}-1`, content: "" },
          { id: `${newId}-2`, content: "" },
        ],
      },
    ]);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== questionId));
    }
  };

  const handleAddAnswer = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newAnswerId = `${questionId}-${q.answers.length + 1}`;
          return {
            ...q,
            answers: [...q.answers, { id: newAnswerId, content: "" }],
          };
        }
        return q;
      })
    );
  };

  const handleDeleteAnswer = (questionId: string, answerId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.filter((a) => a.id !== answerId),
            }
          : q
      )
    );
  };

  const handleQuestionChange = (questionId: string, content: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, content } : q
      )
    );
  };

  const handleAnswerChange = (
    questionId: string,
    answerId: string,
    content: string
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a.id === answerId ? { ...a, content } : a
              ),
            }
          : q
      )
    );
  };

  const handleCorrectAnswerChange = (
    questionId: string,
    correctAnswer: string
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, correctAnswer } : q
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (!title.trim()) {
        alert("Assessment title is required");
        return;
      }

      const validQuestions = questions.filter((q) => q.content.trim());
      if (validQuestions.length === 0) {
        alert("At least one question with content is required");
        return;
      }

      for (const q of validQuestions) {
        if (!q.correctAnswer) {
          alert("Please select a correct answer for each question");
          return;
        }
        const nonEmptyAnswers = q.answers.filter((a) => a.content.trim());
        if (nonEmptyAnswers.length < 2) {
          alert("Each question must have at least 2 answers");
          return;
        }
      }

      const assessmentData = validQuestions.map((q) => {
        // Find the correct answer content by its ID
        const correctAnswerObj = q.answers.find((a) => a.id === q.correctAnswer);
        const correctAnswerContent = correctAnswerObj?.content || "";

        return {
          content: q.content.trim(),
          correctAnswerContent,
          answers: q.answers.filter((a) => a.content.trim()).map((a) => a.content),
        };
      });

      const result = await createAssessment(moduleId, title, assessmentData);

      if (result.success) {
        handleClose();
        onAssessmentCreated();
      } else {
        alert(result.error || "Failed to create assessment");
      }
    } catch (error) {
      alert("Failed to create assessment");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Assessment</DialogTitle>
          <DialogDescription>
            Create an assessment with questions and answers for this module
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex-1 overflow-y-auto px-1"
        >
          <div className="space-y-2">
            <Label htmlFor="assessment-title">Assessment Title *</Label>
            <Input
              id="assessment-title"
              placeholder="Enter assessment title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Questions</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </Button>
            </div>

            <div className="space-y-4">
              {questions.map((question, questionIndex) => (
                <Card key={question.id} className="p-4 space-y-4 bg-slate-50">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-semibold text-sm">
                      Question {questionIndex + 1}
                    </h4>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`question-${question.id}`}>
                      Question Content *
                    </Label>
                    <Input
                      id={`question-${question.id}`}
                      placeholder="Enter your question"
                      value={question.content}
                      onChange={(e) =>
                        handleQuestionChange(question.id, e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Answers *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddAnswer(question.id)}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Answer
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {question.answers.map((answer, answerIndex) => (
                        <div
                          key={answer.id}
                          className="flex items-center gap-2"
                        >
                          <Input
                            placeholder={`Answer ${answerIndex + 1}`}
                            value={answer.content}
                            onChange={(e) =>
                              handleAnswerChange(
                                question.id,
                                answer.id,
                                e.target.value
                              )
                            }
                            className="flex-1"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id={`correct-${question.id}-${answer.id}`}
                              name={`correct-${question.id}`}
                              checked={
                                question.correctAnswer ===
                                answer.id
                              }
                              onChange={() =>
                                handleCorrectAnswerChange(
                                  question.id,
                                  answer.id
                                )
                              }
                              className="w-4 h-4"
                            />
                            <Label
                              htmlFor={`correct-${question.id}-${answer.id}`}
                              className="text-xs whitespace-nowrap"
                            >
                              Correct
                            </Label>
                          </div>
                          {question.answers.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteAnswer(question.id, answer.id)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Assessment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
