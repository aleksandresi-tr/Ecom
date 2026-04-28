"use client";

import { TopicDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type TopicInputProps = {
  topics: TopicDto[];
  selectedTopicId: number | null;
  onTopicChange: (topicId: number | null) => void;
  onCreateTopic: (nameKa: string, nameEn: string) => Promise<void>;
  canCreateTopic: boolean;
  labels: {
    title: string;
    hint: string;
    allTopics: string;
    nameKa: string;
    nameEn: string;
    addTopic: string;
    adminOnlyCreate: string;
  };
};

export function TopicInput({
  topics,
  selectedTopicId,
  onTopicChange,
  onCreateTopic,
  canCreateTopic,
  labels,
}: TopicInputProps) {
  const [nameKa, setNameKa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateTopic() {
    if (!nameKa.trim() || !nameEn.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      await onCreateTopic(nameKa.trim(), nameEn.trim());
      setNameKa("");
      setNameEn("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card/95 p-4 shadow-[0_6px_20px_rgba(0,0,0,0.05)] backdrop-blur">
      <div className="mb-3">
        <h3 className="text-sm font-semibold tracking-tight">{labels.title}</h3>
        <p className="text-xs text-muted-foreground">{labels.hint}</p>
      </div>
      <div className={`grid gap-3 ${canCreateTopic ? "md:grid-cols-[1.2fr_1fr_1fr_auto]" : ""}`}>
        <select
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
          value={selectedTopicId ?? ""}
          onChange={(event) =>
            onTopicChange(
              event.target.value ? Number(event.target.value) : null
            )
          }
        >
          <option value="">{labels.allTopics}</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.nameKa} / {topic.nameEn}
            </option>
          ))}
        </select>
        {canCreateTopic ? (
          <>
            <input
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
              value={nameKa}
              onChange={(event) => setNameKa(event.target.value)}
              placeholder={labels.nameKa}
            />
            <input
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
              value={nameEn}
              onChange={(event) => setNameEn(event.target.value)}
              placeholder={labels.nameEn}
            />
            <Button
              type="button"
              className="h-10 rounded-lg px-4"
              onClick={handleCreateTopic}
              disabled={submitting}
            >
              {labels.addTopic}
            </Button>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground md:col-span-3">
            {labels.adminOnlyCreate}
          </div>
        )}
      </div>
    </div>
  );
}
