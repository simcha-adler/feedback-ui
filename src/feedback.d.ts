/**
 * Feedback — דיאלוגים וטוסטים לדפדפן. ייצוא ציבורי יחיד: `Feedback`.
 *
 * ```ts
 * import { Feedback } from 'feedback-ui';
 * import 'feedback-ui/style.css';
 * ```
 *
 * בלי bundler: `feedback.min.js` (IIFE) + `feedback.css`, ואז `window.Feedback`.
 * ב־npm: `node_modules/feedback-ui/dist/feedback.min.js` + `feedback.css`.
 * אין export בשם `feedback-ui/min`. אחרי `import` מ־ESM — אין גלובל ב־runtime
 * (גם אם `Window.Feedback` מופיע בטיפוסים בגלל IIFE).
 * חבילה: https://www.npmjs.com/package/feedback-ui
 * ריפו: https://github.com/simcha-adler/feedback-ui
 * דמו (IIFE מ־dist): https://simcha-adler.github.io/feedback-ui/demo/
 *
 * כלים:
 * - `alert` — הודעה, כפתור אחד. TS: `Promise<void>` (לא לקרוא את הערך). JS: תמיד `undefined`.
 * - `confirm` — כן/לא. תמיד `true` או `false` (X/Esc = `false`, לא `null`).
 * - `prompt` — שדה אחד. אישור = ערך; ביטול/X/Esc = `null`.
 * - `menu` — כמה כפתורי פעולה. אישור = `value` אם קיים המפתח, אחרת `undefined`; ביטול = `null`.
 * - `selector` — רשימה (אופציונלי חיפוש). אישור = `items[i].value`; ביטול = `null`.
 * - `form` — כמה שדות. אישור = אובייקט לפי `name`; ביטול = `null`.
 * - `toast.success` / `info` / `warning` / `error` — לא חוסם, לא Promise. מחזיר `{ close() }`.
 * - `closeAll` — `void`. סוגר דיאלוג פתוח + תור. טוסטים לא נגעים.
 * - `setLocale` / `getLocale` — מילון ברירות מחדל (`he` כברירת מחדל). שפה אחרת = אובייקט `feedbackLocale`.
 * - `setToastPosition` / `getToastPosition` — מיקום קונטיינר הטוסטים. ברירת מחדל `bottom-center`.
 *
 * התנהגות:
 * - דיאלוג אחד על המסך. קריאה נוספת נכנסת לתור.
 * - לכל דיאלוג כפתור X. X ו־Esc = ערך הביטול של אותו סוג. אין `cancelBtn` ב־`alert`.
 * - לחיצה על הרקע (backdrop) לא סוגרת כברירת מחדל — רק אנימציית אזהרה.
 *   `closeOnBackdrop: true` על אובייקט הקריאה: סגירה בערך הביטול, רק אם pointerdown ו־pointerup שניהם על הרקע (לא גרירה מהקופסה החוצה). מחרוזת ל־alert/confirm/prompt לא מפעילה את זה.
 * - אם `showModal` נכשל: ה־Promise נדחה ב־`Error('Feedback: failed to show dialog')`. אין resolve.
 * - כותרת, הודעה, תוויות וטוסט הם טקסט (`textContent`), לא HTML. `\n` בהודעת דיאלוג נשבר לשורה.
 * - `dir` מגיע מהמסמך. אין `className` ציבורי על דיאלוג.
 * - `vars` על אובייקט דיאלוג: משתני CSS למופע הזה בלבד. ראו `feedbackDialogVars`.
 * - כפתור: מחרוזת (הטקסט) או `{ text, theme? }`. בלי theme / `theme: ''` → primary. ביטול בלי theme → secondary.
 * - ברירות כותרת/כפתור/aria כשחסר — מ־`Feedback.getLocale()`. ברירת מחדל `he`.
 *   `setLocale('en' | 'he')` או `setLocale({ ok: 'OK', … })`. מפתח חסר באובייקט נופל ל־he.
 *   מבנה מלא: `feedbackLocale` / `feedback-ui/locales`. לא משנה `dir`.
 */

export type themeString = 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'error' | 'info' | 'outline' | '';

export type feedbackLocaleId = 'he' | 'en'

/**
 * מילון טקסטים מובנים. מפתחות יציבים — שפה אחרת = אותם מפתחות, ערכים מתורגמים.
 * לא כולל הודעות צרכן, `×`, אייקוני טוסט, או `Error('Feedback: failed to show dialog')`.
 */
