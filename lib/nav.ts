export type PageId = "overview" | "automation" | "pipeline" | "finance" | "activity";

export const PAGE_META: Record<
  PageId,
  { label: string; title: string; subtitle: string }
> = {
  overview: {
    label: "Огляд",
    title: "Привіт, команда",
    subtitle: "Загальний огляд автоматизації та продакшну",
  },
  automation: {
    label: "Автоматизація",
    title: "Автоматизація n8n",
    subtitle: "Виконання, помилки та статистика по воркфлоу",
  },
  pipeline: {
    label: "Воронка",
    title: "Продакшн-воронка",
    subtitle: "Статуси задач та навантаження команди",
  },
  finance: {
    label: "Фінанси",
    title: "Фінанси",
    subtitle: "Виручка та закриті проєкти з ClickUp",
  },
  activity: {
    label: "Активність",
    title: "Живий feed",
    subtitle: "Події з Central Activity Log",
  },
};

export function isPageId(v: string | null): v is PageId {
  return v != null && v in PAGE_META;
}
