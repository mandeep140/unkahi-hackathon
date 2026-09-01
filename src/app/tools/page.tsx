import Link from "next/link";
import { TOOLS } from "@/lib/daymap";
import { Card, PageHeader, SectionTitle } from "@/components/ui";

export default function ToolsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="A few things that might help"
        description="Short, simple exercises you can use anytime, with or without a check-in. Pick whichever one sounds right for this moment."
      />

      <div>
        <SectionTitle>Pick what fits</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {TOOLS.map((tool, i) => (
            <Link key={tool.id} href={`/tools/${tool.id}`} className="group">
              <Card lift className="h-full flex flex-col gap-3 hover:border-accent">
                <span
                  aria-hidden
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-lg transition-colors ${
                    i % 2 === 0
                      ? "bg-accent-soft text-accent-strong group-hover:bg-accent group-hover:text-accent-foreground"
                      : "bg-clay-soft text-clay-strong group-hover:bg-clay group-hover:text-white"
                  }`}
                >
                  {tool.icon}
                </span>
                <p className="text-[15px] font-medium">{tool.title}</p>
                <p className="text-[14px] text-muted leading-relaxed">{tool.summary}</p>
                <p className="text-[13px] text-muted mt-auto pt-2">Good for {tool.useWhen}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
