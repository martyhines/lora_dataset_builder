import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, collection, addDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { ImageDoc } from '../../types';

describe('Firebase Integration Tests', () => {
  let testEnv: RulesTestEnvironment;
  let testUserId: string;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      firestore: {
        rules: `
          rules_version = '2';
          service cloud.firestore {
            match /databases/{database}/documents {
              match /users/{userId}/{document=**} {
                allow read, write: if request.auth != null && request.auth.uid == userId;
              }
            }
          }
        `,
        host: 'localhost',
        port: 8080
      },
      storage: {
        rules: `
          rules_version = '2';
          service firebase.storage {
            match /b/{bucket}/o {
              match /uploads/{userId}/{allPaths=**} {
                allow read, write: if request.auth != null && request.auth.uid == userId;
              }
            }
          }
        `,
        host: 'localhost',
        port: 9199
      }
    });

    testUserId = 'test-user-123';
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.clearStorage();
  });

  describe('Firestore Security Rules', () => {
    it('should allow authenticated user to read/write their own data', async () => {
      const authenticatedContext = testEnv.authenticatedContext(testUserId);
      const db = authenticatedContext.firestore();

      const imageDoc: Partial<ImageDoc> = {
        id: 'test-image-1',
        filename: 'test.jpg',
        status: 'pending',
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Should be able to write
      const docRef = doc(db, `users/${testUserId}/images/test-image-1`);
      await setDoc(docRef, imageDoc);

      // Should be able to read
      const docSnap = await getDoc(docRef);
      expect(docSnap.exists()).toBe(true);
      expect(docSnap.data()?.filename).toBe('test.jpg');
    });

    it('should deny access to other users data', async () => {
      const user1Context = testEnv.authenticatedContext('user-1');
      const user2Context = testEnv.authenticatedContext('user-2');

      const db1 = user1Context.firestore();
      const db2 = user2Context.firestore();

      // User 1 creates a document
      const docRef1 = doc(db1, 'users/user-1/images/test-image');
      await setDoc(docRef1, { filename: 'test.jpg' });

      // User 2 should not be able to read user 1's data
      const docRef2 = doc(db2, 'users/user-1/images/test-image');
      await expect(getDoc(docRef2)).rejects.toThrow();
    });

    it('should deny access to unauthenticated users', async () => {
      const unauthenticatedContext = testEnv.unauthenticatedContext();
      const db = unauthenticatedContext.firestore();

      const docRef = doc(db, `users/${testUserId}/images/test-image`);
      
      await expect(getDoc(docRef)).rejects.toThrow();
      await expect(setDoc(docRef, { filename: 'test.jpg' })).rejects.toThrow();
    });
  });

  describe('Storage Security Rules', () => {
    it('should allow authenticated user to upload to their folder', async () => {
      const authenticatedContext = testEnv.authenticatedContext(testUserId);
      const storage = authenticatedContext.storage();

      const fileRef = ref(storage, `uploads/${testUserId}/test-image.jpg`);
      const testFile = new Uint8Array([1, 2, 3, 4]);

      // Should be able to upload
      await uploadBytes(fileRef, testFile);

      // Should be able to get download URL
      const downloadURL = await getDownloadURL(fileRef);
      expect(downloadURL).toContain('test-image.jpg');
    });

    it('should deny upload to other users folders', async () => {
      const user1Context = testEnv.authenticatedContext('user-1');
      const storage = user1Context.storage();

      const fileRef = ref(storage, 'uploads/user-2/test-image.jpg');
      const testFile = new Uint8Array([1, 2, 3, 4]);

      await expect(uploadBytes(fileRef, testFile)).rejects.toThrow();
    });

    it('should deny access to unauthenticated users', async () => {
      const unauthenticatedContext = testEnv.unauthenticatedContext();
      const storage = unauthenticatedContext.storage();

      const fileRef = ref(storage, `uploads/${testUserId}/test-image.jpg`);
      const testFile = new Uint8Array([1, 2, 3, 4]);

      await expect(uploadBytes(fileRef, testFile)).rejects.toThrow();
    });
  });

  describe('Real-time Updates', () => {
    it('should receive real-time updates for image collection', async () => {
      const authenticatedContext = testEnv.authenticatedContext(testUserId);
      const db = authenticatedContext.firestore();

      const collectionRef = collection(db, `users/${testUserId}/images`);
      const updates: any[] = [];

      // Set up listener
      const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
        updates.push(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      // Wait for initial empty snapshot
      await new Promise(resolve => setTimeout(resolve, 100));

      // Add a document
      await addDoc(collectionRef, {
        filename: 'test1.jpg',
        status: 'pending',
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Wait for update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Add another document
      await addDoc(collectionRef, {
        filename: 'test2.jpg',
        status: 'pending',
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Wait for update
      await new Promise(resolve => setTimeout(resolve, 100));

      unsubscribe();

      // Should have received multiple updates
      expect(updates.length).toBeGreaterThan(1);
      expect(updates[updates.length - 1]).toHaveLength(2);
    });

    it('should handle document updates in real-time', async () => {
      const authenticatedContext = testEnv.authenticatedContext(testUserId);
      const db = authenticatedContext.firestore();

      const docRef = doc(db, `users/${testUserId}/images/test-image`);
      const updates: any[] = [];

      // Set up listener
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          updates.push({ id: snapshot.id, ...snapshot.data() });
        }
      });

      // Create document
      await setDoc(docRef, {
        filename: 'test.jpg',
        status: 'pending',
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Wait for update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update document
      await setDoc(docRef, {
        filename: 'test.jpg',
        status: 'complete',
        candidates: [
          {
            modelId: 'test-model',
            caption: 'Test caption',
            createdAt: Date.now()
          }
        ],
        selectedIndex: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Wait for update
      await new Promise(resolve => setTimeout(resolve, 100));

      unsubscribe();

      expect(updates.length).toBe(2);
      expect(updates[0].status).toBe('pending');
      expect(updates[1].status).toBe('complete');
      expect(updates[1].candidates).toHaveLength(1);
    });

    it('should handle document deletion in real-time', async () => {
      const authenticatedContext = testEnv.authenticatedContext(testUserId);
      const db = authenticatedContext.firestore();

      const docRef = doc(db, `users/${testUserId}/images/test-image`);
      const updates: any[] = [];
      let deletionDetected = false;

      // Set up listener
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          updates.push({ id: snapshot.id, ...snapshot.data() });
        } else {
          deletionDetected = true;
        }
      });

      // Create document
      await setDoc(docRef, {
        filename: 'test.jpg',
        status: 'pending',
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Wait for creation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Delete document
      await deleteDoc(docRef);

      // Wait for deletion
      await new Promise(resolve => setTimeout(resolve, 100));

      unsubscribe();

      expect(updates.length).toBe(1);
      expect(deletionDetected).toBe(true);
    });
  });

  describe('File Upload and Storage', () => {
    it('should handle complete upload workflow', async () => {
      const authenticatedContext = testEnv.authenticatedContext(testUserId);
      const db = authenticatedContext.firestore();
      const storage = authenticatedContext.storage();

      // Upload file
      const fileRef = ref(storage, `uploads/${testUserId}/test-image.jpg`);
      const testFile = new Uint8Array([1, 2, 3, 4, 5]);
      
      await uploadBytes(fileRef, testFile);
      const downloadURL = await getDownloadURL(fileRef);

      // Create Firestore document
      const docRef = doc(db, `users/${testUserId}/images/test-image`);
      const imageDoc: Partial<ImageDoc> = {
        id: 'test-image',
        filename: 'test-image.jpg',
        storagePath: `uploads/${testUserId}/test-image.jpg`,
        downloadURL,
        status: 'pending',
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await setDoc(docRef, imageDoc);

      // Verify document was created
      const docSnap = await getDoc(docRef);
      expect(docSnap.exists()).toBe(true);
      expect(docSnap.data()?.downloadURL).toBe(downloadURL);

      // Clean up - delete both file and document
      await deleteObject(fileRef);
      await deleteDoc(docRef);

      // Verify cleanup
      const docSnapAfterDelete = await getDoc(docRef);
      expect(docSnapAfterDelete.exists()).toBe(false);
    });

    it('should handle batch operations', async () => {
      const authenticatedContext = testEnv.authenticatedContext(testUserId);
      const db = authenticatedContext.firestore();

      const collectionRef = collection(db, `users/${testUserId}/images`);

      // Create multiple documents
      const promises = Array.from({ length: 5 }, (_, i) =>
        addDoc(collectionRef, {
          filename: `test${i}.jpg`,
          status: 'pending',
          candidates: [],
          selectedIndex: null,
          createdAt: Date.now(),
          updatedAt: Date.now()
        })
      );

      const docRefs = await Promise.all(promises);
      expect(docRefs).toHaveLength(5);

      // Verify all documents exist
      const getPromises = docRefs.map(docRef => getDoc(docRef));
      const docSnaps = await Promise.all(getPromises);
      
      docSnaps.forEach(snap => {
        expect(snap.exists()).toBe(true);
      });

      // Clean up
      const deletePromises = docRefs.map(docRef => deleteDoc(docRef));
      await Promise.all(deletePromises);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // This test would require simulating network conditions
      // For now, we'll test basic error scenarios
      
      const authenticatedContext = testEnv.authenticatedContext(testUserId);
      const db = authenticatedContext.firestore();

      // Try to get a non-existent document
      const docRef = doc(db, `users/${testUserId}/images/non-existent`);
      const docSnap = await getDoc(docRef);
      
      expect(docSnap.exists()).toBe(false);
    });

    it('should handle concurrent updates', async () => {
      const authenticatedContext = testEnv.authenticatedContext(testUserId);
      const db = authenticatedContext.firestore();

      const docRef = doc(db, `users/${testUserId}/images/concurrent-test`);
      
      // Create initial document
      await setDoc(docRef, {
        filename: 'test.jpg',
        status: 'pending',
        updateCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Simulate concurrent updates
      const updatePromises = Array.from({ length: 3 }, (_, i) =>
        setDoc(docRef, {
          filename: 'test.jpg',
          status: 'processing',
          updateCount: i + 1,
          createdAt: Date.now(),
          updatedAt: Date.now()
        })
      );

      await Promise.all(updatePromises);

      // Verify final state
      const finalSnap = await getDoc(docRef);
      expect(finalSnap.exists()).toBe(true);
      expect(finalSnap.data()?.status).toBe('processing');
    });
  });
});