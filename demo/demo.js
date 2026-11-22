
function report(label, value) {
    console.log(label, value);
    Feedback.toast.info(`${label}: ${JSON.stringify(value)} (${typeof value})`, 5000);
}

document.getElementById('demo-dir-toggle').addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.dir === 'rtl' ? 'ltr' : 'rtl';
    html.dir = next;
    document.getElementById('demo-dir-toggle').textContent = next === 'rtl' ? 'LTR' : 'RTL';
});

document.getElementById('demo-theme-toggle').addEventListener('click', () => {
    const html = document.documentElement;
    const cur = html.getAttribute('data-fb-theme');
    const next = cur === 'light' ? 'dark' : cur === 'dark' ? '' : 'light';
    const btn = document.getElementById('demo-theme-toggle');
    if (next) {
        html.setAttribute('data-fb-theme', next);
        btn.textContent = next === 'light' ? 'בהיר' : 'כהה';
    } else {
        html.removeAttribute('data-fb-theme');
        btn.textContent = 'מערכת';
    }
});

// --- דיאלוגים: קבוצה 1 (שימושים בסיסיים והתאמות אישיות) ---

document.getElementById('simpalert1').addEventListener('click', async () => {
    await Feedback.alert('זוהי הודעת מערכת פשוטה שנועדה להעביר מידע למשתמש.');
});

document.getElementById('alert1').addEventListener('click', async () => {
    await Feedback.alert({
        title: 'עדכון מערכת',
        message: 'הנתונים עודכנו בהצלחה במסד הנתונים המקומי.',
        btn: 'הבנתי, תודה'
    });
});

document.getElementById('simpconfirm1').addEventListener('click', async () => {
    const isConfirmed = await Feedback.confirm('האם להמשיך בפעולה זו?');
    if (isConfirmed) Feedback.toast.success('המשכנו בפעולה.');
});

document.getElementById('confirm1').addEventListener('click', async () => {
    const result = await Feedback.confirm({
        title: 'מחיקת רשומה',
        message: 'האם אתה בטוח שברצונך למחוק את הרשומה הזו? לא ניתן יהיה לשחזר את המידע.',
        confirmBtn: { text: 'כן, מחק', theme: 'danger' },
        cancelBtn: { text: 'ביטול', theme: 'secondary' }
    });

    if (result) {
        Feedback.toast.success('הרשומה נמחקה בהצלחה.');
    } else {
        Feedback.toast.info('פעולת המחיקה בוטלה.');
    }
});

document.getElementById('simpprompt1').addEventListener('click', async () => {
    const name = await Feedback.prompt('אנא הזן את שמך:');
    if (name) Feedback.toast.success(`שלום, ${name}!`);
});

document.getElementById('prompt1').addEventListener('click', async () => {
    const value = await Feedback.prompt({
        title: 'שינוי שם פרויקט',
        message: 'הקלד את השם החדש שתרצה לתת לפרויקט הנוכחי:',
        defaultText: 'פרויקט_ללא_שם',
        placeholder: 'שם פרויקט...',
        confirmBtn: 'עדכן שם',
        cancelBtn: 'ביטול'
    });

    if (value) Feedback.toast.success(`שם הפרויקט שונה ל: ${value}`);
});

document.getElementById('menu1').addEventListener('click', async () => {
    const choice = await Feedback.menu({
        title: 'בחר פעולה לביצוע',
        message: 'מה תרצה לעשות עם הקובץ המסומן?',
        buttons: [
            { text: 'עריכה', value: 'edit', theme: 'primary' },
            { text: 'שכפול', value: 'duplicate', theme: 'secondary' },
            { text: 'מחיקה', value: 'delete', theme: 'danger' }
        ]
    });

    if (choice) Feedback.toast.info(`בחרת בפעולה: ${choice}`);
});

document.getElementById('form1').addEventListener('click', async () => {
    const formData = await Feedback.form({
        title: 'הגדרות חיבור למסד נתונים',
        message: 'אנא מלא את פרטי החיבור המקומיים:',
        fields: [
            { label: 'כתובת שרת', name: 'host', type: 'text', default: 'localhost', required: true },
            { label: 'פורט', name: 'port', type: 'number', default: '3306', required: true },
            { label: 'שם משתמש', name: 'username', type: 'text', required: true }
        ],
        confirmBtn: 'התחבר',
        cancelBtn: 'סגור'
    });

    if (formData) {
        console.log('Form Data:', formData);
        Feedback.toast.success(`מתחבר ל-${formData.host}:${formData.port}...`);
    }
});

