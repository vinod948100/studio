import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { PagePerformance } from './types';

export async function getPerformanceData(): Promise<PagePerformance[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "performance-reports"));
    const data: PagePerformance[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...(doc.data() as Omit<PagePerformance, 'id'>) });
    });
    // sort by lastUpdated descending
    data.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    return data;
  } catch (error) {
    console.error("Error fetching performance data from Firestore:", error);
    return [];
  }
}
