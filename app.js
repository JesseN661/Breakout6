let employees = [
    {id: 1, name: "Jesse Nkubito", role: "UI/UXDesigner", score: 90},
    {id: 2, name: "Jospin Nganji", role: "Developer", score: 92},
    {id: 3, name: "Lea Abatoni", role: "Project Manager", score: 88},
    {id: 4, name: "Melissa Mbayire", role: "QA Engineer", score: 94}
];

let currentSort = { column: null, direction: 'asc' };
let filters = { search: '', role: '' };

const tableContainer = document.getElementById('table-container');
const summaryContainer = document.getElementById('summary-container');
const modalRoot = document.getElementById('modal-root');
const searchBar = document.getElementById('search-bar');
const roleFilter = document.getElementById('role-filter');
const addEmployeeBtn = document.getElementById('add-employee-btn');

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderDashboard();
});

function setupEventListeners() {
    searchBar.addEventListener('input', (e) => {
        filters.search = e.target.value.toLowerCase();
        renderDashboard();
    });

    roleFilter.addEventListener('change', (e) => {
        filters.role = e.target.value;
        renderDashboard();
    });

    addEmployeeBtn.addEventListener('click', () => {
        openEmployeeModal(null);
    });
}

function renderDashboard() {
    renderTable();
    updateSummary();
}

function renderTable() {
    tableContainer.textContent = ''; 

    let processedData = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(filters.search);
        const matchesRole = filters.role === '' || emp.role === filters.role;
        return matchesSearch && matchesRole;
    });

    if (currentSort.column) {
        processedData.sort((a, b) => {
            let valA = a[currentSort.column];
            let valB = b[currentSort.column];

            if (typeof valA === 'string') {
                return currentSort.direction === 'asc' 
                    ? valA.localeCompare(valB) 
                    : valB.localeCompare(valA);
            } else {
                return currentSort.direction === 'asc' ? valA - valB : valB - valA;
            }
        });
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = [
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
        { key: 'score', label: 'Score' }
    ];

    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h.label;
        if (currentSort.column === h.key) {
            th.textContent += currentSort.direction === 'asc' ? ' ▲' : ' ▼';
        }
        th.addEventListener('click', () => handleSort(h.key));
        headerRow.appendChild(th);
    });

    const actionsTh = document.createElement('th');
    actionsTh.textContent = 'Actions';
    headerRow.appendChild(actionsTh);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    processedData.forEach(emp => {
        const tr = document.createElement('tr');
        
        if (emp.score >= 85) {
            tr.classList.add('row-high');
        } else if (emp.score >= 70) {
            tr.classList.add('row-med');
        } else {
            tr.classList.add('row-low');
        }

        const tdName = document.createElement('td');
        tdName.textContent = emp.name;
        
        const tdRole = document.createElement('td');
        tdRole.textContent = emp.role;
        
        const tdScore = document.createElement('td');
        tdScore.textContent = emp.score;

        const tdActions = document.createElement('td');
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'btn btn-edit';
        editBtn.addEventListener('click', () => openEmployeeModal(emp));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'btn btn-delete';
        deleteBtn.addEventListener('click', () => handleDeleteEmployee(emp.id));

        tdActions.appendChild(editBtn);
        tdActions.appendChild(deleteBtn);

        tr.appendChild(tdName);
        tr.appendChild(tdRole);
        tr.appendChild(tdScore);
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

function handleSort(columnKey) {
    if (currentSort.column === columnKey) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = columnKey;
        currentSort.direction = 'asc';
    }
    renderTable();
}

function openEmployeeModal(employee = null) {
    const isEditMode = employee !== null;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const title = document.createElement('h3');
    title.textContent = isEditMode ? 'Edit Employee Metrics' : 'Add New Employee';
    content.appendChild(title);

    const form = document.createElement('form');

    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    const labelName = document.createElement('label');
    labelName.textContent = 'Full Name:';
    const inputName = document.createElement('input');
    inputName.type = 'text';
    inputName.required = true;
    inputName.value = isEditMode ? employee.name : '';
    inputName.disabled = isEditMode;
    nameGroup.appendChild(labelName);
    nameGroup.appendChild(inputName);
    form.appendChild(nameGroup);

    const roleGroup = document.createElement('div');
    roleGroup.className = 'form-group';
    const labelRole = document.createElement('label');
    labelRole.textContent = 'Company Role:';
    const selectRole = document.createElement('select');
    
    const roles = ["Developer", "Designer", "Project Manager", "QA Engineer"];
    roles.forEach(r => {
        const option = document.createElement('option');
        option.value = r;
        option.textContent = r;
        if(isEditMode && employee.role === r) option.selected = true;
        selectRole.appendChild(option);
    });
    roleGroup.appendChild(labelRole);
    roleGroup.appendChild(selectRole);
    form.appendChild(roleGroup);

    const scoreGroup = document.createElement('div');
    scoreGroup.className = 'form-group';
    const labelScore = document.createElement('label');
    labelScore.textContent = 'Score Performance (0 - 100):';
    const inputScore = document.createElement('input');
    inputScore.type = 'number';
    inputScore.min = 0;
    inputScore.max = 100;
    inputScore.required = true;
    inputScore.value = isEditMode ? employee.score : '';
    scoreGroup.appendChild(labelScore);
    scoreGroup.appendChild(inputScore);
    form.appendChild(scoreGroup);

    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', closeModal);

    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = 'Save Changes';

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    form.appendChild(actions);
    content.appendChild(form);
    overlay.appendChild(content);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const parsedScore = parseInt(inputScore.value, 10);
        if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
            alert('Validation Error: Performance score metrics data points boundaries require safe input scaling limits ranging (0 - 100).');
            return;
        }

        if (isEditMode) {
            const targetEmployee = employees.find(emp => emp.id === employee.id);
            if (targetEmployee) {
                targetEmployee.role = selectRole.value;
                targetEmployee.score = parsedScore;
            }
        } else {
            const newEmployee = {
                id: employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1,
                name: inputName.value.trim(),
                role: selectRole.value,
                score: parsedScore
            };
            employees.push(newEmployee);
        }

        closeModal();
        renderDashboard();
    });

    modalRoot.appendChild(overlay);
}

function closeModal() {
    modalRoot.textContent = '';
}

function handleDeleteEmployee(id) {
    if (confirm("Are you sure you want to remove this employee?")) {
        employees = employees.filter(emp => emp.id !== id);
        renderDashboard();
    }
}

function updateSummary() {
    summaryContainer.textContent = '';

    const totalCount = employees.length;
    let avgScore = 0;
    let highestScorerName = 'N/A';

    if (totalCount > 0) {
        const sum = employees.reduce((acc, curr) => acc + curr.score, 0);
        avgScore = (sum / totalCount).toFixed(1);

        const topEmployee = employees.reduce((prev, current) => (prev.score > current.score) ? prev : current);
        highestScorerName = topEmployee.name;
    }

    const cardsData = [
        { label: 'Total Employees', value: totalCount },
        { label: 'Average Score', value: totalCount > 0 ? `${avgScore}` : '0' },
        { label: 'Top Performer', value: highestScorerName }
    ];

    cardsData.forEach(card => {
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';

        const labelSpan = document.createElement('span');
        labelSpan.textContent = card.label;
        const valueDiv = document.createElement('div');
        valueDiv.className = 'stat-val';
        valueDiv.textContent = card.value;
        statItem.appendChild(labelSpan);
        statItem.appendChild(valueDiv);
        summaryContainer.appendChild(statItem);
        });
        }