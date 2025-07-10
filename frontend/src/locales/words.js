import { useState, useEffect, useCallback } from 'react';

export const WORD_POOLS = {
  he: [
    // Animals (בעלי חיים)
    'אריה', 'נמר', 'דוב', 'זאב', 'שועל', 'חתול', 'כלב', 'סוס', 'פרה', 'כבש',
    'עז', 'חזיר', 'פיל', 'קוף', 'ג׳ירפה', 'זברה', 'צבי', 'ארנב', 'עכבר', 'דולפין',
    'לוויתן', 'כריש', 'דג זהב', 'ציפור', 'נשר', 'יונה', 'תרנגול', 'ברווז', 'אווז', 'דבורה',
    'זבוב', 'פרפר', 'נחש', 'לטאה', 'צפרדע', 'עכביש', 'קרח', 'סרטן', 'דיונון', 'מדוזה',

    // Food & Drinks (אוכל ומשקאות)
    'לחם', 'גבינה', 'חלב', 'ביצה', 'דגים', 'בשר', 'עוף', 'אורז', 'פסטה', 'פיצה',
    'המבורגר', 'נקניק', 'סלט', 'מרק', 'עוגה', 'שוקולד', 'גלידה', 'עוגיות', 'דבש', 'ריבה',
    'תפוח', 'בננה', 'תפוז', 'לימון', 'אבטיח', 'מלון', 'ענבים', 'תות', 'אפרסק', 'משמש',
    'קפה', 'תה', 'מיץ', 'מים', 'יין', 'בירה', 'וודקה', 'קוקה קולה', 'לימונדה', 'חלב שקד',

    // Body Parts (חלקי הגוף)
    'ראש', 'פנים', 'עיניים', 'אף', 'פה', 'שיניים', 'לשון', 'אוזניים', 'צוואר', 'כתפיים',
    'זרועות', 'ידיים', 'אצבעות', 'ציפורניים', 'חזה', 'בטן', 'גב', 'רגליים', 'ברכיים', 'כפות רגליים',
    'לב', 'מוח', 'ריאות', 'כבד', 'כליות', 'עצמות', 'שרירים', 'עור', 'שיער', 'זקן',

    // Clothing (ביגוד)
    'חולצה', 'מכנסיים', 'שמלה', 'חצאית', 'ז׳קט', 'מעיל', 'סוודר', 'גרביים', 'נעליים', 'כובע',
    'כפפות', 'צעיף', 'חגורה', 'עניבה', 'תחתונים', 'חזייה', 'פיג׳מה', 'בגד ים', 'מגפיים', 'סנדלים',
    'משקפיים', 'שעון', 'תיק', 'ארנק', 'תכשיטים', 'שרשרת', 'עגילים', 'טבעת', 'צמיד', 'סיכה',

    // House & Furniture (בית ורהיטים)
    'בית', 'דירה', 'חדר', 'סלון', 'מטבח', 'חדר שינה', 'אמבטיה', 'מרפסת', 'גינה', 'דלת',
    'חלון', 'קיר', 'תקרה', 'רצפה', 'מדרגות', 'מעלית', 'שולחן', 'כיסא', 'ספה', 'מיטה',
    'ארון', 'מדפים', 'מקרר', 'תנור', 'כיריים', 'מכונת כביסה', 'מייבש', 'מדיח כלים', 'טלוויזיה', 'מחשב',

    // Transportation (תחבורה)
    'מכונית', 'אוטובוס', 'רכבת', 'מטוס', 'אניה', 'סירה', 'אופניים', 'אופנוע', 'משאית', 'מונית',
    'אמבולנס', 'מכבת אש', 'משטרה', 'גגלגלים', 'הגה', 'בלמים', 'מנוע', 'דלק', 'כביש', 'רמזור',
    'חניה', 'תחנת דלק', 'נמל תעופה', 'תחנת רכבת', 'מעבר חצייה', 'מדרכה', 'גשר', 'מנהרה', 'צומת', 'כביש מהיר',

    // Weather & Nature (מזג אויר וטבע)
    'שמש', 'ירח', 'כוכבים', 'עננים', 'גשם', 'שלג', 'ברד', 'רוח', 'ברק', 'רעם',
    'קשת', 'ערפל', 'שמיים', 'אוויר', 'חום', 'קור', 'לחות', 'יובש', 'הר', 'עמק',
    'נהר', 'ים', 'אגם', 'מפל', 'מדבר', 'יער', 'שדה', 'חוף', 'אי', 'מערה',

    // Professions (מקצועות)
    'רופא', 'אחות', 'מורה', 'מהנדס', 'עורך דין', 'שוטר', 'כבאי', 'טייס', 'נהג', 'טבח',
    'מלצר', 'מוכר', 'ספר', 'איכר', 'בנאי', 'חשמלאי', 'רופא שיניים', 'וטרינר', 'עיתונאי', 'צלם',
    'אמן', 'מוזיקאי', 'שחקן', 'רקדן', 'כותב', 'משורר', 'זמר', 'קוסם', 'ליצן', 'ספורטאי',

    // Sports & Activities (ספורט ופעילויות)
    'כדורגל', 'כדורסל', 'טניס', 'שחייה', 'ריצה', 'רכיבה על אופניים', 'יוגה', 'פילאטס', 'כושר', 'ריקוד',
    'שירה', 'נגינה', 'ציור', 'קריאה', 'כתיבה', 'בישול', 'אפייה', 'גינון', 'דיג', 'קמפינג',
    'טיולים', 'צילום', 'אוסף בולים', 'משחקי מחשב', 'שחמט', 'דמקה', 'קלפים', 'פאזל', 'לגו', 'בובות',

    // Colors (צבעים)
    'אדום', 'כחול', 'ירוק', 'צהוב', 'סגול', 'ורוד', 'כתום', 'חום', 'שחור', 'לבן',
    'אפור', 'זהב', 'כסף', 'ברונזה', 'שקוף', 'צבעוני', 'בהיר', 'כהה', 'בוהק', 'עמום',

    // Emotions & Feelings (רגשות ותחושות)
    'שמחה', 'עצב', 'כעס', 'פחד', 'אהבה', 'שנאה', 'קנאה', 'גאווה', 'בושה', 'התרגשות',
    'עייפות', 'רעב', 'צמא', 'כאב', 'בריאות', 'מחלה', 'הקלה', 'דאגה', 'תקווה', 'ייאוש',

    // School & Education (בית ספר וחינוך)
    'בית ספר', 'כיתה', 'מורה', 'תלמיד', 'לוח', 'ספר', 'מחברת', 'עט', 'עיפרון', 'מחק',
    'תיק', 'מבחן', 'הרצאה', 'שיעור', 'הפסקה', 'חופש', 'ציון', 'תעודה', 'דיפלומה', 'אוניברסיטה',

    // Technology (טכנולוגיה)
    'מחשב', 'טלפון', 'אינטרנט', 'אימייל', 'אפליקציה', 'אתר', 'רשתות חברתיות', 'וידאו', 'תמונה', 'מוזיקה',
    'משחק', 'תוכנה', 'חומרה', 'מסך', 'מקלדת', 'עכבר', 'מדפסת', 'סורק', 'רמקול', 'אוזניות',

    // Time & Calendar (זמן ולוח שנה)
    'יום', 'לילה', 'בוקר', 'צהריים', 'ערב', 'שעה', 'דקה', 'שנייה', 'שבוע', 'חודש',
    'שנה', 'עבר', 'הווה', 'עתיד', 'אתמול', 'היום', 'מחר', 'מהר', 'לאט', 'זמן'
  ],
  
  en: [
    // Animals
    'lion', 'tiger', 'bear', 'wolf', 'fox', 'cat', 'dog', 'horse', 'cow', 'sheep',
    'goat', 'pig', 'elephant', 'monkey', 'giraffe', 'zebra', 'deer', 'rabbit', 'mouse', 'dolphin',
    'whale', 'shark', 'goldfish', 'bird', 'eagle', 'dove', 'rooster', 'duck', 'goose', 'bee',
    'fly', 'butterfly', 'snake', 'lizard', 'frog', 'spider', 'crab', 'shrimp', 'octopus', 'jellyfish',

    // Food & Drinks
    'bread', 'cheese', 'milk', 'egg', 'fish', 'meat', 'chicken', 'rice', 'pasta', 'pizza',
    'hamburger', 'sausage', 'salad', 'soup', 'cake', 'chocolate', 'ice cream', 'cookies', 'honey', 'jam',
    'apple', 'banana', 'orange', 'lemon', 'watermelon', 'melon', 'grapes', 'strawberry', 'peach', 'apricot',
    'coffee', 'tea', 'juice', 'water', 'wine', 'beer', 'vodka', 'coca cola', 'lemonade', 'almond milk',

    // Body Parts
    'head', 'face', 'eyes', 'nose', 'mouth', 'teeth', 'tongue', 'ears', 'neck', 'shoulders',
    'arms', 'hands', 'fingers', 'nails', 'chest', 'stomach', 'back', 'legs', 'knees', 'feet',
    'heart', 'brain', 'lungs', 'liver', 'kidneys', 'bones', 'muscles', 'skin', 'hair', 'beard',

    // Clothing
    'shirt', 'pants', 'dress', 'skirt', 'jacket', 'coat', 'sweater', 'socks', 'shoes', 'hat',
    'gloves', 'scarf', 'belt', 'tie', 'underwear', 'bra', 'pajamas', 'swimsuit', 'boots', 'sandals',
    'glasses', 'watch', 'bag', 'wallet', 'jewelry', 'necklace', 'earrings', 'ring', 'bracelet', 'pin',

    // House & Furniture
    'house', 'apartment', 'room', 'living room', 'kitchen', 'bedroom', 'bathroom', 'balcony', 'garden', 'door',
    'window', 'wall', 'ceiling', 'floor', 'stairs', 'elevator', 'table', 'chair', 'sofa', 'bed',
    'closet', 'shelves', 'refrigerator', 'oven', 'stove', 'washing machine', 'dryer', 'dishwasher', 'television', 'computer',

    // Transportation
    'car', 'bus', 'train', 'airplane', 'ship', 'boat', 'bicycle', 'motorcycle', 'truck', 'taxi',
    'ambulance', 'fire truck', 'police car', 'wheels', 'steering wheel', 'brakes', 'engine', 'fuel', 'road', 'traffic light',
    'parking', 'gas station', 'airport', 'train station', 'crosswalk', 'sidewalk', 'bridge', 'tunnel', 'intersection', 'highway',

    // Weather & Nature
    'sun', 'moon', 'stars', 'clouds', 'rain', 'snow', 'hail', 'wind', 'lightning', 'thunder',
    'rainbow', 'fog', 'sky', 'air', 'heat', 'cold', 'humidity', 'dryness', 'mountain', 'valley',
    'river', 'sea', 'lake', 'waterfall', 'desert', 'forest', 'field', 'beach', 'island', 'cave',

    // Professions
    'doctor', 'nurse', 'teacher', 'engineer', 'lawyer', 'police officer', 'firefighter', 'pilot', 'driver', 'chef',
    'waiter', 'salesperson', 'hairdresser', 'farmer', 'builder', 'electrician', 'dentist', 'veterinarian', 'journalist', 'photographer',
    'artist', 'musician', 'actor', 'dancer', 'writer', 'poet', 'singer', 'magician', 'clown', 'athlete',

    // Sports & Activities
    'soccer', 'basketball', 'tennis', 'swimming', 'running', 'cycling', 'yoga', 'pilates', 'fitness', 'dancing',
    'singing', 'playing music', 'drawing', 'reading', 'writing', 'cooking', 'baking', 'gardening', 'fishing', 'camping',
    'hiking', 'photography', 'stamp collecting', 'video games', 'chess', 'checkers', 'cards', 'puzzle', 'lego', 'dolls',

    // Colors
    'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'brown', 'black', 'white',
    'gray', 'gold', 'silver', 'bronze', 'transparent', 'colorful', 'bright', 'dark', 'shiny', 'dull',

    // Emotions & Feelings
    'happiness', 'sadness', 'anger', 'fear', 'love', 'hate', 'jealousy', 'pride', 'shame', 'excitement',
    'tiredness', 'hunger', 'thirst', 'pain', 'health', 'illness', 'relief', 'worry', 'hope', 'despair',

    // School & Education
    'school', 'classroom', 'teacher', 'student', 'blackboard', 'book', 'notebook', 'pen', 'pencil', 'eraser',
    'backpack', 'test', 'lecture', 'lesson', 'break', 'vacation', 'grade', 'certificate', 'diploma', 'university',

    // Technology
    'computer', 'phone', 'internet', 'email', 'app', 'website', 'social media', 'video', 'photo', 'music',
    'game', 'software', 'hardware', 'screen', 'keyboard', 'mouse', 'printer', 'scanner', 'speaker', 'headphones',

    // Time & Calendar
    'day', 'night', 'morning', 'noon', 'evening', 'hour', 'minute', 'second', 'week', 'month',
    'year', 'past', 'present', 'future', 'yesterday', 'today', 'tomorrow', 'fast', 'slow', 'time'
  ]
};

// Word pool hook for local management
export const useWordPool = (language = 'he') => {
  const [shuffledWords, setShuffledWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const initializeWords = useCallback(() => {
    const words = WORD_POOLS[language] || WORD_POOLS.he;
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setCurrentIndex(0);
  }, [language]);
  
  const getNextWord = useCallback(() => {
    if (shuffledWords.length === 0) return 'מילה';
    const nextIndex = (currentIndex + 1) % shuffledWords.length;
    setCurrentIndex(nextIndex);
    return shuffledWords[nextIndex];
  }, [currentIndex, shuffledWords]);
  
  const getCurrentWord = useCallback(() => {
    return shuffledWords[currentIndex] || 'מילה';
  }, [shuffledWords, currentIndex]);
  
  // Re-shuffle when reaching end
  useEffect(() => {
    if (currentIndex >= shuffledWords.length - 5 && shuffledWords.length > 0) {
      initializeWords(); // Re-shuffle when close to end
    }
  }, [currentIndex, shuffledWords.length, initializeWords]);
  
  return {
    currentWord: getCurrentWord(),
    getNextWord,
    getCurrentWord, // Add this function to the return object
    initializeWords,
    remainingWords: shuffledWords.length - currentIndex
  };
};