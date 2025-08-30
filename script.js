// Importar funciones necesarias desde firebaseconect.js
import { listenBlockedNumbers, validateBlockedNumbers, saveParticipation, saveBlockedNumbers } from './firebaseconect.js';

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
    const toast = document.getElementById('toast'); // Elemento para el mensaje flotante
    const numbersLeftText = document.getElementById('numbers-left-text'); // Elemento para el texto de números restantes
    const countdownDisplay = document.getElementById('countdown'); // Elemento para el cronómetro

    // Depuración: Verificar que las celdas se encuentren (debería ser 25)
    console.log('Celdas encontradas:', cells.length);

    // Inicializar todas las celdas como seleccionables (remueve la clase 'blocked' y 'reserved')
    cells.forEach(cell => {
        cell.classList.remove('blocked');
        cell.classList.remove('reserved');
    });

    // Variable para almacenar los números bloqueados desde Firebase
    let blockedNumbers = [];

    // Función para mostrar el mensaje flotante (toast)
    function showToast(message) {
        toast.textContent = message; // Establecer el mensaje
        toast.style.display = 'block'; // Mostrar el toast
        console.log('Toast mostrado:', message); // Depuración
        // Ocultar el toast después de la animación (3 segundos)
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    // Función para actualizar la interfaz (números seleccionados, precio total, y cronómetro)
    function updateUI() {
        console.log('Actualizando UI, selectedNumbers:', selectedNumbers); // Depuración
        if (selectedNumbers.length === 0) {
            // Si no hay números seleccionados, mostrar mensaje por defecto
            selectedNumbersDisplay.textContent = 'Ningún número seleccionado';
        } else {
            // Mostrar números seleccionados, ordenados numéricamente
            selectedNumbersDisplay.textContent = `Números seleccionados: ${selectedNumbers.sort((a, b) => a - b).join(', ')}`;
        }
        // Calcular y mostrar el precio total ($80 por número)
        const totalPrice = selectedNumbers.length * 80;
        totalPriceDisplay.textContent = `Precio total: $${totalPrice.toFixed(2)}`; // Mostrar con 2 decimales
    }

    // Escuchar números bloqueados en tiempo real desde Firestore
    listenBlockedNumbers((numbers) => {
        blockedNumbers = numbers; // Actualizar la lista de números bloqueados
        cells.forEach(cell => {
            const number = parseInt(cell.textContent); // Obtener el número de la celda
            if (blockedNumbers.includes(number)) {
                // Si el número está bloqueado, añadir clase 'blocked' y quitar 'selected' y 'reserved'
                cell.classList.add('blocked');
                cell.classList.remove('selected', 'reserved');
                // Si el número estaba seleccionado, deseleccionarlo
                if (selectedNumbers.includes(number)) {
                    selectedNumbers = selectedNumbers.filter(num => num !== number);
                }
            } else {
                // Si el número no está bloqueado, quitar clase 'blocked'
                cell.classList.remove('blocked');
            }
        });
        // Actualizar texto de números restantes
        const remaining = 25 - blockedNumbers.length;
        numbersLeftText.textContent = `Faltan ${remaining} para iniciar el sorteo`;
        // Actualizar cronómetro
        if (remaining === 0) {
            startCountdown();
        } else {
            countdownDisplay.textContent = '00h 00m 00s'; // Mantener en ceros mientras hay números por vender
        }
        // Actualizar la interfaz después de procesar números bloqueados
        updateUI();
    });

    // Función para iniciar el cronómetro de 5 horas
    function startCountdown() {
        const endTime = new Date().getTime() + 5 * 60 * 60 * 1000; // 5 horas desde ahora
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;
            if (distance <= 0) {
                clearInterval(interval);
                countdownDisplay.textContent = '¡Sorteo en curso!';
                numbersLeftText.textContent = '¡Sorteo iniciado!';
                return;
            }
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            countdownDisplay.textContent = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
        }, 1000);
    }

    // Añadir evento de clic a cada celda de la tabla
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            const number = parseInt(cell.textContent); // Obtener el número de la celda
            console.log(`Clic en celda ${number}`); // Depuración
            if (cell.classList.contains('blocked') || cell.classList.contains('reserved')) {
                // Mostrar toast si la celda está bloqueada o reservada
                showToast(cell.classList.contains('blocked') ? 'Número ya comprado.' : 'Número reservado.');
                console.log(`Celda ${number} ${cell.classList.contains('blocked') ? 'bloqueada' : 'reservada'}, no se puede seleccionar`); // Depuración
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
            showToast('Por favor, selecciona al menos un número antes de continuar.');
            return;
        }
        // Mostrar números seleccionados en el modal (en negritas)
        modalNumbers.innerHTML = `Números seleccionados: <strong>${selectedNumbers.sort((a, b) => a - b).join(', ')}</strong>`;
        // Mostrar precio total en el modal (en negritas y rojo)
        modalPrice.innerHTML = `Precio total: <strong>$${selectedNumbers.length * 80}.00</strong>`;
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

    // Cerrar el modal si se hace clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            console.log('Clic fuera del modal, cerrando'); // Depuración
            modal.style.display = 'none';
        }
    });

    // Añadir evento para el formulario de participación
    participationForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
        // Obtener los valores del formulario
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const totalPrice = selectedNumbers.length * 80; // Calcular precio total ($80 por número)

        // Depuración: Verificar selectedNumbers antes de enviar
        console.log('Formulario enviado:', { name, email, phone, numbers: selectedNumbers, totalPrice });

        try {
            // Validar que los números no estén bloqueados en Firestore
            const alreadyTaken = await validateBlockedNumbers(selectedNumbers);
            if (alreadyTaken) {
                // Si algún número está bloqueado, mostrar toast y deseleccionar
                showToast('Algunos números seleccionados ya fueron tomados. Por favor, elige otros.');
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

            // Guardar una copia de selectedNumbers para el mensaje de WhatsApp y el estado reservado
            const numbersForMessage = [...selectedNumbers];

            // Marcar las celdas como reservadas
            cells.forEach(cell => {
                const number = parseInt(cell.textContent);
                if (numbersForMessage.includes(number)) {
                    cell.classList.add('reserved');
                    cell.classList.remove('selected');
                }
            });

            // Guardar la participación en Firestore
            await saveParticipation({ name, email, phone, numbers: selectedNumbers, totalPrice });

            // Guardar los números seleccionados como bloqueados en Firestore
            await saveBlockedNumbers(selectedNumbers);

            // Enviar mensaje a WhatsApp
            const yourPhoneNumber = '+1234567890'; // Reemplaza con tu número de WhatsApp (ej. +525512345678)
            const message = `Nueva participación en la rifa:\nNombre: ${name}\nCorreo: ${email}\nTeléfono: ${phone || 'No proporcionado'}\nNúmeros: ${numbersForMessage.length > 0 ? numbersForMessage.sort((a, b) => a - b).join(', ') : 'Ninguno'}\nTotal: $${totalPrice.toFixed(2)}`;
            console.log('Enviando mensaje a WhatsApp, números:', numbersForMessage); // Depuración
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${yourPhoneNumber}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank'); // Abrir WhatsApp en una nueva pestaña/ventana

            // Reiniciar la selección
            selectedNumbers = [];
            updateUI();
            // Ocultar el modal
            modal.style.display = 'none';
            // Mostrar mensaje de éxito
            showToast('¡Participación registrada con éxito! Revisa WhatsApp para los detalles.');
        } catch (error) {
            // Manejar errores al guardar en Firestore
            console.error('Error al registrar participación:', error);
            // Quitar la clase 'reserved' si hay un error
            cells.forEach(cell => {
                const number = parseInt(cell.textContent);
                if (numbersForMessage.includes(number)) {
                    cell.classList.remove('reserved');
                }
            });
            showToast('Error al registrar. Intenta de nuevo.');
        }
    });
});
