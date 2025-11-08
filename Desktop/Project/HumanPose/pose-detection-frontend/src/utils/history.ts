export interface HistoryItem {
  id: string;
  type: 'image' | 'video' | 'live';
  timestamp: number;
  score: number;
  thumbnail?: string;
  data?: any;
}

export const saveToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
  const history = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };
  
  history.unshift(newItem);
  
  // Keep only last 50 items
  const trimmed = history.slice(0, 50);
  localStorage.setItem('poseHistory', JSON.stringify(trimmed));
};

export const getHistory = (): HistoryItem[] => {
  const saved = localStorage.getItem('poseHistory');
  return saved ? JSON.parse(saved) : [];
};