document.getElementById('selector1').addEventListener('click', async () => {
    const selected = await Feedback.selector({
        title: 'בחר שפת תכנות',
        message: 'סנן ובחר את השפה המועדפת עליך:',
        searchable: true,
        searchPlaceholder: 'הקלד לסינון...',
        items: [
            { text: 'Vanilla JavaScript', value: 'js' },
            { text: 'HTML / CSS', value: 'html' },
            { text: 'TypeScript', value: 'ts' },
            { text: 'Python', value: 'py' },
            { text: 'C#', value: 'cs' }
        ]
    });

    if (selected) Feedback.toast.success(`הקוד הנבחר: ${selected}`);
});

// --- טוסטים ---

document.getElementById('success').addEventListener('click', () => {
    Feedback.toast.success('הפעולה הושלמה בהצלחה ללא שגיאות.', 3000);
});

document.getElementById('error').addEventListener('click', () => {
    Feedback.toast.error('אירעה שגיאה חמורה בשמירת הקובץ.', 4000);
});

document.getElementById('warning').addEventListener('click', () => {
    Feedback.toast.warning('שים לב: המקום בדיסק המקומי אוזל.', 4000);
});

document.getElementById('info').addEventListener('click', () => {
    Feedback.toast.info('ישנו עדכון גרסה זמין להורדה.', 3000);
});

// --- ערמות וכפילויות (תור דיאלוגים וטוסטים מרובים) ---

document.getElementById('toasts').addEventListener('click', () => {
    Feedback.toast.success('חיבור לרשת הצליח.');
    Feedback.toast.info('טוען נתונים...');
    Feedback.toast.warning('חלק מהרשומות חסרות.');
    Feedback.toast.error('שגיאה בייבוא טבלה.');
    Feedback.toast.info('עוד הודעה — מעבר למקס.');
    Feedback.toast.success('השישית דוחקת את הראשונה.');
});

document.getElementById('dialogs').addEventListener('click', () => {
    Feedback.alert('דיאלוג ראשון בתור');
    Feedback.alert('דיאלוג שני בתור');
    Feedback.alert('דיאלוג שלישי בתור');
    Feedback.confirm('דיאלוג רביעי - האם לאשר סיום?');
});

document.getElementById('toastsAndDialogs').addEventListener('click', () => {
    Feedback.toast.info('מפעיל רצף דיאלוגים...');
    Feedback.alert('דיאלוג ראשון מתוך רצף מעורב');
    Feedback.toast.success('דיאלוג ראשון הוצג');
    Feedback.confirm('האם להמשיך לשלב הבא?');
});

document.getElementById('toastsWait').addEventListener('click', async () => {
    Feedback.toast.info('מתחיל תהליך...', 2000);
    await new Promise(r => setTimeout(r, 1000));
    Feedback.toast.warning('מעבד נתונים...', 2000);
    await new Promise(r => setTimeout(r, 1000));
    Feedback.toast.success('סיים בהצלחה!', 3000);
});

// --- דיאלוגים: קבוצה 2 (הדגמת מגוון אפשרויות נוספות) ---

document.getElementById('simpalert2').addEventListener('click', async () => {
    await Feedback.alert('שים לב! הפעולה שביצעת אינה הפיכה.');
});

document.getElementById('alert2').addEventListener('click', async () => {
    await Feedback.alert({
        title: 'שגיאת התחברות',
        message: 'לא ניתן להתחבר לשרת כרגע. אנא בדוק את חיבור הרשת שלך ונסה שוב מאוחר יותר.',
        btn: 'סגור חלון'
    });
});

document.getElementById('simpconfirm2').addEventListener('click', async () => {
    const isConfirmed = await Feedback.confirm('האם ברצונך לצאת מהמערכת כעת?');
    if (isConfirmed) Feedback.toast.info('מתנתק...');
});

document.getElementById('confirm2').addEventListener('click', async () => {
    const result = await Feedback.confirm({
        title: 'שמירת שינויים',
        message: 'ישנם שינויים שלא נשמרו. האם לשמור אותם לפני היציאה?',
        confirmBtn: { text: 'שמור וצא', theme: 'success' },
        cancelBtn: { text: 'אל תשמור', theme: 'danger' }
    });

    if (result) {
        Feedback.toast.success('השינויים נשמרו.');
    } else {
        Feedback.toast.warning('השינויים בוטלו.');
    }
});

