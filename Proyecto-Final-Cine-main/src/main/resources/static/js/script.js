
let cines = [];
let empleados = [];
let peliculas = [];
let salas = [];
let funciones = [];
let entradas = [];
let generos = [];


function showSection(sectionName) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.style.display = 'none');


    document.getElementById(sectionName).style.display = 'block';

    const navigation = document.getElementById('navigation');
    if (sectionName === 'menu') {
        navigation.style.display = 'none';
    } else {
        navigation.style.display = 'block';
        // Cargar datos
        loadSectionData(sectionName);
    }
}

//cargar datos de cada sección
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

    }
}

// mostrar alertas
function showAlert(elementId, message, type = 'success') {
    const alertDiv = document.getElementById(elementId);
    alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        alertDiv.innerHTML = '';
    }, 3000);
}

//requests
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

            }
            throw new Error(errorMessage);
        }


        const contentType = response.headers.get('content-type');
        const text = await response.text();

        if (!text || text.trim() === '') {
            return [];
        }

        if (contentType && contentType.includes('application/json')) {
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Error parsing JSON:', text);
                console.error('Response text:', text); // debug
                return []; // retorna un array vacio
            }
        }

        return text;
    } catch (error) {
        console.error('Request error:', error);
        throw error;
    }
}

// CINES

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
    document.querySelectorAll(`#cine-row-${id} .display-mode`).forEach(el => el.style.display = 'none');
    document.querySelectorAll(`#cine-row-${id} .edit-mode`).forEach(el => el.style.display = 'block');
}

function cancelEditCine(id) {
    const cine = cines.find(c => c.id === id);
    if (cine) {
        document.getElementById(`cine-nombre-edit-${id}`).value = cine.nombre;
        document.getElementById(`cine-direccion-edit-${id}`).value = cine.direccion;
    }

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
            //actualizo
            await makeRequest(`/api/v1/cines/${cineId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cineData)
            });
            showAlert('cineAlert', 'Cine actualizado exitosamente');
        } else {
            //CREAR
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

        // errores de fk
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

//EMPLEADOS

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

        //select de cinesds
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
        cines: [{ id: parseInt(cineId) }]
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

//PELICULAS

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



// validar JSON response
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

//para inicializar con manejo de erroes

document.addEventListener('DOMContentLoaded', function() {
    try {

        showSection('menu');


        if (typeof salas === 'undefined') window.salas = [];
        if (typeof peliculas === 'undefined') window.peliculas = [];
        if (typeof entradas === 'undefined') window.entradas = [];
        if (typeof cines === 'undefined') window.cines = [];

        console.log('Aplicación inicializada correctamente');
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    }
});

async function refreshSectionData(sectionName) {
    switch(sectionName) {
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

function showAlert(alertId, message, type = 'success') {
    const alertElement = document.getElementById(alertId);
    if (!alertElement) {
        console.warn(`Alert element with id '${alertId}' not found`);

        alert(message);
        return;
    }

    alertElement.className = `alert alert-${type}`;
    alertElement.textContent = message;
    alertElement.style.display = 'block';


    if (type === 'success') {
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    }
}

