import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export async function listRecords<T>(name: string, constraints: QueryConstraint[] = []): Promise<T[]> {
  const records = collection(getFirebaseDb(), name);
  const snapshot = constraints.length
    ? await getDocs(query(records, ...constraints))
    : await getDocs(records);
  return snapshot.docs.map((record) => ({ ...record.data(), id: record.id }) as T);
}

export async function getRecord<T>(name: string, id: string): Promise<T | null> {
  const snapshot = await getDoc(doc(getFirebaseDb(), name, id));
  return snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as T) : null;
}

export async function createRecord<T extends object>(name: string, data: T): Promise<T & { id: string }> {
  const reference = doc(collection(getFirebaseDb(), name));
  await setDoc(reference, data as DocumentData);
  return { ...data, id: reference.id };
}

export async function saveRecord<T extends { id: string }>(name: string, record: T): Promise<T> {
  const { id, ...data } = record;
  await setDoc(doc(getFirebaseDb(), name, id), data);
  return record;
}

export async function patchRecord(name: string, id: string, data: DocumentData): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), name, id), data);
}

export async function removeRecord(name: string, id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), name, id));
}