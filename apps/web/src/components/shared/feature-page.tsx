import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Metric = {
  label: string;
  value: string;
  helper: string;
};

type Section = {
  title: string;
  description: string;
  items: string[];
};

type FeaturePageProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction?: string;
  secondaryAction?: string;
  metrics?: Metric[];
  sections: Section[];
};

export function FeaturePage({
  eyebrow = 'SkillMango AI',
  title,
  description,
  primaryAction = 'Create new',
  secondaryAction = 'View analytics',
  metrics = [],
  sections,
}: FeaturePageProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-card dark:border-border-dark sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-mango-500">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="rounded-xl bg-mango-500 px-5 py-3 text-sm font-semibold text-white shadow-glow-mango transition hover:bg-mango-600">
              {primaryAction}
            </button>
            <button className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted">
              {secondaryAction}
            </button>
          </div>
        </div>
      </section>

      {metrics.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{metric.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{metric.helper}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      <section className="grid gap-5 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">{section.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-mango-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
