
// Variables globales
let cines = [];
let empleados = [];
let peliculas = [];
let salas = [];
let funciones = [];
let entradas = [];
let generos = [];

// Función para mostrar secciones
function showSection(sectionName) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.style.display = 'none');

    // Mostrar la sección seleccionada
    document.getElementById(sectionName).style.display = 'block';

    // Mostrar/ocultar navegación
    const navigation = document.getElementById('navigation');
    if (sectionName === 'menu') {
        navigation.style.display = 'none';
    } else {
        navigation.style.display = 'block';
        // Cargar datos cuando se abre una sección
        loadSectionData(sectionName);
    }
}

// Función para cargar datos de cada sección
async function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'cines':
            loadCines();
            break;
        case 'empleados':
            loadEmpleados();
            loadCinesForEmpleadoSelect();
            break;
        case 'peliculas':
            loadPeliculas();
            loadGeneros();
            loadCinesForSelect('peliculaCine');
            break;
        case 'salas':
            loadSalas();
            loadCinesForSelect('salaCine');
            break;
        case 'funciones':
            loadFunciones();
            loadSalasForSelect();
            loadPeliculasForSelect();
            break;
        case 'entradas':
            loadEntradas();
            loadFuncionesForSelect();
            break;
    }
}

// Funciones para mostrar alertas
function showAlert(elementId, message, type = 'success') {
    const alertDiv = document.getElementById(elementId);
    alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        alertDiv.innerHTML = '';
    }, 3000);
}

// Función auxiliar para hacer requests con mejor manejo de errores
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.text();
                if (errorData) {
                    errorMessage = errorData;
                }
            } catch (e) {
                // Si no se puede leer la respuesta, usar el mensaje por defecto
            }
            throw new Error(errorMessage);
        }

        // Verificar si hay contenido para parsear
        const contentType = response.headers.get('content-type');
        const text = await response.text();

        if (!text || text.trim() === '') {
            return []; // Retornar array vacío para listas vacías
        }

        if (contentType && contentType.includes('application/json')) {
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Error parsing JSON:', text);
                console.error('Response text:', text); // Para debug
                return []; // Retornar array vacío en lugar de lanzar error
            }
        }

        return text;
    } catch (error) {
        console.error('Request error:', error);
        throw error;
    }
}

// ===== GESTIÓN DE CINES =====

async function loadCines() {
    try {
        const data = await makeRequest('/api/v1/cines');
        cines = data || [];
        displayCines();
    } catch (error) {
        showAlert('cineAlert', 'Error al cargar cines: ' + error.message, 'error');
    }
}

function displayCines() {
    const tbody = document.getElementById('cinesTableBody');
    tbody.innerHTML = '';

    cines.forEach(cine => {
        const row = `
            <tr id="cine-row-${cine.id}">
                <td>${cine.id}</td>
                <td>
                    <span class="display-mode" id="cine-nombre-display-${cine.id}">${cine.nombre}</span>
                    <input type="text" class="edit-mode form-control" id="cine-nombre-edit-${cine.id}" value="${cine.nombre}" style="display:none;">
                </td>
                <td>
                    <span class="display-mode" id="cine-direccion-display-${cine.id}">${cine.direccion}</span>
                    <input type="text" class="edit-mode form-control" id="cine-direccion-edit-${cine.id}" value="${cine.direccion}" style="display:none;">
                </td>
                <td>
                    <div class="display-mode" id="cine-actions-display-${cine.id}">
                        <button class="btn btn-secondary btn-sm" onclick="enableEditCine(${cine.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCine(${cine.id})">Eliminar</button>
                    </div>
                    <div class="edit-mode" id="cine-actions-edit-${cine.id}" style="display:none;">
                        <button class="btn btn-success btn-sm" onclick="saveEditCine(${cine.id})">Guardar</button>
                        <button class="btn btn-secondary btn-sm" onclick="cancelEditCine(${cine.id})">Cancelar</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function enableEditCine(id) {
    // Ocultar elementos de display y mostrar elementos de edición
    document.querySelectorAll(`#cine-row-${id} .display-mode`).forEach(el => el.style.display = 'none');
    document.querySelectorAll(`#cine-row-${id} .edit-mode`).forEach(el => el.style.display = 'block');
}

function cancelEditCine(id) {
    // Restaurar valores originales
    const cine = cines.find(c => c.id === id);
    if (cine) {
        document.getElementById(`cine-nombre-edit-${id}`).value = cine.nombre;
        document.getElementById(`cine-direccion-edit-${id}`).value = cine.direccion;
    }

    // Mostrar elementos de display y ocultar elementos de edición
    document.querySelectorAll(`#cine-row-${id} .display-mode`).forEach(el => el.style.display = 'block');
    document.querySelectorAll(`#cine-row-${id} .edit-mode`).forEach(el => el.style.display = 'none');
}

async function saveEditCine(id) {
    const nombre = document.getElementById(`cine-nombre-edit-${id}`).value.trim();
    const direccion = document.getElementById(`cine-direccion-edit-${id}`).value.trim();

    if (!nombre || !direccion) {
        showAlert('cineAlert', 'Todos los campos son obligatorios', 'error');
        return;
    }

    const cineData = {
        id: id, // El ID se mantiene igual
        nombre,
        direccion
    };

    try {
        await makeRequest(`/api/v1/cines/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cineData)
        });

        showAlert('cineAlert', 'Cine actualizado exitosamente');
        loadCines(); // Recargar la tabla
    } catch (error) {
        showAlert('cineAlert', 'Error al actualizar cine: ' + error.message, 'error');
    }
}

document.getElementById('cineForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('cineNombre').value.trim();
    const direccion = document.getElementById('cineDireccion').value.trim();

    if (!nombre || !direccion) {
        showAlert('cineAlert', 'Todos los campos son obligatorios', 'error');
        return;
    }

    const cineData = { nombre, direccion };
    const cineId = document.getElementById('cineId').value;

    try {
        if (cineId) {
            // Actualizar
            await makeRequest(`/api/v1/cines/${cineId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cineData)
            });
            showAlert('cineAlert', 'Cine actualizado exitosamente');
        } else {
            // Crear
            await makeRequest('/api/v1/cines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cineData)
            });
            showAlert('cineAlert', 'Cine creado exitosamente');
        }

        clearCineForm();
        loadCines();
    } catch (error) {
        let errorMessage = error.message;

        // Detectar errores de restricción de clave foránea
        if (errorMessage.toLowerCase().includes('foreign key') ||
            errorMessage.toLowerCase().includes('constraint') ||
            errorMessage.toLowerCase().includes('referenced') ||
            errorMessage.toLowerCase().includes('violates') ||
            errorMessage.includes('409')) {
            errorMessage = 'No se puede eliminar este cine porque está asociado a otras entidades (películas, salas, etc.). Primero debe eliminar las dependencias.';
        }

        showAlert('cineAlert', 'Error: ' + errorMessage, 'error');
    }
});

function editCine(id) {
    const cine = cines.find(c => c.id === id);
    if (cine) {
        document.getElementById('cineId').value = cine.id;
        document.getElementById('cineNombre').value = cine.nombre;
        document.getElementById('cineDireccion').value = cine.direccion;
    }
}