document.getElementById('simpprompt2').addEventListener('click', async () => {
    const email = await Feedback.prompt('הזן כתובת דואר אלקטרוני לשחזור סיסמה:');
    if (email) Feedback.toast.success(`נשלח קישור לכתובת: ${email}`);
});

document.getElementById('prompt2').addEventListener('click', async () => {
    const folderName = await Feedback.prompt({
        title: 'יצירת תיקייה חדשה',
        message: 'אנא הזן את שם התיקייה:',
        defaultText: 'תיקייה_חדשה_1',
        placeholder: 'שם התיקייה...',
        type: 'text',
        required: true,
        confirmBtn: 'צור',
        cancelBtn: 'בטל'
    });

    if (folderName) Feedback.toast.success(`התיקייה "${folderName}" נוצרה.`);
});

document.getElementById('menu2').addEventListener('click', async () => {
    const format = await Feedback.menu({
        title: 'אפשרויות ייצוא',
        message: 'באיזה פורמט תרצה לייצא את דוח הנתונים?',
        buttons: [
            { text: 'ייצוא ל-PDF', value: 'pdf', theme: 'danger' },
            { text: 'ייצוא ל-Excel', value: 'xls', theme: 'success' },
            { text: 'טקסט פשוט (CSV)', value: 'csv', theme: 'secondary' }
        ]
    });

    if (format) Feedback.toast.info(`מתחיל ייצוא בפורמט ${format.toUpperCase()}...`);
});

document.getElementById('form2').addEventListener('click', async () => {
    // הדגמה של טופס עם סוגי קלט שונים כמו טלפון ומספר עם הגבלות
    const profileData = await Feedback.form({
        title: 'עדכון פרופיל משתמש',
        message: 'אנא עדכן את פרטי הקשר שלך במערכת:',
        fields: [
            { label: 'שם מלא', name: 'fullName', type: 'text', required: true },
            { label: 'טלפון נייד', name: 'phone', type: 'tel' },
            { label: 'גיל', name: 'age', type: 'number', min: 18, max: 120 },
            { label: 'מחלקה', name: 'dept', type: 'select', options: ['פיתוח', { value: 'hr', text: 'משאבי אנוש' }, { value: 'sales', text: 'מכירות' }], default: 'פיתוח' },
            { label: 'הערות', name: 'notes', type: 'textarea', placeholder: 'פרט חופשי...' },
            { label: 'קבלת עדכונים', name: 'newsletter', type: 'checkbox', default: true }
        ],
        confirmBtn: 'עדכן פרטים',
        cancelBtn: 'ביטול'
    });

    if (profileData) {
        console.log('Profile Data Updated:', profileData);
        Feedback.toast.success('פרטי הפרופיל עודכנו בהצלחה.');
    }
});

document.getElementById('selector2').addEventListener('click', async () => {
    // הדגמה של סלקטור קצר ללא תיבת חיפוש
    const theme = await Feedback.selector({
        title: 'בחירת ערכת נושא',
        message: 'בחר את המראה המועדף עליך למערכת:',
        searchable: false, // ביטול החיפוש
        items: [
            { text: 'מראה בהיר (Light)', value: 'light' },
            { text: 'מראה כהה (Dark)', value: 'dark' },
            { text: 'מותאם למערכת ההפעלה', value: 'system' }
        ]
    });

    if (theme) Feedback.toast.info(`ערכת הנושא שונתה ל: ${theme}`);
});

// --- כפילויות עם המתנה (Wait) ---

document.getElementById('dialogsWait').addEventListener('click', async () => {
    // שימוש ב-await כדי לחכות שהמשתמש יסגור דיאלוג אחד לפני שהבא קופץ
    await Feedback.alert('שלב 1: מתחילים בתהליך האימות.');
    const proceed = await Feedback.confirm('שלב 2: הנתונים אומתו. להמשיך לשלב הסופי?');

    if (proceed) {
        const finalInput = await Feedback.prompt('שלב 3: הזן קוד אישור לסיכום:');
        if (finalInput) Feedback.toast.success('התהליך הושלם!');
    }
});

