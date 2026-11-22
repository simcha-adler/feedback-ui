# Feedback

ספריית דיאלוגים וטוסטים לדפדפן. בלי תלויות, עם RTL מובנה, ו־API שמחכה ל־`await` כמו `alert` / `confirm` / `prompt` — בלי לתקוע את הדף.

[npm](https://www.npmjs.com/package/feedback-ui) · [GitHub](https://github.com/simcha-adler/feedback-ui) · [דמו](https://simcha-adler.github.io/feedback-ui/demo/)

MIT · ESM + IIFE · CSS עצמאי · `prefers-color-scheme`

---

## התקנה

```bash
npm install feedback-ui
```

```js
import { Feedback } from 'feedback-ui';
import 'feedback-ui/style.css';

await Feedback.alert('הפעולה הושלמה');
```

בלי bundler — שני קבצים מ־`dist/` (ב־npm: `node_modules/feedback-ui/dist/`). אין export בשם `feedback-ui/min`. `window.Feedback` קיים רק אחרי ה־IIFE, לא אחרי `import` מ־ESM.

```html
<link rel="stylesheet" href="./dist/feedback.css" />
<script src="./dist/feedback.min.js"></script>
<script>
  Feedback.alert('שלום');
</script>
```

דמו חי (אותם קבצי `dist` שבחבילה): [simcha-adler.github.io/feedback-ui/demo](https://simcha-adler.github.io/feedback-ui/demo/).

מקומית, אחרי `npm run build`, משרת בשורש הריפו:

```bash
python -m http.server 5502
```

ואז [http://127.0.0.1:5502/demo/](http://127.0.0.1:5502/demo/). הדמו טוען `dist/feedback.css` + `dist/feedback.min.js` (IIFE), לא את `src/`.

---

## מה הספרייה עושה

| מתודה | מתי | מה חוזר |
|---|---|---|
| `alert(message \| {…})` | הודעה עם כפתור אחד | `Promise<void>` — ב־JS תמיד `undefined`, לא לקרוא |
| `confirm(message \| {…})` | כן / לא | `Promise<boolean>` — תמיד `true` או `false` |
| `prompt(message \| {…})` | שדה קלט אחד | ערך באישור, `null` בביטול |
| `menu({ buttons })` | כמה פעולות | `value` אם המפתח קיים, אחרת `undefined`; `null` בביטול |
| `selector({ items })` | רשימה (אופציונלי חיפוש) | `value` של הפריט, `null` בביטול |
| `form({ fields })` | כמה שדות | אובייקט לפי `name`, `null` בביטול |
| `toast.success` / `info` / `warning` / `error` | הודעה קצרה בלי לחסום | `{ close() }` — לא Promise |
| `closeAll()` | סגירת דיאלוג פתוח + ריקון התור | `void` — כל Promise נפתר כמו ביטול |
| `setLocale` / `getLocale` | מילון טקסטים מובנים | `void` / עותק המילון. ברירת מחדל עברית |
| `setToastPosition` / `getToastPosition` | מיקום הטוסטים | `void` / המיקום. ברירת מחדל `bottom-center` |

דיאלוג אחד בלבד על המסך. קריאות נוספות נכנסות לתור ומופיעות אחרי שהקודם נסגר. לכל דיאלוג כפתור X; X ו־Esc = ביטול. לחיצה על הרקע **לא** סוגרת, אלא אם העברת `closeOnBackdrop: true` באובייקט הקריאה. אז נסגר רק אם ה־press וה־release היו שניהם על הרקע (לא גרירה מהקופסה החוצה), וחוזר אותו ערך ביטול כמו X.

אם `showModal` נכשל — ה־Promise נדחה (`Error('Feedback: failed to show dialog')`), לא resolve.

`size: 'sm' | 'md' | 'lg'` על כל דיאלוג. בלי `size` = `md` (400px). `lg` לטופס רחב.

`vars` על אובייקט דיאלוג — משתני CSS למופע הזה בלבד (לא לטוסטים, לא לקריאה הבאה). מחרוזת ל־alert/confirm/prompt לא מעבירה `vars`.

טוסטים לא נחסמים: עד 5 גלויים, מעבר עכבר או פוקוס עוצר את הטיימר, והם נשארים מעל דיאלוג פתוח.

---

## שימוש

```js
await Feedback.alert('נשמר.');

const ok = await Feedback.confirm({
  title: 'מחיקה',
  message: 'למחוק את הרשומה? לא ניתן לשחזר.',
  confirmBtn: { text: 'מחק', theme: 'danger' },
  cancelBtn: 'ביטול',
});
if (!ok) return;

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

Feedback.toast.success('נשמר');
Feedback.toast.error('נכשל', 4000);
const t = Feedback.toast.info('טוען…');
t.close();

Feedback.setToastPosition('bottom-end');
Feedback.getToastPosition(); // 'bottom-end'

Feedback.closeAll();
```

`closeOnBackdrop` רק באובייקט, לא במחרוזת:

```js
await Feedback.confirm({
  message: 'למחוק?',
  closeOnBackdrop: true, // X / Esc / רקע מלא → false
});
```

`vars` — טוקנים לדיאלוג הזה. אחרי סגירה הדיאלוג הבא חוזר לברירת המחדל:

```js
await Feedback.form({
  title: 'חשבונית',
  vars: { '--fb-dialog-max': '45rem', '--fb-primary': '#0f766e' },
  fields: [{ name: 'id', label: 'מספר' }],
});
```

כפתור יכול להיות מחרוזת (`'אישור'`) או `{ text, theme }`.  
`theme`: `primary` · `secondary` · `danger` · `warning` · `success` · `error` · `info` · `outline`.

טקסט צרכן (כותרת, הודעה, תוויות, טוסט) מוצג כטקסט — לא כ־HTML. `\n` בהודעת דיאלוג נשבר לשורה חדשה.

---

## שפה (טקסטים מובנים)

ברירות כותרת, כפתור, placeholder ו־aria-label מגיעות ממילון. ברירת המחדל **עברית**. מה שהועבר בקריאה (`title`, `confirmBtn`, …) לא משתנה. `dir` נשאר מהמסמך.

```js
Feedback.setLocale('en');   // אנגלית מובנית
Feedback.setLocale('he');   // חזרה לעברית
Feedback.getLocale();       // עותק של המילון הפעיל
```

בלי bundler, אחרי `feedback.min.js`:

```html
<script src="./dist/feedback.min.js"></script>
<script>
  Feedback.setLocale('en');
</script>
```

הקטלוג המלא (לא ממוזער) ב־`dist/feedback.locales.js`. ב־npm:

```js
import { Feedback } from 'feedback-ui';
import { FeedbackLocales } from 'feedback-ui/locales';

Feedback.setLocale(FeedbackLocales.en);
```

### שפה אחרת

אין `setLocale('fr')` מובנה. מעתיקים את המבנה, מתרגמים את הערכים, מעבירים ל־`setLocale`. מפתח שחסר או שאינו מחרוזת נשאר בעברית.

```js
Feedback.setLocale({
  closeDialog: 'Fermer la fenêtre',
  closeToast: 'Fermer',
  ok: 'OK',
  cancel: 'Annuler',
  save: 'Enregistrer',
  alertTitle: 'Message',
  confirmTitle: 'Confirmation requise',
  menuTitle: 'Choisir une action',
  inputTitle: 'Saisie',
  promptPlaceholder: 'Saisir ici…',
  selectorTitle: 'Choisir une option',
  selectorSearch: 'Rechercher dans la liste…',
  selectorEmpty: 'Aucun élément',
  selectorNoResults: 'Aucun résultat',
  selectorList: 'Liste des options',
});
```

| מפתח | מתי מופיע |
|---|---|
| `closeDialog` | aria-label של X בדיאלוג |
| `closeToast` | aria-label של X בטוסט |
| `ok` | כפתור אישור ב־alert / confirm |
| `cancel` | כפתור ביטול |
| `save` | כפתור אישור ב־prompt / form |
| `alertTitle` | כותרת alert |
| `confirmTitle` | כותרת confirm |
| `menuTitle` | כותרת menu |
| `inputTitle` | כותרת prompt ו־form |
| `promptPlaceholder` | placeholder ב־prompt |
| `selectorTitle` | כותרת selector |
| `selectorSearch` | placeholder חיפוש ב־selector |
| `selectorEmpty` | רשימה ריקה |
| `selectorNoResults` | חיפוש בלי תוצאות |
| `selectorList` | aria-label של רשימת selector |

חל רק על דיאלוג/טוסט שנפתח **אחרי** הקריאה. מזהה לא מוכר → `Error('Feedback: invalid locale')`.

---

## ערכים שחוזרים

חשוב לבדוק לפי הטיפוס, לא לפי truthiness.

- **confirm** — אישור → `true`. ביטול, X ו־Esc → `false`. אף פעם לא `null`.
- **alert** — TS: `void` (לא לקרוא). JS: תמיד `undefined` (גם ב־X / Esc).
- **prompt / menu / selector / form** — ביטול, X ו־Esc → `null`.
- **menu** — מחזיר גם `0`, `''`, `false` אם זה ה־`value`. בלי מפתח `value` על הכפתור → `undefined`.
- **prompt / שדה `number`** — אותו coerce: ריק באישור → `undefined`; מספר סופי → `number`; `NaN` / `Infinity` → `undefined`.
- **checkbox בטופס** — תמיד `true` / `false`.
- **select בלי `default`** — שורה ריקה נבחרת, לא האופציה הראשונה.
- **`form` עם `name` לא חוקי** — ה־Promise נדחה (לא throw סינכרוני). צריך `await` / `.catch`.
- **`closeAll`** — אם הסגירה כבר רצה, הערך שנבחר נשאר (אישור לא נהפך לביטול). דיאלוג חדש מחכה לאנימציה.
- **טוסט** — `icon` הוא תו (emoji), לא HTML. `duration: 0` סוגר מיד. מיקום: `Feedback.setToastPosition('top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end')`. `start`/`end` לפי `dir`. ערך לא מוכר → `Error('Feedback: invalid toast position')`.
- **`closeOnBackdrop`** — אופציונלי. ברירת מחדל לא סוגר. עם `true`: ערך הביטול של אותו סוג דיאלוג.
- **`vars`** — אופציונלי. מפתחות `--שם` (כמו `--fb-dialog-max`). throw סינכרוני אם המפתח לא תקין (`Error('Feedback: invalid CSS variable')`) או אם `vars` לא אובייקט (`Error('Feedback: invalid dialog vars')`). דורס `size` לאותו טוקן. לא דולף לדיאלוג הבא.

---

## עיצוב וכיוון

הספרייה לא כופה `dir`. היא משתמשת ב־logical properties, ולכן נראית נכון ב־RTL וב־LTR לפי `dir` של המסמך.

צבעים ואנימציה הם משתנים על `.fb-container`:

```css
.fb-container {
  --fb-primary: #2563eb;
  --fb-radius: 8px;
  --fb-duration: 0.2s;
  --fb-dialog-max: 400px;
}
```

דריסה ב־CSS של האפליקציה על `.fb-container` חלה על **כל** דיאלוג וטוסט. לקריאה אחת — `vars` באובייקט הדיאלוג, לא גיליון גלובלי.

ערכת נושא:

- ברירת מחדל: `prefers-color-scheme`
- כפייה: `data-fb-theme="dark"` או `"light"` על `.fb-container` או על אב (`html` / `body`)

---

## רישיון

MIT — שמחה אדלר, 2026.
