import firebase from "firebase/app"
import "firebase/auth"
import "firebase/firestore"
import "firebase/storage"

var firebaseConfig = {
    apiKey: "AIzaSyBs6sQdVA9DHDG8QJHw-VItsN8z-RRs-OY",
    authDomain: "fir-react-5112c.firebaseapp.com",
    databaseURL: "https://fir-react-5112c.firebaseio.com",
    projectId: "fir-react-5112c",
    storageBucket: "fir-react-5112c.appspot.com",
    messagingSenderId: "86028253712",
    appId: "1:86028253712:web:53e618778712721e782895",
}

const firebaseApp = !firebase.apps.length
    ? firebase.initializeApp(firebaseConfig)
    : firebase.app()
const db = firebaseApp.firestore()
const auth = firebaseApp.auth()
const storage = firebaseApp.storage()

export async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider()
    await auth.signInWithPopup(provider)
    window.location.reload()
}

export function checkAuth(cb) {
    auth.onAuthStateChanged(cb)
}

export async function logOut() {
    await auth.signOut()
    window.location.reload()
}

export async function getCollection(id) {
    const snapshot = await db.collection(id).get()
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    // console.log(data)
}

export async function getUserLists(userId) {
    const snapshot = await db
        .collection("lists")
        .where("author", "==", userId)
        .get()
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

function uploadCoverImage(file) {
    const uploadTask = storage
        .ref(`images/${file.name}-${file.lastModified}`)
        .put(file)
    return new Promise((resolve, reject) => {
        uploadTask.on(
            "state_changed",
            snapshot => console.log("Image uploading: ", snapshot),
            reject,
            () => {
                storage
                    .ref("images")
                    .child(`${file.name}-${file.lastModified}`)
                    .getDownloadURL()
                    .then(resolve)
            }
        )
    })
}

export async function createList(list, user) {
    const { name, description, image } = list
    await db.collection("lists").add({
        name,
        description,
        image: image ? await uploadCoverImage(image) : null,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        author: user.uid,
        userIds: [user.uid],
        users: [
            {
                id: user.uid,
                name: user.displayName,
            },
        ],
    })
}
