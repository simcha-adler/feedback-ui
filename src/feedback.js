
/**
* feedback.js - ספריה עצמאית לניהול חלונות קופצים מעוצבים
*/

import { FeedbackLocales } from './feedback.locales.js';

/**
 * @typedef {import('./feedback.internal.d.ts').dialogManager} dialogManager
 * @typedef {import('./feedback.internal.d.ts').toast} toast
 * @typedef {import('./feedback.internal.d.ts').FbDialog} FbDialog
 * @typedef {import('./feedback.internal.d.ts').FbToast} FbToast
 * @typedef {import('./feedback.d.ts').FeedbackObject} FeedbackObject
 * @typedef {import('./feedback.d.ts').feedbackLocale} feedbackLocale
 * @typedef {import('./feedback.d.ts').feedbackLocaleId} feedbackLocaleId
 * @typedef {import('./feedback.d.ts').feedbackToastPosition} feedbackToastPosition
 */

/** @type {feedbackLocale} */
let fbStrings = { ...FeedbackLocales.he };

/**
 * @param {feedbackLocaleId | Partial<feedbackLocale>} locale
 */
function setLocale(locale) {
    if (locale === 'he' || locale === 'en') {
        fbStrings = { ...FeedbackLocales[locale] };
        return;
    }
    if (locale && typeof locale === 'object') {
        const next = { ...FeedbackLocales.he };
        for (const key of /** @type {(keyof feedbackLocale)[]} */ (Object.keys(FeedbackLocales.he))) {
            if (typeof locale[key] === 'string') next[key] = locale[key];
        }
        fbStrings = next;
        return;
    }
    throw new Error('Feedback: invalid locale');
}

/** @returns {feedbackLocale} */
function getLocale() {
    return { ...fbStrings };
}

/** @type {readonly feedbackToastPosition[]} */
const TOAST_POSITIONS = [
    'top-start', 'top-center', 'top-end',
    'bottom-start', 'bottom-center', 'bottom-end',
];

/** @type {feedbackToastPosition} */
let toastPosition = 'bottom-center';

/**
 * @param {feedbackToastPosition} position
 */
function setToastPosition(position) {
    if (!TOAST_POSITIONS.includes(position)) {
        throw new Error('Feedback: invalid toast position');
    }
    toastPosition = position;
    const container = document.getElementById(TOAST_CONTAINER_ID);
    if (container) ToastManager.applyPosition(container);
}

/** @returns {feedbackToastPosition} */
function getToastPosition() {
    return toastPosition;
}


const ScrollLock = {
    /** @type {{ overflow: string, paddingLeft: string, paddingRight: string } | null} */
    saved: null,

    /** @returns {'left' | 'right' | null} */
    scrollbarSide() {
        const html = document.documentElement;
        const width = window.innerWidth - html.clientWidth;
        if (width <= 0) return null;
        // clientLeft כולל את פס ה-viewport כשהוא משמאל (לא probe פנימי, שמתנהג אחרת מחלון).
        const borderLeft = parseFloat(getComputedStyle(html).borderLeftWidth) || 0;
        return (html.clientLeft - borderLeft) >= width / 2 ? 'left' : 'right';
    },

    lock() {
        if (this.saved) return;
        const html = document.documentElement;
        const width = window.innerWidth - html.clientWidth;
        const side = width > 0 ? this.scrollbarSide() : null;
        this.saved = {
            overflow: html.style.overflow,
            paddingLeft: html.style.paddingLeft,
            paddingRight: html.style.paddingRight,
        };
        html.style.overflow = 'hidden';
        if (side === 'left') html.style.paddingLeft = `${width}px`;
        else if (side === 'right') html.style.paddingRight = `${width}px`;
    },

    unlock() {
        if (!this.saved) return;
        const html = document.documentElement;
        html.style.overflow = this.saved.overflow;
        html.style.paddingLeft = this.saved.paddingLeft;
        html.style.paddingRight = this.saved.paddingRight;
        this.saved = null;
    }
};

const DialogQueue = {
    // משתני ניהול התור
    /**@type {FbDialog[]} */
    queue: [],
    isProcessing: false,

    /**
     * פונקציית המעטפת שמכניסה בקשות לתור
     * @param {FbDialog} dialog
     */
    push(dialog) {
        this.queue.push(dialog);
        this.processQueue();
    },

    /**
     * מנהל התור - שולף ומציג דיאלוגים אחד אחרי השני
     */
    processQueue() {
        if (!this.isProcessing && this.queue.length > 0) {
            const dialog = this.queue.shift();
            if (!dialog) return;
            this.isProcessing = true;
            try {
                document.body.appendChild(dialog);
                dialog.showModal();
            } catch {
                ToastManager.releaseFrom(dialog);
                dialog.remove();
                if (typeof dialog._fbShowFailed === 'function') dialog._fbShowFailed();
                this.dialogDeleted();
                return;
            }
            ScrollLock.lock();
            ToastManager.promote();
            dialog._fbShown?.();
        }
    },

    dialogDeleted() {
        this.isProcessing = false;
        this.processQueue(); // בעת מחיקת דיאלוג, הקפצת דיאלוג נוסף מהתור אם קיים
        if (!this.isProcessing) {
            ScrollLock.unlock();
            ToastManager.promote();
        }
    },

    /**
     * מרוקן את התור (resolve מיידי ב-dismissValue) וסוגר את הדיאלוג הפתוח באנימציה הרגילה.
     * טוסטים לא נסגרים.
     */
    closeAll() {
        const waiting = this.queue.splice(0);
        for (const dialog of waiting) {
            dialog._fbAbort?.();
        }
        const open = /** @type {FbDialog | null} */ (document.querySelector('dialog.fb-dialog[open]'));
        open?._fbForceClose?.();
    }
}

