const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '..', 'backend', 'data', 'words.json');
const TARGET_COUNT = 1000;

const hebrewSingles = [
  // Animals
  'אריה', 'נמר', 'דוב', 'זאב', 'שועל', 'חתול', 'כלב', 'סוס', 'פרה', 'כבש', 'עז', 'תיש', 'חזיר', 'פיל', 'קרנף',
  'היפופוטם', 'גמל', 'ג׳ירפה', 'זברה', 'קנגורו', 'קואלה', 'פנדה', 'אייל', 'צבי', 'דביבון', 'סנאי', 'דולפין',
  'לוויתן', 'כריש', 'תמנון', 'סוס ים', 'צבת ים', 'חזיר ים', 'דג חרב', 'קרפדה', 'צפרדע', 'תנין', 'לטאה', 'צב',
  'נחש', 'זיקית', 'נמלה', 'חיפושית', 'חגב', 'חסילון', 'פרפר', 'שפירית', 'דבורה', 'צרצר', 'יתוש', 'פרת משה',
  'פינגווין', 'ברווז', 'אווז', 'ברבור', 'קורמורן', 'חסידה', 'אנפה', 'חוחית', 'דרור', 'יונה', 'תור', 'שחף',
  'בז', 'עיט', 'נשר', 'ינשוף', 'תנשמת', 'שלדג', 'תוכי', 'קקדו', 'קנרית', 'צופית', 'דוכיפת', 'עורב', 'עורבני',
  'שליו', 'תרנגול', 'תרנגולת', 'חולדה', 'עכבר', 'ארנבת', 'ארנב', 'גרביל', 'מרמיטה', 'עצלן', 'שועלית',
  'תן', 'זאב ערבות', 'בואש', 'חולד', 'עטלף', 'לוטרה', 'חפרפרת', 'למינג', 'אופוסום', 'חדף'
];

const hebrewFoods = [
  'לחם', 'חלה', 'לחמנייה', 'בייגל', 'פיתה', 'לאפה', 'חומוס', 'טחינה', 'פלאפל', 'שווארמה', 'מעורב', 'פסטרמה',
  'קציצות', 'שניצל', 'פיצה', 'פסטה', 'ניוקי', 'ריזוטו', 'אורז', 'קוסקוס', 'קינואה', 'בורגול', 'מרק עוף',
  'מרק עדשים', 'מרק ירקות', 'מרק בצל', 'קובה', 'גולאש', 'קציצות דגים', 'גפילטע פיש', 'סלט קצוץ', 'סלט יווני',
  'סלט חצילים', 'סלט כרוב', 'טאבולה', 'שקשוקה', 'חביתה', 'סנדוויץ׳', 'כריך', 'טוסט', 'סביח', 'בורקס', 'פאי תפוחים',
  'פשטידה', 'עוגת גבינה', 'עוגת שוקולד', 'עוגת גזר', 'עוגת שמרים', 'עוגיות חמאה', 'עוגיות שוקולד', 'קרואסון',
  'בלינצ׳ס', 'פנקייק', 'וופל בלגי', 'סופגניה', 'אוזני המן', 'חלבה', 'בקלאווה', 'מלבי', 'קדאיף', 'טירמיסו',
  'גלידה וניל', 'גלידה שוקולד', 'גלידה תות', 'שייק מנגו', 'שייק בננה', 'מיץ תפוזים', 'מיץ רימונים', 'קפה שחור',
  'אספרסו', 'קפוצ׳ינו', 'לאטה', 'תה ירוק', 'תה נענע', 'לימונדה', 'שוקו חם', 'מים מינרליים'
];

