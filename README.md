# Feedback

**English** · [עברית](./README.he.md)

Dialogs and toasts for the browser. Zero dependencies, built-in RTL, and an API you can `await` like `alert` / `confirm` / `prompt` — without freezing the page.

[npm](https://www.npmjs.com/package/@simcha-adler/feedback-ui) · [GitHub](https://github.com/simcha-adler/feedback-ui) · [Live demo](https://simcha-adler.github.io/feedback-ui/demo/)

MIT · ESM + IIFE · Standalone CSS · Light/dark theming · Native `<dialog>`

---

## Why Feedback

- **The same `await` as `alert`, without blocking.** Promise-based, zero dependencies, ESM or a plain `<script>` tag. No framework needed.
- **A real `<dialog>`, not an overlay.** Built on `<dialog>.showModal()`, so the top layer, Esc and focus handling come from the browser. No `z-index` wars with the host page.
- **Toasts above dialogs, not behind them.** Toasts live in a popover; while a dialog is open they move *inside* it, so they stay visible.
- **Text only, no HTML injection.** Titles, messages, labels and toasts are rendered with `textContent`. There is no API that accepts HTML.
- **Return values you can trust.** `confirm` is always `true` or `false` — including after X or Esc. `menu` can return `0`, `''` or `false`.
- **One dialog at a time.** The rest wait in a queue. A held-down Enter key can't confirm the next dialog by accident.
- **Backdrop clicks don't close by default.** Safe for destructive actions. Opt in per call with `closeOnBackdrop: true`.
- **RTL and LTR from the document.** Logical CSS properties, `dir` comes from your page. Hebrew by default, English built in, any language via a dictionary.
- **Per-call styling that doesn't leak.** `size` and `vars` apply to one dialog and disappear with it.
- **Accessible by construction.** `alertdialog` for alert/confirm, `dialog` for the rest, proper `aria-*` labelling, `aria-live` toasts, focus set after the dialog is actually shown.

---

## Installation

```bash
npm install @simcha-adler/feedback-ui
```

```js
import { Feedback } from '@simcha-adler/feedback-ui';
import '@simcha-adler/feedback-ui/style.css';

await Feedback.alert('Operation completed');
```

### Without a bundler

Use the two files from `dist/` (with npm: `node_modules/@simcha-adler/feedback-ui/dist/`):

```html
<link rel="stylesheet" href="./dist/feedback.css" />
<script src="./dist/feedback.min.js"></script>
<script>
  Feedback.alert('Hello');
</script>
```

`window.Feedback` exists only after loading the IIFE build, not after an ESM `import`. There is no `@simcha-adler/feedback-ui/min` export.

### Browser support

Requires the `<dialog>` element and the Popover API. Browsers or WebViews without them are not supported.

---

## Quick start

```js
await Feedback.alert('Saved.');

const ok = await Feedback.confirm({
  title: 'Delete',
  message: 'Delete this record? This cannot be undone.',
  confirmBtn: { text: 'Delete', theme: 'danger' },
  cancelBtn: 'Cancel',
});
if (!ok) return;

Feedback.toast.success('Deleted');
```

---

## API at a glance

| Method | Use it for | Resolves with |
|---|---|---|
| `alert(message \| {…})` | A message with one button | `Promise<void>` — always `undefined` in JS; don't read it |
| `confirm(message \| {…})` | Yes / no | `Promise<boolean>` — always `true` or `false` |
| `prompt(message \| {…})` | One input field | The value on confirm, `null` on cancel |
| `menu({ buttons })` | Several actions | The button's `value` (or `undefined` if it has none); `null` on cancel |
| `selector({ items })` | Pick from a list (optionally searchable) | The item's `value`; `null` on cancel |
| `form({ fields })` | Several fields | An object keyed by `name`; `null` on cancel |
| `toast.success` / `info` / `warning` / `error` | A short message that doesn't block | `{ close() }` — not a Promise |
| `closeAll()` | Close the open dialog and clear the queue | `void` — every pending Promise resolves as if cancelled |
| `setLocale` / `getLocale` | Built-in text dictionary | `void` / a copy of the active dictionary |
| `setToastPosition` / `getToastPosition` | Where toasts appear | `void` / the active position |

`alert`, `confirm` and `prompt` accept either a string (the message) or an options object. A string cannot carry `closeOnBackdrop`, `vars`, or `urgent`.

---

## Return values

Always check by type, not by truthiness.

| API | On confirm | On X / Esc / cancel |
|---|---|---|
| `alert` | `undefined` | `undefined` |
| `confirm` | `true` | **`false`** (never `null`) |
| `prompt` | The field value | `null` |
| `menu` | `button.value` if the key exists, otherwise `undefined` | `null` |
| `selector` | `items[i].value` | `null` |
| `form` | `{ [field.name]: value }` | `null` |

Details worth knowing:

- **`menu`** returns `0`, `''` and `false` when those are the `value`. Check for `null` to detect cancel — don't write `if (result)`.
- **`prompt` with `type: 'number'`** and **`number` form fields** share one rule: empty → `undefined`; a finite number → `number`; `NaN` / `Infinity` → `undefined`.
- **`checkbox` form fields** are always `true` or `false`.
- **`select` form fields** without a `default` start on an empty row, not on the first option.
- All other field types return a string (or `''`). Values are always primitives — never `File`.
- **`closeAll`** while a close is already running keeps the chosen value: a confirm is not turned into a cancel. A new dialog waits for the closing animation.

---

## Dialogs

### Options

Shared by every dialog (object form only):

| Option | Meaning |
|---|---|
| `title` | Heading. Defaults come from the locale. |
| `message` | Body text (plain text; `\n` becomes a line break). |
| `size` | `'sm'` (~20rem) · `'md'` (default, 400px) · `'lg'` (~40rem, for wide forms). |
| `vars` | CSS variables for this dialog only. See [Per-dialog styling](#per-dialog-styling). |
| `closeOnBackdrop` | `true` to let a backdrop click close the dialog. See [Behavior](#behavior). |
| `urgent` | `true` to show this dialog now: the open one is hidden (its Promise stays pending, field values kept) and comes back after. See [Queue](#queue). |

Per method:

| Method | Method-specific options |
|---|---|
| `alert` | `btn` |
| `confirm` | `confirmBtn`, `cancelBtn` |
| `prompt` | `defaultText`, `placeholder`, `type`, `required`, `min`, `max`, `step`, `confirmBtn`, `cancelBtn` |
| `menu` | `buttons: { text, value?, theme? }[]`, `cancelBtn` |
| `selector` | `items: { text, value }[]`, `searchable`, `searchPlaceholder`, `cancelBtn` |
| `form` | `fields`, `confirmBtn`, `cancelBtn` |

`alert` has no `cancelBtn`.

### Buttons

A button is a string (`'OK'`) or `{ text, theme? }`.

`theme`: `primary` · `secondary` · `danger` · `warning` · `success` · `error` · `info` · `outline`.

An empty or missing `theme` gives a primary button; a cancel button without a theme is secondary.

### Examples

```js
const name = await Feedback.prompt({
  title: 'Project name',
  defaultText: 'Untitled',
  required: true,
});
if (name == null) return;

const action = await Feedback.menu({
  title: 'File',
  buttons: [
    { text: 'Edit', value: 'edit' },
    { text: 'Duplicate', value: 'duplicate', theme: 'secondary' },
    { text: 'Delete', value: 'delete', theme: 'danger' },
  ],
});

const lang = await Feedback.selector({
  title: 'Language',
  searchable: true,
  items: [
    { text: 'Hebrew', value: 'he' },
    { text: 'English', value: 'en' },
  ],
});

const profile = await Feedback.form({
  title: 'Profile',
  size: 'lg',
  fields: [
    { name: 'fullName', label: 'Name', required: true },
    { name: 'age', label: 'Age', type: 'number', min: 0 },
    { name: 'dept', label: 'Department', type: 'select', options: ['Engineering', { value: 'hr', text: 'Human Resources' }] },
    { name: 'notes', label: 'Notes', type: 'textarea' },
    { name: 'newsletter', label: 'Updates', type: 'checkbox', default: true },
  ],
});
```

### Prompt and form validation

`required`, `min`, `max`, `step` use native validation, and Enter won't submit an invalid value. Validation messages come from the active locale dictionary (`validation*` keys), not from the browser's language.

`prompt` `type`: `text` (default), `password`, `email`, `tel`, `url`, `search`, `number`.

### Form fields

| Field option | Meaning |
|---|---|
| `name` | Key in the result object. Must match `/^[A-Za-z_][A-Za-z0-9_-]*$/` — no spaces, no non-Latin characters. |
| `label` | Visible label. |
| `type` | `text` (default), `password`, `email`, `tel`, `url`, `search`, `number`, `textarea`, `select`, `checkbox`. |
| `required` | Native required validation. |
| `default` | Initial value. For `checkbox`, a truthy value means checked. |
| `placeholder` | Placeholder text. |
| `min` / `max` / `step` | Native constraints. |
| `options` | For `select`: strings (used as both value and text) or `{ value, text }`. |

An unsupported `type` (such as `file` or `date`) or an invalid `name` **rejects the returned Promise** when the form is built — it is not a synchronous throw, so use `await` or `.catch`.

---

## Toasts

```js
Feedback.toast.success('Saved');
Feedback.toast.error('Failed', 4000);
Feedback.toast.warning('Check your input', 3500, '⚠️');

const t = Feedback.toast.info('Loading…');
t.close();
```

Signature: `toast.<type>(text, duration?, icon?)`, returns `{ close() }`.

- Default durations: success / info 3000 ms, warning 3500 ms, error 4000 ms. `duration: 0` closes immediately.
- `icon` is a character (an emoji), rendered as text.
- Up to 5 toasts are visible at once; a new one pushes out the oldest.
- Hovering or focusing a toast pauses its timer.
- Toasts stay above an open dialog.
- Long text wraps at the container's maximum width.

### Position

```js
Feedback.setToastPosition('bottom-end');
Feedback.getToastPosition(); // 'bottom-end'
```

Allowed: `top-start` · `top-center` · `top-end` · `bottom-start` · `bottom-center` · `bottom-end`. Default: `bottom-center`. `start` and `end` follow the document's `dir`. The position is global (not per toast) and applies immediately. An unknown value throws `Error('Feedback: invalid toast position')`.

---

## Behavior

### Queue

Only one dialog is on screen at a time. Additional calls are queued and appear after the previous one closes. A held-down Enter key (key repeat) never confirms the next dialog in the queue.

`urgent: true` (object form only) shows this call now. If another dialog is open and not already closing, it is taken off the screen **without resolving** — typed field values stay on the element — and put back at the front of the queue. After the urgent dialog closes, the parked one is shown again. Two urgent calls in a row: the later one is on top (LIFO). There is still only one `showModal` at a time. Toasts are not dismissed; they may flicker while the open dialog is swapped.

```js
await Feedback.prompt({ title: 'Name', defaultText: '' });
// elsewhere, e.g. session expired:
await Feedback.alert({
  title: 'Disconnected',
  message: 'Sign in again.',
  urgent: true,
});
```

### Closing

Every dialog has an X button. **X and Esc always mean cancel**, resolving with the cancel value from the table above.

Clicking the backdrop does **not** close a dialog by default — it only plays a short attention animation. Pass `closeOnBackdrop: true` in an options object to enable it:

```js
await Feedback.confirm({
  message: 'Delete?',
  closeOnBackdrop: true, // X / Esc / backdrop → false
});
```

With the flag on, the dialog closes only if both the press and the release happened on the backdrop, so dragging from the dialog box outward does nothing. The result is the same cancel value as X. The backdrop is dimmed lightly with no blur — unlike the stronger scrim when backdrop clicks do not close.

### `closeAll`

`Feedback.closeAll()` closes the open dialog with its normal animation and immediately resolves everything still queued with the cancel value. It doesn't touch toasts.

### Errors

| Situation | What happens |
|---|---|
| `showModal` fails | The Promise **rejects** with `Error('Feedback: failed to show dialog')`. |
| Invalid field `name` / unsupported field or prompt `type` | The Promise **rejects** when the dialog is built. |
| Invalid `vars` | **Throws synchronously**, before the dialog is queued. |
| Unknown locale | `setLocale` throws `Error('Feedback: invalid locale')`. |
| Unknown toast position | `setToastPosition` throws `Error('Feedback: invalid toast position')`. |

---

## Locale (built-in text)

Default titles, buttons, placeholders, aria-labels and validation messages come from a dictionary. The default is **Hebrew**. Anything you pass in a call (`title`, `confirmBtn`, …) is never replaced. `dir` is not affected.

```js
Feedback.setLocale('en');   // built-in English
Feedback.setLocale('he');   // back to Hebrew
Feedback.getLocale();       // a copy of the active dictionary
```

`setLocale` affects only dialogs and toasts opened **after** the call.

The full unminified catalog is in `dist/feedback.locales.js`. With npm:

```js
import { Feedback } from '@simcha-adler/feedback-ui';
import { FeedbackLocales } from '@simcha-adler/feedback-ui/locales';

Feedback.setLocale(FeedbackLocales.en);
```

### Another language, or small tweaks

Pass an object. It is merged on top of the Hebrew dictionary; only keys with string values are applied, and any key you omit stays in Hebrew.

```js
Feedback.setLocale({
  closeDialog: 'Fermer la fenêtre',
  closeToast: 'Fermer',
  ok: 'OK',
  cancel: 'Annuler',
  save: 'Enregistrer',
  // …translate every key you need
});
```

To tweak English instead, start from the full English dictionary:

```js
Feedback.setLocale({ ...FeedbackLocales.en, ok: 'Got it' });
```

| Key | Where it appears |
|---|---|
| `closeDialog` | aria-label of the dialog's X button |
| `closeToast` | aria-label of the toast's X button |
| `ok` | Confirm button in alert / confirm |
| `cancel` | Cancel button |
| `save` | Confirm button in prompt / form |
| `alertTitle` | Default alert title |
| `confirmTitle` | Default confirm title |
| `menuTitle` | Default menu title |
| `inputTitle` | Default prompt and form title |
| `promptPlaceholder` | Prompt placeholder |
| `selectorTitle` | Default selector title |
| `selectorSearch` | Selector search placeholder |
| `selectorEmpty` | Empty selector list |
| `selectorNoResults` | Search with no results |
| `selectorList` | aria-label of the selector list |
| `validationRequired` | Required field left empty |
| `validationType` | Type mismatch (email, url, …) |
| `validationMin` / `validationMax` | Value below min / above max |
| `validationStep` | Value doesn't fit `step` |
| `validationTooShort` / `validationTooLong` | Text length out of range |
| `validationPattern` | Value doesn't match the pattern |

---

## Styling and direction

The library never forces `dir`. It uses logical properties, so it looks right in RTL and LTR according to the document.

### Global styling

Colors, radius and timing are CSS variables on `.fb-container`:

```css
.fb-container {
  --fb-primary: #2563eb;
  --fb-radius: 8px;
  --fb-duration: 0.2s;
  --fb-dialog-max: 400px;
}
```

Overriding them in your stylesheet affects **every** dialog and toast. All class names and IDs use the `fb-` prefix, and the library doesn't rely on the host page's CSS.

### Per-dialog styling

For a single call, use `size` or `vars` on the options object. `vars` sets CSS variables on that dialog only; the next dialog in the queue returns to the defaults.

```js
await Feedback.form({
  title: 'Invoice',
  vars: { '--fb-dialog-max': '45rem', '--fb-primary': '#0f766e' },
  fields: [{ name: 'id', label: 'Number' }],
});
```

Rules for `vars`:

- Keys must be CSS custom properties: `/^--[A-Za-z_][A-Za-z0-9_-]*$/`.
- Values are CSS strings exactly as in a stylesheet (`'32rem'`, `'0.2s'`) — numbers are not converted.
- A `null` or `undefined` value skips that key.
- An invalid key or a non-string value throws `Error('Feedback: invalid CSS variable')`; a `vars` that isn't an object throws `Error('Feedback: invalid dialog vars')`. Both happen synchronously, before the dialog is queued.
- `vars` wins over `size` for the same token (for example `--fb-dialog-max`).
- `vars` doesn't apply to toasts.

There is no public `className` option.

### Theming

- Default: follows `prefers-color-scheme`.
- Force a theme: `data-fb-theme="dark"` or `"light"` on `.fb-container` or any ancestor (`html` / `body`).

---

## How it compares

| | Feedback | Native `alert` / `confirm` / `prompt` | SweetAlert2 |
|---|---|---|---|
| Usage | `await Feedback.confirm(…)`, a method per dialog type | Blocks the whole thread | `Swal.fire({…})`; result is an object (`isConfirmed` / `isDismissed`) |
| Rendering | `<dialog>.showModal()` (top layer) | System window, not stylable | Overlay by default; opt-in `topLayer` option |
| Toasts above a dialog | Yes — they move into the open dialog | No toasts | Toast is a mode of the popup |
| HTML in content | Never (text only) | Text only | `html` option renders HTML — sanitize it yourself |
| Result checking | `confirm` is always a boolean | Boolean / string / `null` | Check the result object's fields |
| Backdrop click | Doesn't close by default | n/a | Closes by default |
| Dependencies | None | None | None |

Beyond the table: Feedback has a built-in dialog queue with Enter-repeat protection, document-driven RTL, a built-in Hebrew/English dictionary with locale-based validation messages, and per-call `size`/`vars` that never leak to the next dialog.

### When not to choose Feedback

- You need **HTML or custom slots** inside the dialog (links, rich SVG, forms beyond `form`).
- You need a **public `className`** per dialog, or per-toast positioning.
- You need `file` / `date` inputs, or non-primitive form values.
- You want an **official React wrapper** (Feedback is called from your state/handlers, not rendered as JSX).
- You must support browsers without `<dialog>` and the Popover API.
- You rely on a **plugin ecosystem**.

In those cases SweetAlert2 or a UI kit (Radix, MUI, Bootstrap) is a better fit.

---

## License

MIT — Simcha Adler, 2026.