/**
 * בניית DOM בלי innerHTML. `text` נכנס כ-textContent; שאר המחרוזות כ-attributes.
 * @template {keyof HTMLElementTagNameMap} T
 * @param {T} tag
 * @param {Record<string, any>} [props]
 * @param {(Node|string|null|undefined|false)[]} [children]
 * @returns {HTMLElementTagNameMap[T]}
 */
function fbEl(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
        if (value == null || value === false) continue;
        if (key === 'className') node.className = value;
        else if (key === 'text') node.textContent = String(value);
        else if (typeof value === 'boolean') {
            if (value) node.setAttribute(key, '');
        } else {
            node.setAttribute(key, String(value));
        }
    }
    for (const child of children) {
        if (child != null && child !== false) node.append(child);
    }
    return node;
}

/**
 * @template {keyof HTMLElementTagNameMap} T
 * @param {ParentNode} root
 * @param {T} tag
 * @param {string} [rest]
 * @returns {HTMLElementTagNameMap[T]}
 */
function fbQ(root, tag, rest = '') {
    return /** @type {HTMLElementTagNameMap[T]} */ (root.querySelector(tag + rest));
}

/**
 * @template {keyof HTMLElementTagNameMap} T
 * @param {ParentNode} root
 * @param {T} tag
 * @param {string} [rest]
 * @returns {NodeListOf<HTMLElementTagNameMap[T]>}
 */
function fbQA(root, tag, rest = '') {
    return /** @type {NodeListOf<HTMLElementTagNameMap[T]>} */ (root.querySelectorAll(tag + rest));
}

/** @type {readonly string[]} */
const FORM_FIELD_TYPES = Object.freeze([
    'text', 'password', 'email', 'tel', 'url', 'search',
    'number', 'textarea', 'select', 'checkbox',
]);
/** @type {readonly string[]} */
const PROMPT_FIELD_TYPES = Object.freeze([
    'text', 'password', 'email', 'tel', 'url', 'search', 'number',
]);