const hebrewHousehold = [
  'בית', 'דירה', 'גינה', 'מרפסת', 'מטבח', 'סלון', 'חדר שינה', 'חדר עבודה', 'חדר ילדים', 'מזווה', 'מחסן', 'חדר כביסה',
  'מדיח כלים', 'מקרר', 'מקפיא', 'תנור', 'כיריים', 'מיקרוגל', 'קומקום', 'טוסטר', 'בלנדר', 'מיקסר', 'מכונת קפה',
  'סיר', 'מחבת', 'מצקת', 'מרית', 'קערה', 'צלחת', 'סכו״ם', 'כוס', 'ספל', 'בקבוק', 'מגש', 'קרש חיתוך', 'מסננת',
  'מדף', 'ארון', 'שידה', 'ספריה', 'שולחן', 'כיסא', 'ספה', 'כורסה', 'שולחן קפה', 'שטיח', 'וילון', 'מנורה', 'מראה',
  'שעון קיר', 'תמונה', 'אגרטל', 'עציץ', 'כרית', 'שמיכה', 'סדין', 'שמיכת פוך', 'שמיכת קיץ', 'מגבת', 'מגבת ידיים',
  'מייבש כביסה', 'מכונת כביסה', 'גיהוץ', 'מגהץ', 'קרש גיהוץ', 'מסיר אבק', 'שואב אבק', 'מטאטא', 'יעה', 'דלי',
  'סבון כלים', 'סבון רצפה', 'אקונומיקה', 'מטהר אוויר', 'שקית אשפה', 'פח אשפה', 'מד חום', 'לוח מודעות', 'מתלה מעילים'
];

const hebrewEducation = [
  'בית ספר', 'גן ילדים', 'כיתה', 'לוח', 'גיר', 'טוש מחיק', 'ספסל', 'יומן', 'מערכת שעות', 'מורה', 'תלמיד', 'ספר לימוד',
  'מחברת', 'קלסר', 'תיק גב', 'קלמר', 'עפרון', 'עט כדורי', 'עט סימון', 'סרגל', 'מחוגה', 'מחשבון', 'מחשב נייד', 'טאבלט',
  'מדפסת', 'הדפסה', 'מעבדה', 'ניסוי', 'ספרייה', 'ספרן', 'חצר משחקים', 'פעמון בית ספר', 'טיול שנתי', 'עבודת חקר',
  'מבחן', 'בוחן', 'ציונים', 'תעודה', 'מסיבת סיום', 'חוג', 'סדנה', 'הרצאה', 'מגרש ספורט', 'חדר מוזיקה', 'אולם ספורט',
  'מועצת תלמידים', 'שיעור בית', 'שיעור פרטי', 'בגרות', 'סקר קורס', 'מערכת מקוונת'
];

const hebrewProfessions = [
  'רופא', 'אח', 'אחות', 'רוקח', 'מנתח', 'פיזיותרפיסט', 'פסיכולוג', 'עובד סוציאלי', 'מורה', 'גננת', 'מרצה', 'עיתונאי',
  'צלם', 'סופר', 'עורך דין', 'שופט', 'שוטר', 'כבאי', 'חייל', 'טייס', 'מהנדס', 'אדריכל', 'מעצב גרפי', 'מעצב פנים',
  'מתכנת', 'מפתח תוכנה', 'בודק תוכנה', 'מנתח מערכות', 'מנהל מוצר', 'אנליסט נתונים', 'כלכלן', 'רו״ח', 'יועץ מס',
  'חשמלאי', 'אינסטלטור', 'נגר', 'רתך', 'מסגר', 'קבלן', 'בנאי', 'נהג אוטובוס', 'נהג מונית', 'קופאי', 'מוכר',
  'ספר', 'מאפר', 'ספרית', 'שף', 'טבח', 'אופה', 'קונדיטור', 'מלצר', 'ברמן', 'חוקר', 'מדען', 'אסטרונום', 'ביולוג',
  'כימאי', 'פיזיקאי', 'מתמטיקאי', 'חקלאי', 'גנן', 'דבוראי', 'דייג', 'חקלאית', 'וטרינר', 'מאמן כושר', 'מדריך יוגה'
];