export type feedbackLocale = {
    /** aria-label של כפתור X בדיאלוג */
    closeDialog: string
    /** aria-label של כפתור X בטוסט */
    closeToast: string
    /** כפתור אישור ב-alert / confirm */
    ok: string
    /** כפתור ביטול */
    cancel: string
    /** כפתור אישור ב-prompt / form */
    save: string
    alertTitle: string
    confirmTitle: string
    menuTitle: string
    /** כותרת ברירת מחדל ל-prompt ול-form */
    inputTitle: string
    promptPlaceholder: string
    selectorTitle: string
    selectorSearch: string
    selectorEmpty: string
    selectorNoResults: string
    /** aria-label של רשימת selector */
    selectorList: string
}

/** חסר = `md` (400px). רק `sm` ו־`lg` מוסיפים מחלקה. sm ≈ 20rem, lg ≈ 40rem */
export type feedbackSize = 'sm' | 'md' | 'lg'

/**
 * משתני CSS על ה־`<dialog>` של הקריאה הזו בלבד (`style.setProperty`).
 * מתים עם האלמנט — הדיאלוג הבא בתור לא יורש אותם.
 * מפתח חייב `/^--[A-Za-z_][A-Za-z0-9_-]*$/` (למשל `--fb-dialog-max`, `--fb-primary`).
 * ערך: מחרוזת או מספר (הופך למחרוזת). `null`/`undefined` על מפתח — דילוג.
 * מפתח לא תקין או ערך שאינו מחרוזת/מספר → throw סינכרוני `Error('Feedback: invalid CSS variable')`.
 * `vars` לא אובייקט (מערך, מחרוזת, …) → `Error('Feedback: invalid dialog vars')`.
 * חסר / `null` / `{}` — אין שינוי.
 * inline דורס `size` לאותו טוקן (`--fb-dialog-max` ב־`vars` מנצח את `sm`/`lg`).
 * לא על טוסטים. מחרוזת ל־alert/confirm/prompt לא מעבירה `vars`.
 */
export type feedbackDialogVars = Record<string, string | number>

/**
 * מיקום קונטיינר הטוסטים. `start`/`end` לפי `dir` של המסמך (logical).
 * ברירת מחדל של הספרייה: `bottom-center`.
 */
export type feedbackToastPosition =
    | 'top-start'
    | 'top-center'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-center'
    | 'bottom-end'

/** מחרוזת = טקסט הכפתור. או `{ text, theme? }`. */
export type feedbackBtn = { text: string, theme?: themeString } | string

export type feedbackOption<T = any> = {
    /** הטקסט על הכפתור */
    text: string
    /**
     * הערך שחוזר בלחיצה. אם המפתח חסר — חוזר `undefined`.
     * `0` / `''` / `false` חוקיים — לא לבדוק `if (item.value)`.
     */
    value?: T
    theme?: themeString
}

export type feedbackAlert = {
    /** טקסט, לא HTML */
    message?: string
    title?: string
    btn?: feedbackBtn
    size?: feedbackSize
    vars?: feedbackDialogVars
    /**
     * חסר / `false` — לחיצה על הרקע לא סוגרת (אנימציית אזהרה בלבד).
     * `true` — סגירה כמו X/Esc (`undefined` ב-alert). רק אם press ו-release שניהם על הרקע.
     */
    closeOnBackdrop?: boolean
}

export type feedbackConfirm = {
    message?: string
    title?: string
    confirmBtn?: feedbackBtn
    cancelBtn?: feedbackBtn
    size?: feedbackSize
    vars?: feedbackDialogVars
    /**
     * חסר / `false` — הרקע לא סוגר.
     * `true` — סגירה כמו X/Esc (`false`, לא `null`). רק press+release על הרקע.
     */
    closeOnBackdrop?: boolean
}

export type feedbackMenu<T = any> = {
    message?: string
    title?: string
    buttons: feedbackOption<T>[]
    cancelBtn?: feedbackBtn
    size?: feedbackSize
    vars?: feedbackDialogVars
    /**
     * חסר / `false` — הרקע לא סוגר.
     * `true` — סגירה כמו X/Esc (`null`). רק press+release על הרקע.
     */
    closeOnBackdrop?: boolean
}

