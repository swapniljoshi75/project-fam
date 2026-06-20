import { db, auth, googleProvider } from './firebase'
import { collection, doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth'

export const EMPTY = { persons: [] }

export function subscribePersons(callback) {
  return onSnapshot(collection(db, 'persons'), snap => {
    callback({ persons: snap.docs.map(d => d.data()) })
  })
}

export async function savePersons(persons) {
  await Promise.all(persons.map(p => setDoc(doc(db, 'persons', p.id), p)))
}

export function uid() {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function deletePersonDoc(id) {
  return deleteDoc(doc(db, 'persons', id))
}

export async function signIn() {
  const result = await signInWithPopup(auth, googleProvider)
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
  if (result.user.email !== adminEmail) {
    await firebaseSignOut(auth)
    throw new Error('not-admin')
  }
  return result
}

export function signOut() {
  return firebaseSignOut(auth)
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

const CONFIG_DOC = doc(db, 'config', 'settings')

export async function loadTreeName() {
  try {
    const snap = await getDoc(CONFIG_DOC)
    return snap.exists() ? (snap.data().treeName ?? 'Family Tree') : 'Family Tree'
  } catch {
    return 'Family Tree'
  }
}

export async function saveTreeName(name) {
  await setDoc(CONFIG_DOC, { treeName: name }, { merge: true })
}