const hebrewPlaces = [
  'מוזיאון', 'תיאטרון', 'קולנוע', 'ספריה עירונית', 'אולם קונצרטים', 'בית קפה', 'מסעדה', 'בר שכונתי', 'שוק מקורה',
  'קניון', 'מרכז מסחרי', 'פארק עירוני', 'גן שעשועים', 'גן בוטני', 'שמורת טבע', 'חוף ים', 'טיילת', 'נמל', 'מרינה',
  'שדה תעופה', 'תחנת רכבת', 'תחנת אוטובוס', 'תחנת דלק', 'מלון', 'אכסניה', 'צימר', 'בית הארחה', 'הוסטל', 'ספא',
  'קאנטרי קלאב', 'בריכה עירונית', 'אצטדיון', 'היכל ספורט', 'אולם אירועים', 'בית כנסת', 'כנסייה', 'מסגד', 'מרכז קהילתי',
  'בית עירייה', 'לשכת דואר', 'סניף בנק', 'יד לבנים', 'מרכז חוסן', 'מרפאה', 'בית חולים', 'בית מרקחת', 'תחנת משטרה',
  'כבאית', 'בית משפט', 'משרד ממשלתי', 'משרד נסיעות', 'סוכנות דואר', 'לשכת תעסוקה', 'בית דפוס', 'סטודיו', 'גלריה'
];

const hebrewNature = [
  'הר', 'עמק', 'גבעה', 'פסגה', 'מורד', 'מצוק', 'נקיק', 'קניון טבעי', 'מערה', 'מעיין', 'נחל', 'נהר', 'פלג', 'אגם',
  'בריכה טבעית', 'מפל', 'לגונה', 'ים', 'אוקיינוס', 'חוף', 'חול זהוב', 'חול לבן', 'צוק חוף', 'שונית', 'דיונה', 'מדבר',
  'ערבה', 'ערוץ', 'חורש', 'יער', 'פרדס', 'כרם', 'שדה', 'מטע', 'ערוגה', 'גינה קהילתית', 'גן לאומי', 'שמורת טבע',
  'שמיים', 'ענן', 'ערפל', 'טיפה', 'גשם', 'טל', 'שלג', 'ברד', 'כפור', 'רוח', 'סופה', 'סערה', 'ברק', 'רעם', 'קשת',
  'זריחה', 'שקיעה', 'שמש', 'ירח', 'כוכב', 'כוכבית', 'מטאור', 'צביר כוכבים', 'גלקסיה', 'יקום'
];

const hebrewSports = [
  'כדורגל', 'כדורסל', 'כדורעף', 'כדוריד', 'טניס', 'בדמינטון', 'טניס שולחן', 'הוקי קרח', 'הוקי שדה', 'בייסבול', 'סופטבול',
  'פוטבול', 'רגבי', 'אתלטיקה', 'ריצת שדה', 'מרתון', 'טריאתלון', 'אולטרה מרתון', 'רכיבת כביש', 'רכיבת שטח', ' רכיבת הרים',
  'שחייה', 'קפיצה למים', 'כדורמים', 'חתירה', 'קיאקים', 'קיאקים בים', 'גלישת גלים', 'גלישת רוח', 'גלישת עפיפונים',
  'סאפ', 'טיפוס קירות', 'טיפוס הרים', 'אגרוף', 'קיקבוקס', 'ג׳ודו', 'קראטה', 'טאקוונדו', 'אייקידו', 'אבקות', 'סומו',
  'סיף', 'ירי בחץ וקשת', 'ירי ברובה', 'ביאתלון', 'החלקה אומנותית', 'החלקה מהירה', 'סקי אלפיני', 'סקי קרוס קאונטרי',
  'סנובורד', 'סקייטבורד', 'גלגיליות', 'רולרבליידס', 'ספורט מוטורי', 'מרוץ מכוניות', 'ראלי', 'קארטינג', 'באולינג',
  'ביליארד', 'שחמט', 'דמקה', 'ברידג׳'
];