async function deleteCine(id) {
    if (confirm('¿Estás seguro de eliminar este cine?')) {
        try {
            await makeRequest(`/api/v1/cines/${id}`, { method: 'DELETE' });
            showAlert('cineAlert', 'Cine eliminado exitosamente');
            loadCines();
        } catch (error) {
            let errorMessage = error.message || '';
            if (
                errorMessage.includes('Error, por favor intente mas tarde') ||
                errorMessage.toLowerCase().includes('foreign key') ||
                errorMessage.toLowerCase().includes('constraint') ||
                errorMessage.toLowerCase().includes('referenced') ||
                errorMessage.toLowerCase().includes('violates') ||
                errorMessage.includes('409') ||
                errorMessage.includes('500')
            ) {
                errorMessage = 'No se puede eliminar este cine porque está asociado a otras entidades (películas, salas, empleados, etc.). Elimine primero las entidades relacionadas.';
            }
            showAlert('cineAlert', 'Error: ' + errorMessage, 'error');
        }
    }
}

function clearCineForm() {
    document.getElementById('cineForm').reset();
    document.getElementById('cineId').value = '';
}

// ===== GESTIÓN DE EMPLEADOS =====

async function loadEmpleados() {
    try {
        const data = await makeRequest('/api/v1/Empleados');
        empleados = data || [];
        displayEmpleados();
    } catch (error) {
        showAlert('empleadoAlert', 'Error al cargar empleados: ' + error.message, 'error');
    }
}

async function loadCinesForEmpleadoSelect() {
    if (cines.length === 0) {
        await loadCines();
    }
    const select = document.getElementById('empleadoCine');
    select.innerHTML = '<option value="">Seleccionar cine</option>';
    cines.forEach(cine => {
        const option = document.createElement('option');
        option.value = cine.id;
        option.textContent = cine.nombre;
        select.appendChild(option);
    });
}

function displayEmpleados() {
    const tbody = document.getElementById('empleadosTableBody');
    tbody.innerHTML = '';

    empleados.forEach(empleado => {
        let cineNombre = '';
        let cineId = '';
        if (empleado.cines && empleado.cines.length > 0) {
            cineNombre = empleado.cines.map(c => c.nombre).join(', ');
            cineId = empleado.cines[0].id; // Solo el primero si es uno solo
        } else {
            cineNombre = 'Sin asignar';
        }

        // Generar las opciones del select de cines
        const cineOptions = cines.map(cine =>
            `<option value="${cine.id}" ${cine.id === cineId ? 'selected' : ''}>${cine.nombre}</option>`
        ).join('');

        const row = `
            <tr id="empleado-row-${empleado.id}">
                <td>${empleado.id}</td>
                <td>
                    <span class="display-mode" id="empleado-nombre-display-${empleado.id}">${empleado.nombre}</span>
                    <input type="text" class="edit-mode form-control" id="empleado-nombre-edit-${empleado.id}" value="${empleado.nombre}" style="display:none;">
                </td>
                <td>
                    <span class="display-mode" id="empleado-dni-display-${empleado.id}">${empleado.dni}</span>
                    <input type="number" class="edit-mode form-control" id="empleado-dni-edit-${empleado.id}" value="${empleado.dni}" style="display:none;">
                </td>
                <td>
                    <span class="display-mode" id="empleado-cine-display-${empleado.id}">${cineNombre}</span>
                    <select class="edit-mode form-control" id="empleado-cine-edit-${empleado.id}" style="display:none;">
                        <option value="">Seleccionar cine</option>
                        ${cineOptions}
                    </select>
                </td>
                <td>
                    <div class="display-mode" id="empleado-actions-display-${empleado.id}">
                        <button class="btn btn-secondary btn-sm" onclick="enableEditEmpleado(${empleado.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteEmpleado(${empleado.id})">Eliminar</button>
                    </div>
                    <div class="edit-mode" id="empleado-actions-edit-${empleado.id}" style="display:none;">
                        <button class="btn btn-success btn-sm" onclick="saveEditEmpleado(${empleado.id})">Guardar</button>
                        <button class="btn btn-secondary btn-sm" onclick="cancelEditEmpleado(${empleado.id})">Cancelar</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function enableEditEmpleado(id) {
    document.querySelectorAll(`#empleado-row-${id} .display-mode`).forEach(el => el.style.display = 'none');
    document.querySelectorAll(`#empleado-row-${id} .edit-mode`).forEach(el => el.style.display = 'block');
}

function cancelEditEmpleado(id) {
    const empleado = empleados.find(e => e.id === id);
    if (empleado) {
        document.getElementById(`empleado-nombre-edit-${id}`).value = empleado.nombre;
        document.getElementById(`empleado-dni-edit-${id}`).value = empleado.dni;
        document.getElementById(`empleado-cine-edit-${id}`).value = empleado.cines && empleado.cines.length > 0 ? empleado.cines[0].id : '';
    }

    document.querySelectorAll(`#empleado-row-${id} .display-mode`).forEach(el => el.style.display = 'block');
    document.querySelectorAll(`#empleado-row-${id} .edit-mode`).forEach(el => el.style.display = 'none');
}

async function saveEditEmpleado(id) {
    const nombre = document.getElementById(`empleado-nombre-edit-${id}`).value.trim();
    const dni = parseInt(document.getElementById(`empleado-dni-edit-${id}`).value);
    const cineId = document.getElementById(`empleado-cine-edit-${id}`).value;

    if (!nombre || !dni || !cineId) {
        showAlert('empleadoAlert', 'Todos los campos son obligatorios', 'error');
        return;
    }

    const empleadoData = {
        id: id,
        nombre,
        dni,
        cines: [{ id: parseInt(cineId) }] // Solo el cine seleccionado
    };

    try {
        await makeRequest(`/api/v1/Empleados/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(empleadoData)
        });

        showAlert('empleadoAlert', 'Empleado actualizado exitosamente');
        loadEmpleados();
    } catch (error) {
        showAlert('empleadoAlert', 'Error al actualizar empleado: ' + error.message, 'error');
    }
}
document.getElementById('empleadoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('empleadoNombre').value.trim();
    const dni = parseInt(document.getElementById('empleadoDni').value);
    const cineId = document.getElementById('empleadoCine').value;

    if (!nombre || !dni || !cineId) {
        showAlert('empleadoAlert', 'Todos los campos son obligatorios', 'error');
        return;
    }

    const empleadoData = {
        nombre,
        dni,
        cines: [{ id: parseInt(cineId) }] // Relacionar con el cine seleccionado
    };
    const empleadoId = document.getElementById('empleadoId').value;

    try {
        if (empleadoId) {
            await makeRequest(`/api/v1/Empleados/${empleadoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(empleadoData)
            });
            showAlert('empleadoAlert', 'Empleado actualizado exitosamente');
        } else {
            await makeRequest('/api/v1/Empleados', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(empleadoData)
            });
            showAlert('empleadoAlert', 'Empleado creado exitosamente');
        }

        clearEmpleadoForm();
        loadEmpleados();
    } catch (error) {
        let errorMessage = error.message;

        if (errorMessage.toLowerCase().includes('foreign key') ||
            errorMessage.toLowerCase().includes('constraint') ||
            errorMessage.toLowerCase().includes('referenced') ||
            errorMessage.toLowerCase().includes('violates') ||
            errorMessage.includes('409')) {
            errorMessage = 'No se puede realizar esta operación porque el empleado está asociado a otras entidades. Primero debe eliminar las dependencias.';
        }

        showAlert('empleadoAlert', 'Error: ' + errorMessage, 'error');
    }
});

