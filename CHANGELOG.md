# Changelog

## 1.2.2

- `closeOnBackdrop: true` — עמעום רקע עדין ובלי blur (מחלקה `fb-close-on-backdrop`). בלי הדגל העמעום נשאר כפי שהיה.

## 1.2.1

- README באנגלית לדף npm. עברית ב־`README.he.md`.

## 1.2.0

- `closeOnBackdrop` אופציונלי על אובייקט דיאלוג. ברירת מחדל: הרקע לא סוגר. עם הדגל: סגירה בערך הביטול, רק אם press ו־release שניהם על הרקע.
- `Feedback.setToastPosition` / `getToastPosition` — שישה מיקומים (`top|bottom`-`start|center|end`). ברירת מחדל `bottom-center`.
- `vars` על אובייקט דיאלוג — משתני CSS למופע הזה בלבד (`--fb-dialog-max`, `--fb-primary`, …). ערך מחרוזת כמו בגיליון, בלי המרת מספרים. לא דולף לתור הבא. לא על טוסטים.
- הודעות ולידציה של `prompt`/`form` ממילון `feedbackLocale` (`validationRequired`, `validationType`, …), לא משפת הדפדפן.
- `form` / `prompt`: רק טיפוסי קלט בסיסיים; ערך חזרה פרימיטיב בלבד. `type` לא ברשימה → דחיית ה־Promise בבנייה.

## 1.1.0

- `Feedback.setLocale` / `getLocale` — מילון טקסטים מובנים. ברירת מחדל עברית; `'en'` מובנה; שפה אחרת כאובייקט `feedbackLocale`.
- קטלוג לא ממוזער: `src/feedback.locales.js` → `dist/feedback.locales.js`, ייצוא `@simcha-adler/feedback-ui/locales`.

## 1.0.0

- דיאלוגים (`alert` / `confirm` / `prompt` / `menu` / `selector` / `form`) עם תור, טוסטים, ESM + IIFE.
- `alert` / `confirm` / `prompt` מקבלים מחרוזת או אובייקט. אין `simple*`.
- `size`: `sm` | `md` | `lg` לכל דיאלוג (`md` כברירת מחדל).
- `Feedback.closeAll()` — סגירת הדיאלוג הפתוח וריקון התור. טוסטים לא נסגרים.
