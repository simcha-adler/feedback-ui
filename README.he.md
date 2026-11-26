# Feedback

**עברית** · [English](./README.md)

ספריית דיאלוגים וטוסטים לדפדפן. בלי תלויות, עם RTL מובנה, ו־API שמחכה ל־`await` כמו `alert` / `confirm` / `prompt` — בלי לתקוע את הדף.

[npm](https://www.npmjs.com/package/@simcha-adler/feedback-ui) · [GitHub](https://github.com/simcha-adler/feedback-ui) · [דמו](https://simcha-adler.github.io/feedback-ui/demo/)

MIT · ESM + IIFE · CSS עצמאי · ערכת נושא בהירה/כהה · `<dialog>` נייטיב

---

## למה Feedback

- **אותו `await` כמו `alert`, בלי לחסום.** מבוסס Promise, אפס תלויות, ESM או תגית `<script>` רגילה. בלי framework.
- **`<dialog>` אמיתי, לא overlay.** בנוי על `<dialog>.showModal()`: top-layer, Esc ופוקוס מהדפדפן. בלי מלחמות `z-index` מול הדף המארח.
- **טוסטים מעל דיאלוג, לא מאחוריו.** הטוסטים יושבים ב־popover, וכשדיאלוג פתוח הם עוברים *לתוכו* ונשארים גלויים.
- **טקסט בלבד, בלי הזרקת HTML.** כותרות, הודעות, תוויות וטוסטים מוצגים ב־`textContent`. אין שום API שמקבל HTML.
- **ערכי חזרה שאפשר לסמוך עליהם.** `confirm` תמיד `true` או `false` — גם אחרי X או Esc. `menu` יכול להחזיר `0`, `''` או `false`.
- **דיאלוג אחד בכל רגע.** השאר מחכים בתור. Enter מוחזק לא יאשר בטעות את הדיאלוג הבא.
- **לחיצה על הרקע לא סוגרת כברירת מחדל.** בטוח לפעולות מחיקה. מפעילים בקריאה עם `closeOnBackdrop: true`.
- **RTL ו־LTR לפי המסמך.** properties לוגיים, ו־`dir` מגיע מהדף שלך. עברית כברירת מחדל, אנגלית מובנית, וכל שפה אחרת דרך מילון.
- **עיצוב לקריאה אחת שלא דולף.** `size` ו־`vars` חלים על דיאלוג אחד ונעלמים איתו.
- **נגישות מהיסוד.** `alertdialog` ל־alert/confirm, `dialog` לשאר, `aria-*` מלא, טוסטים עם `aria-live`, ופוקוס רק אחרי שהדיאלוג באמת הוצג.

---

## התקנה

```bash
npm install @simcha-adler/feedback-ui
```

```js
import { Feedback } from '@simcha-adler/feedback-ui';
import '@simcha-adler/feedback-ui/style.css';

await Feedback.alert('הפעולה הושלמה');
```

### בלי bundler

משתמשים בשני הקבצים מ־`dist/` (ב־npm: `node_modules/@simcha-adler/feedback-ui/dist/`):

```html
<link rel="stylesheet" href="./dist/feedback.css" />
<script src="./dist/feedback.min.js"></script>
<script>
  Feedback.alert('שלום');
</script>
```

`window.Feedback` קיים רק אחרי טעינת ה־IIFE, לא אחרי `import` מ־ESM. אין export בשם `@simcha-adler/feedback-ui/min`.

### תמיכת דפדפנים

נדרשים אלמנט `<dialog>` ו־Popover API. דפדפנים או WebViews בלעדיהם אינם נתמכים.

---

## התחלה מהירה

```js
await Feedback.alert('נשמר.');

const ok = await Feedback.confirm({
  title: 'מחיקה',
  message: 'למחוק את הרשומה? לא ניתן לשחזר.',
  confirmBtn: { text: 'מחק', theme: 'danger' },
  cancelBtn: 'ביטול',
});
if (!ok) return;

Feedback.toast.success('נמחק');
```

---

## ה־API במבט אחד

| מתודה | מתי | מה חוזר |
|---|---|---|
| `alert(message \| {…})` | הודעה עם כפתור אחד | `Promise<void>` — ב־JS תמיד `undefined`, לא לקרוא |
| `confirm(message \| {…})` | כן / לא | `Promise<boolean>` — תמיד `true` או `false` |
| `prompt(message \| {…})` | שדה קלט אחד | הערך באישור, `null` בביטול |
| `menu({ buttons })` | כמה פעולות | ה־`value` של הכפתור (או `undefined` אם אין לו); `null` בביטול |
| `selector({ items })` | בחירה מרשימה (אופציונלי חיפוש) | ה־`value` של הפריט; `null` בביטול |
| `form({ fields })` | כמה שדות | אובייקט לפי `name`; `null` בביטול |
| `toast.success` / `info` / `warning` / `error` | הודעה קצרה בלי לחסום | `{ close() }` — לא Promise |
| `closeAll()` | סגירת הדיאלוג הפתוח וריקון התור | `void` — כל Promise ממתין נפתר כמו ביטול |
| `setLocale` / `getLocale` | מילון טקסטים מובנים | `void` / עותק המילון הפעיל |
| `setToastPosition` / `getToastPosition` | מיקום הטוסטים | `void` / המיקום הפעיל |

`alert`, `confirm` ו־`prompt` מקבלים מחרוזת (ההודעה) או אובייקט אפשרויות. מחרוזת לא יכולה לשאת `closeOnBackdrop`, `vars` או `urgent`.

---

## ערכים שחוזרים

תמיד בודקים לפי הטיפוס, לא לפי truthiness.

| API | באישור | ב־X / Esc / ביטול |
|---|---|---|
| `alert` | `undefined` | `undefined` |
| `confirm` | `true` | **`false`** (אף פעם לא `null`) |
| `prompt` | ערך השדה | `null` |
| `menu` | `button.value` אם המפתח קיים, אחרת `undefined` | `null` |
| `selector` | `items[i].value` | `null` |
| `form` | `{ [field.name]: value }` | `null` |

דברים שכדאי לדעת:

- **`menu`** מחזיר גם `0`, `''` ו־`false` כשזה ה־`value`. לזיהוי ביטול בודקים `null` — לא כותבים `if (result)`.
- **`prompt` עם `type: 'number'`** ו**שדות `number` בטופס** חולקים כלל אחד: ריק → `undefined`; מספר סופי → `number`; `NaN` / `Infinity` → `undefined`.
- **שדות `checkbox` בטופס** תמיד `true` או `false`.
- **שדות `select` בלי `default`** מתחילים בשורה ריקה, לא באופציה הראשונה.
- כל שאר סוגי השדות מחזירים מחרוזת (או `''`). הערכים תמיד פרימיטיבים — אף פעם לא `File`.
- **`closeAll`** כשהסגירה כבר רצה משאיר את הערך שנבחר: אישור לא נהפך לביטול. דיאלוג חדש מחכה לסיום אנימציית הסגירה.

---

## דיאלוגים

### אפשרויות

משותפות לכל הדיאלוגים (בצורת אובייקט בלבד):

| אפשרות | משמעות |
|---|---|
| `title` | כותרת. ברירות המחדל מהמילון. |
| `message` | טקסט גוף (טקסט רגיל; `\n` נשבר לשורה חדשה). |
| `size` | `'sm'` (‏~20rem) · `'md'` (ברירת מחדל, 400px) · `'lg'` (‏~40rem, לטפסים רחבים). |
| `vars` | משתני CSS לדיאלוג הזה בלבד. ראו [עיצוב לדיאלוג בודד](#עיצוב-לדיאלוג-בודד). |
| `closeOnBackdrop` | `true` מאפשר לסגור בלחיצה על הרקע. ראו [התנהגות](#התנהגות). |
| `urgent` | `true` מציג את הקריאה עכשיו: הפתוח יורד מהמסך (ה־Promise לא נפתר, שדות נשמרים) וחוזר אחריה. ראו [תור](#תור). |

לפי מתודה:

| מתודה | אפשרויות ייחודיות |
|---|---|
| `alert` | `btn` |
| `confirm` | `confirmBtn`, `cancelBtn` |
| `prompt` | `defaultText`, `placeholder`, `type`, `required`, `min`, `max`, `step`, `confirmBtn`, `cancelBtn` |
| `menu` | `buttons: { text, value?, theme? }[]`, `cancelBtn` |
| `selector` | `items: { text, value }[]`, `searchable`, `searchPlaceholder`, `cancelBtn` |
| `form` | `fields`, `confirmBtn`, `cancelBtn` |

ל־`alert` אין `cancelBtn`.

### כפתורים

כפתור הוא מחרוזת (`'אישור'`) או `{ text, theme? }`.

`theme`: `primary` · `secondary` · `danger` · `warning` · `success` · `error` · `info` · `outline`.

`theme` ריק או חסר נותן כפתור primary; כפתור ביטול בלי theme הוא secondary.

### דוגמאות

```js
const name = await Feedback.prompt({
  title: 'שם פרויקט',
  defaultText: 'בלי שם',
  required: true,
});
if (name == null) return;

const action = await Feedback.menu({
  title: 'הקובץ',
  buttons: [
    { text: 'עריכה', value: 'edit' },
    { text: 'שכפול', value: 'duplicate', theme: 'secondary' },
    { text: 'מחיקה', value: 'delete', theme: 'danger' },
  ],
});

const lang = await Feedback.selector({
  title: 'שפה',
  searchable: true,
  items: [
    { text: 'עברית', value: 'he' },
    { text: 'English', value: 'en' },
  ],
});

const profile = await Feedback.form({
  title: 'פרופיל',
  size: 'lg',
  fields: [
    { name: 'fullName', label: 'שם', required: true },
    { name: 'age', label: 'גיל', type: 'number', min: 0 },
    { name: 'dept', label: 'מחלקה', type: 'select', options: ['פיתוח', { value: 'hr', text: 'משאבי אנוש' }] },
    { name: 'notes', label: 'הערות', type: 'textarea' },
    { name: 'newsletter', label: 'עדכונים', type: 'checkbox', default: true },
  ],
});
```

### ולידציה ב־prompt וב־form

`required`, `min`, `max`, `step` משתמשים בולידציה נייטיב, ו־Enter לא יאשר ערך לא תקין. הודעות הולידציה מגיעות ממילון השפה הפעיל (מפתחות `validation*`), לא משפת הדפדפן.

`type` ב־`prompt`: `text` (ברירת מחדל), `password`, `email`, `tel`, `url`, `search`, `number`.

### שדות בטופס

| אפשרות בשדה | משמעות |
|---|---|
| `name` | המפתח באובייקט התוצאה. חייב להתאים ל־`/^[A-Za-z_][A-Za-z0-9_-]*$/` — בלי רווחים ובלי אותיות שאינן לטיניות. |
| `label` | התווית הגלויה. |
| `type` | `text` (ברירת מחדל), `password`, `email`, `tel`, `url`, `search`, `number`, `textarea`, `select`, `checkbox`. |
| `required` | ולידציית חובה נייטיב. |
| `default` | ערך התחלתי. ב־`checkbox`, ערך truthy = מסומן. |
| `placeholder` | טקסט placeholder. |
| `min` / `max` / `step` | מגבלות נייטיב. |
| `options` | ל־`select`: מחרוזות (משמשות גם כ־value וגם כטקסט) או `{ value, text }`. |

`type` לא נתמך (כמו `file` או `date`) או `name` לא חוקי **דוחים את ה־Promise שחוזר** בזמן בניית הטופס — זה לא throw סינכרוני, ולכן צריך `await` או `.catch`.

---

## טוסטים

```js
Feedback.toast.success('נשמר');
Feedback.toast.error('נכשל', 4000);
Feedback.toast.warning('בדוק את הקלט', 3500, '⚠️');

const t = Feedback.toast.info('טוען…');
t.close();
```

חתימה: `toast.<type>(text, duration?, icon?)`, מחזיר `{ close() }`.

- משכי ברירת מחדל: success / info ‏3000ms, warning ‏3500ms, error ‏4000ms. `duration: 0` סוגר מיד.
- `icon` הוא תו (emoji) שמוצג כטקסט.
- עד 5 טוסטים גלויים בו־זמנית; חדש דוחה את הישן ביותר.
- מעבר עכבר או פוקוס על טוסט עוצר את הטיימר.
- טוסטים נשארים מעל דיאלוג פתוח.
- טקסט ארוך נשבר ברוחב המקסימלי של הקונטיינר.

### מיקום

```js
Feedback.setToastPosition('bottom-end');
Feedback.getToastPosition(); // 'bottom-end'
```

מותר: `top-start` · `top-center` · `top-end` · `bottom-start` · `bottom-center` · `bottom-end`. ברירת מחדל: `bottom-center`. `start` ו־`end` לפי `dir` של המסמך. המיקום גלובלי (לא per-toast) וחל מיד. ערך לא מוכר זורק `Error('Feedback: invalid toast position')`.

---

## התנהגות

### תור

דיאלוג אחד בלבד על המסך. קריאות נוספות נכנסות לתור ומופיעות אחרי שהקודם נסגר. Enter מוחזק (key repeat) לא מאשר את הדיאלוג הבא בתור.

`urgent: true` (רק באובייקט) מציג את הקריאה הזו עכשיו. אם יש דיאלוג פתוח שלא בתהליך סגירה, הוא יורד מהמסך **בלי לפתור** — מה שהוקלד נשאר על האלמנט — וחוזר לראש התור. אחרי שהדחוף נסגר, החונה מוצג שוב. שני `urgent` ברצף: האחרון למעלה (LIFO). עדיין `showModal` אחד. טוסטים לא נסגרים; ייתכן הבהוב בקפיצה בין דיאלוגים.

```js
await Feedback.prompt({ title: 'שם', defaultText: '' });
// במקום אחר, למשל ניתוק סשן:
await Feedback.alert({
  title: 'נותקת',
  message: 'יש להתחבר מחדש.',
  urgent: true,
});
```

### סגירה

לכל דיאלוג כפתור X. **X ו־Esc תמיד אומרים ביטול**, והדיאלוג נפתר בערך הביטול מהטבלה למעלה.

לחיצה על הרקע **לא** סוגרת כברירת מחדל — רק מפעילה אנימציית תשומת לב קצרה. כדי לאפשר סגירה מעבירים `closeOnBackdrop: true` באובייקט:

```js
await Feedback.confirm({
  message: 'למחוק?',
  closeOnBackdrop: true, // X / Esc / רקע → false
});
```

עם הדגל, הדיאלוג נסגר רק אם גם הלחיצה וגם השחרור היו על הרקע, כך שגרירה מהקופסה החוצה לא עושה כלום. התוצאה היא אותו ערך ביטול כמו X. הרקע מעומעם בעדינות ובלי blur — בניגוד לעמעום החזק כשהרקע לא סוגר.

### `closeAll`

`Feedback.closeAll()` סוגר את הדיאלוג הפתוח באנימציה הרגילה, ופותר מיד את כל מה שנשאר בתור בערך הביטול. הוא לא נוגע בטוסטים.

### שגיאות

| מצב | מה קורה |
|---|---|
| `showModal` נכשל | ה־Promise **נדחה** עם `Error('Feedback: failed to show dialog')`. |
| `name` לא חוקי בשדה / `type` לא נתמך בשדה או ב־prompt | ה־Promise **נדחה** בזמן בניית הדיאלוג. |
| `vars` לא חוקי | **throw סינכרוני**, לפני כניסה לתור. |
| שפה לא מוכרת | `setLocale` זורק `Error('Feedback: invalid locale')`. |
| מיקום טוסט לא מוכר | `setToastPosition` זורק `Error('Feedback: invalid toast position')`. |

---

## שפה (טקסטים מובנים)

כותרות, כפתורים, placeholders, aria-labels והודעות ולידציה מגיעים ממילון. ברירת המחדל **עברית**. מה שמועבר בקריאה (`title`, `confirmBtn`, …) אף פעם לא מוחלף. `dir` לא מושפע.

```js
Feedback.setLocale('en');   // אנגלית מובנית
Feedback.setLocale('he');   // חזרה לעברית
Feedback.getLocale();       // עותק של המילון הפעיל
```

`setLocale` משפיע רק על דיאלוגים וטוסטים שנפתחים **אחרי** הקריאה.

הקטלוג המלא (לא ממוזער) נמצא ב־`dist/feedback.locales.js`. ב־npm:

```js
import { Feedback } from '@simcha-adler/feedback-ui';
import { FeedbackLocales } from '@simcha-adler/feedback-ui/locales';

Feedback.setLocale(FeedbackLocales.en);
```

### שפה אחרת, או שינויים קטנים

מעבירים אובייקט. הוא ממוזג על המילון העברי; רק מפתחות עם ערך מחרוזת מוחלים, וכל מפתח שהושמט נשאר בעברית.

```js
Feedback.setLocale({
  closeDialog: 'Fermer la fenêtre',
  closeToast: 'Fermer',
  ok: 'OK',
  cancel: 'Annuler',
  save: 'Enregistrer',
  // …מתרגמים כל מפתח שצריך
});
```

כדי לשנות משהו באנגלית, מתחילים מהמילון האנגלי המלא:

```js
Feedback.setLocale({ ...FeedbackLocales.en, ok: 'Got it' });
```

| מפתח | מתי מופיע |
|---|---|
| `closeDialog` | aria-label של X בדיאלוג |
| `closeToast` | aria-label של X בטוסט |
| `ok` | כפתור אישור ב־alert / confirm |
| `cancel` | כפתור ביטול |
| `save` | כפתור אישור ב־prompt / form |
| `alertTitle` | כותרת ברירת מחדל ל־alert |
| `confirmTitle` | כותרת ברירת מחדל ל־confirm |
| `menuTitle` | כותרת ברירת מחדל ל־menu |
| `inputTitle` | כותרת ברירת מחדל ל־prompt ול־form |
| `promptPlaceholder` | placeholder ב־prompt |
| `selectorTitle` | כותרת ברירת מחדל ל־selector |
| `selectorSearch` | placeholder חיפוש ב־selector |
| `selectorEmpty` | רשימה ריקה ב־selector |
| `selectorNoResults` | חיפוש בלי תוצאות |
| `selectorList` | aria-label של רשימת ה־selector |
| `validationRequired` | שדה חובה ריק |
| `validationType` | אי־התאמת טיפוס (email, url, …) |
| `validationMin` / `validationMax` | ערך מתחת למינימום / מעל למקסימום |
| `validationStep` | ערך שלא מתאים ל־`step` |
| `validationTooShort` / `validationTooLong` | אורך טקסט מחוץ לטווח |
| `validationPattern` | ערך שלא תואם ל־pattern |

---

## עיצוב וכיוון

הספרייה לעולם לא כופה `dir`. היא משתמשת ב־logical properties, ולכן נראית נכון ב־RTL וב־LTR לפי המסמך.

### עיצוב גלובלי

צבעים, רדיוס וזמנים הם משתני CSS על `.fb-container`:

```css
.fb-container {
  --fb-primary: #2563eb;
  --fb-radius: 8px;
  --fb-duration: 0.2s;
  --fb-dialog-max: 400px;
}
```

דריסה שלהם בגיליון שלך משפיעה על **כל** דיאלוג וטוסט. כל שמות המחלקות וה־IDs עם prefix `fb-`, והספרייה לא נשענת על ה־CSS של הדף המארח.

### עיצוב לדיאלוג בודד

לקריאה אחת משתמשים ב־`size` או ב־`vars` באובייקט. `vars` מציב משתני CSS על הדיאלוג הזה בלבד; הדיאלוג הבא בתור חוזר לברירת המחדל.

```js
await Feedback.form({
  title: 'חשבונית',
  vars: { '--fb-dialog-max': '45rem', '--fb-primary': '#0f766e' },
  fields: [{ name: 'id', label: 'מספר' }],
});
```

כללי `vars`:

- מפתחות חייבים להיות CSS custom properties: `/^--[A-Za-z_][A-Za-z0-9_-]*$/`.
- ערכים הם מחרוזות CSS בדיוק כמו בגיליון (`'32rem'`, `'0.2s'`) — מספרים לא מומרים.
- ערך `null` או `undefined` מדלג על המפתח.
- מפתח לא תקין או ערך שאינו מחרוזת זורק `Error('Feedback: invalid CSS variable')`; `vars` שאינו אובייקט זורק `Error('Feedback: invalid dialog vars')`. שניהם סינכרוניים, לפני כניסה לתור.
- `vars` גובר על `size` באותו טוקן (למשל `--fb-dialog-max`).
- `vars` לא חל על טוסטים.

אין אפשרות `className` ציבורית.

### ערכת נושא

- ברירת מחדל: לפי `prefers-color-scheme`.
- כפייה: `data-fb-theme="dark"` או `"light"` על `.fb-container` או על כל אב (`html` / `body`).

---

## איך זה מתחבר לשאר

| | Feedback | `alert` / `confirm` / `prompt` נייטיב | SweetAlert2 |
|---|---|---|---|
| שימוש | `await Feedback.confirm(…)`, מתודה לכל סוג דיאלוג | חוסם את כל ה־thread | `Swal.fire({…})`; התוצאה אובייקט (`isConfirmed` / `isDismissed`) |
| שכבת תצוגה | `<dialog>.showModal()` (top-layer) | חלון מערכת, לא ניתן לעיצוב | overlay כברירת מחדל; אפשרות `topLayer` אופציונלית |
| טוסט מעל דיאלוג | כן — עובר לתוך הדיאלוג הפתוח | אין טוסט | טוסט הוא מצב של אותו popup |
| HTML בתוכן | אף פעם (טקסט בלבד) | טקסט בלבד | אפשרות `html` מציגה HTML — לנקות בעצמך |
| בדיקת התוצאה | `confirm` תמיד בוליאני | בוליאני / מחרוזת / `null` | בודקים שדות באובייקט התוצאה |
| לחיצה על הרקע | לא סוגרת כברירת מחדל | לא רלוונטי | סוגרת כברירת מחדל |
| תלויות | אין | אין | אין |

מעבר לטבלה: ל־Feedback יש תור דיאלוגים מובנה עם הגנה מ־Enter חוזר, RTL לפי המסמך, מילון עברית/אנגלית מובנה עם הודעות ולידציה לפי השפה, ו־`size`/`vars` לקריאה אחת שלא דולפים לדיאלוג הבא.

### מתי לא לבחור ב־Feedback

- צריך **HTML או סלוטים** בתוך הדיאלוג (קישורים, SVG עשיר, טפסים מעבר ל־`form`).
- צריך **`className` ציבורי** לכל דיאלוג, או מיקום per-toast.
- צריך קלט `file` / `date`, או ערכי טופס שאינם פרימיטיבים.
- רוצים **עטיפת React רשמית** (Feedback נקרא מתוך הסטייט וה־handlers, לא מרונדר כ־JSX).
- חייבים לתמוך בדפדפנים בלי `<dialog>` ו־Popover API.
- נשענים על **אקוסיסטם פלאגינים**.

במקרים האלה SweetAlert2 או UI kit (Radix, MUI, Bootstrap) מתאימים יותר.

---

## רישיון

MIT — שמחה אדלר, 2026.
