# Feedback — הנחיות לסוכן

ספריית UI לדפדפן: דיאלוגים (`<dialog>.showModal`) וטוסטים. אפס runtime deps. ייצוא ציבורי יחיד: `Feedback`.

מקור האמת: `src/feedback.js`, `src/feedback.css`, `src/feedback.d.ts`, `src/feedback.locales.js`.  
לא לקחת חוזים מ־`המלצות לשיפור הספרייה.md`, `docs/שיפורי ספריית דיאלוג.md`, או `docs/archive/` — אלה היסטוריה.

---

## מפת קבצים

| נתיב | תפקיד |
|---|---|
| `src/feedback.js` | כל הלוגיקה. אובייקטים פנימיים + `export const Feedback` |
| `src/feedback.css` | כל העיצוב. prefix `fb-`. tokens ב־`.fb-container` |
| `src/feedback.d.ts` | טיפוסים ציבוריים + חוזה לסוכן צרכן. `scripts/build.js` מעתיק ל־`dist/` |
| `src/feedback.locales.js` | מילוני `he`/`en`. לא ממוזער. מועתק ל־`dist/` |
| `src/feedback.locales.d.ts` | טיפוסי הקטלוג. מועתק ל־`dist/` |
| `src/feedback.internal.d.ts` | טיפוסי פנים ל־JSDoc בלבד. לא מפורסם |
| `src/feedback.iife.js` | `globalThis.Feedback = Feedback` ל־IIFE |
| `scripts/build.js` | ESM + IIFE ממוזער + CSS ממוזער + העתקת d.ts + העתקת locales |
| `demo/` | דמו ללקוח. טוען **dist** (CSS + IIFE), לא src |
| `docs/בדיקות.md` | תרחישי חוזה ידניים מול הדמו |
| `dist/` | פלט בילד, בגיט. `package.json` מפרסם רק אותו |

`jsconfig.json`: `checkJs` על `src/`, `strictNullChecks: false`, `noImplicitAny: true`.

---

## ארכיטקטורה (סדר קריאה)

1. **`fbEl(tag, props, children)`** — DOM בלי `innerHTML`. `text` → `textContent`. booleans → attribute ריק. אין לערב טקסט צרכן ב־HTML string.
2. **`ScrollLock`** — `overflow: hidden` על `html` + פיצוי רוחב scrollbar ב־`paddingLeft`/`paddingRight` לפי הצד הפיזי שבו הפס נמדד (לא לפי `dir`). lock רק אם אין `saved`; unlock מחזיר inline styles.
3. **`DialogQueue`** — דיאלוג **אחד** ב־`showModal`. `push` → `processQueue`. אחרי סגירה: `dialogDeleted` → הבא בתור. אם התור ריק: `ScrollLock.unlock` + `ToastManager.promote`.
4. **`DialogManager.createDialog`** — תשתית לכל דיאלוג. המתודות (`alert`/`confirm`/…) רק `buildContent` + `onRender`.
5. **`ToastManager`** — קונטיינר `#fb-toast-container` עם `popover="manual"`. מעל דיאלוג פתוח: מועבר **לתוך** ה־`<dialog>` (top-layer). בלי דיאלוג: `showPopover` אם יש טוסטים.

זרימת דיאלוג:

```
Feedback.* → DialogManager.* → createDialog → Promise
  DOM נבנה → DialogQueue.push
  processQueue: append ל-body, showModal, ScrollLock.lock, toast.promote, dialog._fbShown → onRender(dialog, close)
  close(value): דגל closed (idempotent) → fb-closing → timeout לפי --fb-duration
    → toast.releaseFrom(dialog) → dialog.close() → remove → dialogDeleted → resolve(value)
  showModal נכשל: _fbShowFailed → reject Error('Feedback: failed to show dialog') + ניקוי תור
```

`onRender` רץ **רק אחרי** `showModal` (דרך `_fbShown`). פוקוס: `autofocus` ב־DOM, לא `element.focus()` ב־onRender של דיאלוג בתור.

---

## חוזה ציבורי — אסור לשבור בלי אישור מפורש

| API | אישור | X / Esc / ביטול |
|---|---|---|
| `alert` | `undefined` | `undefined` (`dismissValue`) |
| `confirm` | `true` | **`false`** (לא `null`) |
| `prompt` | ערך שדה | `null` |
| `menu` | `item.value` אם יש מפתח `value`, אחרת `undefined` | `null` |
| `selector` | `items[i].value` | `null` |
| `form` | אובייקט `{ [field.name]: coerced }` | `null` |
| `closeAll` | `void` — הפתוח נסגר באנימציה; שאר התור `dismissValue` מיד | כמו X/Esc לכל Promise |
| `setLocale` | `void` — מחליף מילון ברירות. `'he'`/`'en'` או `Partial<feedbackLocale>` | לא סוגר דיאלוגים |
| `getLocale` | עותק של המילון הפעיל | — |
| `setToastPosition` | `void` — מחלקה על `#fb-toast-container` | לא נוגע בדיאלוגים |
| `getToastPosition` | המיקום הפעיל (`bottom-center` בהתחלה) | — |