function editEmpleado(id) {
    const empleado = empleados.find(e => e.id === id);
    if (empleado) {
        document.getElementById('empleadoId').value = empleado.id;
        document.getElementById('empleadoNombre').value = empleado.nombre;
        document.getElementById('empleadoDni').value = empleado.dni;
    }
}

async function deleteEmpleado(id) {
    if (confirm('¿Estás seguro de eliminar este empleado?')) {
        try {
            await makeRequest(`/api/v1/Empleados/${id}`, {
                method: 'DELETE'
            });

            showAlert('empleadoAlert', 'Empleado eliminado exitosamente');
            loadEmpleados();
        } catch (error) {
            let errorMessage = error.message;

            if (errorMessage.toLowerCase().includes('foreign key') ||
                errorMessage.toLowerCase().includes('constraint') ||
                errorMessage.toLowerCase().includes('referenced') ||
                errorMessage.toLowerCase().includes('violates') ||
                errorMessage.includes('409') ||
                errorMessage.includes('500')) {
                errorMessage = 'No se puede eliminar este empleado porque está asociado a otras entidades. Primero debe eliminar las dependencias.';
            }

            showAlert('empleadoAlert', 'Error: ' + errorMessage, 'error');
        }
    }
}

function clearEmpleadoForm() {
    document.getElementById('empleadoForm').reset();
    document.getElementById('empleadoId').value = '';
}

// ===== GESTIÓN DE PELÍCULAS =====

async function loadGeneros() {
    try {
        const data = await makeRequest('/api/v1/enums/genero');
        generos = data || [];
        populateGeneroSelect();
    } catch (error) {
        showAlert('peliculaAlert', 'Error al cargar géneros: ' + error.message, 'error');
    }
}

function populateGeneroSelect() {
    const select = document.getElementById('peliculaGenero');
    select.innerHTML = '<option value="">Seleccionar género</option>';

    generos.forEach(genero => {
        const option = document.createElement('option');
        option.value = genero;
        option.textContent = genero;
        select.appendChild(option);
    });
}

async function loadCinesForSelect(selectId) {
    if (cines.length === 0) {
        await loadCines();
    }

    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Seleccionar cine</option>';

    cines.forEach(cine => {
        const option = document.createElement('option');
        option.value = cine.id;
        option.textContent = cine.nombre;
        select.appendChild(option);
    });
}

async function loadPeliculas() {
    try {
        const data = await makeRequest('/api/v1/peliculass');
        peliculas = data || [];
        displayPeliculas();
    } catch (error) {
        showAlert('peliculaAlert', 'Error al cargar películas: ' + error.message, 'error');
    }
}

function displayPeliculas() {
    const tbody = document.getElementById('peliculasTableBody');
    tbody.innerHTML = '';

    peliculas.forEach(pelicula => {
        const cineNombre = pelicula.cine ? pelicula.cine.nombre : 'Sin asignar';
        const cineId = pelicula.cine ? pelicula.cine.id : '';

        // Opciones para el select de cines
        const cineOptions = cines.map(cine =>
            `<option value="${cine.id}" ${cine.id === cineId ? 'selected' : ''}>${cine.nombre}</option>`
        ).join('');

        // Opciones para el select de géneros
        const generoOptions = generos.map(genero =>
            `<option value="${genero}" ${genero === pelicula.genero ? 'selected' : ''}>${genero}</option>`
        ).join('');

        const row = `
            <tr id="pelicula-row-${pelicula.id}">
                <td>${pelicula.id}</td>
                <td>
                    <span class="display-mode" id="pelicula-titulo-display-${pelicula.id}">${pelicula.titulo}</span>
                    <input type="text" class="edit-mode form-control" id="pelicula-titulo-edit-${pelicula.id}" value="${pelicula.titulo}" style="display:none;">
                </td>
                <td>
                    <span class="display-mode" id="pelicula-genero-display-${pelicula.id}">${pelicula.genero}</span>
                    <select class="edit-mode form-control" id="pelicula-genero-edit-${pelicula.id}" style="display:none;">
                        <option value="">Seleccionar género</option>
                        ${generoOptions}
                    </select>
                </td>
                <td>
                    <span class="display-mode" id="pelicula-cine-display-${pelicula.id}">${cineNombre}</span>
                    <select class="edit-mode form-control" id="pelicula-cine-edit-${pelicula.id}" style="display:none;">
                        <option value="">Seleccionar cine</option>
                        ${cineOptions}
                    </select>
                </td>
                <td>
                    <div class="display-mode" id="pelicula-actions-display-${pelicula.id}">
                        <button class="btn btn-secondary btn-sm" onclick="enableEditPelicula(${pelicula.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deletePelicula(${pelicula.id})">Eliminar</button>
                    </div>
                    <div class="edit-mode" id="pelicula-actions-edit-${pelicula.id}" style="display:none;">
                        <button class="btn btn-success btn-sm" onclick="saveEditPelicula(${pelicula.id})">Guardar</button>
                        <button class="btn btn-secondary btn-sm" onclick="cancelEditPelicula(${pelicula.id})">Cancelar</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function enableEditPelicula(id) {
    document.querySelectorAll(`#pelicula-row-${id} .display-mode`).forEach(el => el.style.display = 'none');
    document.querySelectorAll(`#pelicula-row-${id} .edit-mode`).forEach(el => el.style.display = 'block');
}

function cancelEditPelicula(id) {
    const pelicula = peliculas.find(p => p.id === id);
    if (pelicula) {
        document.getElementById(`pelicula-titulo-edit-${id}`).value = pelicula.titulo;
        document.getElementById(`pelicula-genero-edit-${id}`).value = pelicula.genero;
        document.getElementById(`pelicula-cine-edit-${id}`).value = pelicula.cine ? pelicula.cine.id : '';
    }
    document.querySelectorAll(`#pelicula-row-${id} .display-mode`).forEach(el => el.style.display = 'block');
    document.querySelectorAll(`#pelicula-row-${id} .edit-mode`).forEach(el => el.style.display = 'none');
}

async function saveEditPelicula(id) {
    const titulo = document.getElementById(`pelicula-titulo-edit-${id}`).value.trim();
    const genero = document.getElementById(`pelicula-genero-edit-${id}`).value;
    const cineId = document.getElementById(`pelicula-cine-edit-${id}`).value;

    if (!titulo || !genero || !cineId) {
        showAlert('peliculaAlert', 'Todos los campos son obligatorios', 'error');
        return;
    }

    const peliculaData = {
        id: id,
        titulo,
        genero,
        cine: { id: parseInt(cineId) }
    };

    try {
        await makeRequest(`/api/v1/peliculass/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(peliculaData)
        });

        showAlert('peliculaAlert', 'Película actualizada exitosamente');
        loadPeliculas();
    } catch (error) {
        showAlert('peliculaAlert', 'Error al actualizar película: ' + error.message, 'error');
    }
}

document.getElementById('peliculaForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('peliculaTitulo').value.trim();
    const genero = document.getElementById('peliculaGenero').value;
    const cineId = document.getElementById('peliculaCine').value;

    if (!titulo || !genero || !cineId) {
        showAlert('peliculaAlert', 'Todos los campos son obligatorios', 'error');
        return;
    }

    const peliculaData = {
        titulo,
        genero,
        cine: {
            id: parseInt(cineId)
        }
    };

    const peliculaId = document.getElementById('peliculaId').value;

    try {
        if (peliculaId) {
            await makeRequest(`/api/v1/peliculass/${peliculaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(peliculaData)
            });
            showAlert('peliculaAlert', 'Película actualizada exitosamente');
        } else {
            await makeRequest('/api/v1/peliculass', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(peliculaData)
            });
            showAlert('peliculaAlert', 'Película creada exitosamente');
        }

        clearPeliculaForm();
        loadPeliculas();
    } catch (error) {
        let errorMessage = error.message;

        if (errorMessage.toLowerCase().includes('foreign key') ||
            errorMessage.toLowerCase().includes('constraint') ||
            errorMessage.toLowerCase().includes('referenced') ||
            errorMessage.toLowerCase().includes('violates') ||
            errorMessage.includes('409')) {
            errorMessage = 'Error de integridad de datos. Verifique que el cine seleccionado existe.';
        }

        showAlert('peliculaAlert', 'Error: ' + errorMessage, 'error');
    }
});

