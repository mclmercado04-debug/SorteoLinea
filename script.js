// Array para almacenar los números seleccionados
let selectedNumbers = [];

// Obtener elementos
const cells = document.querySelectorAll('.rifa-table td');
const selectedNumbersDisplay = document.getElementById('selected-numbers');
const totalPriceDisplay = document.getElementById('total-price');
const clearButton = document.getElementById('clear-button');
const continueButton = document.getElementById('continue-button');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('close-modal');
const modalNumbers = document.getElementById('modal-numbers');
const modalPrice = document.getElementById('modal-price');
const participationForm = document.getElementById('participation-form');

// Función para actualizar la interfaz
function updateUI() {
    console.log('Actualizando UI, selectedNumbers:', selectedNumbers); // Depuración
    if (selectedNumbers.length === 0) {
        selectedNumbersDisplay.textContent = 'Ningún número seleccionado';
    } else {
        selectedNumbersDisplay.textContent = `Números seleccionados: ${selectedNumbers.sort((a, b) => a - b).join(', ')}`;
    }
    const totalPrice = selectedNumbers.length * 25;
    totalPriceDisplay.textContent = `Precio total: $${totalPrice}`;
}

// Añadir evento de clic a cada celda
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const number = parseInt(cell.textContent);
        // Alternar selección
        if (selectedNumbers.includes(number)) {
            selectedNumbers = selectedNumbers.filter(num => num !== number);
            cell.classList.remove('selected');
            console.log(`Deseleccionado número ${number}`); // Depuración
        } else {
            selectedNumbers.push(number);
            cell.classList.add('selected');
            console.log(`Seleccionado número ${number}`); // Depuración
        }

        updateUI();
    });
});

// Añadir evento al botón Borrar
clearButton.addEventListener('click', () => {
    console.log('Botón Borrar clicado'); // Depuración
    selectedNumbers = [];
    cells.forEach(cell => cell.classList.remove('selected'));
    updateUI();
});

// Añadir evento al botón Continuar
continueButton.addEventListener('click', () => {
    console.log('Botón Continuar clicado, selectedNumbers:', selectedNumbers); // Depuración
    if (selectedNumbers.length === 0) {
        alert('Por favor, selecciona al menos un número antes de continuar.');
        return;
    }
    modalNumbers.innerHTML = `Números seleccionados: <strong>${selectedNumbers.sort((a, b) => a - b).join(', ')}</strong>`;
    modalPrice.innerHTML = `Precio total: <strong>$${selectedNumbers.length * 25}</strong>`;
    modal.style.display = 'block';
    console.log('Modal abierto'); // Depuración
});

// Añadir evento para cerrar el modal
closeModal.addEventListener('click', () => {
    console.log('Cerrar modal clicado'); // Depuración
    modal.style.display = 'none';
});

// Añadir evento para el formulario
participationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const totalPrice = selectedNumbers.length * 25;

    console.log('Formulario enviado:', { name, email, phone, numbers: selectedNumbers, totalPrice }); // Depuración

    // Simular registro
    alert('¡Participación registrada con éxito!');
    console.log('Participación registrada con éxito');

    // Reiniciar selección
    selectedNumbers = [];
    cells.forEach(cell => cell.classList.remove('selected'));
    updateUI();
    modal.style.display = 'none';
});