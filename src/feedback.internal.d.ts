import type {
    FeedbackObject,
    feedbackAlert,
    feedbackBtn,
    feedbackConfirm,
    feedbackField,
    feedbackForm,
    feedbackMenu,
    feedbackPrompt,
    feedbackSelector,
    feedbackDialogVars,
    feedbackSize,
    feedbackToastHandle,
    themeString,
} from './feedback.d.ts';

export type feedbackClose = (value?: any) => void

export type feedbackOnRender = (dialog: HTMLDialogElement, close: feedbackClose) => void

export type feedbackDialog = {
    message?: string
    title?: string
    buildContent?: (root: HTMLElement) => void
    onRender?: feedbackOnRender
    dismissValue?: boolean | null | undefined
    role?: 'dialog' | 'alertdialog'
    size?: feedbackSize
    closeOnBackdrop?: boolean
    vars?: feedbackDialogVars
}

export type FbDialog = HTMLDialogElement & {
    _fbShowFailed?: () => void
    _fbAbort?: () => void
    _fbForceClose?: () => void
    _fbShown?: () => void
}

export type FbToast = HTMLDivElement & {
    _fbDismiss?: () => void
}

export type toast = {
    applyPosition: (container: HTMLElement) => void
    getContainer: () => HTMLElement
    announce: (text: string, type: string) => void
    promote: () => void
    releaseFrom: (host: Node) => void
    show: (
        text: string,
        type: themeString,
        icon: string,
        duration?: number
    ) => feedbackToastHandle
    success: (text: string, duration?: number, icon?: string) => feedbackToastHandle
    info: (text: string, duration?: number, icon?: string) => feedbackToastHandle
    error: (text: string, duration?: number, icon?: string) => feedbackToastHandle
    warning: (text: string, duration?: number, icon?: string) => feedbackToastHandle
}

export type dialogManager = {
    convertBtn: (btn?: feedbackBtn) => { text: string, theme?: themeString }
    btnClass: (theme?: themeString, extra?: string) => string
    durationMs: (el: Element) => number
    cssTimeToMs: (raw: string) => number
    applyConstraintMessage: (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => void
    reportFormValidity: (formEl: HTMLFormElement) => boolean
    selectOption: (opt: string | { value: any, text: string }) => { value: any, text: string }
    coerceFieldValue: (field: Pick<feedbackField, 'type'>, raw: FormDataEntryValue | null) => string | number | boolean | undefined
    fieldName: (name: string) => string
    fieldType: <T extends string>(type: unknown, allowed: readonly T[]) => T
    applyInputLimits: (control: HTMLElement, field: Pick<feedbackField, 'min' | 'max' | 'step'>) => void
    normalizeDialogVars: (vars?: unknown) => [string, string][]
    createDialog: (data: feedbackDialog) => Promise<any | void | null>
    alert: (data: feedbackAlert) => Promise<void>
    confirm: (data: feedbackConfirm) => Promise<boolean>
    prompt: (data: feedbackPrompt) => Promise<string | number | undefined | null>
    menu: <T = any>(data: feedbackMenu<T>) => Promise<T | null | undefined>
    form: (data: feedbackForm) => Promise<Record<string, string | number | boolean | undefined> | null>
    selector: <T = any>(data: feedbackSelector<T>) => Promise<T | null>
}

export type { FeedbackObject };
