export const PADLET_PAGE_TEXTS = {
  loading: 'טוען לוח...',
  boardNotFound: 'לוח לא נמצא',
  backToHome: 'חזרה לבית',

  deletePost: {
    title: 'מחיקת פוסט',
    description: 'האם את/ה בטוח/ה שברצונך למחוק את הפוסט?',
    confirmLabel: 'מחק',
    pendingLabel: 'מוחק...',
  },

  leaveBoard: {
    title: 'עזיבת לוח',
    description: (boardTitle: string) =>
      `האם את/ה בטוח/ה שברצונך לעזוב את הלוח "${boardTitle}"? לא תהיה לך יותר גישה אליו.`,
    confirmLabel: 'עזוב',
    pendingLabel: 'עוזב/ת...',
  },
};
