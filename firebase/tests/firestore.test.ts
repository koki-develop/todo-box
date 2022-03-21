import {
  assertSucceeds,
  assertFails,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import fs from "fs";
import path from "path";
import { afterAll, it, describe, beforeEach } from "vitest";

const PROJECT_ID = "test-todo-box";

const getTestEnvironment = async () => {
  const firestoreRules = fs.readFileSync("firestore.rules", "utf8");

  return await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: firestoreRules,
    },
  });
};

const getAuthenticatedContext = async (uid: string) => {
  const testEnv = await getTestEnvironment();
  return testEnv.authenticatedContext(uid);
};

const getUnauthenticatedContext = async () => {
  const testEnv = await getTestEnvironment();
  return testEnv.unauthenticatedContext();
};

const getAuthenticatedFirestore = async (uid: string) => {
  const context = await getAuthenticatedContext(uid);
  return context.firestore();
};

const getUnauthenticatedFirestore = async () => {
  const context = await getUnauthenticatedContext();
  return context.firestore();
};

beforeEach(async () => {
  const testEnv = await getTestEnvironment();
  await testEnv.clearFirestore();
});

afterAll(async () => {
  const testEnv = await getTestEnvironment();
  await testEnv.cleanup();
});

describe("/users/{userId}", () => {
  const uid = "USER_ID";
  const anotherUid = "ANOTHER_USER_ID";

  describe("/projects/{projectId}", () => {
    const projectId = "PROJECT_ID";
    const projectsCollectionPath = `users/${uid}/projects`;

    it("should be able to access to own projects", async () => {
      const db = await getAuthenticatedFirestore(uid);
      const collectionRef = db.collection(projectsCollectionPath);
      const docRef = collectionRef.doc(projectId);
      // list
      await assertSucceeds(collectionRef.get());
      // get
      await assertSucceeds(docRef.get());
      // create
      await assertFails(docRef.set({}));
      await assertFails(
        docRef.set({ name: "PROJECT_NAME", unknownField: "VALUE" })
      );
      await assertFails(docRef.set({ name: 1 }));
      await assertFails(docRef.set({ name: "" }));
      await assertFails(docRef.set({ name: "  " }));
      await assertFails(docRef.set({ name: "a".repeat(31) }));
      await assertFails(docRef.set({ name: "a".repeat(50) }));
      await assertSucceeds(docRef.set({ name: "a".repeat(30) }));
      await assertSucceeds(docRef.set({ name: "PROJECT_NAME" }));
      // update
      await assertFails(docRef.update({}));
      await assertFails(
        docRef.update({ name: "UPDATED_PROJECT_NAME", unknownField: "VALUE" })
      );
      await assertFails(docRef.update({ name: 1 }));
      await assertFails(docRef.update({ name: "a".repeat(31) }));
      await assertFails(docRef.update({ name: "a".repeat(50) }));
      await assertSucceeds(docRef.update({ name: "a".repeat(30) }));
      await assertSucceeds(docRef.update({ name: "UPDATED_PROJECT_NAME" }));
      // delete
      await assertSucceeds(docRef.delete());
    });

    it("should not be able to access to own projects from another user", async () => {
      const db = await getAuthenticatedFirestore(anotherUid);
      const collectionRef = db.collection(projectsCollectionPath);
      const docRef = collectionRef.doc(projectId);
      // list
      await assertFails(collectionRef.get());
      // get
      await assertFails(docRef.get());
      // create
      await assertFails(docRef.set({ name: "PROJECT_NAME" }));
      // update
      await assertFails(docRef.update({ name: "UPDATED_PROJECT_NAME" }));
      // delete
      await assertFails(docRef.delete());
    });

    it("should not be able to access to own projects from unauthenticated user", async () => {
      const db = await getUnauthenticatedFirestore();
      const collectionRef = db.collection(projectsCollectionPath);
      const docRef = collectionRef.doc(projectId);
      // list
      await assertFails(collectionRef.get());
      // get
      await assertFails(docRef.get());
      // create
      await assertFails(docRef.set({ name: "PROJECT_NAME" }));
      // update
      await assertFails(docRef.update({ name: "UPDATED_PROJECT_NAME" }));
      // delete
      await assertFails(docRef.delete());
    });

    describe("/counters/tasks/shards/{shardId}", () => {
      const shardsCollectionPath = path.join(
        projectsCollectionPath,
        projectId,
        "counters/tasks/shards"
      );
      const sharedId = "1";

      it("should be able to access to own counter shards", async () => {
        const db = await getAuthenticatedFirestore(uid);
        const collectionRef = db.collection(shardsCollectionPath);
        const docRef = collectionRef.doc(sharedId);
        // list
        await assertSucceeds(collectionRef.get());
        // get
        await assertSucceeds(docRef.get());
        // create
        await assertFails(collectionRef.doc("INVALID_ID").set({ count: 0 }));
        await assertFails(collectionRef.doc("-1").set({ count: 0 }));
        await assertFails(collectionRef.doc("10").set({ count: 0 }));
        await assertFails(docRef.set({ count: 1 }));
        await assertFails(docRef.set({ count: -1 }));
        await assertFails(docRef.set({ count: "COUNT" }));
        await assertSucceeds(docRef.set({ count: 0 }));
        // update
        await assertFails(docRef.update({ count: "COUNT" }));
        await assertSucceeds(docRef.update({ count: 1 }));
        await assertSucceeds(docRef.update({ count: -1 }));
        // delete
        await assertFails(docRef.delete());
      });
      it("should not be able to access to own counter shards from another user", async () => {
        const db = await getAuthenticatedFirestore(anotherUid);
        const collectionRef = db.collection(shardsCollectionPath);
        const docRef = collectionRef.doc(sharedId);
        // list
        await assertFails(collectionRef.get());
        // get
        await assertFails(docRef.get());
        // create
        await assertFails(docRef.set({ count: 0 }));
        // update
        await assertFails(docRef.update({ count: 1 }));
        // delete
        await assertFails(docRef.delete());
      });
      it("should not be able to access to own counter shards from unauthenticated user", async () => {
        const db = await getUnauthenticatedFirestore();
        const collectionRef = db.collection(shardsCollectionPath);
        const docRef = collectionRef.doc(sharedId);
        // list
        await assertFails(collectionRef.get());
        // get
        await assertFails(docRef.get());
        // create
        await assertFails(docRef.set({ count: 0 }));
        // update
        await assertFails(docRef.update({ count: 1 }));
        // delete
        await assertFails(docRef.delete());
      });
    });

    describe("/sections/{sectionId}", () => {
      const sectionsCollectionPath = path.join(
        projectsCollectionPath,
        projectId,
        "sections"
      );
      const sectionId = "SECTION_ID";

      it("should be able to access to own sections", async () => {
        const db = await getAuthenticatedFirestore(uid);
        const collectionRef = db.collection(sectionsCollectionPath);
        const docRef = collectionRef.doc(sectionId);
        // list
        await assertSucceeds(collectionRef.get());
        // get
        await assertSucceeds(docRef.get());
        // create
        await assertFails(
          docRef.set({ name: "SECTION_NAME", index: 0, unknownField: "VALUE" })
        );
        await assertFails(docRef.set({ name: "SECTION_NAME" }));
        await assertFails(docRef.set({ name: 0, index: 0 }));
        await assertFails(docRef.set({ name: "", index: 0 }));
        await assertFails(docRef.set({ name: "  ", index: 0 }));
        await assertFails(docRef.set({ name: "a".repeat(256), index: 0 }));
        await assertFails(docRef.set({ name: "a".repeat(500), index: 0 }));
        await assertFails(docRef.set({ index: 0 }));
        await assertFails(docRef.set({ name: "SECTION_NAME", index: "INDEX" }));
        await assertFails(docRef.set({ name: "SECTION_NAME", index: -1 }));
        await assertSucceeds(docRef.set({ name: "a".repeat(255), index: 0 }));
        await assertSucceeds(docRef.set({ name: "SECTION_NAME", index: 0 }));
        // update
        await assertFails(docRef.update({}));
        await assertFails(
          docRef.update({
            name: "UPDATED_SECTION_NAME",
            index: 1,
            unknownField: "VALUE",
          })
        );
        await assertSucceeds(docRef.update({ name: "UPDATED_SECTION_NAME" }));
        await assertSucceeds(docRef.update({ index: 1 }));
        await assertSucceeds(
          docRef.update({ name: "RE_UPDATED_SECTION_NAME", index: 2 })
        );
        // delete
        await assertSucceeds(docRef.delete());
      });
      it("should not be able to access to own sections from another user", async () => {
        const db = await getAuthenticatedFirestore(anotherUid);
        const collectionRef = db.collection(sectionsCollectionPath);
        const docRef = collectionRef.doc(sectionId);
        // list
        await assertFails(collectionRef.get());
        // get
        await assertFails(docRef.get());
        // create
        await assertFails(docRef.set({ name: "a".repeat(255), index: 0 }));
        // update
        await assertFails(
          docRef.update({ name: "UPDATED_SECTION_NAME", index: 1 })
        );
        // delete
        await assertFails(docRef.delete());
      });
      it("should not be able to access to own sections from unauthenticated user", async () => {
        const db = await getUnauthenticatedFirestore();
        const collectionRef = db.collection(sectionsCollectionPath);
        const docRef = collectionRef.doc(sectionId);
        // list
        await assertFails(collectionRef.get());
        // get
        await assertFails(docRef.get());
        // create
        await assertFails(docRef.set({ name: "a".repeat(255), index: 0 }));
        // update
        await assertFails(
          docRef.update({ name: "UPDATED_SECTION_NAME", index: 1 })
        );
        // delete
        await assertFails(docRef.delete());
      });
    });

    describe("/tasks/{taskId}", () => {
      const tasksCollectionPath = path.join(
        projectsCollectionPath,
        projectId,
        "tasks"
      );
      const taskId = "TASK_ID";
      const sectionId = "SECTION_ID";

      beforeEach(async () => {
        const db = await getAuthenticatedFirestore(uid);
        const sectionsCollectionPath = path.join(
          projectsCollectionPath,
          projectId,
          "sections"
        );
        await assertSucceeds(
          db
            .collection(sectionsCollectionPath)
            .doc(sectionId)
            .set({ name: "SECTION_NAME", index: 0 })
        );
      });

      it("should be able to access to own tasks", async () => {
        const db = await getAuthenticatedFirestore(uid);
        const collectionRef = db.collection(tasksCollectionPath);
        const docRef = collectionRef.doc(taskId);
        // list
        await assertSucceeds(collectionRef.get());
        // get
        await assertSucceeds(docRef.get());
        // create
        await assertFails(
          docRef.set({
            sectionId: "NOT_EXISTS_SECTION_ID",
            index: 0,
            title: "TASK_TITLE",
            description: "TASK_DESCRIPTION",
            completedAt: null,
          })
        );
        await assertSucceeds(
          docRef.set({
            sectionId: sectionId,
            index: 0,
            title: "TASK_TITLE",
            description: "TASK_DESCRIPTION",
            completedAt: null,
          })
        );
        await assertSucceeds(
          docRef.set({
            sectionId: null,
            index: 0,
            title: "TASK_TITLE",
            description: "TASK_DESCRIPTION",
            completedAt: null,
          })
        );
        // update
        await assertSucceeds(
          docRef.update({
            sectionId: null,
            index: 1,
            title: "UPDATED_TASK_TITLE",
            description: "UPDATED_TASK_DESCRIPTION",
            completedAt: new Date(),
          })
        );
        // delete
        await assertSucceeds(docRef.delete());
      });
      it("should not be able to access to own tasks from another user", async () => {
        const db = await getAuthenticatedFirestore(anotherUid);
        const collectionRef = db.collection(tasksCollectionPath);
        const docRef = collectionRef.doc(taskId);
        // list
        await assertFails(collectionRef.get());
        // get
        await assertFails(docRef.get());
        // create
        await assertFails(
          docRef.set({
            sectionId: null,
            index: 0,
            title: "TASK_TITLE",
            description: "TASK_DESCRIPTION",
            completedAt: null,
          })
        );
        // update
        await assertFails(
          docRef.update({
            sectionId: null,
            index: 1,
            title: "UPDATED_TASK_TITLE",
            description: "UPDATED_TASK_DESCRIPTION",
            completedAt: new Date(),
          })
        );
        // delete
        await assertFails(docRef.delete());
      });
      it("should not be able to access to own tasks from unauthenticated user", async () => {
        const db = await getAuthenticatedFirestore(anotherUid);
        const collectionRef = db.collection(tasksCollectionPath);
        const docRef = collectionRef.doc(taskId);
        // list
        await assertFails(collectionRef.get());
        // get
        await assertFails(docRef.get());
        // create
        await assertFails(
          docRef.set({
            sectionId: null,
            index: 0,
            title: "TASK_TITLE",
            description: "TASK_DESCRIPTION",
            completedAt: null,
          })
        );
        // update
        await assertFails(
          docRef.update({
            sectionId: null,
            index: 1,
            title: "UPDATED_TASK_TITLE",
            description: "UPDATED_TASK_DESCRIPTION",
            completedAt: new Date(),
          })
        );
        // delete
        await assertFails(docRef.delete());
      });
    });
  });
});
