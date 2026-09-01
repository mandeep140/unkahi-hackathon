"use client";

import { useState } from "react";
import { Badge, Button, Card, EmptyState, PageHeader, SectionTitle, TextArea } from "@/components/ui";
import { addJournalEntry, deleteJournalEntry, getJournalEntries, type JournalEntry } from "@/lib/localStore";
import { analyzeSentiment } from "@/lib/signals";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => getJournalEntries());
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleSave() {
    if (!text.trim()) return;
    setSaving(true);
    const sentiment = analyzeSentiment(text.trim());
    addJournalEntry(text.trim(), sentiment);
    setEntries(getJournalEntries());
    setText("");
    setSaving(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  function handleDelete(id: string) {
    deleteJournalEntry(id);
    setEntries(getJournalEntries());
    setConfirmDeleteId(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="A space just for you"
        description="Write whatever comes to mind, without worrying about how it sounds. This stays on this device."
      />

      <Card>
        <SectionTitle>Write something</SectionTitle>
        <TextArea
          rows={6}
          placeholder="Start wherever feels easiest..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-3 flex items-center gap-3">
          <Button disabled={!text.trim()} loading={saving} onClick={handleSave}>
            {saving ? "Saving..." : "Save"}
          </Button>
          {justSaved && (
            <span className="text-[14px] text-accent-strong animate-fade-up">Saved.</span>
          )}
        </div>
      </Card>

      <div>
        <SectionTitle>What you&apos;ve written before</SectionTitle>
        {entries.length === 0 ? (
          <EmptyState
            title="Nothing here yet."
            description="Whenever you're ready, this is a good place to start."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <Card key={entry.id}>
                <div className="flex items-center justify-between mb-2 gap-3">
                  <span className="text-[13px] text-muted">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge tone="accent">{entry.sentiment}</Badge>
                    {confirmDeleteId === entry.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-[13px] font-medium text-white bg-danger rounded-full px-3 py-1.5 hover:opacity-90 transition-opacity focus-ring"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[13px] font-medium text-muted hover:text-foreground px-2 py-1.5 focus-ring rounded-full"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(entry.id)}
                        aria-label="Delete this entry"
                        className="inline-flex items-center justify-center h-7 w-7 rounded-full text-muted hover:text-danger hover:bg-danger-soft transition-colors focus-ring"
                      >
                        <span aria-hidden className="text-[14px]">✕</span>
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[15px] whitespace-pre-wrap leading-relaxed">
                  {entry.text}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
