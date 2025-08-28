import { listenBlockedNumbers, validateBlockedNumbers, saveParticipation, saveBlockedNumbers } from './firebaseconect.js';

document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.rifa-table td');
    const clearButton = document.getElementById('clear-button');
    const continueButton = document.getElementById('continue-button');
    const selectedNumbersDisplay = document.getElementById('selected-numbers');
    const totalPriceDisplay = document.getElementById('total-price');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');
    const modalNumbers = document.getElementById('modal-numbers');
    const modalPrice = document.getElementById('modal-price');
    const participationForm = document.getElementById('participation-form');
    const toast = document.getElementById('toast');
    const numbersLeftText = document.getElementById('numbers-left-text');
    const countdownDisplay = document.getElementById('countdown');

    let selectedNumbers = [];
    let blockedNumbers = [];

    function showToast(message) {
        toast.textContent = message;
        toast.style.display = 'block';
        console.log('Toast mostrado:', message);
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    function updateUI() {
        selectedNumbersDisplay.textContent = selectedNumbers.length > 0 ? `Números seleccionados: ${selectedNumbers.join(', ')}` : 'Ningún número seleccionado';
        const totalPrice = selectedNumbers.length * 80;
        totalPriceDisplay.textContent = `Precio total: $${totalPrice.toFixed(2)}`;
        console.log('Actualizando UI, selectedNumbers:', selectedNumbers);
    }

    listenBlockedNumbers((numbers) => {
        blockedNumbers = numbers;
        cells.forEach(cell => {
            const number = parseInt(cell.textContent);
            if (blockedNumbers.includes(number)) {
                cell.classList.add('blocked');
            } else {
                cell.classList.remove('blocked');
            }
        });
        // Actualizar texto de números restantes
        const remaining = 25 - blockedNumbers.length;
        numbersLeftText.textContent = `Faltan ${remaining} para iniciar el sorteo`;
        // Iniciar cronómetro si no hay números restantes
        if (remaining === 0) {
            startCountdown();
        } else {
            countdownDisplay.textContent = '00h 00m 00s'; // Mantener en ceros
        }
    });

    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            const number = parseInt(cell.textContent);
            if (blockedNumbers.includes(number)) {
                showToast('Número ya comprado.');
                return;
            }
            if (selectedNumbers.includes(number)) {
                selectedNumbers = selectedNumbers.filter(num => num !== number);
                cell.classList.remove('selected');
            } else {
                selectedNumbers.push(number);
                cell.classList.add('selected');
            }
            updateUI();
        });
    });

    clearButton.addEventListener('click', () => {
        selectedNumbers = [];
        cells.forEach(cell => cell.classList.remove('selected'));
        updateUI();
    });

    continueButton.addEventListener('click', () => {
        if (selectedNumbers.length === 0) {
            showToast('Selecciona al menos un número.');
            return;
        }
        modalNumbers.textContent = `Números seleccionados: ${selectedNumbers.join(', ')}`;
        const totalPrice = selectedNumbers.length * 80;
        modalPrice.textContent = `Precio total: $${totalPrice.toFixed(2)}`;
        modal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    participationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const totalPrice = selectedNumbers.length * 80;

        try {
            const alreadyTaken = await validateBlockedNumbers(selectedNumbers);
            if (alreadyTaken) {
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

            await saveParticipation({ name, email, phone, numbers: selectedNumbers, totalPrice });
            await saveBlockedNumbers(selectedNumbers);
            selectedNumbers = [];
            cells.forEach(cell => cell.classList.remove('selected'));
            updateUI();
            modal.style.display = 'none';
            showToast('¡Participación registrada con éxito!');
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al registrar. Intenta de nuevo.');
        }
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
});