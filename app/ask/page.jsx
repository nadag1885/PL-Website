import PageShell from "@/components/PageShell";
import AskExperience from "@/components/AskExperience";

export const metadata = {
  title: "Ask Powerline — Powerline",
  description:
    "Have an electrical question, a specification to review, or a project challenge? Ask Powerline — start with the question and our engineers help with what comes next.",
};

export default function AskPage() {
  return (
    <PageShell>
      <AskExperience />
    </PageShell>
  );
}
