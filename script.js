// Importar funciones necesarias desde firebaseconect.js
import { listenBlockedNumbers, validateBlockedNumbers, saveParticipation, saveBlockedNumbers, resetBlockedNumbers } from './firebaseconect.js';

// Esperar a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', () => {
    // Array para almacenar los números seleccionados por el usuario
    let selectedNumbers = [];

    // Obtener elementos del DOM
    const cells = document.querySelectorAll('.rifa-table td'); // Todas las celdas de la tabla (1 al 25)
    const selectedNumbersDisplay = document.getElementById('selected-numbers'); // Elemento para mostrar números seleccionados
    const totalPriceDisplay = document.getElementById('total-price'); // Elemento para mostrar el precio total
    const clearButton = document.getElementById('clear-button'); // Botón "Borrar"
    const continueButton = document.getElementById('continue-button'); // Botón "Continuar"
    const modal = document.getElementById('modal'); // Contenedor del modal
    const closeModal = document.getElementById('close-modal'); // Botón para cerrar el modal
    const modalNumbers = document.getElementById('modal-numbers'); // Elemento para mostrar números en el modal
    const modalPrice = document.getElementById('modal-price'); // Elemento para mostrar el precio en el modal
    const participationForm = document.getElementById('participation-form'); // Formulario del modal
    const resetBlockedButton = document.getElementById('reset-blocked'); // Botón "Reiniciar Números"

    // Depuración: Verificar que las celdas se encuentren (debería ser 25)
    console.log('Celdas encontradas:', cells.length);

    // Inicializar todas las celdas como seleccionables (remueve la clase 'blocked')
    cells.forEach(cell => cell.classList.remove('blocked'));

    // Variable para almacenar los números bloqueados desde Firebase
    let blockedNumbers = [];

    // Escuchar números bloqueados en tiempo real desde Firestore
    listenBlockedNumbers((numbers) => {
        blockedNumbers = numbers; // Actualizar la lista de números bloqueados
        cells.forEach(cell => {
            const number = parseInt(cell.textContent); // Obtener el número de la celda
            if (blockedNumbers.includes(number)) {
                // Si el número está bloqueado, añadir clase 'blocked'
                cell.classList.add('blocked');
                // Si el número estaba seleccionado, deseleccionarlo
                if (selectedNumbers.includes(number)) {
                    selectedNumbers = selectedNumbers.filter(num => num !== number);
                    cell.classList.remove('selected');
                }
            } else {
                // Si el número no está bloqueado, quitar clase 'blocked'
                cell.classList.remove('blocked');
            }
        });
        // Actualizar la interfaz después de procesar números bloqueados
        updateUI();
    });

    // Función para actualizar la interfaz (números seleccionados y precio total)
    function updateUI() {
        console.log('Actualizando UI, selectedNumbers:', selectedNumbers); // Depuración
        if (selectedNumbers.length === 0) {
            // Si no hay números seleccionados, mostrar mensaje por defecto
            selectedNumbersDisplay.textContent = 'Ningún número seleccionado';
        } else {
            // Mostrar números seleccionados, ordenados numéricamente
            selectedNumbersDisplay.textContent = `Números seleccionados: ${selectedNumbers.sort((a, b) => a - b).join(', ')}`;
        }
        // Calcular y mostrar el precio total ($25 por número)
        const totalPrice = selectedNumbers.length * 25;
        totalPriceDisplay.textContent = `Precio total: $${totalPrice}`;
    }

    // Añadir evento de clic a cada celda de la tabla
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            const number = parseInt(cell.textContent); // Obtener el número de la celda
            console.log(`Clic en celda ${number}`); // Depuración
            if (cell.classList.contains('blocked')) {
                // Si la celda está bloqueada, no hacer nada
                console.log(`Celda ${number} bloqueada, no se puede seleccionar`); // Depuración
                return;
            }
            
            // Alternar selección de la celda
            if (selectedNumbers.includes(number)) {
                // Si el número ya está seleccionado, deseleccionarlo
                selectedNumbers = selectedNumbers.filter(num => num !== number);
                cell.classList.remove('selected');
                console.log(`Deseleccionado número ${number}`); // Depuración
            } else {
                // Si el número no está seleccionado, añadirlo
                selectedNumbers.push(number);
                cell.classList.add('selected');
                console.log(`Seleccionado número ${number}`); // Depuración
            }

            // Actualizar la interfaz después de la selección
            updateUI();
        });
    });

    // Añadir evento al botón "Borrar"
    clearButton.addEventListener('click', () => {
        console.log('Botón Borrar clicado'); // Depuración
        // Limpiar la selección de números
        selectedNumbers = [];
        // Quitar la clase 'selected' de todas las celdas
        cells.forEach(cell => cell.classList.remove('selected'));
        // Actualizar la interfaz
        updateUI();
    });

    // Añadir evento al botón "Continuar"
    continueButton.addEventListener('click', () => {
        console.log('Botón Continuar clicado, selectedNumbers:', selectedNumbers); // Depuración
        // Verificar que haya al menos un número seleccionado
        if (selectedNumbers.length === 0) {
            alert('Por favor, selecciona al menos un número antes de continuar.');
            return;
        }
        // Mostrar números seleccionados en el modal (en negritas)
        modalNumbers.innerHTML = `Números seleccionados: <strong>${selectedNumbers.sort((a, b) => a - b).join(', ')}</strong>`;
        // Mostrar precio total en el modal (en negritas y rojo)
        modalPrice.innerHTML = `Precio total: <strong>$${selectedNumbers.length * 25}</strong>`;
        // Mostrar el modal
        modal.style.display = 'block';
        console.log('Modal abierto'); // Depuración
    });

    // Añadir evento para cerrar el modal
    closeModal.addEventListener('click', () => {
        console.log('Cerrar modal clicado'); // Depuración
        // Ocultar el modal
        modal.style.display = 'none';
    });

    // Añadir evento para el formulario de participación
    participationForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
        // Obtener los valores del formulario
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const totalPrice = selectedNumbers.length * 25;

        console.log('Formulario enviado:', { name, email, phone, numbers: selectedNumbers, totalPrice }); // Depuración

        try {
            // Validar que los números no estén bloqueados en Firestore
            const alreadyTaken = await validateBlockedNumbers(selectedNumbers);
            if (alreadyTaken) {
                // Si algún número está bloqueado, mostrar alerta y deseleccionar
                alert('Algunos números seleccionados ya fueron tomados. Por favor, elige otros.');
                selectedNumbers = selectedNumbers.filter(num => !blockedNumbers.includes(num));
                cells.forEach(cell => {
                    const number = parseInt(cell.textContent);
                    if (!selectedNumbers.includes(number)) {
                        cell.classList.remove('selected');
                    }
                });
                updateUI();
                return;
            }

            // Guardar la participación en Firestore
            await saveParticipation({ name, email, phone, numbers: selectedNumbers, totalPrice });

            // Guardar los números seleccionados como bloqueados en Firestore
            await saveBlockedNumbers(selectedNumbers);

            // Reiniciar la selección
            selectedNumbers = [];
            cells.forEach(cell => cell.classList.remove('selected'));
            updateUI();
            // Ocultar el modal
            modal.style.display = 'none';
            // Mostrar mensaje de éxito
            alert('¡Participación registrada con éxito!');
        } catch (error) {
            // Manejar errores al guardar en Firestore
            console.error('Error al registrar participación:', error);
            alert('Error al registrar. Intenta de nuevo.');
        }
    });

    // Añadir evento para el botón "Reiniciar Números"
    if (resetBlockedButton) {
        resetBlockedButton.addEventListener('click', async () => {
            try {
                // Reiniciar la colección numeros_bloqueados en Firestore
                await resetBlockedNumbers();
                alert('Números bloqueados reiniciados');
                console.log('Números bloqueados reiniciados'); // Depuración
            } catch (error) {
                // Manejar errores al reiniciar
                console.error('Error al reiniciar números bloqueados:', error);
                alert('Error al reiniciar. Intenta de nuevo.');
            }
        });
    }
});