const hebrewTechnology = [
  'מחשב נייד', 'מחשב שולחני', 'מסך', 'מקלדת', 'עכבר', 'מדפסת', 'סורק', 'טאבלט', 'טלפון חכם', 'שעון חכם', 'רמקול',
  'אוזניות', 'מצלמה דיגיטלית', 'מצלמת אקשן', 'רחפן', 'קונסולת משחק', 'ג׳ויסטיק', 'בקר משחק', 'מודם', 'ראוטר',
  'שרת', 'ענן פרטי', 'כונן קשיח', 'כונן SSD', 'זיכרון נייד', 'מקלדת מכנית', 'מקלדת אלחוטית', 'עכבר אלחוטי', 'מטען מהיר',
  'מטען נייד', 'סוללה נטענת', 'מערכת שמע', 'מיקרופון', 'מיקסר אודיו', 'מקרן', 'מסך חכם', 'טלוויזיה חכמה', 'מערכת חכם',
  'בית חכם', 'נורה חכמה', 'תרמוסטט חכם', 'מצלמת אבטחה', 'אזעקה אלחוטית', 'צמיד כושר', 'מד צעדים', 'רצועת דופק',
  'חיישן תנועה', 'מתג חכם', 'שקע חכם', 'שלט אוניברסלי', 'קורא ספרים דיגיטלי', 'פד גרפי', 'מסך מגע'
];

const hebrewTransportation = [
  'מכונית', 'משאית', 'אוטובוס', 'מיניבוס', 'טנדר', 'אופניים', 'אופניים חשמליים', 'קורקינט', 'קטנוע', 'אופנוע',
  'רכבת', 'רכבת מהירה', 'רכבת קלה', 'רכבת תחתית', 'חשמלית', 'מונורייל', 'כבלית', 'רכבל', 'סירה', 'סירת מפרש',
  'יאכטה', 'ספינת תענוגות', 'מעבורת', 'קאנו', 'קיאק', 'גלשן רוח', 'גלשן גלים', 'סקי מים', 'אופנוע ים', 'מצנח ים',
  'מטוס', 'מטוס סילון', 'מטוס קל', 'מסוק', 'רחפן ענק', 'כדור פורח', 'אוירון קל', 'רחפת', 'טרקטור', 'טרקטורון',
  'כלי שיט', 'קרוואן', 'קמפר', 'אוטו קרוואן', 'רכב שטח', 'ג׳יפ', 'ספארי ג׳יפ', 'כלי רכב אוטונומי', 'רכב היברידי', 'מכונית חשמלית'
];

const hebrewClothing = [
  'חולצה', 'טי שירט', 'גופיה', 'מעיל', 'ז׳קט', 'סריג', 'סווצ׳ר', 'שמלה', 'חצאית', 'מכנסיים', 'ג׳ינס', 'מכנסיים קצרים',
  'חליפה', 'עניבה', 'חגורה', 'סוודר', 'מעיל רוח', 'מעיל גשם', 'מעיל חורף', 'מגבת חוף', 'גרביים', 'גרביים עבים', 'כפפות',
  'כובע', 'כובע שמש', 'כובע צמר', 'צעיף', 'נעלי ספורט', 'נעלי ריצה', 'נעלי עבודה', 'נעלי עקב', 'נעלי בית', 'סנדלים',
  'כפכפים', 'מגפיים', 'מגפיים גבוהים', 'מגפי גשם', 'בגד ים', 'חלוק אמבט', 'פיג׳מה', 'חליפת ספורט', 'חליפת סקי', 'בגד ריקוד',
  'מעיל עור', 'מעיל פוך', 'כובע מצחיה', 'משקפי שמש', 'משקפיים', 'תרמיל גב'
];

const hebrewBodyParts = [
  'ראש', 'מצח', 'עורף', 'לחי', 'סנטר', 'אוזן', 'אף', 'פה', 'שפתיים', 'לשון', 'שיניים', 'לסת', 'עיניים', 'ריסים', 'גבות',
  'צוואר', 'כתף', 'זרוע', 'מרפק', 'אמה', 'כף יד', 'אצבע', 'אגודל', 'ציפורן', 'חזה', 'גב', 'מותן', 'בטן', 'טבור',
  'ירך', 'ברך', 'שוק', 'קרסול', 'כף רגל', 'פיקה', 'עקב', 'גיד', 'שריר', 'ריאה', 'לב', 'כבד', 'כליה', 'כיס מרה', 'לבלב',
  'טחול', 'עמוד שדרה', 'חוליה', 'עצם', 'גולגולת', 'קרקפת'
];

