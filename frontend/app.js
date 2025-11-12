// If you're serving the frontend with Live Server (port 5500),
// use the backend running on localhost:3000. Otherwise use relative path.
const API_URL = (location.port === '5500') ? 'http://localhost:3000/api/definitions' : '/api/definitions';

let allDefinitions = [];
let elements = null;
let selectedDefinition = null; // Definición seleccionada actualmente

async function fetchDefinitions() {
    try {
        showLoading();

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        allDefinitions = await response.json();

        renderDefinitions(allDefinitions);
        updateResultCount(allDefinitions.length);
        selectedDefinition = null; // Reset selección

    } catch (error) {
        showError('No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo en http://localhost:3000');
        console.error('Error al obtener definiciones:', error);
    }
}

async function crearDefinition(termino, definicion) {
  if (!termino.trim() || !definicion.trim()) throw new Error('Campos requeridos');
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ termino, definicion })
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    
    showSuccessMessage('Término creado exitosamente');
    await fetchDefinitions();
    limpiarFormulario();
    
  } catch (error) {
    showError(`Error al crear: ${error.message}`);
  }
}

async function actualizarDefinition(id, termino, definicion) {
  if (!termino.trim() || !definicion.trim()) throw new Error('Campos requeridos');
  
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ termino, definicion })
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    
    showSuccessMessage('Término actualizado exitosamente');
    await fetchDefinitions();
    limpiarFormulario();
    
  } catch (error) {
    showError(`Error al actualizar: ${error.message}`);
  }
}

async function eliminarDefinition(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este término?')) return;
  
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    
    showSuccessMessage('Término eliminado exitosamente');
    await fetchDefinitions();
    limpiarFormulario();
    
  } catch (error) {
    showError(`Error al eliminar: ${error.message}`);
  }
}

function renderDefinitions(definitions) {
    elements.definitionsContainer.innerHTML = '';

    if (definitions.length === 0) {
        showNoResults();
        return;
    }

    definitions.forEach(def => {
        const card = createDefinitionCard(def);
        elements.definitionsContainer.appendChild(card);
    });
}

function createDefinitionCard(definition) {
    const card = document.createElement('div');
    card.className = 'definition-card';
    
    // Marcar como seleccionada si coincide
    if (selectedDefinition && selectedDefinition._id === definition._id) {
        card.classList.add('selected');
    }

    const term = document.createElement('div');
    term.className = 'term';
    term.textContent = definition.termino;

    const def = document.createElement('div');
    def.className = 'definition';
    def.textContent = definition.definicion;

    card.appendChild(term);
    card.appendChild(def);
    
    // Click para seleccionar
    card.addEventListener('click', () => seleccionarDefinition(definition, card));

    return card;
}

function seleccionarDefinition(definition, cardElement) {
    // Remover selección anterior
    document.querySelectorAll('.definition-card.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Seleccionar nueva
    selectedDefinition = definition;
    cardElement.classList.add('selected');
    
    // Mostrar en el formulario
    elements.terminoInput.value = definition.termino;
    elements.definicionInput.value = definition.definicion;
    elements.modalTitle.textContent = `Modificar: "${definition.termino}"`;
    elements.formContainer.style.display = 'block';
    elements.terminoInput.focus();
}

function filterDefinitions(searchTerm) {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    if (normalizedSearch === '') {
        return allDefinitions;
    }

    return allDefinitions.filter(def => {
        const term = def.termino.toLowerCase();
        const definition = def.definicion.toLowerCase();

        return term.includes(normalizedSearch) || definition.includes(normalizedSearch);
    });
}

function handleSearch(event) {
    const searchTerm = event.target.value;
    const filteredDefinitions = filterDefinitions(searchTerm);

    renderDefinitions(filteredDefinitions);
    updateResultCount(filteredDefinitions.length, searchTerm !== '');
}

function updateResultCount(count, isSearching = false) {
    if (isSearching) {
        elements.resultCount.textContent = `${count} resultado${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
    } else {
        elements.resultCount.textContent = `${count} término${count !== 1 ? 's' : ''} en total`;
    }
}

function showLoading() {
    elements.definitionsContainer.innerHTML = '<div class="loading">Cargando definiciones...</div>';
}

function showError(message) {
    elements.definitionsContainer.innerHTML = `<div class="error">${message}</div>`;
    elements.resultCount.textContent = '';
    console.error(message);
}

function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'success-message';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showNoResults() {
    elements.definitionsContainer.innerHTML = '<div class="no-results">No se encontraron definiciones</div>';
    elements.resultCount.textContent = '0 resultados encontrados';
}

function limpiarFormulario() {
    elements.terminoInput.value = '';
    elements.definicionInput.value = '';
    elements.formContainer.style.display = 'none';
    elements.modalTitle.textContent = 'Crear nuevo término';
    selectedDefinition = null;
    
    // Remover selección visual
    document.querySelectorAll('.definition-card.selected').forEach(el => {
        el.classList.remove('selected');
    });
}

function handleCrearClick() {
    selectedDefinition = null;
    limpiarFormulario();
    elements.modalTitle.textContent = 'Crear nuevo término';
    elements.formContainer.style.display = 'block';
    elements.terminoInput.focus();
}

function handleActualizarClick() {
    if (!selectedDefinition) {
        showError('Por favor selecciona un término para actualizar');
        return;
    }
    elements.formContainer.style.display = 'block';
    elements.terminoInput.focus();
}

function handleEliminarClick() {
    if (!selectedDefinition) {
        showError('Por favor selecciona un término para eliminar');
        return;
    }
    eliminarDefinition(selectedDefinition._id);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const termino = elements.terminoInput.value.trim();
    const definicion = elements.definicionInput.value.trim();
    
    if (!termino || !definicion) {
        showError('Los campos no pueden estar vacíos');
        return;
    }
    
    if (selectedDefinition) {
        // Actualizar
        await actualizarDefinition(selectedDefinition._id, termino, definicion);
    } else {
        // Crear
        await crearDefinition(termino, definicion);
    }
}

function init() {
    elements = {
        searchInput: document.getElementById('searchInput'),
        definitionsContainer: document.getElementById('definitionsContainer'),
        resultCount: document.getElementById('resultCount'),
        createBtn: document.getElementById('createBtn'),
        updateBtn: document.getElementById('updateBtn'),
        deleteBtn: document.getElementById('deleteBtn'),
        formContainer: document.getElementById('formContainer'),
        terminoInput: document.getElementById('terminoInput'),
        definicionInput: document.getElementById('definicionInput'),
        modalTitle: document.getElementById('modalTitle'),
        submitBtn: document.getElementById('submitBtn'),
        cancelBtn: document.getElementById('cancelBtn'),
        deleteFormBtn: document.getElementById('deleteFormBtn'),
        form: document.getElementById('definitionForm')
    };

    if (!elements.searchInput) {
        console.error('No se encontró #searchInput en el DOM');
        return;
    }

    // Event listeners
    elements.searchInput.addEventListener('input', handleSearch);
    elements.createBtn.addEventListener('click', handleCrearClick);
    elements.updateBtn.addEventListener('click', handleActualizarClick);
    elements.deleteBtn.addEventListener('click', handleEliminarClick);
    elements.deleteFormBtn.addEventListener('click', () => {
        if (selectedDefinition) {
            eliminarDefinition(selectedDefinition._id);
        }
    });
    elements.cancelBtn.addEventListener('click', limpiarFormulario);
    elements.form.addEventListener('submit', handleFormSubmit);

    fetchDefinitions();
}

document.addEventListener('DOMContentLoaded', init);