function editPelicula(id) {
    const pelicula = peliculas.find(p => p.id === id);
    if (pelicula) {
        document.getElementById('peliculaId').value = pelicula.id;
        document.getElementById('peliculaTitulo').value = pelicula.titulo;
        document.getElementById('peliculaGenero').value = pelicula.genero;
        document.getElementById('peliculaCine').value = pelicula.cine ? pelicula.cine.id : '';
    }
}

async function deletePelicula(id) {
    if (confirm('¿Estás seguro de eliminar esta película?')) {
        try {
            await makeRequest(`/api/v1/peliculass/${id}`, { method: 'DELETE' });
            showAlert('peliculaAlert', 'Película eliminada exitosamente');
            loadPeliculas();
        } catch (error) {
            let errorMessage = error.message || '';
            if (
                errorMessage.includes('Error, por favor intente mas tarde') ||
                errorMessage.toLowerCase().includes('foreign key') ||
                errorMessage.toLowerCase().includes('constraint') ||
                errorMessage.toLowerCase().includes('referenced') ||
                errorMessage.toLowerCase().includes('violates') ||
                errorMessage.includes('409') ||
                errorMessage.includes('500')
            ) {
                errorMessage = 'No se puede eliminar esta película porque está asociada a funciones. Elimine primero las funciones relacionadas.';
            }
            showAlert('peliculaAlert', 'Error: ' + errorMessage, 'error');
        }
    }
}

function clearPeliculaForm() {
    document.getElementById('peliculaForm').reset();
    document.getElementById('peliculaId').value = '';
}

// ===== GESTIÓN DE SALAS =====

async function loadSalas() {
    try {
        const data = await makeRequest('/api/v1/salas');
        console.log('Datos de salas recibidos:', data); // Para debug
        salas = Array.isArray(data) ? data : [];
        displaySalas();
    } catch (error) {
        console.error('Error completo al cargar salas:', error);
        showAlert('salaAlert', 'Error al cargar salas: ' + error.message, 'error');
        salas = []; // Inicializar array vacío en caso de error
        displaySalas(); // Mostrar tabla vacía
    }
}

function displaySalas() {
    const tbody = document.getElementById('salasTableBody');
    if (!tbody) {
        console.error('No se encontró el elemento salasTableBody');
        return;
    }

    tbody.innerHTML = '';

    if (!Array.isArray(salas)) {
        console.error('Salas no es un array:', salas);
        return;
    }

    salas.forEach(sala => {
        // Manejo seguro de datos anidados
        let cineNombre = 'Sin asignar';
        if (sala.cine && typeof sala.cine === 'object') {
            cineNombre = sala.cine.nombre || 'Sin nombre';
        }

        const row = `
            <tr id="sala-row-${sala.id}">
                <td>${sala.id || 'N/A'}</td>
                <td>
                    <span class="display-mode" id="sala-numero-display-${sala.id}">${sala.numero || 'N/A'}</span>
                    <input type="number" class="edit-mode form-control" id="sala-numero-edit-${sala.id}" value="${sala.numero || ''}" style="display:none;">
                </td>
                <td>
                    <span class="display-mode" id="sala-capacidad-display-${sala.id}">${sala.capacidad || 'N/A'}</span>
                    <input type="number" class="edit-mode form-control" id="sala-capacidad-edit-${sala.id}" value="${sala.capacidad || ''}" style="display:none;">
                </td>
                <td>
                    <span class="display-mode" id="sala-cine-display-${sala.id}">${cineNombre}</span>
                    <select class="edit-mode form-control" id="sala-cine-edit-${sala.id}" style="display:none;">
                        <option value="">Seleccionar cine</option>
                    </select>
                </td>
                <td>
                    <div class="display-mode" id="sala-actions-display-${sala.id}">
                        <button class="btn btn-secondary btn-sm" onclick="enableEditSala(${sala.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteSala(${sala.id})">Eliminar</button>
                    </div>
                    <div class="edit-mode" id="sala-actions-edit-${sala.id}" style="display:none;">
                        <button class="btn btn-success btn-sm" onclick="saveEditSala(${sala.id})">Guardar</button>
                        <button class="btn btn-secondary btn-sm" onclick="cancelEditSala(${sala.id})">Cancelar</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    // Llenar los selects de cine después de crear las filas
    salas.forEach(sala => {
        const select = document.getElementById(`sala-cine-edit-${sala.id}`);
        if (select) {
            fillCineSelectForEdit(select, sala.cine ? sala.cine.id : null);
        }
    });
}

function fillCineSelectForEdit(selectElement, selectedCineId = null) {
    if (!selectElement) return;

    selectElement.innerHTML = '<option value="">Seleccionar cine</option>';
    cines.forEach(cine => {
        const option = document.createElement('option');
        option.value = cine.id;
        option.textContent = cine.nombre;
        if (selectedCineId && cine.id == selectedCineId) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
}



document.getElementById('salaForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const numero = parseInt(document.getElementById('salaNumero').value);
    const capacidad = parseInt(document.getElementById('salaCapacidad').value);
    const cineId = document.getElementById('salaCine').value;
    const salaId = document.getElementById('salaId').value;

    if (!numero || !capacidad || !cineId) {
        showAlert('salaAlert', 'Todos los campos son obligatorios', 'error');
        return;
    }

    const salaData = {
        id: salaId ? parseInt(salaId) : undefined,
        numero,
        capacidad,
        cine: {
            id: parseInt(cineId)
        }
    };

    try {
        if (salaId) {
            await makeRequest(`/api/v1/salas/${salaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(salaData)
            });
            showAlert('salaAlert', 'Sala actualizada exitosamente');
        } else {
            await makeRequest('/api/v1/salas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(salaData)
            });
            showAlert('salaAlert', 'Sala creada exitosamente');
        }

        clearSalaForm();
        loadSalas();
    } catch (error) {
        let errorMessage = error.message;

        if (errorMessage.toLowerCase().includes('foreign key') ||
            errorMessage.toLowerCase().includes('constraint') ||
            errorMessage.toLowerCase().includes('referenced') ||
            errorMessage.toLowerCase().includes('violates') ||
            errorMessage.includes('409')) {
            errorMessage = 'Error de integridad de datos. Verifique que el cine seleccionado existe.';
        }

        showAlert('salaAlert', 'Error: ' + errorMessage, 'error');
    }
});