- `size`: `'sm'` / `'md'` / `'lg'`. חסר = `md` (400px). רק `sm` ו־`lg` מוסיפים מחלקה. לא `className` ציבורי.
- `closeOnBackdrop`: חסר/`false` — backdrop לא סוגר. `true` רק על אובייקט הקריאה (לא על מחרוזת). סגירה = אותו `dismissValue` כמו X/Esc. רק אם `pointerdown` ו־`pointerup` שניהם `e.target === dialog` וכפתור ראשי (`button === 0`). גרירה מהקופסה לרקע לא סוגרת. `pointercancel` מאפס. בלי הדגל: אותו תנאי מפעיל `fb-note` במקום סגירה.
- `vars`: אופציונלי על אובייקט דיאלוג (לא מחרוזת, לא טוסט). `normalizeDialogVars` לפני ה־Promise — throw סינכרוני, בלי כניסה לתור. מפתח `/^--[A-Za-z_][A-Za-z0-9_-]*$/`; ערך מחרוזת CSS כמו בגיליון (בלי המרה); `null` על מפתח = דילוג. לא אובייקט → `Error('Feedback: invalid dialog vars')`; מפתח לא תקין או ערך שאינו מחרוזת → `Error('Feedback: invalid CSS variable')`. `setProperty` על ה־`<dialog>`. inline דורס `size` לאותו טוקן. המופע הבא בלי `vars` חוזר לברירת המחדל. אין `className` ציבורי.
- `confirm` תמיד `boolean`. צרכן שכותב `if (result)` ו־`if (!result)` חייב להיות נכון גם ל־X/Esc.
- `menu`: `0` / `''` / `false` הם ערכים חוקיים. אסור לבדוק `if (item.value)` כדי להחליט אם להחזיר. רק `Object.hasOwn(item, 'value')`.
- `coerceFieldValue`: רק פרימיטיבים. `checkbox` → `raw === 'true'` (boolean). `number` ריק/`null` → `undefined`; `Number` סופי → number; אחרת `undefined`. שאר טיפוס מותר → מחרוזת (או `''`). אין `File`.
- `prompt` עם `type: 'number'` משתמש באותו coerce.
- `field.type` / `prompt.type`: רשימה סגורה. חסר = `text`. אחר (`file`, `date`, …) → `throw` בבניית הטופס/הדיאלוג, לפני `showModal` (דוחה את ה־Promise, כמו `name`). form: `text` `password` `email` `tel` `url` `search` `number` `textarea` `select` `checkbox`. prompt: בלי `textarea`/`select`/`checkbox`.
- `field.name` חייב `/^[A-Za-z_][A-Za-z0-9_-]*$/` — אחרת `throw`. לא לשנות את ה־regex בלי אישור.
- כפתור: מחרוזת או `{ text, theme? }`. `convertBtn`: מחרוזת → `{ text, theme: '' }`. `theme` ריק → מחלקה `fb-btn-primary`. ביטול בלי theme → `secondary`.
- `role`: `alert`/`confirm` = `alertdialog`; השאר `dialog`.
- טוסט: לא Promise. מחזיר `{ close }`. ברירות משך: success/info 3000, warning 3500, error 4000. מקס' 5 גלויים (`:not(.fb-closing)`). ערימה `column` תמיד. למעלה: prepend (חדש ראשון ב-DOM); למטה: append. עודף דוחה את הישן (`pop` למעלה / `shift` למטה). סלוט `fb-toast-slot` + FLIP לאחים בכניסה; יציאה: `0fr` + fade. כניסה: `--fb-toast-in-duration` (`* 2.5`); יציאה: `--fb-duration`. טקסט נשבר ב-`max-width` של הקונטיינר (`min(24rem, 100vw - 2rem)`).
- `setToastPosition(pos)`: רק `'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end'`. אחרת `throw Error('Feedback: invalid toast position')`. מחלקה `fb-toast-pos-{pos}` על הקונטיינר. `start`/`end` logical לפי `dir`. פינות: רק `inset-inline-*`, בלי `left`/`right` (אחרת `end` נוחת ב-`start`). כניסה אנכית `±1.25rem`; צד `2rem`; `:dir(rtl)` הופך סימן X. חל מיד; לא יוצר קונטיינר אם אין טוסטים. לא per-toast. לא משנה דיאלוגים. ברירת מחדל `bottom-center`.
- `closeAll` לא נוגע בטוסטים. דיאלוג שעוד לא הוצג: `resolve(dismissValue)` בלי `showModal`. הפתוח: אותו `close(dismissValue)` כמו X.
- טקסט צרכן = טקסט בלבד. `\n` בהודעה: `white-space: pre-line` ב־CSS.
- טקסט מובנה (כותרת/כפתור/placeholder/aria/הודעות ולידציה כשחסר בקריאה) רק מ־`fbStrings` / `feedback.locales.js`. ברירת מחדל `he`. לא לזהות מ־`<html lang>`. לא לשנות מפתחות `feedbackLocale` בלי אישור.
- `setLocale('en'|'he')` מחליף מילון שלם. אובייקט: מיזוג על `he`, רק מפתחות קיימים שהם `string`. מזהה לא מוכר → `throw Error('Feedback: invalid locale')`. חל על דיאלוגים/טוסטים חדשים. לא משנה `dir`.
- ייצוא npm נוסף לקטלוג: `feedback-ui/locales` (לא ייצוא שני מ־`feedback.js`). הקובץ ב־dist לא ממוזער.

