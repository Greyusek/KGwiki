export const LANGUAGES = ["ru", "en"] as const;

export type Language = (typeof LANGUAGES)[number];

type Dictionary = Record<string, string>;

export const translations: Record<Language, Dictionary> = {
  ru: {
    "nav.home": "Главная",
    "nav.activities": "Активности",
    "nav.plans": "Планы",
    "nav.profile": "Профиль",
    "nav.admin": "Админ",
    "nav.myActivities": "Мои активности",
    "nav.login": "Войти",
    "nav.register": "Регистрация",
    "button.save": "Сохранить",
    "button.delete": "Удалить",
    "button.add": "Добавить",
    "button.cancel": "Отмена",
    "button.edit": "Изменить",
    "button.saving": "Сохранение...",
    "activity.form.title": "Название",
    "activity.form.ageGroup": "Возрастная группа",
    "activity.form.summary": "Краткое описание",
    "activity.form.goal": "Цель",
    "activity.form.steps": "Шаги",
    "activity.form.materials": "Материалы",
    "activity.form.goalHelp": "Опишите, какого результата должны достичь дети.",
    "activity.form.stepsHelp": "Каждый шаг с новой строки в порядке проведения.",
    "activity.form.materialsHelp": "Перечислите используемые материалы, по одному на строку.",
    "plan.form.type": "Тип плана",
    "plan.form.title": "Название",
    "plan.form.visibility": "Видимость",
    "plan.form.day": "День",
    "plan.form.week": "Неделя",
    "plan.form.titleHelp": "Краткое понятное название (минимум 2 символа).",
    "empty.activities": "Пока нет активностей.",
    "empty.plans": "Пока нет планов.",
    "empty.materials": "Пока нет материалов.",
    "message.success.saved": "Успешно сохранено.",
    "message.error.generic": "Произошла ошибка. Попробуйте снова.",
    "message.validation.checkFields": "Проверьте заполнение полей."
  },
  en: {
    "nav.home": "Home",
    "nav.activities": "Activities",
    "nav.plans": "Plans",
    "nav.profile": "Profile",
    "nav.admin": "Admin",
    "nav.myActivities": "My Activities",
    "nav.login": "Login",
    "nav.register": "Register",
    "button.save": "Save",
    "button.delete": "Delete",
    "button.add": "Add",
    "button.cancel": "Cancel",
    "button.edit": "Edit",
    "button.saving": "Saving...",
    "activity.form.title": "Title",
    "activity.form.ageGroup": "Age group",
    "activity.form.summary": "Summary",
    "activity.form.goal": "Goal",
    "activity.form.steps": "Steps",
    "activity.form.materials": "Materials",
    "activity.form.goalHelp": "Explain what children should achieve.",
    "activity.form.stepsHelp": "One step per line in facilitation order.",
    "activity.form.materialsHelp": "List used materials, one per line.",
    "plan.form.type": "Plan type",
    "plan.form.title": "Title",
    "plan.form.visibility": "Visibility",
    "plan.form.day": "Day",
    "plan.form.week": "Week",
    "plan.form.titleHelp": "Use a concise plan name (minimum 2 characters).",
    "empty.activities": "No activities yet.",
    "empty.plans": "No plans yet.",
    "empty.materials": "No materials yet.",
    "message.success.saved": "Saved successfully.",
    "message.error.generic": "Something went wrong. Please try again.",
    "message.validation.checkFields": "Please check the form fields."
  }
};

export const DEFAULT_LANGUAGE: Language = "ru";
export const LANGUAGE_STORAGE_KEY = "kgwiki.language";

export function t(key: string, language: Language): string {
  return translations[language][key] ?? key;
}

export function resolveLanguage(value: string | null | undefined): Language {
  return value === "en" || value === "ru" ? value : DEFAULT_LANGUAGE;
}