/**@type {dialogManager} */
const DialogManager = {

    convertBtn(btn) {
        if (btn instanceof Object)
            return btn;
        return { text: btn, theme: '' }
    },

    btnClass(theme, extra = '') {
        const name = theme || 'primary';
        return `fb-btn fb-dialog-btn fb-btn-${name}${extra ? ` ${extra}` : ''}`;
    },

    cssTimeToMs(raw) {
        const token = String(raw || '').trim().split(',')[0].trim() || '0.2s';
        const value = parseFloat(token);
        if (Number.isNaN(value)) return 200;
        if (token.endsWith('ms')) return value;
        if (token.endsWith('s')) return value * 1000;
        return 200;
    },

    durationMs(el) {
        return DialogManager.cssTimeToMs(
            getComputedStyle(el).getPropertyValue('--fb-duration').trim() || '0.2s',
        );
    },

    /**
     * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} el
     */
    applyConstraintMessage(el) {
        el.setCustomValidity('');
        const v = el.validity;
        if (v.valid) return;
        if (v.valueMissing) el.setCustomValidity(fbStrings.validationRequired);
        else if (v.typeMismatch) el.setCustomValidity(fbStrings.validationType);
        else if (v.rangeUnderflow) el.setCustomValidity(fbStrings.validationMin);
        else if (v.rangeOverflow) el.setCustomValidity(fbStrings.validationMax);
        else if (v.stepMismatch) el.setCustomValidity(fbStrings.validationStep);
        else if (v.tooShort) el.setCustomValidity(fbStrings.validationTooShort);
        else if (v.tooLong) el.setCustomValidity(fbStrings.validationTooLong);
        else if (v.patternMismatch) el.setCustomValidity(fbStrings.validationPattern);
        else el.setCustomValidity(fbStrings.validationType);
    },

    /**
     * @param {HTMLFormElement} formEl
     * @returns {boolean} האם הטופס תקין (אחרי הודעות מהמילון)
     */
    reportFormValidity(formEl) {
        for (const el of formEl.elements) {
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
                DialogManager.applyConstraintMessage(el);
            }
        }
        return formEl.reportValidity();
    },

    selectOption(opt) {
        if (typeof opt === 'string') return { value: opt, text: opt };
        return { value: opt.value, text: opt.text };
    },

    coerceFieldValue(field, raw) {
        const type = field.type || 'text';
        if (type === 'checkbox') return raw === 'true';
        if (type === 'number') {
            if (raw === null || raw === '') return undefined;
            const n = Number(raw);
            return Number.isFinite(n) ? n : undefined;
        }
        return typeof raw === 'string' ? raw : '';
    },

    fieldName(name) {
        if (typeof name !== 'string' || !/^[A-Za-z_][A-Za-z0-9_-]*$/.test(name)) {
            throw new Error(`Feedback: שם שדה לא תקין: ${JSON.stringify(name)}`);
        }
        return name;
    },

    /**
     * @param {unknown} type
     * @param {readonly string[]} allowed
     */
    fieldType(type, allowed) {
        const resolved = type == null || type === '' ? 'text' : type;
        if (typeof resolved !== 'string' || !allowed.includes(resolved)) {
            throw new Error(`Feedback: סוג שדה לא תקין: ${JSON.stringify(type)}`);
        }
        return resolved;
    },

    applyInputLimits(control, field) {
        if (field.min !== undefined) control.setAttribute('min', String(field.min));
        if (field.max !== undefined) control.setAttribute('max', String(field.max));
        if (field.step !== undefined) control.setAttribute('step', String(field.step));
    },

    /**
     * @param {unknown} vars
     * @returns {[string, string][]}
     */
    normalizeDialogVars(vars) {
        if (vars == null) return [];
        if (typeof vars !== 'object' || Array.isArray(vars)) {
            throw new Error('Feedback: invalid dialog vars');
        }
        /** @type {[string, string][]} */
        const out = [];
        for (const [key, value] of Object.entries(vars)) {
            if (!/^--[A-Za-z_][A-Za-z0-9_-]*$/.test(key)) {
                throw new Error('Feedback: invalid CSS variable');
            }
            if (value == null) continue;
            if (typeof value !== 'string') {
                throw new Error('Feedback: invalid CSS variable');
            }
            out.push([key, value]);
        }
        return out;
    },

    /**
     * פונקציית תשתית ליצירת הדיאלוג מבוססת תגית <dialog>
    */
    createDialog(options) {
        const { title, message, buildContent, onRender, role = 'dialog', size } = options;
        const dismissValue = Object.hasOwn(options, 'dismissValue') ? options.dismissValue : null;
        const closeOnBackdrop = options.closeOnBackdrop === true;
        const cssVars = DialogManager.normalizeDialogVars(options.vars);

        return new Promise((resolve, reject) => {
            const dialog = /** @type {FbDialog} */ (document.createElement('dialog'));
            dialog.className = 'fb-container fb-dialog fb-opening';
            if (size === 'sm' || size === 'lg') dialog.classList.add(`fb-dialog-${size}`);
            for (const [key, value] of cssVars) dialog.style.setProperty(key, value);
            dialog.setAttribute('role', role);
            if (title) dialog.setAttribute('aria-labelledby', 'fb-dialog-title');
            if (message) dialog.setAttribute('aria-describedby', 'fb-dialog-message');

            // תיבה פנימית: מבדילים לחיצה על התוכן מלחיצה על ה-backdrop.
            const header = fbEl('div', { className: 'fb-dialog-header' });
            if (title) {
                header.append(fbEl('h3', { id: 'fb-dialog-title', className: 'fb-dialog-title', text: title }));
            }
            header.append(fbEl('button', {
                type: 'button',
                className: 'fb-dialog-close',
                'aria-label': fbStrings.closeDialog,
            }, [
                fbEl('span', { className: 'fb-dialog-close-icon', 'aria-hidden': 'true', text: '\u00d7' }),
            ]));

            const body = fbEl('div', { className: 'fb-dialog-box' }, [header]);
            if (message) {
                body.append(fbEl('p', { id: 'fb-dialog-message', className: 'fb-dialog-message', text: message }));
            }
            const dynamic = fbEl('div', { className: 'fb-dialog-dynamic-content' });
            if (buildContent) buildContent(dynamic);
            body.append(dynamic);
            dialog.append(body);

            let closed = false;
            /** @param {any} [value] */
            const close = (value) => {
                if (closed) return;
                closed = true;
                dialog.classList.remove('fb-note', 'fb-opening');
                dialog.classList.add('fb-closing');

                setTimeout(() => {
                    ToastManager.releaseFrom(dialog);
                    dialog.close(); // פקודת סגירה נייטיב
                    dialog.remove(); // ניקוי סופי מה-DOM
                    DialogQueue.dialogDeleted(); // פתיחת התור להקפצת דיאלוג נוסף
                    resolve(value);
                }, DialogManager.durationMs(dialog));
            };

            dialog._fbShowFailed = () => {
                if (closed) return;
                closed = true;
                reject(new Error('Feedback: failed to show dialog'));
            };

            dialog._fbAbort = () => {
                if (closed) return;
                closed = true;
                resolve(dismissValue);
            };

            dialog._fbForceClose = () => close(dismissValue);

            dialog._fbShown = () => {
                if (onRender) onRender(dialog, close);
            };

            // סגירה בלחיצה על כפתור ה-X
            fbQ(dialog, 'button', '.fb-dialog-close').onclick = () => close(dismissValue);

            // סגירה / אזהרה רק אם press ו-release שניהם על ה-backdrop (לא גרירה מהקופסה החוצה).
            let backdropPress = false;
            dialog.addEventListener('pointerdown', (e) => {
                backdropPress = e.button === 0 && e.target === dialog;
            });
            dialog.addEventListener('pointerup', (e) => {
                const startedOnBackdrop = backdropPress;
                backdropPress = false;
                if (!startedOnBackdrop || e.button !== 0 || e.target !== dialog) return;
                if (closeOnBackdrop) {
                    close(dismissValue);
                    return;
                }
                dialog.classList.remove('fb-opening', 'fb-note');
                void dialog.offsetWidth;
                dialog.classList.add('fb-note');
            });
            dialog.addEventListener('pointercancel', () => {
                backdropPress = false;
            });

            dialog.querySelector('.fb-dialog-box').addEventListener('animationend', (e) => {
                if (e.target !== e.currentTarget) return;
                dialog.classList.remove('fb-opening');
                if (dialog.classList.contains('fb-note')) dialog.classList.remove('fb-note');
            });

            // השתלטות על מקש ה-Esc כדי להפעיל את האנימציה
            dialog.addEventListener('cancel', (e) => {
                e.preventDefault();
                close(dismissValue);
            });

            // Enter מוחזק (key-repeat) לא יאשר את הדיאלוג הבא בתור אחרי autofocus.
            dialog.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.repeat) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, true);

            DialogQueue.push(dialog);
        });
    },

    // הודעת אישור (Alert) פשוטה
    alert({ message, title = fbStrings.alertTitle, btn = fbStrings.ok, size, closeOnBackdrop, vars }) {
        btn = DialogManager.convertBtn(btn);
        return DialogManager.createDialog({
            title, message, size, closeOnBackdrop, vars, dismissValue: undefined, role: 'alertdialog',
            buildContent(root) {
                root.append(fbEl('div', { className: 'fb-dialog-footer' }, [
                    fbEl('button', {
                        type: 'button',
                        className: DialogManager.btnClass(btn.theme, 'fb-limited'),
                        autofocus: true,
                        text: btn.text,
                    }),
                ]));
            },
            onRender: (overlay, close) => {
                fbQ(overlay, 'button', '.fb-limited').onclick = () => close();
            }
        });
    },

    //אישור או ביטול פעולה
    confirm({ message, title = fbStrings.confirmTitle, confirmBtn, cancelBtn, size, closeOnBackdrop, vars }) {
        confirmBtn = DialogManager.convertBtn(confirmBtn);
        cancelBtn = DialogManager.convertBtn(cancelBtn);

        return DialogManager.createDialog({
            title, message, size, closeOnBackdrop, vars, dismissValue: false, role: 'alertdialog',
            buildContent(root) {
                root.append(fbEl('div', { className: 'fb-dialog-buttons' }, [
                    fbEl('button', {
                        type: 'button',
                        id: 'fb-dialog-btn-confirm',
                        className: DialogManager.btnClass(confirmBtn?.theme),
                        autofocus: true,
                        text: confirmBtn?.text || fbStrings.ok,
                    }),
                    fbEl('button', {
                        type: 'button',
                        id: 'fb-dialog-btn-cancel',
                        className: DialogManager.btnClass(cancelBtn?.theme || 'secondary'),
                        text: cancelBtn?.text || fbStrings.cancel,
                    }),
                ]));
            },
            onRender: (overlay, close) => {
                fbQ(overlay, 'button', '#fb-dialog-btn-confirm').onclick = () => close(true);
                fbQ(overlay, 'button', '#fb-dialog-btn-cancel').onclick = () => close(false);
            }
        });
    },

    // אישור פעולה עם אפשרויות מרובות או תפריט פעולות
    menu({ message, title = fbStrings.menuTitle, buttons, cancelBtn = fbStrings.cancel, size, closeOnBackdrop, vars }) {
        cancelBtn = DialogManager.convertBtn(cancelBtn);

        return DialogManager.createDialog({
            title, message, size, closeOnBackdrop, vars,
            buildContent(root) {
                buttons.forEach((btn, index) => {
                    root.append(fbEl('button', {
                        type: 'button',
                        className: DialogManager.btnClass(btn.theme),
                        'data-index': String(index),
                        autofocus: index === 0,
                        text: btn.text,
                    }));
                });
                root.append(fbEl('div', { className: 'fb-dialog-footer' }, [
                    fbEl('button', {
                        type: 'button',
                        className: DialogManager.btnClass(cancelBtn.theme || 'secondary', 'fb-limited'),
                        text: cancelBtn.text || fbStrings.cancel,
                    }),
                ]));
            },
            onRender: (overlay, close) => {
                const domButtons = fbQA(overlay, 'button', '.fb-dialog-btn[data-index]');

                domButtons.forEach(btn => {
                    btn.onclick = () => {
                        const index = Number(btn.getAttribute('data-index'));
                        const item = buttons[index];
                        close(item && Object.hasOwn(item, 'value') ? item.value : undefined);
                    };
                });

                fbQ(overlay, 'button', '.fb-limited').onclick = () => close(null);
            }
        });
    },

    // בקשת קלט (Prompt)
    prompt({ message, title = fbStrings.inputTitle, defaultText = '', placeholder = fbStrings.promptPlaceholder, confirmBtn = fbStrings.save, cancelBtn = fbStrings.cancel, type = 'text', required = false, min, max, step, size, closeOnBackdrop, vars }) {

        confirmBtn = DialogManager.convertBtn(confirmBtn);
        cancelBtn = DialogManager.convertBtn(cancelBtn);
        let inputType = 'text';

        return DialogManager.createDialog({
            title, message, size, closeOnBackdrop, vars,
            buildContent(root) {
                inputType = DialogManager.fieldType(type, PROMPT_FIELD_TYPES);
                const input = fbEl('input', {
                    type: inputType,
                    className: 'fb-dialog-input',
                    placeholder,
                    required: !!required,
                    autofocus: true,
                    ...(title
                        ? { 'aria-labelledby': 'fb-dialog-title' }
                        : { 'aria-label': placeholder || fbStrings.promptPlaceholder }),
                });
                input.value = defaultText;
                DialogManager.applyInputLimits(input, { min, max, step });
                root.append(fbEl('form', { id: 'fb-prompt-form', novalidate: true }, [
                    input,
                    fbEl('div', { className: 'fb-dialog-buttons' }, [
                        fbEl('button', {
                            type: 'submit',
                            className: DialogManager.btnClass(confirmBtn.theme),
                            id: 'fb-dialog-btn-confirm',
                            text: confirmBtn.text,
                        }),
                        fbEl('button', {
                            type: 'button',
                            className: DialogManager.btnClass(cancelBtn.theme || 'secondary'),
                            id: 'fb-dialog-btn-cancel',
                            text: cancelBtn.text,
                        }),
                    ]),
                ]));
            },
            onRender: (overlay, close) => {
                const formEl = fbQ(overlay, 'form', '#fb-prompt-form');
                const input = fbQ(overlay, 'input', '.fb-dialog-input');
                const btnCancel = fbQ(overlay, 'button', '#fb-dialog-btn-cancel');

                formEl.addEventListener('input', () => input.setCustomValidity(''));
                formEl.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if (!DialogManager.reportFormValidity(formEl)) return;
                    close(DialogManager.coerceFieldValue({ type: inputType }, input.value));
                });
                btnCancel.onclick = () => close(null);
                if (input.value) input.select();
            }
        });
    },

    // חלון בחירה מתוך רשימה נגללת (Selector)
    selector({ items = [], title = fbStrings.selectorTitle, message = '', cancelBtn = fbStrings.cancel,
        searchable = false, searchPlaceholder = fbStrings.selectorSearch, size, closeOnBackdrop, vars }) {

        cancelBtn = DialogManager.convertBtn(cancelBtn);

        return DialogManager.createDialog({
            title,
            message,
            size,
            closeOnBackdrop,
            vars,
            buildContent(root) {
                if (searchable) {
                    root.append(fbEl('input', {
                        type: 'text',
                        className: 'fb-dialog-selector-search',
                        placeholder: searchPlaceholder,
                        'aria-label': searchPlaceholder,
                        autofocus: true,
                    }));
                }
                const list = fbEl('ul', { className: 'fb-dialog-selector-list', 'aria-label': fbStrings.selectorList });
                const emptyItem = fbEl('li', {
                    className: 'fb-selector-empty',
                    hidden: items.length > 0,
                    text: fbStrings.selectorEmpty,
                });
                list.append(emptyItem);
                items.forEach((item, index) => {
                    list.append(fbEl('li', { className: 'fb-dialog-selector-item' }, [
                        fbEl('button', {
                            type: 'button',
                            'data-index': String(index),
                            autofocus: !searchable && index === 0,
                            text: item.text,
                        }),
                    ]));
                });
                root.append(list);
                root.append(fbEl('div', { className: 'fb-dialog-footer' }, [
                    fbEl('button', {
                        type: 'button',
                        className: DialogManager.btnClass(cancelBtn.theme || 'secondary'),
                        id: 'fb-dialog-btn-cancel',
                        text: cancelBtn.text,
                    }),
                ]));
            },
            onRender: (overlay, close) => {
                const listItemsDom = fbQA(overlay, 'li', '.fb-dialog-selector-item');
                const itemButtons = fbQA(overlay, 'button', '[data-index]');

                // האזנה לבחירת פריט
                itemButtons.forEach(btn => {
                    btn.onclick = () => {
                        const index = Number(btn.getAttribute('data-index'));
                        close(items[index].value);
                    };
                });

                // האזנה לכפתור ביטול
                fbQ(overlay, 'button', '#fb-dialog-btn-cancel').onclick = () => close(null);

                const visibleButtons = () =>
                    [...itemButtons].filter(btn => !btn.closest('.fb-dialog-selector-item').classList.contains('fb-hidden'));

                const emptyItem = fbQ(overlay, 'li', '.fb-selector-empty');
                const syncEmpty = () => {
                    const visible = visibleButtons().length;
                    emptyItem.hidden = visible > 0;
                    emptyItem.textContent = items.length === 0 ? fbStrings.selectorEmpty : fbStrings.selectorNoResults;
                };
                syncEmpty();

                const searchInput = searchable ? fbQ(overlay, 'input', '.fb-dialog-selector-search') : null;

                if (searchable) {
                    searchInput.addEventListener('input', (e) => {
                        const searchTerm = /** @type {HTMLInputElement} */ (e.target).value.toLowerCase();

                        items.forEach((item, index) => {
                            const label = item.text.toLowerCase();
                            if (label.includes(searchTerm)) {
                                listItemsDom[index].classList.remove('fb-hidden');
                            } else {
                                listItemsDom[index].classList.add('fb-hidden');
                            }
                        });
                        syncEmpty();
                    });

                    searchInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            visibleButtons()[0]?.focus();
                        }
                    });
                }

                fbQ(overlay, 'ul', '.fb-dialog-selector-list').addEventListener('keydown', (e) => {
                    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
                    const current = e.target instanceof Element ? e.target.closest('button') : null;
                    if (!current) return;
                    e.preventDefault();
                    const vis = visibleButtons();
                    const i = vis.indexOf(current);
                    if (e.key === 'ArrowDown') vis[i + 1]?.focus();
                    else if (i <= 0) searchInput?.focus();
                    else vis[i - 1].focus();
                });
            }
        });
    },

    form({ title = fbStrings.inputTitle, message = '', fields = [], confirmBtn = fbStrings.save, cancelBtn = fbStrings.cancel, size, closeOnBackdrop, vars }) {
        confirmBtn = DialogManager.convertBtn(confirmBtn);
        cancelBtn = DialogManager.convertBtn(cancelBtn);

        return DialogManager.createDialog({
            title,
            message,
            size,
            closeOnBackdrop,
            vars,
            buildContent(root) {
                const formEl = fbEl('form', { id: 'fb-dynamic-form', novalidate: true });
                fields.forEach((field, index) => {
                    const name = DialogManager.fieldName(field.name);
                    const type = DialogManager.fieldType(field.type, FORM_FIELD_TYPES);
                    const id = `fb-input-${name}`;
                    const autofocus = index === 0;
                    const required = !!field.required;

                    if (type === 'checkbox') {
                        const input = fbEl('input', {
                            className: 'fb-form-checkbox',
                            id,
                            name,
                            type: 'checkbox',
                            required,
                            autofocus,
                        });
                        input.checked = !!field.default;
                        formEl.append(fbEl('div', { className: 'fb-form-group fb-form-group-checkbox' }, [
                            fbEl('label', { for: id }, [input, document.createTextNode(field.label ?? '')]),
                        ]));
                        return;
                    }

                    const label = fbEl('label', { for: id, text: field.label });
                    /** @type {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} */
                    let control;
                    if (type === 'textarea') {
                        control = fbEl('textarea', {
                            className: 'fb-form-input',
                            id,
                            name,
                            required,
                            autofocus,
                        });
                        if (field.placeholder !== undefined) control.setAttribute('placeholder', String(field.placeholder));
                        if (field.default !== undefined) control.value = String(field.default);
                    } else if (type === 'select') {
                        control = fbEl('select', {
                            className: 'fb-form-input',
                            id,
                            name,
                            required,
                            autofocus,
                        });
                        if (field.default === undefined) {
                            const blank = fbEl('option', { value: '', text: '' });
                            blank.selected = true;
                            control.append(blank);
                        }
                        for (const opt of field.options || []) {
                            const { value, text } = DialogManager.selectOption(opt);
                            const option = fbEl('option', { text });
                            option.value = value == null ? '' : String(value);
                            if (field.default !== undefined && String(field.default) === String(value)) {
                                option.selected = true;
                            }
                            control.append(option);
                        }
                    } else {
                        control = fbEl('input', {
                            className: 'fb-form-input',
                            id,
                            name,
                            type,
                            required,
                            autofocus,
                        });
                        if (field.default !== undefined) control.value = String(field.default);
                        if (field.placeholder !== undefined) control.setAttribute('placeholder', String(field.placeholder));
                        DialogManager.applyInputLimits(control, field);
                    }
                    formEl.append(fbEl('div', { className: 'fb-form-group' }, [label, control]));
                });
                formEl.append(fbEl('div', { className: 'fb-dialog-buttons' }, [
                    fbEl('button', {
                        type: 'submit',
                        className: DialogManager.btnClass(confirmBtn.theme),
                        text: confirmBtn.text,
                    }),
                    fbEl('button', {
                        type: 'button',
                        className: DialogManager.btnClass(cancelBtn.theme || 'secondary'),
                        id: 'fb-btn-cancel',
                        text: cancelBtn.text,
                    }),
                ]));
                root.append(formEl);
            },
            onRender: (dialog, close) => {
                const formEl = fbQ(dialog, 'form', '#fb-dynamic-form');
                const btnCancel = fbQ(dialog, 'button', '#fb-btn-cancel');

                // טיפול בביטול
                btnCancel.onclick = () => close(null);

                // טיפול בשליחת הטופס (Submit)
                formEl.addEventListener('input', (e) => {
                    const t = e.target;
                    if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement) {
                        t.setCustomValidity('');
                    }
                });
                formEl.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if (!DialogManager.reportFormValidity(formEl)) return;

                    const formData = new FormData(formEl);
                    fbQA(formEl, 'input', '[type="checkbox"]').forEach((cb) => {
                        if (cb.name) formData.set(cb.name, cb.checked ? 'true' : 'false');
                    });
                    /** @type {Record<string, any>} */
                    const resultObject = {};
                    for (const field of fields) {
                        resultObject[field.name] = DialogManager.coerceFieldValue(field, formData.get(field.name));
                    }

                    close(resultObject);
                });
            }
        });
    }
}