const hebrewEmotions = [
  'שמחה', 'אושר', 'התרגשות', 'הנאה', 'אהבה', 'חיבה', 'געגועים', 'תקווה', 'אופטימיות', 'השראה', 'סיפוק', 'רוגע', 'שלווה',
  'גאווה', 'הערכה', 'הכרת תודה', 'פליאה', 'סקרנות', 'בדידות', 'געגוע', 'כאב', 'עצב', 'ייאוש', 'פחד', 'חרדה', 'דאגה', 'כעס',
  'תסכול', 'קנאה', 'מבוכה', 'ביטחון', 'אמון', 'נחישות', 'אומץ', 'חמלה', 'סבלנות', 'פתיחות', 'הכלה', 'התלהבות', 'נחת'
];

const hebrewMusic = [
  'פסנתר', 'כינור', 'צ׳לו', 'קונטרבס', 'חליל צד', 'קלרינט', 'סקסופון', 'אבוב', 'פגוט', 'חלילית', 'חצוצרה', 'טרומבון',
  'קרן יער', 'טובה', 'גיטרה', 'גיטרה חשמלית', 'בס', 'עוגב', 'סינטיסייזר', 'פסנתר חשמלי', 'אקורדיון', 'מפוחית', 'דרבוקה',
  'תופים', 'מרימבה', 'קסילופון', 'כלי הקשה', 'מצילות', 'טמבורין', 'בונגו', 'קחון', 'חצצרה', 'עוד', 'קאנון', 'בוזוקי',
  'כינור אלקטרוני', 'מנדולינה', 'קונצ׳רטינה', 'בנג׳ו', 'יוקולילי', 'כלי נגינה עתיק', 'תזמורת', 'הרכב קאמרי', 'להקת ג׳אז',
  'הרכב רוק', 'מקהלה', 'דואט', 'טריו', 'רביעיה'
];

const hebrewPhrases = [
  'בית ספר יסודי', 'בית ספר תיכון', 'חדר מורים', 'יום הורים', 'שעת סיפור', 'הפסקת אוכל', 'סיור לימודי', 'שיעור ספורט',
  'טיול שנתי', 'מחנה קיץ', 'שיעור נגינה', 'חוג ריקוד', 'סדנת צילום', 'הרצאת מדע', 'שיעור בישול', 'מפגש חברים',
  'ארוחת ערב', 'ארוחת בוקר', 'ארוחת צהריים', 'שולחן חג', 'סדר פסח', 'נר ראשון', 'מופע חנוכה', 'מסיבת פורים',
  'קבלת שבת', 'הדלקת נרות', 'טיול סוף שבוע', 'טיול אופניים', 'טיול משפחתי', 'טיול לילה', 'פיקניק משפחתי',
  'טיול במדבר', 'טיול לגליל', 'טיול לרמת הגולן', 'הליכה בחוף', 'מסלול פרחים', 'מסלול הררי', 'מסלול יער', 'טיול פריחה',
  'מסע אופניים', 'מסע מים', 'מסע שטח', 'מסע ניווט', 'טיפוס מצוקים', 'הרפתקת מערות', 'לילה בשטח', 'לינה באוהל',
  'לינה בחאן', 'קמפינג משפחתי', 'לילה במדבר', 'חופשת סקי', 'חופשת קיץ', 'חופשת חורף', 'חופשת אביב', 'חופשת סוכות',
  'חופשה זוגית', 'חופשה משפחתית', 'חופשה עירונית', 'חופשת ספא', 'סוף שבוע רגוע', 'יום ללא מסכים', 'יום התנדבות',
  'יום קהילה', 'ערב קולנוע', 'ערב משחקי קופסה', 'ערב תרבות', 'ערב קריוקי', 'מסיבת ריקודים', 'ערב פיוט', 'ערב שירה',
  'ערב ג׳אז', 'קונצרט ערב', 'הצגת ילדים', 'הצגת נוער', 'הצגת מבוגרים', 'סדנת תיאטרון', 'סדנת כתיבה', 'סדנת מדיטציה',
  'סדנת יוגה', 'קורס בישול', 'קורס אפייה', 'קורס קדרות', 'קורס פיסול', 'קורס ציור', 'קורס תכנות', 'קורס עיצוב',
  'קורס צילום', 'מפגש נטוורקינג', 'מסיבת פרידה', 'ארוחה חגיגית', 'בר מצווה', 'בת מצווה', 'מסיבת אירוסין', 'מסיבת רווקים',
  'מסיבת רווקות', 'חתונה משפחתית', 'יום נישואין', 'מסיבת הפתעה'
];