export type feedbackPrompt = {
    message?: string
    title?: string
    defaultText?: string
    placeholder?: string
    confirmBtn?: feedbackBtn
    cancelBtn?: feedbackBtn
    /**
     * סוג `<input>`: text, password, number, email…
     * רק `'number'` משנה את ערך החזרה (אותו coerce כמו `feedbackField`). שאר הטיפוסים → מחרוזת.
     */
    type?: string
    /** ולידציה נייטיבית של הטופס — Enter לא סוגר אם לא תקין */
    required?: boolean
    min?: string | number
    max?: string | number
    step?: string | number
    size?: feedbackSize
    vars?: feedbackDialogVars
    /**
     * חסר / `false` — הרקע לא סוגר.
     * `true` — סגירה כמו X/Esc (`null`). רק press+release על הרקע.
     */
    closeOnBackdrop?: boolean
}

export type feedbackSelector<T = any> = {
    items: { text: string, value: T }[]
    title?: string
    message?: string
    cancelBtn?: feedbackBtn
    /** סינון לפי `item.text` (substring, case-insensitive). לא לפי `value`. */
    searchable?: boolean
    searchPlaceholder?: string
    size?: feedbackSize
    vars?: feedbackDialogVars
    /**
     * חסר / `false` — הרקע לא סוגר.
     * `true` — סגירה כמו X/Esc (`null`). רק press+release על הרקע.
     */
    closeOnBackdrop?: boolean
}

export type feedbackForm = {
    title?: string
    message?: string
    fields: feedbackField[]
    confirmBtn?: feedbackBtn
    cancelBtn?: feedbackBtn
    size?: feedbackSize
    vars?: feedbackDialogVars
    /**
     * חסר / `false` — הרקע לא סוגר.
     * `true` — סגירה כמו X/Esc (`null`). רק press+release על הרקע.
     */
    closeOnBackdrop?: boolean
}

export type feedbackField = {
    /**
     * מפתח באובייקט התוצאה.
     * חייב `/^[A-Za-z_][A-Za-z0-9_-]*$/` — אחרת `throw`. לא עברית, לא רווחים.
     * הבדיקה בבניית הטופס, לפני `showModal`. `throw` דוחה את ה־Promise של `form`
     * (לא throw סינכרוני מ־`Feedback.form()` — `try` בלי `await` לא תופס).
     */
    name: string
    label: string
    /**
     * text (ברירת מחדל), number, email, textarea, select, checkbox…
     * checkbox: `default` truthy → מסומן; בתוצאה תמיד `true` / `false` (גם בלי סימון).
     * number: ריק/`null` → `undefined`; מספר סופי → `number`; אחרת (`NaN`/`Infinity`) → `undefined`.
     * select בלי `default`: שורה ריקה נבחרת (לא האופציה הראשונה).
     * שאר הטיפוסים: מחרוזת (או `''`).
     */
    type?: string
    required?: boolean
    default?: any
    placeholder?: string
    min?: string | number
    max?: string | number
    step?: string | number
    /** ל-select: מחרוזת (גם value וגם text) או `{ value, text }` */
    options?: Array<string | { value: any, text: string }>
}

export type feedbackToastHandle = {
    close: () => void
}