document.getElementById('toastsAndDialogsWait').addEventListener('click', async () => {
    Feedback.toast.info('מתחיל סריקת מערכת...');

    // המתנה מלאכותית של שניה
    await new Promise(resolve => setTimeout(resolve, 1000));

    await Feedback.alert('נמצאו 3 קבצים ישנים שאינם בשימוש.');

    Feedback.toast.warning('ממתין להחלטת משתמש...');

    const shouldDelete = await Feedback.confirm({
        title: 'ניקוי קבצים',
        message: 'האם למחוק את הקבצים הישנים כדי לפנות מקום?',
        confirmBtn: { text: 'כן, נקה', theme: 'danger' }
    });

    if (shouldDelete) {
        Feedback.toast.success('הקבצים נמחקו ופונה מקום בדיסק.');
    } else {
        Feedback.toast.info('הקבצים נשמרו ללא שינוי.');
    }
});

document.getElementById('test-queue').addEventListener('click', () => {
    Feedback.alert('ראשון — לחץ Enter');
    Feedback.alert('שני — רק זה אמור להופיע אחרי הראשון');
    Feedback.alert('שלישי');
    Feedback.confirm('רביעי — X או Esc או ביטול = false');
});

document.getElementById('test-confirm-contract').addEventListener('click', async () => {
    const result = await Feedback.confirm({
        title: 'חוזה confirm',
        message: 'אישור → true. ביטול / X / Esc → false.',
        confirmBtn: 'אישור',
        cancelBtn: 'ביטול'
    });
    report('confirm', result);
});

document.getElementById('test-menu-falsy').addEventListener('click', async () => {
    const value = await Feedback.menu({
        title: 'ערכי falsy',
        message: 'בחר אפס / ריק / false. ביטול ו-X אמורים להחזיר null.',
        buttons: [
            { text: 'אפס', value: 0, theme: 'primary' },
            { text: 'מחרוזת ריקה', value: '', theme: 'secondary' },
            { text: 'false', value: false, theme: 'danger' }
        ]
    });
    report('menu', value);
});

document.getElementById('test-selector-filter').addEventListener('click', async () => {
    const selected = await Feedback.selector({
        title: 'סינון',
        message: 'הקלד «תפ» — אמור להישאר רק תפוח. בחר אותו.',
        searchable: true,
        searchPlaceholder: 'חיפוש...',
        items: [
            { text: 'תפוח', value: 'apple' },
            { text: 'בננה', value: 'banana' },
            { text: 'אבטיח', value: 'melon' }
        ]
    });
    report('selector', selected);
});

document.getElementById('test-escaping').addEventListener('click', async () => {
    await Feedback.alert({
        title: 'כותרת עם "מרכאות" ו-<b>html</b>',
        message: 'שורה 1\nשורה 2 עם <b>bold</b> ו-"ציטוט".',
        btn: 'סגור'
    });
    const value = await Feedback.prompt({
        title: 'prompt עם ברירת מחדל מסוכנת',
        message: 'הערך אמור להיות טקסט. אין אירוע onfocus.',
        defaultText: 'a" onfocus="alert(1)',
        placeholder: 'x" onclick="alert(1)'
    });
    report('prompt-escape', value);
    Feedback.toast.info('toast <b>bold</b> ו-"ציטוט"');
});

document.getElementById('test-prompt-cancel').addEventListener('click', async () => {
    const value = await Feedback.prompt({
        title: 'ביטול prompt',
        message: 'X / Esc / ביטול → null. אישור מחזיר את הטקסט.',
        defaultText: '',
        required: false
    });
    report('prompt', value);
});

document.getElementById('test-size').addEventListener('click', async () => {
    await Feedback.alert({
        title: 'sm',
        message: 'רוחב צר (~20rem).',
        size: 'sm',
        btn: 'הבא: lg',
    });
    await Feedback.form({
        title: 'טופס רחב',
        message: 'size: lg (~40rem).',
        size: 'lg',
        fields: [
            { name: 'fullName', label: 'שם מלא', required: true, default: 'בדיקה' },
            { name: 'notes', label: 'הערות', type: 'textarea', placeholder: 'שדה ארוך בטופס רחב' },
        ],
        confirmBtn: 'סגור',
        cancelBtn: 'ביטול',
    });
});

document.getElementById('test-close-all').addEventListener('click', () => {
    Feedback.alert('ראשון — ייסגר ב-closeAll').then((v) => report('closeAll-1', v));
    Feedback.confirm('שני בתור').then((v) => report('closeAll-2', v));
    Feedback.prompt('שלישי בתור').then((v) => report('closeAll-3', v));
    setTimeout(() => Feedback.closeAll(), 400);
});