const englishSingles = [
  'lion', 'tiger', 'bear', 'wolf', 'fox', 'cat', 'dog', 'horse', 'cow', 'sheep', 'goat', 'pig', 'rhino', 'hippo', 'giraffe',
  'zebra', 'kangaroo', 'koala', 'panda', 'deer', 'moose', 'antelope', 'dolphin', 'whale', 'shark', 'octopus', 'seahorse',
  'turtle', 'crocodile', 'lizard', 'snake', 'chameleon', 'butterfly', 'dragonfly', 'ladybug', 'cricket', 'grasshopper',
  'firefly', 'penguin', 'swan', 'heron', 'sparrow', 'finch', 'pigeon', 'dove', 'falcon', 'eagle', 'owl', 'parrot', 'macaw',
  'canary', 'hummingbird', 'peacock', 'rooster', 'hen', 'duck', 'goose', 'turkey', 'hedgehog', 'hamster', 'squirrel',
  'rabbit', 'hare', 'chipmunk', 'ferret', 'otter', 'weasel', 'badger', 'skunk', 'raccoon', 'sloth', 'opossum', 'lemur',
  'armadillo', 'beaver', 'platypus', 'walrus', 'seal', 'lobster', 'shrimp', 'salmon', 'trout', 'anchovy', 'mackerel',
  'strawberry', 'blueberry', 'raspberry', 'blackberry', 'cranberry', 'apple', 'pear', 'peach', 'plum', 'nectarine', 'apricot',
  'banana', 'orange', 'grapefruit', 'lemon', 'lime', 'mango', 'papaya', 'pineapple', 'kiwi', 'melon', 'watermelon', 'grape',
  'pomegranate', 'fig', 'date', 'olive', 'tomato', 'cucumber', 'pepper', 'carrot', 'potato', 'yam', 'onion', 'garlic', 'ginger',
  'cabbage', 'lettuce', 'spinach', 'kale', 'broccoli', 'cauliflower', 'celery', 'parsley', 'cilantro', 'basil', 'oregano',
  'thyme', 'rosemary', 'sage', 'chive', 'dill', 'mint', 'cumin', 'paprika', 'turmeric', 'cinnamon', 'cardamom', 'clove',
  'vanilla', 'chocolate', 'caramel', 'marshmallow', 'hazelnut', 'almond', 'peanut', 'walnut', 'cashew', 'pistachio', 'pecan',
  'sunflower', 'pumpkin', 'sesame', 'chia', 'quinoa', 'oatmeal', 'granola', 'pancake', 'waffle', 'crepe', 'omelet', 'sandwich',
  'burger', 'falafel', 'shawarma', 'taco', 'burrito', 'sushi', 'ramen', 'udon', 'paella', 'risotto', 'lasagna', 'gnocchi',
  'noodle', 'dumpling', 'souffle', 'casserole', 'stew', 'soup', 'salad', 'pastry', 'croissant', 'muffin', 'cupcake', 'brownie',
  'cookie', 'biscuit', 'scone', 'pie', 'tart', 'pudding', 'custard', 'ice cream', 'sorbet', 'gelato', 'milkshake', 'smoothie',
  'espresso', 'latte', 'cappuccino', 'americano', 'mocha', 'tea', 'chai', 'lemonade', 'soda', 'cola', 'ginger ale', 'tonic',
  'water', 'mineral water', 'sparkling water', 'juice', 'nectar', 'cider', 'kombucha', 'mocktail', 'cocktail', 'martini',
  'mojito', 'sangria', 'punch', 'spritzer', 'smoothie bowl', 'oat milk', 'almond milk', 'soy milk', 'rice milk', 'yogurt',
  'cheese', 'butter', 'cream', 'milk', 'sour cream', 'cottage cheese', 'ricotta', 'feta', 'goat cheese', 'brie', 'cheddar',
  'gouda', 'parmesan', 'provolone', 'blue cheese', 'gruyere', 'camembert', 'edam', 'swiss cheese', 'pecorino', 'manchego',
  'halloumi', 'tofu', 'tempeh', 'seitan', 'miso', 'kimchi', 'sauerkraut', 'pickles', 'olives', 'tapenade', 'hummus', 'tahini',
  'guacamole', 'salsa', 'pesto', 'aioli', 'mayonnaise', 'ketchup', 'mustard', 'relish', 'chutney', 'marinade', 'dressing',
  'gravy', 'stock', 'broth', 'bouillon', 'seasoning', 'herbs', 'spices', 'flavor', 'aroma', 'texture', 'savory', 'sweet',
  'bitter', 'sour', 'salty', 'umami'
];