export type FeedbackObject = {
    /**
     * הודעה עם כפתור אחד. אין `cancelBtn`.
     * מחרוזת = הודעה. אובייקט = כותרת / כפתור / size / vars.
     * TS: `Promise<void>` — לא לקרוא את הערך.
     * JS: אישור, X, Esc ו־`closeAll` → `undefined`.
     */
    alert: {
        (message: string): Promise<void>
        (data: feedbackAlert): Promise<void>
    }
    /**
     * כן / לא. תמיד `boolean` — `if (result)` ו־`if (!result)` נכונים גם אחרי X/Esc.
     * אישור → `true`. ביטול, X, Esc → `false`. אף פעם לא `null`.
     */
    confirm: {
        (message: string): Promise<boolean>
        (data: feedbackConfirm): Promise<boolean>
    }
    /**
     * שדה קלט אחד.
     * אישור עם `type: 'number'` — אותו coerce כמו `feedbackField`:
     * ריק/`null` → `undefined`; `Number` סופי → `number`; אחרת (`NaN`/`Infinity`) → `undefined`.
     * שאר `type` → מחרוזת.
     * ביטול / X / Esc → `null`.
     */
    prompt: {
        (message: string): Promise<string | null>
        (data: feedbackPrompt): Promise<string | number | undefined | null>
    }
    /**
     * כמה פעולות. בודקים `null` לביטול, לא truthiness של הערך.
     * כפתור עם מפתח `value` (גם `0`/`''`/`false`) → הערך.
     * כפתור בלי מפתח `value` → `undefined`.
     * ביטול / X / Esc → `null`.
     */
    menu: <T = any>(data: feedbackMenu<T>) => Promise<T | null | undefined>
    /**
     * כמה שדות. אישור → `{ [field.name]: ערך מתואם }`. ביטול / X / Esc → `null`.
     * ראו `feedbackField` ל־checkbox / number / select / `name`.
     */
    form: (data: feedbackForm) => Promise<Record<string, any> | null>
    /**
     * רשימה. אישור → `items[i].value`. ביטול / X / Esc → `null`.
     */
    selector: <T = any>(data: feedbackSelector<T>) => Promise<T | null>
    /**
     * סוגר את הדיאלוג הפתוח באנימציה (כמו X) ומרוקן את התור.
     * דיאלוג שטרם הוצג: `resolve` מיידי בערך הביטול, בלי `showModal`.
     * אם הסגירה כבר רצה (`close` idempotent) — הערך שנבחר נשאר; `closeAll` לא הופך אישור לביטול.
     * חוזר מיד (לא Promise). דיאלוג חדש ייכנס לתור אחרי האנימציה של הפתוח.
     * לא נוגע בטוסטים.
     */
    closeAll: () => void
    /**
     * מחליף את מילון ברירות המחדל. חל על דיאלוגים/טוסטים **חדשים** בלבד.
     * `'he'` / `'en'` — חבילות מובנות. אובייקט — מיזוג על `he` (רק מפתחות מ־`feedbackLocale` שהם מחרוזת).
     * מזהה לא מוכר או ערך לא אובייקט/לא מחרוזת מזהה → `throw Error('Feedback: invalid locale')`.
     * לא משנה `dir` ולא דורס `title` / כפתור / placeholder שהועברו בקריאה.
     */
    setLocale: (locale: feedbackLocaleId | Partial<feedbackLocale>) => void
    /** עותק של המילון הפעיל. שינוי העותק לא משפיע על הספרייה. */
    getLocale: () => feedbackLocale
    /**
     * מיקום קונטיינר הטוסטים. חל מיד על קונטיינר קיים ועל טוסטים חדשים. לא על דיאלוגים.
     * `start` / `end` לפי `dir` של המסמך. ברירת מחדל `bottom-center`.
     * ערך לא מוכר → `throw Error('Feedback: invalid toast position')`.
     * לא יוצר קונטיינר אם עוד אין טוסטים.
     */
    setToastPosition: (position: feedbackToastPosition) => void
    /** המיקום הפעיל. ברירת מחדל לפני קריאה: `bottom-center`. */
    getToastPosition: () => feedbackToastPosition
    /**
     * הודעות קצרות, לא חוסמות. לא Promise. מיקום: `getToastPosition()` (ברירת מחדל תחתית-מרכז).
     * ברירת משך: success/info 3000, warning 3500, error 4000 (ms).
     * `duration === 0` סוגר מיד (לא «נשאר»).
     * `icon` אופציונלי — תו (emoji), `textContent`, לא HTML.
     * עד 5 גלויים; עודף דוחה את הגלוי הישן ביותר. חדש על הקצה (למעלה-עליון / למטה-תחתון).
     * טקסט נשבר לשורות ברוחב המקסימלי (`min(24rem, 100vw - 2rem)`).
     * מעבר עכבר או פוקוס עוצר את הטיימר.
     */
    toast: {
        success: (text: string, duration?: number, icon?: string) => feedbackToastHandle
        info: (text: string, duration?: number, icon?: string) => feedbackToastHandle
        error: (text: string, duration?: number, icon?: string) => feedbackToastHandle
        warning: (text: string, duration?: number, icon?: string) => feedbackToastHandle
    }
}

export declare const Feedback: FeedbackObject;

export as namespace Feedback;

declare global {
    interface Window {
        /**
         * קיים ב־runtime רק אחרי IIFE (`feedback.min.js` / `dist/feedback.min.js`).
         * אחרי `import { Feedback } from 'feedback-ui'` אין גלובל — להשתמש בייבוא, לא ב־`window.Feedback`.
         */
        Feedback: FeedbackObject
    }
}
