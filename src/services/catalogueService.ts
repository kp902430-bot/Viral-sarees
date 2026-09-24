import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  getDocs,
  getDocFromServer
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Saree, SareeReel } from '../types';

const SAREES_COLLECTION = 'sarees';
const REELS_COLLECTION = 'reels';

// Helper to remove any undefined fields so Firestore doesn't reject document writes
function cleanFirestoreData<T extends Record<string, any>>(data: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        cleaned[key] = value.map((item) => (typeof item === 'object' && item !== null ? cleanFirestoreData(item) : item));
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = cleanFirestoreData(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

/**
 * Real-time listener for the store catalogue.
 * Every customer and owner gets instant live updates when sarees are added or changed.
 */
export function subscribeToCatalogue(
  onUpdate: (sarees: Saree[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const colRef = collection(db, SAREES_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const sareesList: Saree[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Saree;
          if (data && data.id) {
            sareesList.push(data);
          }
        });
        onUpdate(sareesList);
      },
      (error) => {
        console.warn('Firestore live catalogue snapshot error:', error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (error: any) {
    console.warn('Could not establish Firestore live listener for sarees:', error);
    if (onError) onError(error);
    return () => {};
  }
}

/**
 * Real-time listener for store video reels.
 */
export function subscribeToReels(
  onUpdate: (reels: SareeReel[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const colRef = collection(db, REELS_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const reelsList: SareeReel[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as SareeReel;
          if (data && data.id) {
            reelsList.push(data);
          }
        });
        onUpdate(reelsList);
      },
      (error) => {
        console.warn('Firestore reels snapshot error:', error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (error: any) {
    console.warn('Could not establish Firestore live listener for reels:', error);
    if (onError) onError(error);
    return () => {};
  }
}

/**
 * Save a saree to Cloud Firestore so all customers can see it immediately.
 */
export async function saveSareeToCloud(saree: Saree): Promise<void> {
  if (!saree.id) throw new Error('Saree ID is required');
  const cleaned = cleanFirestoreData(saree);
  const docRef = doc(db, SAREES_COLLECTION, saree.id);
  await setDoc(docRef, cleaned, { merge: true });
}

/**
 * Remove a saree from Cloud Firestore.
 */
export async function deleteSareeFromCloud(sareeId: string): Promise<void> {
  if (!sareeId) return;
  const docRef = doc(db, SAREES_COLLECTION, sareeId);
  await deleteDoc(docRef);
}

/**
 * Update stock status in Cloud Firestore.
 */
export async function updateSareeStockInCloud(sareeId: string, inStock: boolean): Promise<void> {
  if (!sareeId) return;
  const docRef = doc(db, SAREES_COLLECTION, sareeId);
  await updateDoc(docRef, { inStock });
}

/**
 * Save a video reel to Cloud Firestore.
 */
export async function saveReelToCloud(reel: SareeReel): Promise<void> {
  if (!reel.id) throw new Error('Reel ID is required');
  const cleaned = cleanFirestoreData(reel);
  const docRef = doc(db, REELS_COLLECTION, reel.id);
  await setDoc(docRef, cleaned, { merge: true });
}

/**
 * Upload local sarees to Cloud Firestore (ensures items added in owner's browser
 * are uploaded to the cloud database so all customers can see them).
 */
export async function syncLocalSareesToCloud(localSarees: Saree[]): Promise<number> {
  if (!localSarees || localSarees.length === 0) return 0;
  
  let uploadedCount = 0;
  try {
    // Check existing documents in Firestore
    const existingSnap = await getDocs(collection(db, SAREES_COLLECTION));
    const existingIds = new Set(existingSnap.docs.map(d => d.id));

    for (const saree of localSarees) {
      if (saree && saree.id && !existingIds.has(saree.id)) {
        await saveSareeToCloud(saree);
        uploadedCount++;
      }
    }
  } catch (err) {
    console.error('Error syncing local sarees to cloud:', err);
  }
  return uploadedCount;
}

/**
 * Test connectivity to Firestore as recommended in the skill guidelines.
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('Firestore is currently offline or unreachable.');
      return false;
    }
    // Any other response (like permission-denied or document-not-found) means connection reached server
    return true;
  }
}
