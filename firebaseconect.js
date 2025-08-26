// Importar funciones necesarias de la biblioteca de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js"; // Inicializa la app de Firebase
import { getFirestore, collection, addDoc, getDocs, onSnapshot, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js"; // Funciones de Firestore

// Configuración de Firebase con las credenciales de tu proyecto
const firebaseConfig = {
    apiKey: "AIzaSyBNeMRwwz90-hQOhfmrdaMNPGfcpb_g0hw", // Clave de la API
    authDomain: "sorteonumero.firebaseapp.com", // Dominio de autenticación
    projectId: "sorteonumero", // ID del proyecto
    storageBucket: "sorteonumero.firebasestorage.app", // Bucket de almacenamiento
    messagingSenderId: "753234216972", // ID del remitente para mensajería
    appId: "1:753234216972:web:5fe511ced4df5e1e2a0629" // ID de la aplicación
};

// Inicializar Firebase con la configuración proporcionada
const app = initializeApp(firebaseConfig);

// Inicializar Firestore (base de datos) para la aplicación
const db = getFirestore(app);

// Función para escuchar números bloqueados en tiempo real
export function listenBlockedNumbers(callback) {
    // Referencia a la colección 'numeros_bloqueados' en Firestore
    const blockedNumbersRef = collection(db, 'numeros_bloqueados');
    // Escuchar cambios en la colección en tiempo real con onSnapshot
    return onSnapshot(blockedNumbersRef, (snapshot) => {
        try {
            const blockedNumbers = []; // Array para almacenar los números bloqueados
            // Iterar sobre cada documento en la colección
            snapshot.forEach((doc) => {
                const data = doc.data().numeros; // Obtener el campo 'numeros' del documento
                if (Array.isArray(data)) {
                    // Si 'numeros' es un array, añadir sus elementos al array blockedNumbers
                    blockedNumbers.push(...data);
                }
            });
            // Depuración: Mostrar los números bloqueados en la consola
            console.log('Números bloqueados:', blockedNumbers);
            // Llamar al callback con los números bloqueados
            callback(blockedNumbers);
        } catch (error) {
            // Manejar errores durante la escucha
            console.error('Error en listenBlockedNumbers:', error);
            // Llamar al callback con un array vacío en caso de error
            callback([]);
        }
    });
}

// Función para validar si los números seleccionados están bloqueados
export async function validateBlockedNumbers(numbers) {
    try {
        // Obtener todos los documentos de la colección 'numeros_bloqueados'
        const blockedNumbersSnapshot = await getDocs(collection(db, 'numeros_bloqueados'));
        const blockedNumbers = []; // Array para almacenar los números bloqueados
        // Iterar sobre los documentos
        blockedNumbersSnapshot.forEach((doc) => {
            const data = doc.data().numeros; // Obtener el campo 'numeros'
            if (Array.isArray(data)) {
                // Si es un array, añadir sus elementos a blockedNumbers
                blockedNumbers.push(...data);
            }
        });
        // Depuración: Mostrar los números bloqueados en la consola
        console.log('Validando, números bloqueados:', blockedNumbers);
        // Verificar si algún número seleccionado está en blockedNumbers
        return numbers.some(num => blockedNumbers.includes(num));
    } catch (error) {
        // Manejar errores durante la validación
        console.error('Error en validateBlockedNumbers:', error);
        return false; // Retornar false en caso de error
    }
}

// Función para guardar una participación en Firestore
export async function saveParticipation({ name, email, phone, numbers, totalPrice }) {
    try {
        // Añadir un nuevo documento a la colección 'participaciones'
        await addDoc(collection(db, 'participaciones'), {
            name, // Nombre del participante
            email, // Correo electrónico
            phone, // Teléfono (opcional)
            numbers, // Números seleccionados
            totalPrice, // Precio total
            timestamp: serverTimestamp() // Fecha y hora del servidor
        });
        // Depuración: Confirmar que la participación se guardó
        console.log('Participación guardada con éxito');
    } catch (error) {
        // Manejar errores al guardar la participación
        console.error('Error al guardar participación:', error);
        throw error; // Lanzar el error para manejarlo en el llamador
    }
}

// Función para guardar números bloqueados en Firestore
export async function saveBlockedNumbers(numbers) {
    try {
        // Añadir un nuevo documento a la colección 'numeros_bloqueados'
        await addDoc(collection(db, 'numeros_bloqueados'), {
            numeros: numbers, // Array de números a bloquear
            timestamp: serverTimestamp() // Fecha y hora del servidor
        });
        // Depuración: Confirmar que los números se guardaron
        console.log('Números bloqueados guardados con éxito');
    } catch (error) {
        // Manejar errores al guardar los números bloqueados
        console.error('Error al guardar números bloqueados:', error);
        throw error; // Lanzar el error para manejarlo en el llamador
    }
}

// Función para reiniciar la colección de números bloqueados
export async function resetBlockedNumbers() {
    try {
        // Obtener todos los documentos de la colección 'numeros_bloqueados'
        const blockedSnapshot = await getDocs(collection(db, 'numeros_bloqueados'));
        // Crear un array de promesas para eliminar cada documento
        const deletePromises = blockedSnapshot.docs.map(doc => deleteDoc(doc.ref));
        // Esperar a que todas las eliminaciones se completen
        await Promise.all(deletePromises);
        // Depuración: Confirmar que los números bloqueados se reiniciaron
        console.log('Números bloqueados reiniciados');
    } catch (error) {
        // Manejar errores al reiniciar
        console.error('Error al reiniciar números bloqueados:', error);
        throw error; // Lanzar el error para manejarlo en el llamador
    }
}
