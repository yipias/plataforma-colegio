import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyC5mC7CqU0vImQkdK9Qpr2bLRDxxBw_F94',
  authDomain: 'plataforma-colegio-d2fe9.firebaseapp.com',
  projectId: 'plataforma-colegio-d2fe9',
  storageBucket: 'plataforma-colegio-d2fe9.firebasestorage.app',
  messagingSenderId: '956469968559',
  appId: '1:956469968559:web:ce256dc11e73234097de5a',
}

let servicesPromise: Promise<{ app: FirebaseApp; auth: Auth; db: Firestore }> | undefined

export function getFirebaseServices() {
  if (!servicesPromise) {
    servicesPromise = Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]).then(([appSdk, authSdk, firestoreSdk]) => {
      const app = appSdk.getApps().length > 0
        ? appSdk.getApp()
        : appSdk.initializeApp(firebaseConfig)

      return {
        app,
        auth: authSdk.getAuth(app),
        db: firestoreSdk.getFirestore(app),
      }
    })
  }

  return servicesPromise
}