---

## אינווריאנטים

- דיאלוג אחד פתוח. `close` חייב להיות idempotent (`closed`). בלי זה התור נשבר (שני `showModal`).
- `cancel` על `<dialog>`: `preventDefault` + `close(dismissValue)`. בלי זה אין אנימציה / אין resolve.
- Enter חוזר (`e.repeat`) על הדיאלוג: `preventDefault` + `stopPropagation` ב־capture. אחרת autofocus מאשר את הדיאלוג הבא בתור.
- backdrop: `pointerdown`+`pointerup` שניהם על `dialog` (לא `click` בלבד). בלי `closeOnBackdrop`: `fb-note`. עם הדגל: `close(dismissValue)`. כניסה ב־`fb-opening` (לא animation ברירת מחדל על הקופסה). להסיר `fb-opening`/`fb-note` ב־`animationend` של `.fb-dialog-box` (לא ילדים) ובכניסה ל־`close`.
- אחרי סגירה: `ToastManager.releaseFrom(dialog)` לפני `remove` — אחרת הקונטיינר נמחק עם הדיאלוג.
- בניית DOM: `fbEl` / `createElement` / `textContent`. אסור `innerHTML` לטקסט צרכן.
- מחלקות/מזהים: רק prefix `fb-`. לא להישען על CSS של המארח.
- כיוון: logical properties (`inset-inline-end`, `padding-inline`, `margin-block`). **לא** `direction: rtl` ב־CSS הספרייה. `dir` מגיע מהמסמך.
- אנימציה: משך מ־`--fb-duration` דרך `durationMs`. אל תכתוב `200` קשיח בסגירה.
- IDs כמו `fb-dialog-title` / `fb-prompt-form` קיימים כי יש דיאלוג אחד ב־DOM. לא לפתוח שניים במקביל כפתרון.

---

## CSS

- tokens רק תחת `.fb-container` (`--fb-primary`, `--fb-surface`, `--fb-duration`, …).
- ערכת נושא: `@media (prefers-color-scheme: dark)` + `[data-fb-theme="dark"|"light"]` על `.fb-container` או אב.
- כפתורים: `.fb-btn` + `.fb-btn-{theme}`. `danger` ו־`error` אותו צבע.
- nesting מותר (הקובץ כבר ככה). שמור על אותם שמות מחלקות שה־JS מציב.
- `docs/archive/host-theme.neto.css` אינו חלק מהספרייה.

---

## בילד, דמו, בדיקה

```
npm run build
```

esbuild: `src/feedback.js` → `dist/feedback.js` (esm minify + sourcemap), `src/feedback.iife.js` → `dist/feedback.min.js` (iife minify + sourcemap), `src/feedback.css` → `dist/feedback.css` (minify), העתקת d.ts + `feedback.locales.js` / `.d.ts` (בלי minify).

אין Vitest/Playwright. אימות: `npm run build`, שרת סטטי משורש הריפו, דפדפן על `/demo/`. רשימת תרחישי חוזה: `docs/בדיקות.md`. אחרי שינוי בחוזה/תור/טוסט/escaping — לעבור על הרשימה, כולל LTR וערכת נושא בדמו.

הדמו טוען `../dist/feedback.css` ו־`../dist/feedback.min.js`. שינוי ב־src **לא** נראה בדמו עד בילד.

---

## כללי עבודה בפרויקט

- לא להרחיב API, לא לשנות חוזי החזרה, לא להוסיף dependency, לא לגעת ב־schema/בילד מעבר למה שאושר.
- שינוי פנימי (`DialogManager`, תור, CSS) מותר רק אם ה־API הציבורי והחוזים למעלה נשארים זהים.
- טיפוס ציבורי משתנה → עדכן `src/feedback.d.ts` (גם הערות החוזה לצרכן). טיפוס פנימי → `src/feedback.internal.d.ts` + `@typedef` ב־js.
- `alert` / `confirm` / `prompt` מקבלים מחרוזת (`message`) או אובייקט. הנרמול ב־`asDialogData` בשכבת `Feedback`; `DialogManager` נשאר עם אובייקט בלבד.
- אחרי שינוי JS/CSS: `checkJs` (ה־IDE / tsc דרך jsconfig). לא להשאיר `any` חדש בלי צורך.
- קומיט/פוש/PR רק אם התבקש במפורש בתור הנוכחי.