function editSala(id) {
    const sala = salas.find(s => s.id === id);
    if (sala) {
        document.getElementById('salaId').value = sala.id;
        document.getElementById('salaNumero').value = sala.numero;
        document.getElementById('salaCapacidad').value = sala.capacidad;
        document.getElementById('salaCine').value = sala.cine ? sala.cine.id : '';
    }
}

function enableEditSala(id) {
    document.querySelectorAll(`#sala-row-${id} .display-mode`).forEach(el => el.style.display = 'none');
    document.querySelectorAll(`#sala-row-${id} .edit-mode`).forEach(el => el.style.display = 'block');
}

function cancelEditSala(id) {
    const sala = salas.find(s => s.id === id);
    if (sala) {
        document.getElementById(`sala-numero-edit-${id}`).value = sala.numero || '';
        document.getElementById(`sala-capacidad-edit-${id}`).value = sala.capacidad || '';
        const select = document.getElementById(`sala-cine-edit-${id}`);
        if (select) {
            select.value = sala.cine ? sala.cine.id : '';
        }
    }

    document.querySelectorAll(`#sala-row-${id} .display-mode`).forEach(el => el.style.display = 'block');
    document.querySelectorAll(`#sala-row-${id} .edit-mode`).forEach(el => el.style.display = 'none');
}

