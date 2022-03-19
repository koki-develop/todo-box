import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp(functions.firebaseConfig() ?? undefined);

const firestore = admin.firestore();
const functionBuilder = functions.runWith({ timeoutSeconds: 300 });

export const deleteUser = functionBuilder.https.onCall(
  async (_data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Unauthenticated"
      );
    }
    const { uid } = context.auth;
    await admin.auth().deleteUser(uid);
  }
);

export const handleDeleteUser = functionBuilder.auth
  .user()
  .onDelete(async (user) => {
    const snapshot = await firestore
      .collection(`users/${user.uid}/projects`)
      .get();
    const docs = snapshot.docs;
    for (const doc of docs) {
      await doc.ref.delete();
    }
  });

export const handleDeleteSection = functionBuilder.firestore
  .document("users/{userId}/projects/{projectId}/sections/{sectionId}")
  .onDelete(async (_snapshot, context) => {
    const { userId, projectId, sectionId } = context.params;

    const tasksSnapshot = await firestore
      .collection(`users/${userId}/projects/${projectId}/tasks`)
      .where("sectionId", "==", sectionId)
      .get();

    const batch = firestore.batch();
    for (const doc of tasksSnapshot.docs) {
      batch.delete(doc.ref);
    }
    const shardId = Math.floor(Math.random() * 10);
    const shardRef = firestore.doc(
      `users/${userId}/projects/${projectId}/counters/tasks/shards/${shardId}`
    );
    batch.update(shardRef, {
      count: admin.firestore.FieldValue.increment(-tasksSnapshot.size),
    });
    await batch.commit();
  });

export const handleDeleteProject = functionBuilder.firestore
  .document("users/{userId}/projects/{projectId}")
  .onDelete(async (_snapshot, context) => {
    const { userId, projectId } = context.params;

    const sectionsSnapshot = await firestore
      .collection(`users/${userId}/projects/${projectId}/sections`)
      .get();
    const tasksSnapshot = await firestore
      .collection(`users/${userId}/projects/${projectId}/tasks`)
      .get();

    for (const doc of sectionsSnapshot.docs) {
      await doc.ref.delete();
    }
    for (const doc of tasksSnapshot.docs) {
      await doc.ref.delete();
    }
  });
