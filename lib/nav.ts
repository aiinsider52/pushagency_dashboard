export type PageId = "overview" | "automation" | "pipeline" | "finance" | "activity";

export const PAGE_META: Record<
  PageId,
  { label: string; title: string; subtitle: string }
> = {
  overview: {
    label: "Огляд",
    title: "Automation Control",
    subtitle: "Загальний огляд автоматизації та продакшну",
  },
  automation: {
    label: "Автоматизація",
    title: "Automation",
    subtitle: "Виконання, помилки та статистика по воркфлоу",
  },
  pipeline: {
    label: "Воронка",
    title: "Pipeline",
    subtitle: "Статуси задач та навантаження команди",
  },
  finance: {
    label: "Фінанси",
    title: "Finance",
    subtitle: "Виручка та закриті проєкти з ClickUp",
  },
  activity: {
    label: "Активність",
    title: "Activity",
    subtitle: "Події з Central Activity Log",
  },
};

export function isPageId(v: string | null): v is PageId {
  return v != null && v in PAGE_META;
}
