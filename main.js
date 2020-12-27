// Array of all TODOs objects
let allTodos = [];

// Param that can hold one of the following values: "all", "active", "completed"
// for different showing of TODOs based on their completeness
let showType;

// HTML elements
selectAllbutton = document.querySelector('.app-select-all');
arrow = document.querySelector('.arrow');
detailsBox = document.querySelector('.app-details-box');
allButton = document.querySelector('.app-button-all');
completedButton = document.querySelector('.app-button-completed');
activeButton = document.querySelector('.app-button-active');
clearButton = document.querySelector('.app-button-clear-completed');

// Handles page loaded
window.addEventListener('DOMContentLoaded', () => {
	// Updates local storage data when page closes or refresh
	window.onbeforeunload = updateLocalStorage;

	// Gets old localstorage data (if it exists)
	const localStorageData = getLocalStorageData();
	showType = getLocalStorageShowType();
	const selectAll = getLocalStorageSelectAll();
	selectAllbutton.setAttribute('data-select-all',  selectAll);

	// Render select all button
	arrow.style.transform = "rotate(" + (selectAll === 'false' ? '-' : '' ) + "45deg)";

	// Render old data
	if (localStorageData) {
		localStorageData.forEach(todoObj => allTodos.push(todoObj));
		renderTODOs();
	}

	// Adds listener for Add TODO event
	document.querySelector('.app-input').addEventListener("keydown", e => {
		if (e.key === 'Enter' && e.target.value.trim() !== '') {
			allTodos.push(createTodoObj(e.target.value));
			e.target.value = '';
			renderTODOs();
		}
	});

	// Adds listener for Active button
	activeButton.addEventListener('click', () => {
		showType = 'active';
		renderTODOs();
	});

	// Adds listener for Completed button
	completedButton.addEventListener('click', () => {
		showType = 'completed';
		renderTODOs();
	});

	// Adds listener for Completed button
	allButton.addEventListener('click', () => {
		showType = 'all';
		renderTODOs();
	});

	// Adds listener for Clear Completed button
	clearButton.addEventListener('click', () => {
		// Clear all completed TODOs
		allTodos = allTodos.filter(todoObj => todoObj.completed === 'false');
		renderTODOs();
	});

	// Adds listener for Select All button
	selectAllbutton.addEventListener('click', () => {
		const selectAll = selectAllbutton.getAttribute('data-select-all');
		if (selectAll === 'false') {
			selectAllbutton.setAttribute('data-select-all', 'true');
			checkAllTodos();
		} else {
			selectAllbutton.setAttribute('data-select-all', 'false');
			uncheckAllTodos();
		}
		renderTODOs();
	})
});

// Unchecks all completed TODOs
const uncheckAllTodos = () => {
	for (let i = 0; i < allTodos.length; i++) {
		if (allTodos[i].completed === 'true') {
			allTodos[i].completed = 'false';
			allTodos[i].opacityAnimation = 'increase';
		}
	}
	arrow.style.animation = 'arrowRight 0.5s forwards';
}

// Checks all active TODOs
const checkAllTodos = () => {
	for (let i = 0; i < allTodos.length; i++) {
		if (allTodos[i].completed === 'false') {
			allTodos[i].completed = 'true';
			allTodos[i].opacityAnimation = 'decrease';
		}
	}
	arrow.style.animation = 'arrowDown 0.5s forwards';
}

// Render TODO page
const renderTODOs = () => {
	const activeTodos = allTodos.filter(todoObj => todoObj.completed === 'false');
	const completedTodos = allTodos.filter(todoObj => todoObj.completed === 'true');

	document.querySelector('ul').innerHTML = '';
	document.querySelector('.elements-left-nr').textContent = activeTodos.length;

	// Change Clear Completed button's visibility based on checked TODOs size
	clearButton.style.visibility = completedTodos.length > 0 ? 'visible' : 'hidden';

	// Hide Select All button and TODOs Details Box if there are no TODOs
	if (allTodos.length === 0) {
		selectAllbutton.style.visibility = 'hidden';
		detailsBox.style.visibility = 'hidden';

	} else {
		selectAllbutton.style.visibility = 'visible';
		detailsBox.style.visibility = 'visible';

		const selectAll = selectAllbutton.getAttribute('data-select-all');

		// Rotate Select All button based on number of complete TODOs
		if (completedTodos.length === allTodos.length && selectAll === 'false') {
			selectAllbutton.setAttribute('data-select-all', 'true');
			arrow.style.animation = 'arrowDown 0.5s forwards';
		} else if (completedTodos.length !== allTodos.length && selectAll === 'true') {
			selectAllbutton.setAttribute('data-select-all', 'false');
			arrow.style.animation = 'arrowRight 0.5s forwards';
		}
	}

	// Render TODOs based on show type
	switch (showType) {
		case 'all':
			allTodos.forEach(todoObj => addTodoObjToUL(todoObj));
			allButton.style.border = 'inset';
			activeButton.style.border = 0;
			completedButton.style.border = 0;
			break;
		case 'active':
			activeTodos.forEach(todoObj => addTodoObjToUL(todoObj));
			activeButton.style.border = 'inset';
			allButton.style.border = 0;
			completedButton.style.border = 0;
			break;
		default:
			completedTodos.forEach(todoObj => addTodoObjToUL(todoObj));
			completedButton.style.border = 'inset';
			allButton.style.border = 0;
			activeButton.style.border = 0;
	}
}

