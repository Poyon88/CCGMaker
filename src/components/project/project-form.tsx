import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description: string }) => void;
  defaultValues?: { name: string; description: string };
  mode?: "create" | "edit";
}

export function ProjectForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode = "create",
}: ProjectFormProps) {
  const { t } = useTranslation("project");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: defaultValues ?? { name: "", description: "" },
  });

  const handleFormSubmit = (data: ProjectFormData) => {
    onSubmit({ name: data.name, description: data.description ?? "" });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? t("create.title") : t("create.title")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">{t("create.name")}</Label>
            <Input
              id="project-name"
              placeholder={t("create.name_placeholder")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">
              {t("create.description")}
            </Label>
            <Textarea
              id="project-description"
              placeholder={t("create.description_placeholder")}
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("create.title") && "Cancel"}
            </Button>
            <Button type="submit">{t("create.submit")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
