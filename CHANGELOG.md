# Changelog

## 1.1.0

- `Feedback.setLocale` / `getLocale` — מילון טקסטים מובנים. ברירת מחדל עברית; `'en'` מובנה; שפה אחרת כאובייקט `feedbackLocale`.
- קטלוג לא ממוזער: `src/feedback.locales.js` → `dist/feedback.locales.js`, ייצוא `feedback-ui/locales`.

## 1.0.0

- דיאלוגים (`alert` / `confirm` / `prompt` / `menu` / `selector` / `form`) עם תור, טוסטים, ESM + IIFE.
- `alert` / `confirm` / `prompt` מקבלים מחרוזת או אובייקט. אין `simple*`.
- `size`: `sm` | `md` | `lg` לכל דיאלוג (`md` כברירת מחדל).
- `Feedback.closeAll()` — סגירת הדיאלוג הפתוח וריקון התור. טוסטים לא נסגרים.