// Appends List Item to Unordered List and adds corresponding listeners
const addLItoUL = (li) => {
	document.querySelector('ul').append(li);

	// Adds listeners for complete, edit and delete TODOs
	addDeleteTODOListener(li.getElementsByTagName('button')[0]);
	addCompleteTODOListener(li.getElementsByTagName('input')[0]);
	addEditTODOListener(li.getElementsByTagName('p')[0]);

	// Adds Listeners for showing/hiding delete button on mouseover/mouseout
	addShowDeleteButtonListener(li);
	addHideDeleteButtonListener(li);
}

// Adds listeners for changing TODOs' name
const addEditTODOListener = (p) => {
	p.addEventListener('dblclick', () => {
		const editInput = document.createElement('input');
		editInput.classList.add('editInput');
		p.parentNode.replaceChild(editInput, p);
		editInput.value = p.textContent;
		editInput.focus();
		editInput.addEventListener('keydown', e => editTODO('keydown', e.key, editInput));
		editInput.addEventListener('blur', () => editTODO('blur', '', editInput));
	})
}

// Edit TODO name
const editTODO = (ev, key, editInput) => {
	if (ev === 'keydown' && key !== 'Enter') return;

	for (let i = 0; i < allTodos.length; i++) {
		if (allTodos[i].id === editInput.parentNode.id) {
			allTodos[i].name = editInput.value;
			break;
		}
	}
	renderTODOs();
}

// Show delete button on mouseover
const addShowDeleteButtonListener = (li) => {
	li.addEventListener('mouseover', () => li.getElementsByTagName('button')[0].style.opacity = 1)
}

// Hides delete button on mouseout
const addHideDeleteButtonListener = (li) => {
	li.addEventListener('mouseout', () => li.getElementsByTagName('button')[0].style.opacity = 0)
}

// Adds listener for Complete TODO event
const addCompleteTODOListener = (checkToggle) => {
	checkToggle.addEventListener('click', ev => completeTODO(ev.target.parentNode))
}

// Complete TODO or undo it, then render
const completeTODO = (todoLI) => {
	for (let i = 0; i < allTodos.length; i++) {
		if (allTodos[i].id === todoLI.id) {
			showType === 'all' && (allTodos[i].opacityAnimation = allTodos[i].completed === 'true' ? 'increase' : 'decrease');
			allTodos[i].completed = (allTodos[i].completed === 'false').toString();
			break;
		}
	}
	renderTODOs();
}

// Adds listener for Delete TODO event
const addDeleteTODOListener = (deleteButton) => {
	deleteButton.addEventListener('click', ev => deleteTODO(ev.target.parentNode));
}

// Adds TODO obj to Unordered List
const addTodoObjToUL = (todoObj) => {
	addLItoUL(convertTodoObjToLI(todoObj));
}

// Deletes TODO and render
const deleteTODO = (todoLI) => {
	allTodos = allTodos.filter(todoObj => todoObj.id !== todoLI.id);
	renderTODOs();
}

// Creates TODO object
const createTodoObj = (value) => {
	return {name: value, completed: 'false', id: Date.now().toString(), opacityAnimation: 'none'};
}

// Converts TODO object to List Item
const convertTodoObjToLI = (todo) => {
	let li = document.createElement('li');
	li.classList.add('app-todo-element');
	li.setAttribute('id', todo.id);
	li.setAttribute('data-completed', todo.completed);

	let p = document.createElement('p');
	p.classList.add('app-todo-paragraph');
	p.innerHTML = todo.name;
	if (todo.opacityAnimation !== 'none') {
		p.style.animation = todo.opacityAnimation === 'increase' ? 'increaseOpacity 0.5s' : 'decreaseOpacity 0.5s'
		todo.opacityAnimation = 'none';
	}
	p.style.opacity = todo.completed === 'true' ? 0.3 : 1;
	p.style.textDecoration = todo.completed === 'true' ? 'line-through' : 'none';

	let input = document.createElement('input');
	input.setAttribute('type','checkbox');
	input.classList.add('app-todo-input');
	input.checked = todo.completed === 'true';

	let deleteButton = document.createElement('button');
	deleteButton.classList.add('app-todo-delete');
	deleteButton.textContent = 'X';
	
	li.append(input, p, deleteButton);
	return li;
}

// Gets local storage data
const getLocalStorageData = () => {
	return JSON.parse(localStorage.getItem('data')) || [];
}

const getLocalStorageShowType = () => {
	return localStorage.getItem('showType') || 'all';
}

const getLocalStorageSelectAll = () => {
	return localStorage.getItem('selectAll') || 'false';
}

// Updates local storage data
const updateLocalStorage = () => {
	localStorage.setItem('data', JSON.stringify(allTodos));
	localStorage.setItem('showType', showType);
	localStorage.setItem('selectAll', selectAllbutton.getAttribute('data-select-all'));
}

// For debugging purpose
const clearLocalStorageData = () => {
	localStorage.clear();
}