async function saveEditSala(id) {
    const numero = parseInt(document.getElementById(`sala-numero-edit-${id}`).value);
    const capacidad = parseInt(document.getElementById(`sala-capacidad-edit-${id}`).value);
    const cineId = document.getElementById(`sala-cine-edit-${id}`).value;

    if (!numero || !capacidad || !cineId) {
        showAlert('salaAlert', 'Todos los campos son obligatorios', 'error');
        return;
    }

    const salaData = {
        numero,
        capacidad,
        cine: {
            id: parseInt(cineId)
        }
    };

    try {
        await makeRequest(`/api/v1/salas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(salaData)
        });

        showAlert('salaAlert', 'Sala actualizada exitosamente');
        loadSalas();
    } catch (error) {
        showAlert('salaAlert', 'Error al actualizar sala: ' + error.message, 'error');
    }
}

async function deleteSala(id) {
    if (confirm('¿Estás seguro de eliminar esta sala?')) {
        try {
            await makeRequest(`/api/v1/salas/${id}`, { method: 'DELETE' });
            showAlert('salaAlert', 'Sala eliminada exitosamente');
            loadSalas();
        } catch (error) {
            let errorMessage = error.message || '';
            if (
                errorMessage.includes('Error, por favor intente mas tarde') ||
                errorMessage.toLowerCase().includes('foreign key') ||
                errorMessage.toLowerCase().includes('constraint') ||
                errorMessage.toLowerCase().includes('referenced') ||
                errorMessage.toLowerCase().includes('violates') ||
                errorMessage.includes('409') ||
                errorMessage.includes('500')
            ) {
                errorMessage = 'No se puede eliminar esta sala porque tiene funciones asociadas. Elimine primero todas las funciones relacionadas.';
            }
            showAlert('salaAlert', 'Error: ' + errorMessage, 'error');
        }
    }
}

function clearSalaForm() {
    document.getElementById('salaForm').reset();
    document.getElementById('salaId').value = '';
}



// ===== GESTIÓN DE FUNCIONES =====

async function loadSalasForSelect() {
    try {
        if (salas.length === 0) {
            await loadSalas();
        }
        const select = document.getElementById('funcionSala');
        if (!select) return;
        select.innerHTML = '<option value="">Seleccionar sala</option>';
        salas.forEach(sala => {
            const option = document.createElement('option');
            option.value = sala.id;
            option.textContent = `Sala ${sala.numero} - ${sala.cine ? sala.cine.nombre : 'Sin cine'}`;
            select.appendChild(option);
        });
        // Llama al filtro después de llenar las salas
        filterPeliculasForFuncionForm();
    } catch (error) {
        showAlert('funcionAlert', 'Error al cargar salas para la selección', 'error');
    }
}

async function loadPeliculasForSelect() {
    try {
        if (peliculas.length === 0) {
            await loadPeliculas();
        }
        // Llama al filtro después de cargar películas
        filterPeliculasForFuncionForm();
    } catch (error) {
        showAlert('funcionAlert', 'Error al cargar películas para la selección', 'error');
    }
}

async function loadFunciones() {
    try {
        const data = await makeRequest('/api/v1/funciones');
        console.log('Datos de funciones recibidos:', data);
        funciones = Array.isArray(data) ? data : [];
        displayFunciones();
    } catch (error) {
        console.error('Error completo al cargar funciones:', error);
        showAlert('funcionAlert', 'Error al cargar funciones: ' + error.message, 'error');
        funciones = [];
        displayFunciones();
    }
}

function displayFunciones() {
    const tbody = document.getElementById('funcionesTableBody');
    if (!tbody) {
        console.error('No se encontró el elemento funcionesTableBody');
        return;
    }

    tbody.innerHTML = '';

    if (!Array.isArray(funciones)) {
        console.error('Funciones no es un array:', funciones);
        return;
    }

    funciones.forEach(funcion => {
        let salaNombre = 'Sin asignar';
        let peliculaTitulo = 'Sin asignar';

        if (funcion.sala && typeof funcion.sala === 'object') {
            salaNombre = `Sala ${funcion.sala.numero || 'N/A'}`;
        }

        if (funcion.pelicula && typeof funcion.pelicula === 'object') {
            peliculaTitulo = funcion.pelicula.titulo || 'Sin título';
        }

        const row = `
            <tr id="funcion-row-${funcion.id}">
                <td>${funcion.id || 'N/A'}</td>
                <td>
                    <span class="display-mode" id="funcion-horario-display-${funcion.id}">${funcion.horario || 'N/A'}</span>
                    <input type="datetime-local" class="edit-mode form-control" id="funcion-horario-edit-${funcion.id}" value="${funcion.horario || ''}" style="display:none;">
                </td>
                <td>
                    <span class="display-mode" id="funcion-sala-display-${funcion.id}">${salaNombre}</span>
                    <select class="edit-mode form-control" id="funcion-sala-edit-${funcion.id}" style="display:none;">
                        <option value="">Seleccionar sala</option>
                    </select>
                </td>
                <td>
                    <span class="display-mode" id="funcion-pelicula-display-${funcion.id}">${peliculaTitulo}</span>
                    <select class="edit-mode form-control" id="funcion-pelicula-edit-${funcion.id}" style="display:none;">
                        <option value="">Seleccionar película</option>
                    </select>
                </td>
                <td>
                    <div class="display-mode" id="funcion-actions-display-${funcion.id}">
                        <button class="btn btn-secondary btn-sm" onclick="enableEditFuncion(${funcion.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteFuncion(${funcion.id})">Eliminar</button>
                    </div>
                    <div class="edit-mode" id="funcion-actions-edit-${funcion.id}" style="display:none;">
                        <button class="btn btn-success btn-sm" onclick="saveEditFuncion(${funcion.id})">Guardar</button>
                        <button class="btn btn-secondary btn-sm" onclick="cancelEditFuncion(${funcion.id})">Cancelar</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    funciones.forEach(funcion => {
        const salaSelect = document.getElementById(`funcion-sala-edit-${funcion.id}`);
        const peliculaSelect = document.getElementById(`funcion-pelicula-edit-${funcion.id}`);

        // Llenar todas las salas
        fillSalaSelectForEdit(salaSelect, funcion.sala ? funcion.sala.id : null);

        // Llenar películas filtradas según la sala seleccionada
        fillPeliculaSelectForEdit(peliculaSelect, salaSelect.value, funcion.pelicula ? funcion.pelicula.id : null);

        // Evento para actualizar películas al cambiar la sala
        salaSelect.addEventListener('change', function() {
            fillPeliculaSelectForEdit(peliculaSelect, salaSelect.value);
        });
    });
}

function fillSalaSelectForEdit(selectElement, selectedSalaId = null) {
    if (!selectElement) return;
    selectElement.innerHTML = '<option value="">Seleccionar sala</option>';
    salas.forEach(sala => {
        const option = document.createElement('option');
        option.value = sala.id;
        option.textContent = `Sala ${sala.numero} - ${sala.cine ? sala.cine.nombre : 'Sin cine'}`;
        if (selectedSalaId && sala.id == selectedSalaId) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
}


function fillPeliculaSelectForEdit(selectElement, salaId, selectedPeliculaId = null) {
    if (!selectElement) return;
    selectElement.innerHTML = '<option value="">Seleccionar película</option>';
    const sala = salas.find(s => s.id == salaId);
    if (sala && sala.cine && sala.cine.id) {
        const peliculasFiltradas = peliculas.filter(p => p.cine && p.cine.id == sala.cine.id);
        peliculasFiltradas.forEach(pelicula => {
            const option = document.createElement('option');
            option.value = pelicula.id;
            option.textContent = pelicula.titulo;
            if (selectedPeliculaId && pelicula.id == selectedPeliculaId) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        });
    }
}

function enableEditFuncion(id) {
    document.querySelectorAll(`#funcion-row-${id} .display-mode`).forEach(el => el.style.display = 'none');
    document.querySelectorAll(`#funcion-row-${id} .edit-mode`).forEach(el => el.style.display = 'block');
}

function cancelEditFuncion(id) {
    const funcion = funciones.find(f => f.id === id);
    if (funcion) {
        document.getElementById(`funcion-horario-edit-${id}`).value = funcion.horario || '';
        document.getElementById(`funcion-sala-edit-${id}`).value = funcion.sala ? funcion.sala.id : '';
        document.getElementById(`funcion-pelicula-edit-${id}`).value = funcion.pelicula ? funcion.pelicula.id : '';
    }

    document.querySelectorAll(`#funcion-row-${id} .display-mode`).forEach(el => el.style.display = 'block');
    document.querySelectorAll(`#funcion-row-${id} .edit-mode`).forEach(el => el.style.display = 'none');
}

async function saveEditFuncion(id) {
    const horario = document.getElementById(`funcion-horario-edit-${id}`).value;
    const salaId = document.getElementById(`funcion-sala-edit-${id}`).value;
    const peliculaId = document.getElementById(`funcion-pelicula-edit-${id}`).value;

    if (!horario || !salaId || !peliculaId) {
        showAlert('funcionAlert', 'Todos los campos son obligatorios', 'error');
        return;
    }

    const funcionData = {
        id: id, // Agregar el ID
        horario,
        sala: {
            id: parseInt(salaId)
        },
        pelicula: {
            id: parseInt(peliculaId)
        }
    };

    try {
        await makeRequest(`/api/v1/funciones/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(funcionData)
        });

        showAlert('funcionAlert', 'Función actualizada exitosamente');
        loadFunciones();
    } catch (error) {
        showAlert('funcionAlert', 'Error al actualizar función: ' + error.message, 'error');
    }
}

document.getElementById('funcionForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const horario = document.getElementById('funcionHorario')?.value;
    const salaId = document.getElementById('funcionSala')?.value;
    const peliculaId = document.getElementById('funcionPelicula')?.value;

    if (!horario || !salaId || !peliculaId) {
        showAlert('funcionAlert', 'Por favor complete todos los campos requeridos', 'error');
        return;
    }

    const funcionData = {
        horario: horario,
        sala: { id: parseInt(salaId) },
        pelicula: { id: parseInt(peliculaId) }
    };

    const funcionId = document.getElementById('funcionId')?.value;

    try {
        if (funcionId) {
            await makeRequest(`/api/v1/funciones/${funcionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(funcionData)
            });
            showAlert('funcionAlert', 'Función actualizada exitosamente');
        } else {
            await makeRequest('/api/v1/funciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(funcionData)
            });
            showAlert('funcionAlert', 'Función creada exitosamente');
        }
        clearFuncionForm();
        await loadFunciones();
    } catch (error) {
        showAlert('funcionAlert', 'Error: ' + error.message, 'error');
    }
});

function editFuncion(id) {
    const funcion = funciones.find(f => f.id === id);
    if (funcion) {
        document.getElementById('funcionId').value = funcion.id;
        document.getElementById('funcionHorario').value = funcion.horario || '';
        document.getElementById('funcionSala').value = funcion.sala ? funcion.sala.id : '';
        // Llama al filtro para que el select de películas se llene correctamente
        filterPeliculasForFuncionForm();
        document.getElementById('funcionPelicula').value = funcion.pelicula ? funcion.pelicula.id : '';

        // Scroll al formulario para mejor UX
        document.getElementById('funcionForm')?.scrollIntoView({ behavior: 'smooth' });
    }
}

async function deleteFuncion(id) {
    if (confirm('¿Estás seguro de eliminar esta función?')) {
        try {
            await makeRequest(`/api/v1/funciones/${id}`, { method: 'DELETE' });
            showAlert('funcionAlert', 'Función eliminada exitosamente');
            loadFunciones();
        } catch (error) {
            let errorMessage = error.message || '';
            if (
                errorMessage.includes('Error, por favor intente mas tarde') ||
                errorMessage.toLowerCase().includes('foreign key') ||
                errorMessage.toLowerCase().includes('constraint') ||
                errorMessage.toLowerCase().includes('referenced') ||
                errorMessage.toLowerCase().includes('violates') ||
                errorMessage.includes('409') ||
                errorMessage.includes('500')
            ) {
                errorMessage = 'No se puede eliminar esta función porque tiene entradas asociadas. Elimine primero todas las entradas relacionadas.';
            }
            showAlert('funcionAlert', 'Error: ' + errorMessage, 'error');
        }
    }
}

function clearFuncionForm() {
    document.getElementById('funcionForm')?.reset();
    const funcionId = document.getElementById('funcionId');
    if (funcionId) funcionId.value = '';
}

// Funcion para que se selecione la película correcta al cambiar de sala
document.getElementById('funcionSala')?.addEventListener('change', function() {
    const salaId = this.value;
    const sala = salas.find(s => s.id == salaId);
    const peliculaSelect = document.getElementById('funcionPelicula');
    if (!peliculaSelect) return;

    peliculaSelect.innerHTML = '<option value="">Seleccionar película</option>';

    if (sala && sala.cine && sala.cine.id) {
        // Filtrar películas del mismo cine
        const peliculasFiltradas = peliculas.filter(p => p.cine && p.cine.id == sala.cine.id);
        peliculasFiltradas.forEach(pelicula => {
            const option = document.createElement('option');
            option.value = pelicula.id;
            option.textContent = pelicula.titulo;
            peliculaSelect.appendChild(option);
        });
    }
});

// Función para filtrar películas en el select de edición de función
function filterPeliculasForFuncionEdit(funcionId) {
    const salaSelect = document.getElementById(`funcion-sala-edit-${funcionId}`);
    const peliculaSelect = document.getElementById(`funcion-pelicula-edit-${funcionId}`);
    if (!salaSelect || !peliculaSelect) return;

    const salaId = salaSelect.value;
    const sala = salas.find(s => s.id == salaId);

    // Obtener la película actualmente seleccionada (si existe)
    const funcion = funciones.find(f => f.id == funcionId);
    const selectedPeliculaId = funcion && funcion.pelicula ? funcion.pelicula.id : null;

    peliculaSelect.innerHTML = '<option value="">Seleccionar película</option>';

    if (sala && sala.cine && sala.cine.id) {
        const peliculasFiltradas = peliculas.filter(p => p.cine && p.cine.id == sala.cine.id);
        peliculasFiltradas.forEach(pelicula => {
            const option = document.createElement('option');
            option.value = pelicula.id;
            option.textContent = pelicula.titulo;
            if (selectedPeliculaId && pelicula.id == selectedPeliculaId) {
                option.selected = true;
            }
            peliculaSelect.appendChild(option);
        });
    }
}


function filterPeliculasForFuncionForm() {
    const salaId = document.getElementById('funcionSala').value;
    const sala = salas.find(s => s.id == salaId);
    const peliculaSelect = document.getElementById('funcionPelicula');
    if (!peliculaSelect) return;

    peliculaSelect.innerHTML = '<option value="">Seleccionar película</option>';

    if (sala && sala.cine && sala.cine.id) {
        const peliculasFiltradas = peliculas.filter(p => p.cine && p.cine.id == sala.cine.id);
        peliculasFiltradas.forEach(pelicula => {
            const option = document.createElement('option');
            option.value = pelicula.id;
            option.textContent = pelicula.titulo;
            peliculaSelect.appendChild(option);
        });
    }
}

// ===== GESTIÓN DE ENTRADAS =====

async function loadFuncionesForSelect() {
    try {
        if (funciones.length === 0) {
            await loadFunciones();
        }

        const select = document.getElementById('entradaFuncion');
        if (!select) return;

        select.innerHTML = '<option value="">Seleccionar función</option>';

        funciones.forEach(funcion => {
            const option = document.createElement('option');
            option.value = funcion.id;
            const peliculaTitulo = funcion.pelicula ? funcion.pelicula.titulo : 'Sin película';
            const salaNombre = funcion.sala ? `Sala ${funcion.sala.numero}` : 'Sin sala';
            option.textContent = `${peliculaTitulo} - ${salaNombre} - ${funcion.horario}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar funciones para select:', error);
        showAlert('entradaAlert', 'Error al cargar funciones para la selección', 'error');
    }
}

async function loadEntradas() {
    try {
        const data = await makeRequest('/api/v1/entradas');
        console.log('Datos de entradas recibidos:', data); // Para debug
        entradas = Array.isArray(data) ? data : [];
        displayEntradas();
    } catch (error) {
        console.error('Error completo al cargar entradas:', error);
        showAlert('entradaAlert', 'Error al cargar entradas: ' + error.message, 'error');
        entradas = []; // Inicializar array vacío en caso de error
        displayEntradas(); // Mostrar tabla vacía
    }
}

function displayEntradas() {
    const tbody = document.getElementById('entradasTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!Array.isArray(entradas)) {
        console.error('Entradas no es un array:', entradas);
        return;
    }

    entradas.forEach(entrada => {
        const funcionInfo = entrada.funcion ?
            `${entrada.funcion.pelicula ? entrada.funcion.pelicula.titulo : 'Sin película'} - ${entrada.funcion.horario}` :
            'Sin asignar';

        // Opciones para el select de funciones
        const funcionOptions = funciones.map(funcion =>
            `<option value="${funcion.id}" ${entrada.funcion && String(funcion.id) === String(entrada.funcion.id) ? 'selected' : ''}>
                ${funcion.pelicula ? funcion.pelicula.titulo : 'Sin película'} - Sala ${funcion.sala ? funcion.sala.numero : ''} - ${funcion.horario}
            </option>`
        ).join('');

        const row = `
            <tr id="entrada-row-${entrada.id}">
                <td>${entrada.id}</td>
                <td>
                    <span class="display-mode" id="entrada-precio-display-${entrada.id}">${entrada.precio}</span>
                    <input type="number" class="edit-mode form-control" id="entrada-precio-edit-${entrada.id}" value="${entrada.precio}" style="display:none;">
                </td>
                <td>
                    <span class="display-mode" id="entrada-asiento-display-${entrada.id}">${entrada.asiento}</span>
                    <input type="text" class="edit-mode form-control" id="entrada-asiento-edit-${entrada.id}" value="${entrada.asiento}" style="display:none;">
                </td>
                <td>
                    <span class="display-mode" id="entrada-funcion-display-${entrada.id}">${funcionInfo}</span>
                    <select class="edit-mode form-control" id="entrada-funcion-edit-${entrada.id}" style="display:none;">
                        <option value="">Seleccionar función</option>
                        ${funcionOptions}
                    </select>
                </td>
                <td>
                    <div class="display-mode" id="entrada-actions-display-${entrada.id}">
                        <button class="btn btn-secondary btn-sm" onclick="enableEditEntrada(${entrada.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteEntrada(${entrada.id})">Eliminar</button>
                    </div>
                    <div class="edit-mode" id="entrada-actions-edit-${entrada.id}" style="display:none;">
                        <button class="btn btn-success btn-sm" onclick="saveEditEntrada(${entrada.id})">Guardar</button>
                        <button class="btn btn-secondary btn-sm" onclick="cancelEditEntrada(${entrada.id})">Cancelar</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function enableEditEntrada(id) {
    document.querySelectorAll(`#entrada-row-${id} .display-mode`).forEach(el => el.style.display = 'none');
    document.querySelectorAll(`#entrada-row-${id} .edit-mode`).forEach(el => el.style.display = 'block');
}

function cancelEditEntrada(id) {
    const entrada = entradas.find(e => e.id === id);
    if (entrada) {
        document.getElementById(`entrada-precio-edit-${id}`).value = entrada.precio;
        document.getElementById(`entrada-asiento-edit-${id}`).value = entrada.asiento;
        document.getElementById(`entrada-funcion-edit-${id}`).value = entrada.funcion ? entrada.funcion.id : '';
    }
    document.querySelectorAll(`#entrada-row-${id} .display-mode`).forEach(el => el.style.display = 'block');
    document.querySelectorAll(`#entrada-row-${id} .edit-mode`).forEach(el => el.style.display = 'none');
}

async function saveEditEntrada(id) {
    const precio = document.getElementById(`entrada-precio-edit-${id}`).value;
    const asiento = document.getElementById(`entrada-asiento-edit-${id}`).value;
    const funcionId = document.getElementById(`entrada-funcion-edit-${id}`).value;

    if (!precio || !asiento || !funcionId) {
        showAlert('entradaAlert', 'Todos los campos son obligatorios', 'error');
        return;
    }

    const entradaData = {
        precio: parseFloat(precio),
        asiento: asiento,
        funcion: { id: parseInt(funcionId) }
    };

    try {
        await makeRequest(`/api/v1/entradas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entradaData)
        });
        showAlert('entradaAlert', 'Entrada actualizada exitosamente');
        await loadEntradas();
        clearEntradaForm();
    } catch (error) {
        let errorMessage = error.message;
        if (errorMessage.includes('409')) {
            errorMessage = 'El asiento ya está ocupado para esta función';
        }
        showAlert('entradaAlert', 'Error: ' + errorMessage, 'error');
    }
}


document.getElementById('entradaForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const precio = document.getElementById('entradaPrecio')?.value;
    const asientos = document.getElementById('entradaAsiento')?.value;
    const funcionId = document.getElementById('entradaFuncion')?.value;
    const entradaId = document.getElementById('entradaId')?.value;

    if (!precio || !asientos || !funcionId) {
        showAlert('entradaAlert', 'Por favor complete todos los campos requeridos', 'error');
        return;
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
        showAlert('entradaAlert', 'El precio debe ser un número positivo', 'error');
        return;
    }

    // Permitir varios asientos separados por coma o espacio
    const asientosArray = asientos.split(',').map(a => a.trim()).filter(a => a);

    // Si es edición, solo permite uno
    if (entradaId) {
        if (asientosArray.length > 1) {
            showAlert('entradaAlert', 'Solo puedes editar un asiento a la vez', 'error');
            return;
        }
        const entradaData = {
            precio: precioNum,
            asiento: asientosArray[0],
            funcion: { id: parseInt(funcionId) }
        };
        try {
            await makeRequest(`/api/v1/entradas/${entradaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entradaData)
            });
            showAlert('entradaAlert', 'Entrada actualizada exitosamente');
            clearEntradaForm();
            await loadEntradas();
        } catch (error) {
            let errorMessage = error.message;
            if (errorMessage.includes('409')) {
                errorMessage = 'El asiento ya está ocupado para esta función';
            }
            showAlert('entradaAlert', 'Error: ' + errorMessage, 'error');
        }
        return;
    }

    // Alta: permite uno o varios
    let errores = 0;
    for (const asiento of asientosArray) {
        const entradaData = {
            precio: precioNum,
            asiento: asiento,
            funcion: { id: parseInt(funcionId) }
        };
        try {
            await makeRequest('/api/v1/entradas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entradaData)
            });
        } catch (error) {
            errores++;
            let errorMessage = error.message;
            if (errorMessage.includes('409')) {
                errorMessage = `El asiento ${asiento} ya está ocupado para esta función`;
            }
            showAlert('entradaAlert', 'Error: ' + errorMessage, 'error');
        }
    }

    if (errores === 0) {
        showAlert('entradaAlert', 'Entradas creadas exitosamente');
    }
    clearEntradaForm();
    await loadEntradas();
});

function editEntrada(id) {
    const entrada = entradas.find(e => e.id === id);
    if (entrada) {
        document.getElementById('entradaId').value = entrada.id;
        document.getElementById('entradaPrecio').value = entrada.precio || '';
        document.getElementById('entradaAsiento').value = entrada.asiento || '';
        document.getElementById('entradaFuncion').value = entrada.funcion ? entrada.funcion.id : '';

        // Scroll al formulario para mejor UX
        document.getElementById('entradaForm')?.scrollIntoView({ behavior: 'smooth' });
    }
}

async function deleteEntrada(id) {
    if (confirm('¿Estás seguro de eliminar esta entrada?')) {
        try {
            await makeRequest(`/api/v1/entradas/${id}`, { method: 'DELETE' });
            showAlert('entradaAlert', 'Entrada eliminada exitosamente');
            await loadEntradas();
        } catch (error) {
            showAlert('entradaAlert', 'Error: ' + error.message, 'error');
        }
    }
}

function clearEntradaForm() {
    document.getElementById('entradaForm')?.reset();
    const entradaId = document.getElementById('entradaId');
    if (entradaId) entradaId.value = '';
}

// ===== FUNCIONES AUXILIARES PARA MANEJO DE ERRORES =====

// Función para manejar errores de eliminación con relaciones
async function handleDeleteError(response, entityType) {
    if (response.status === 409 || response.status === 400) {
        const errorMessages = {
            'cine': 'No se puede eliminar el cine porque tiene salas asociadas. Elimine primero todas las salas relacionadas.',
            'sala': 'No se puede eliminar la sala porque tiene funciones asociadas. Elimine primero todas las funciones relacionadas.',
            'pelicula': 'No se puede eliminar la película porque tiene funciones asociadas. Elimine primero todas las funciones relacionadas.',
            'funcion': 'No se puede eliminar la función porque tiene entradas asociadas. Elimine primero todas las entradas relacionadas.'
        };

        return errorMessages[entityType] || 'No se puede eliminar este elemento porque tiene datos asociados.';
    }

    const errorText = await response.text();
    return `Error del servidor: ${response.status} - ${errorText}`;
}

// Función para validar JSON response
async function parseJsonResponse(response, entityName) {
    const responseText = await response.text();
    console.log(`Response texto ${entityName}:`, responseText);

    try {
        return JSON.parse(responseText);
    } catch (parseError) {
        console.error(`Error parsing JSON ${entityName}:`, parseError);
        console.error('Texto de respuesta:', responseText);
        throw new Error(`Error al procesar los datos de ${entityName} del servidor`);
    }
}

// ===== INICIALIZACIÓN CON MANEJO DE ERRORES =====

document.addEventListener('DOMContentLoaded', function() {
    try {
        // La aplicación inicia mostrando el menú principal
        showSection('menu');

        // Inicializar arrays globales si no existen
        if (typeof salas === 'undefined') window.salas = [];
        if (typeof peliculas === 'undefined') window.peliculas = [];
        if (typeof funciones === 'undefined') window.funciones = [];
        if (typeof entradas === 'undefined') window.entradas = [];
        if (typeof cines === 'undefined') window.cines = [];

        console.log('Aplicación inicializada correctamente');
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    }
});

// ===== FUNCIONES ADICIONALES PARA MEJORAR LA EXPERIENCIA =====

// Función para refrescar datos cuando se cambia de sección
async function refreshSectionData(sectionName) {
    switch(sectionName) {
        case 'funciones':
            await loadSalasForSelect();      // Espera a que termine
            await loadPeliculasForSelect();  // Espera a que termine
            await loadFunciones();
            filterPeliculasForFuncionForm(); // Aplica el filtro después de cargar todo
            break;
        case 'entradas':
            await loadEntradas();
            await loadFuncionesForSelect();
            break;
        case 'salas':
            if (typeof loadSalas === 'function') await loadSalas();
            break;
        case 'peliculas':
            if (typeof loadPeliculas === 'function') await loadPeliculas();
            break;
        case 'cines':
            if (typeof loadCines === 'function') await loadCines();
            break;
    }
}

// Función mejorada para manejar alertas
function showAlert(alertId, message, type = 'success') {
    const alertElement = document.getElementById(alertId);
    if (!alertElement) {
        console.warn(`Alert element with id '${alertId}' not found`);
        // Fallback: mostrar alert del navegador
        alert(message);
        return;
    }

    alertElement.className = `alert alert-${type}`;
    alertElement.textContent = message;
    alertElement.style.display = 'block';

    // Auto-ocultar después de 5 segundos para mensajes de éxito
    if (type === 'success') {
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    }
}

