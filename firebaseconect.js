// Importar funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBNeMRwwz90-hQOhfmrdaMNPGfcpb_g0hw",
    authDomain: "sorteonumero.firebaseapp.com",
    projectId: "sorteonumero",
    storageBucket: "sorteonumero.firebasestorage.app",
    messagingSenderId: "753234216972",
    appId: "1:753234216972:web:5fe511ced4df5e1e2a0629"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para escuchar números bloqueados en tiempo real
export function listenBlockedNumbers(callback) {
    const blockedNumbersRef = collection(db, 'numeros_bloqueados');
    return onSnapshot(blockedNumbersRef, (snapshot) => {
        try {
            const blockedNumbers = [];
            snapshot.forEach((doc) => {
                const data = doc.data().numeros;
                if (Array.isArray(data)) {
                    blockedNumbers.push(...data);
                }
            });
            console.log('Números bloqueados:', blockedNumbers); // Depuración
            callback(blockedNumbers);
        } catch (error) {
            console.error('Error en listenBlockedNumbers:', error);
            callback([]);
        }
    });
}

// Función para validar números bloqueados antes de guardar
export async function validateBlockedNumbers(numbers) {
    try {
        const blockedNumbersSnapshot = await getDocs(collection(db, 'numeros_bloqueados'));
        const blockedNumbers = [];
        blockedNumbersSnapshot.forEach((doc) => {
            const data = doc.data().numeros;
            if (Array.isArray(data)) {
                blockedNumbers.push(...data);
            }
        });
        console.log('Validando, números bloqueados:', blockedNumbers); // Depuración
        return numbers.some(num => blockedNumbers.includes(num));
    } catch (error) {
        console.error('Error en validateBlockedNumbers:', error);
        return false;
    }
}

// Función para guardar participación
export async function saveParticipation({ name, email, phone, numbers, totalPrice }) {
    try {
        await addDoc(collection(db, 'participaciones'), {
            name,
            email,
            phone,
            numbers,
            totalPrice,
            timestamp: serverTimestamp()
        });
        console.log('Participación guardada con éxito'); // Depuración
    } catch (error) {
        console.error('Error al guardar participación:', error);
        throw error;
    }
}

// Función para guardar números bloqueados
export async function saveBlockedNumbers(numbers) {
    try {
        await addDoc(collection(db, 'numeros_bloqueados'), {
            numeros: numbers,
            timestamp: serverTimestamp()
        });
        console.log('Números bloqueados guardados con éxito'); // Depuración
    } catch (error) {
        console.error('Error al guardar números bloqueados:', error);
        throw error;
    }
}