const englishPhrases = [
  'city park', 'urban garden', 'botanical garden', 'national park', 'nature reserve', 'wildlife sanctuary', 'mountain trail',
  'forest trail', 'river walk', 'coastal walk', 'desert hike', 'sunset cruise', 'sunrise paddle', 'campfire night', 'stargazing trip',
  'ski holiday', 'summer vacation', 'family picnic', 'weekend getaway', 'road trip', 'train journey', 'ferry ride', 'cycling tour',
  'wine tasting', 'farmers market', 'craft fair', 'art festival', 'music festival', 'book festival', 'food festival', 'film festival',
  'community theater', 'open mic', 'jazz night', 'poetry slam', 'dance workshop', 'yoga retreat', 'meditation retreat', 'cooking class',
  'baking class', 'photography walk', 'writing workshop', 'science lecture', 'history lecture', 'museum tour', 'gallery opening',
  'charity auction', 'charity run', 'volunteer day', 'cleanup drive', 'tree planting', 'beach cleanup', 'neighborhood brunch',
  'block party', 'garden party', 'birthday brunch', 'anniversary dinner', 'holiday feast', 'game night', 'movie marathon', 'craft night',
  'board game night', 'puzzle challenge', 'escape room', 'treasure hunt', 'team retreat', 'strategy session', 'design sprint',
  'product demo', 'launch party', 'user testing', 'hackathon weekend', 'innovation lab', 'feedback roundtable', 'leadership summit',
  'wellness fair', 'career fair', 'job interview', 'performance review', 'mentoring session', 'coaching call', 'training seminar',
  'skills workshop', 'language class', 'reading circle', 'study group', 'debate club', 'robotics club', 'coding club', 'art club',
  'music club', 'drama club', 'dance crew', 'choir rehearsal', 'band practice', 'orchestra rehearsal', 'science fair', 'math league',
  'quiz bowl', 'spelling bee', 'talent show', 'school assembly', 'parent meeting', 'open house'
];

function addWords(targetSet, words) {
  words.forEach(word => {
    const normalized = typeof word === 'string' ? word.trim() : '';
    if (normalized) {
      targetSet.add(normalized);
    }
  });
}

function extractWordsFromTextFile() {
  const filePath = path.join(__dirname, '..', 'backend', 'data', 'hebrew-words.txt');
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const entries = fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

  return Array.from(new Set(entries));
}

