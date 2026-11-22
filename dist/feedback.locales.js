/**
 * מילוני ברירת מחדל. הקובץ לא ממוזער (גם ב-dist).
 * מפתחות יציבים — שפה אחרת = אותו מבנה, ערכים מתורגמים.
 * @typedef {import('./feedback.d.ts').feedbackLocale} feedbackLocale
 */

/** @type {feedbackLocale} */
export const he = {
    closeDialog: 'סגור חלון',
    closeToast: 'סגור',
    ok: 'אישור',
    cancel: 'ביטול',
    save: 'שמור',
    alertTitle: 'הודעה',
    confirmTitle: 'אישור נדרש',
    menuTitle: 'בחר פעולה',
    inputTitle: 'הזנת נתונים',
    promptPlaceholder: 'הקלד כאן...',
    selectorTitle: 'בחר אפשרות',
    selectorSearch: 'חיפוש ברשימה...',
    selectorEmpty: 'אין פריטים',
    selectorNoResults: 'אין תוצאות',
    selectorList: 'רשימת אפשרויות',
    validationRequired: 'יש למלא את השדה',
    validationType: 'הערך אינו בפורמט הנכון',
    validationMin: 'הערך קטן מהמינימום',
    validationMax: 'הערך גדול מהמקסימום',
    validationStep: 'הערך אינו תואם לצעדים המותרים',
    validationTooShort: 'הטקסט קצר מדי',
    validationTooLong: 'הטקסט ארוך מדי',
    validationPattern: 'הערך אינו תואם לתבנית',
};

/** @type {feedbackLocale} */
export const en = {
    closeDialog: 'Close dialog',
    closeToast: 'Close',
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    alertTitle: 'Message',
    confirmTitle: 'Confirmation required',
    menuTitle: 'Choose an action',
    inputTitle: 'Enter data',
    promptPlaceholder: 'Type here...',
    selectorTitle: 'Choose an option',
    selectorSearch: 'Search the list...',
    selectorEmpty: 'No items',
    selectorNoResults: 'No results',
    selectorList: 'Options list',
    validationRequired: 'Please fill in this field',
    validationType: 'The value is not in the correct format',
    validationMin: 'The value is below the minimum',
    validationMax: 'The value is above the maximum',
    validationStep: 'The value does not match the allowed steps',
    validationTooShort: 'The text is too short',
    validationTooLong: 'The text is too long',
    validationPattern: 'The value does not match the pattern',
};

/** @type {{ he: feedbackLocale, en: feedbackLocale }} */
export const FeedbackLocales = { he, en };
