/**
 * Feedback — דיאלוגים וטוסטים לדפדפן. ייצוא ציבורי יחיד: `Feedback`.
 *
 * ```ts
 * import { Feedback } from 'feedback-ui';
 * import 'feedback-ui/style.css';
 * ```
 *
 * בלי bundler: `feedback.min.js` (IIFE) + `feedback.css`, ואז `window.Feedback`.
 *
 * כלים:
 * - `alert` — הודעה, כפתור אחד. תמיד `undefined`.
 * - `confirm` — כן/לא. תמיד `true` או `false` (X/Esc = `false`, לא `null`).
 * - `prompt` — שדה אחד. אישור = ערך; ביטול/X/Esc = `null`.
 * - `menu` — כמה כפתורי פעולה. אישור = `value` אם קיים המפתח, אחרת `undefined`; ביטול = `null`.
 * - `selector` — רשימה (אופציונלי חיפוש). אישור = `items[i].value`; ביטול = `null`.
 * - `form` — כמה שדות. אישור = אובייקט לפי `name`; ביטול = `null`.
 * - `toast.success` / `info` / `warning` / `error` — לא חוסם, לא Promise. מחזיר `{ close() }`.
 * - `closeAll` — `void`. סוגר דיאלוג פתוח + תור. טוסטים לא נגעים.
 *
 * התנהגות:
 * - דיאלוג אחד על המסך. קריאה נוספת נכנסת לתור.
 * - לחיצה על הרקע (backdrop) לא סוגרת — רק אנימציית אזהרה.
 * - כותרת, הודעה, תוויות וטוסט הם טקסט (`textContent`), לא HTML. `\n` בהודעת דיאלוג נשבר לשורה.
 * - `dir` מגיע מהמסמך. אין `className` ציבורי על דיאלוג.
 * - כפתור: מחרוזת (הטקסט) או `{ text, theme? }`. בלי theme / `theme: ''` → primary. ביטול בלי theme → secondary.
 */

export type themeString = 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'error' | 'info' | 'outline' | '';

/** חסר = `md` (400px). רק `sm` ו־`lg` מוסיפים מחלקה. sm ≈ 20rem, lg ≈ 40rem */
export type feedbackSize = 'sm' | 'md' | 'lg'

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
}

export type feedbackConfirm = {
    message?: string
    title?: string
    confirmBtn?: feedbackBtn
    cancelBtn?: feedbackBtn
    size?: feedbackSize
}

export type feedbackMenu<T = any> = {
    message?: string
    title?: string
    buttons: feedbackOption<T>[]
    cancelBtn?: feedbackBtn
    size?: feedbackSize
}

export type feedbackPrompt = {
    message?: string
    title?: string
    defaultText?: string
    placeholder?: string
    confirmBtn?: feedbackBtn
    cancelBtn?: feedbackBtn
    /** סוג `<input>`: text, password, number, email… `number` עובר coerce כמו שדה טופס */
    type?: string
    /** ולידציה נייטיבית של הטופס — Enter לא סוגר אם לא תקין */
    required?: boolean
    min?: string | number
    max?: string | number
    step?: string | number
    size?: feedbackSize
}

export type feedbackSelector<T = any> = {
    items: { text: string, value: T }[]
    title?: string
    message?: string
    cancelBtn?: feedbackBtn
    searchable?: boolean
    searchPlaceholder?: string
    size?: feedbackSize
}

export type feedbackForm = {
    title?: string
    message?: string
    fields: feedbackField[]
    confirmBtn?: feedbackBtn
    cancelBtn?: feedbackBtn
    size?: feedbackSize
}

export type feedbackField = {
    /**
     * מפתח באובייקט התוצאה.
     * חייב `/^[A-Za-z_][A-Za-z0-9_-]*$/` — אחרת `throw`. לא עברית, לא רווחים.
     */
    name: string
    label: string
    /**
     * text (ברירת מחדל), number, email, textarea, select, checkbox…
     * checkbox בתוצאה: תמיד `true` / `false`.
     * number: ריק/`null` → `undefined`; מספר סופי → `number`; אחרת `undefined`.
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
     * הודעה עם כפתור אחד.
     * מחרוזת = הודעה. אובייקט = כותרת / כפתור / size.
     * אישור, X ו־Esc: `undefined`.
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
     * אישור: `type: 'number'` ריק → `undefined`, מספר תקין → `number`, אחרת מחרוזת.
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
     * ראו `feedbackField` ל־checkbox / number / `name`.
     */
    form: (data: feedbackForm) => Promise<Record<string, any> | null>
    /**
     * רשימה. אישור → `items[i].value`. ביטול / X / Esc → `null`.
     */
    selector: <T = any>(data: feedbackSelector<T>) => Promise<T | null>
    /**
     * סוגר את הדיאלוג הפתוח באנימציה (כמו X) ומרוקן את התור.
     * דיאלוג שטרם הוצג: `resolve` מיידי בערך הביטול, בלי `showModal`.
     * לא Promise. לא נוגע בטוסטים.
     */
    closeAll: () => void
    /**
     * הודעות קצרות, לא חוסמות. לא Promise.
     * ברירת משך: success/info 3000, warning 3500, error 4000 (ms).
     * עד 5 גלויים; עודף דוחה את הישן. מעבר עכבר או פוקוס עוצר את הטיימר.
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
        /** קיים אחרי IIFE (`feedback.min.js`). אחרי `import` מ־ESM — אין גלובל. */
        Feedback: FeedbackObject
    }
}