function buildHebrewWords() {
  const words = new Set();
  addWords(words, hebrewSingles);
  addWords(words, hebrewFoods);
  addWords(words, hebrewHousehold);
  addWords(words, hebrewEducation);
  addWords(words, hebrewProfessions);
  addWords(words, hebrewPlaces);
  addWords(words, hebrewNature);
  addWords(words, hebrewSports);
  addWords(words, hebrewTechnology);
  addWords(words, hebrewTransportation);
  addWords(words, hebrewClothing);
  addWords(words, hebrewBodyParts);
  addWords(words, hebrewEmotions);
  addWords(words, hebrewMusic);
  addWords(words, extractWordsFromTextFile());
  addWords(words, hebrewPhrases);

  const collectMulti = (arr) => arr
    .filter(w => typeof w === 'string' && w.includes(' '))
    .map(w => w.trim());

  const allowedHebrewMulti = new Set([
    ...hebrewPhrases.map(w => w.trim()),
    ...collectMulti(hebrewSingles),
    ...collectMulti(hebrewFoods),
    ...collectMulti(hebrewHousehold),
    ...collectMulti(hebrewEducation),
    ...collectMulti(hebrewProfessions),
    ...collectMulti(hebrewPlaces),
    ...collectMulti(hebrewNature),
    ...collectMulti(hebrewSports),
    ...collectMulti(hebrewTechnology),
    ...collectMulti(hebrewTransportation),
    ...collectMulti(hebrewClothing),
    ...collectMulti(hebrewBodyParts),
    ...collectMulti(hebrewEmotions),
    ...collectMulti(hebrewMusic),
    ...collectMulti(extractWordsFromTextFile())
  ]);

  const sanitizedHebrew = Array.from(words).filter(word => {
    if (!word.includes(' ')) {
      return true;
    }
    return allowedHebrewMulti.has(word.trim());
  });

  if (sanitizedHebrew.length < TARGET_COUNT) {
    throw new Error(`Hebrew word list too short (${sanitizedHebrew.length}). Please add more entries.`);
  }

  return sanitizedHebrew.slice(0, TARGET_COUNT);
}

function loadEnglishDictionary(limit) {
  const dictPath = '/usr/share/dict/words';
  if (!fs.existsSync(dictPath)) {
    return [];
  }
  const raw = fs.readFileSync(dictPath, 'utf8')
    .split('\n')
    .map(line => line.trim().toLowerCase())
    .filter(Boolean)
    .filter(word => /^[a-z]+$/.test(word));

  return limit ? raw.slice(0, limit) : raw;
}

function buildEnglishWords() {
  const words = new Set();
  addWords(words, englishSingles);

  const allowedEnglishPhrases = new Set([
    ...englishPhrases,
    ...englishSingles.filter(word => word.includes(' '))
  ]);

  englishPhrases.forEach(phrase => {
    if (allowedEnglishPhrases.has(phrase)) {
      words.add(phrase);
    }
  });

  const sanitizedEnglish = new Set(Array.from(words).filter(word => {
    if (!word.includes(' ')) {
      return true;
    }
    return allowedEnglishPhrases.has(word);
  }));

  if (sanitizedEnglish.size < TARGET_COUNT) {
    const needed = TARGET_COUNT - sanitizedEnglish.size;
    const dictionaryWords = loadEnglishDictionary(needed * 5)
      .filter(word => word.length >= 3 && word.length <= 9);

    for (const word of dictionaryWords) {
      if (!word.includes('-')) {
        sanitizedEnglish.add(word);
      }
      if (sanitizedEnglish.size >= TARGET_COUNT) {
        break;
      }
    }
  }

  if (sanitizedEnglish.size < TARGET_COUNT) {
    throw new Error(`English word list too short (${sanitizedEnglish.size}). Please add more entries.`);
  }

  return Array.from(sanitizedEnglish).slice(0, TARGET_COUNT);
}

function main() {
  const hebrew = buildHebrewWords();
  const english = buildEnglishWords();

  const payload = {
    he: hebrew,
    en: english
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Generated ${hebrew.length} Hebrew words and ${english.length} English words at ${OUTPUT_PATH}`);
}

main();
