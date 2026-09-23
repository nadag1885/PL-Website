import PageShell from "@/components/PageShell";
import AskExperience from "@/components/AskExperience";

export const metadata = {
  title: "Ask Powerline — Powerline",
  description:
    "Chat with the Powerline assistant about products, specifications, standards, or a project challenge — instant answers, with our engineers following up when it counts.",
};

export default function AskPage() {
  return (
    // No floating robot here: this page already leads with the assistant avatar
    // and IS the chat, so a second robot would duplicate it and overlap the panel.
    <PageShell robot={false}>
      <AskExperience />
    </PageShell>
  );
}
