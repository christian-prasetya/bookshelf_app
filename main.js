let books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function generateId() {
	return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
	return {
		id,
		title,
		author,
		year,
		isCompleted,
	};
}

function findBook(bookId) {
	for (const bookItem of books) {
		if (bookItem.id === bookId) {
			return bookItem;
		}
	}
}

function findBookIndex(bookId) {
	for (const index in books) {
		if (books[index].id === bookId) {
			return index;
		}
	}

	return -1;
}

function isStorageExist() {
	if (typeof Storage === undefined) {
		alert('Browser kamu tidak mendukung local storage');
		return false;
	}
	return true;
}

function saveData() {
	if (isStorageExist()) {
		const parsed = JSON.stringify(books);
		localStorage.setItem(STORAGE_KEY, parsed);
		document.dispatchEvent(new Event(SAVED_EVENT));
	}
}

function loadDataFromStorage() {
	const serializedData = localStorage.getItem(STORAGE_KEY);

	let data = JSON.parse(serializedData);

	if (data !== null) {
		for (const book of data) {
			books.push(book);
		}
	}

	document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBook() {
	const bookTitle = document.getElementById('inputBookTitle').value;
	const bookAuthor = document.getElementById('inputBookAuthor').value;
	const bookYear = document.getElementById('inputBookYear').value;
	const bookCompleted = document.getElementById('inputBookIsComplete').checked;

	const generateID = generateId();

	const bookObject = generateBookObject(
		generateID,
		bookTitle,
		bookAuthor,
		bookYear,
		bookCompleted,
	);

	books.push(bookObject);

	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function addBookToCompleted(bookId) {
	const bookTarget = findBook(bookId);

	if (bookTarget == null) return;

	bookTarget.isCompleted = true;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function removeBookFromCompleted(bookId) {
	const bookTarget = findBookIndex(bookId);

	if (bookTarget === -1) return;

	books.splice(bookTarget, 1);

	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function undoBookFromCompleted(bookId) {
	const bookTarget = findBook(bookId);

	if (bookTarget == null) return;

	bookTarget.isCompleted = false;

	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function makeBook(bookObject) {
	const textTitle = document.createElement('h2');
	textTitle.innerText = bookObject.title;

	const textAuthor = document.createElement('p');
	textAuthor.innerText = `Penulis: ${bookObject.author}`;

	const textYear = document.createElement('p');
	textYear.innerText = `Tahun: ${bookObject.year}`;

	const container = document.createElement('article');
	container.classList.add('book_item');
	container.append(textTitle, textAuthor, textYear);
	container.setAttribute('id', `${bookObject.id}`);

	const readButton = document.createElement('button');
	readButton.classList.add('check-button');
	readButton.addEventListener('click', function () {
		addBookToCompleted(bookObject.id);
	});

	const undoButton = document.createElement('button');
	undoButton.classList.add('undo-button');
	undoButton.addEventListener('click', function () {
		undoBookFromCompleted(bookObject.id);
	});

	const removeButton = document.createElement('button');
	removeButton.classList.add('trash-button');
	removeButton.addEventListener('click', function () {
		removeBookFromCompleted(bookObject.id);
	});

	const buttonContainer = document.createElement('div');
	buttonContainer.classList.add('action');

	if (bookObject.isCompleted) {
		buttonContainer.append(undoButton, removeButton);
	} else {
		buttonContainer.append(readButton, removeButton);
	}

	container.append(buttonContainer);

	return container;
}

document.addEventListener('DOMContentLoaded', function () {
	const submitForm = document.getElementById('inputBook');
	const completeCheckbox = document.getElementById('inputBookIsComplete');

	submitForm.addEventListener('submit', function (event) {
		event.preventDefault();
		addBook();
		submitForm.reset();
	});

	completeCheckbox.addEventListener('change', function () {
		submitForm.innerText = '';
		if (this.checked) {
			submitForm.innerText = 'Selesai dibaca';
		} else {
			submitForm.innerText = 'Belum selesai dibaca';
		}
	});

	if (isStorageExist()) {
		loadDataFromStorage();
	}
});

document.addEventListener(SAVED_EVENT, function () {
	console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT, function () {
	const uncompletedBookList = document.getElementById(
		'incompleteBookshelfList',
	);
	uncompletedBookList.innerText = '';

	const completedBookList = document.getElementById('completeBookshelfList');
	completedBookList.innerText = '';

	for (const bookItem of books) {
		const bookElement = makeBook(bookItem);
		if (!bookItem.isCompleted) {
			uncompletedBookList.append(bookElement);
		} else {
			completedBookList.append(bookElement);
		}
	}
});
