import { Card, PageHeader, SectionTitle } from "@/components/ui";

const TOPICS = [
  {
    icon: "◎",
    title: "Why slow breathing helps",
    body: "When you're on edge, breathing tends to get quick and shallow, which keeps your body's alarm system switched on. Slowing down, especially the exhale, helps tell your body it's safe to settle a little.",
  },
  {
    icon: "▣",
    title: "Why noticing your surroundings helps",
    body: "Anxious or foggy moments often pull attention inward, into repeating thoughts. Gently noticing things around you, like sounds or textures, gives your attention somewhere else to rest for a moment.",
  },
  {
    icon: "▽",
    title: "Why writing things down can help",
    body: "Thoughts that stay unspoken tend to keep circling. Putting something into words, even just for yourself, can create a bit of distance from it.",
  },
  {
    icon: "◑",
    title: "Why alternating sounds can help",
    body: "Some approaches use sound that shifts gently between your left and right ear. The idea is that this can make a looping worry feel a little less intense while you sit with it.",
  },
];

export default function ResourcesPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="A little bit about why these help"
        description="No pressure to read all of this. It's here if you're curious about the ideas behind the tools."
      />

      <div className="flex flex-col gap-3">
        {TOPICS.map((topic) => (
          <Card key={topic.title}>
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong"
              >
                {topic.icon}
              </span>
              <div>
                <SectionTitle>{topic.title}</SectionTitle>
                <p className="text-[14px] leading-relaxed">{topic.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-surface-muted border-transparent">
        <SectionTitle>Worth knowing</SectionTitle>
        <p className="text-[14px] text-muted leading-relaxed">
          This is a self-paced, everyday tool, not a diagnosis and not a
          replacement for a therapist or doctor. If things feel heavier than
          you can carry alone right now, the safety plan page has people
          ready to help.
        </p>
      </Card>

      <Card className="bg-surface-muted border-transparent">
        <SectionTitle>Two parts of this app, two storage models</SectionTitle>
        <p className="text-[14px] text-muted leading-relaxed">
          The main check-in (start, day map, results, my data) and the
          journal are processed on this device only. The simpler Check-in
          and Weekly assessment pages are a separate, secondary module and
          store their entries on the server for this prototype, since they
          feed the group-level organization dashboard. Both are described in
          full in the project README.
        </p>
      </Card>
    </div>
  );
}