const TOAST_MAX = 5;
const TOAST_CONTAINER_ID = 'fb-toast-container';

/**@type {toast} */
const ToastManager = {

    // מחזירה את הקונטיינר של הטואסטים, ואם לא קיים - יוצרת אותו
    applyPosition(container) {
        for (const pos of TOAST_POSITIONS) {
            container.classList.remove(`fb-toast-pos-${pos}`);
        }
        container.classList.add(`fb-toast-pos-${toastPosition}`);
    },

    getContainer() {
        let container = document.getElementById(TOAST_CONTAINER_ID);
        if (!container) {
            container = document.createElement('div');
            container.id = TOAST_CONTAINER_ID;
            container.className = 'fb-toast-container fb-container';
            container.setAttribute('popover', 'manual');
            container.append(
                fbEl('div', { className: 'fb-visually-hidden', 'aria-live': 'polite', 'aria-atomic': 'true' }),
                fbEl('div', { className: 'fb-visually-hidden', 'aria-live': 'assertive', 'aria-atomic': 'true' }),
            );
            document.body.appendChild(container);
        }
        this.applyPosition(container);
        return container;
    },

    announce(text, type) {
        const container = document.getElementById(TOAST_CONTAINER_ID);
        if (!container) return;
        const regions = container.querySelectorAll('.fb-visually-hidden');
        const region = type === 'error' ? regions[1] : regions[0];
        if (!region) return;
        region.textContent = '';
        requestAnimationFrame(() => {
            region.textContent = String(text);
        });
    },

    releaseFrom(host) {
        const container = document.getElementById(TOAST_CONTAINER_ID);
        if (container && host.contains(container)) {
            document.body.appendChild(container);
        }
    },

    promote() {
        const container = document.getElementById(TOAST_CONTAINER_ID);
        if (!container || typeof container.showPopover !== 'function') return;
        const dialog = document.querySelector('dialog.fb-dialog[open]');
        const hasToasts = !!container.querySelector('.fb-toast');

        if (dialog) {
            if (container.matches(':popover-open')) container.hidePopover();
            if (container.parentNode !== dialog) dialog.appendChild(container);
            return;
        }

        if (container.parentNode !== document.body) document.body.appendChild(container);
        if (!hasToasts) {
            if (container.matches(':popover-open')) container.hidePopover();
            return;
        }
        if (!container.matches(':popover-open')) container.showPopover();
    },

    // הפונקציה המרכזית להצגת הודעה
    show(text, type, icon, duration = 3000) {
        const container = ToastManager.getContainer();
        const visible = [...container.querySelectorAll('div.fb-toast:not(.fb-closing)')];
        const fromTop = toastPosition.startsWith('top-');
        while (visible.length >= TOAST_MAX) {
            const oldest = /** @type {FbToast | undefined} */ (fromTop ? visible.pop() : visible.shift());
            oldest?._fbDismiss?.();
        }

        const toast = /** @type {FbToast} */ (document.createElement('div'));
        toast.className = `fb-toast fb-toast-${type} fb-toast-enter`;
        toast.append(
            fbEl('span', { className: 'fb-toast-icon', 'aria-hidden': 'true', text: icon }),
            fbEl('span', { className: 'fb-toast-text', text }),
            fbEl('button', { type: 'button', className: 'fb-toast-close', 'aria-label': fbStrings.closeToast }, [
                fbEl('span', { 'aria-hidden': 'true', text: '\u00d7' }),
            ]),
        );
        toast.addEventListener('animationend', (e) => {
            if (e.target !== toast) return;
            toast.classList.remove('fb-toast-enter');
        });

        const inner = fbEl('div', { className: 'fb-toast-slot-inner' }, [toast]);
        const slot = fbEl('div', { className: 'fb-toast-slot' }, [inner]);

        let remaining = duration;
        let startedAt = Date.now();
        /** @type {ReturnType<typeof setTimeout> | undefined} */
        let timeoutId;
        let closed = false;
        let hovering = false;
        let focusing = false;
        let paused = false;

        const removeEl = () => {
            slot.remove();
            if (!container.querySelector('.fb-toast') && container.matches(':popover-open')) {
                container.hidePopover();
            }
        };

        const dismiss = () => {
            if (closed) return;
            closed = true;
            clearTimeout(timeoutId);
            slot.classList.add('fb-closing');
            toast.classList.add('fb-closing');
            setTimeout(removeEl, DialogManager.durationMs(toast));
        };

        const schedule = () => {
            timeoutId = setTimeout(dismiss, remaining);
        };

        const syncTimer = () => {
            if (closed) return;
            const shouldPause = hovering || focusing;
            if (shouldPause && !paused) {
                paused = true;
                clearTimeout(timeoutId);
                remaining -= Date.now() - startedAt;
            } else if (!shouldPause && paused) {
                paused = false;
                startedAt = Date.now();
                schedule();
            }
        };

        toast._fbDismiss = dismiss;
        fbQ(toast, 'button', '.fb-toast-close').onclick = () => dismiss();
        toast.addEventListener('mouseenter', () => { hovering = true; syncTimer(); });
        toast.addEventListener('mouseleave', () => { hovering = false; syncTimer(); });
        toast.addEventListener('focusin', () => { focusing = true; syncTimer(); });
        toast.addEventListener('focusout', (e) => {
            if (e.relatedTarget instanceof Node && toast.contains(e.relatedTarget)) return;
            focusing = false;
            syncTimer();
        });

        const others = [...container.querySelectorAll('.fb-toast-slot')];
        const before = others.map((el) => el.getBoundingClientRect());
        if (fromTop) {
            const firstSlot = others[0];
            if (firstSlot) container.insertBefore(slot, firstSlot);
            else container.appendChild(slot);
        } else {
            container.appendChild(slot);
        }

        const inMs = DialogManager.cssTimeToMs(getComputedStyle(toast).animationDuration);
        if (inMs > 0) {
            others.forEach((el, i) => {
                const dy = before[i].top - el.getBoundingClientRect().top;
                if (!dy) return;
                el.animate(
                    [{ transform: `translateY(${dy}px)` }, { transform: 'none' }],
                    { duration: inMs, easing: 'ease-out' },
                );
            });
        }

        ToastManager.promote();
        ToastManager.announce(text, type);
        schedule();

        return { close: dismiss };
    },

    /*=================
        הודעות שונות 
    =================== */

    success(text, duration = 3000, icon = '✅') {
        return ToastManager.show(text, 'success', icon, duration);
    },

    error(text, duration = 4000, icon = '❌') {
        return ToastManager.show(text, 'error', icon, duration);
    },

    warning(text, duration = 3500, icon = '⚠️') {
        return ToastManager.show(text, 'warning', icon, duration);
    },

    info(text, duration = 3000, icon = 'ℹ️') {
        return ToastManager.show(text, 'info', icon, duration);
    }
}

/**
 * מחרוזת → `{ message }`. אובייקט עובר כמו שהוא.
 * @template {Record<string, any>} T
 * @param {string | T} data
 * @returns {T}
 */
function asDialogData(data) {
    return typeof data === 'string' ? /** @type {T} */ (/** @type {unknown} */ ({ message: data })) : data;
}

/**@type {FeedbackObject} */
export const Feedback = {
    alert: (data) => DialogManager.alert(asDialogData(data)),
    confirm: (data) => DialogManager.confirm(asDialogData(data)),
    prompt: /** @type {FeedbackObject['prompt']} */ ((data) => DialogManager.prompt(asDialogData(data))),
    menu: DialogManager.menu,
    form: DialogManager.form,
    selector: DialogManager.selector,
    closeAll: () => DialogQueue.closeAll(),
    setLocale,
    getLocale,
    setToastPosition,
    getToastPosition,
    toast: {
        success: ToastManager.success,
        info: ToastManager.info,
        error: ToastManager.error,
        warning: ToastManager.warning
    }
};