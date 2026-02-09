import { useParams } from "react-router-dom";
import { RulesEditor } from "@/components/rules/rules-editor";

export default function RulesPage() {
  const { projectId } = useParams();

  if (!projectId) return null;

  return <RulesEditor projectId={projectId} />;
}
