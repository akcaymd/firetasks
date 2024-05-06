import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
    getDoc,
    updateDoc,
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
};

// init firebase app
const app = initializeApp(firebaseConfig);

// init services
const db = getFirestore();

const colRef = collection(db, 'tasks');
const q = query(colRef, orderBy('createdAt'));

// DOM
const tasksList = document.getElementById('tasksList');
const addTaskForm = document.getElementById('addTaskForm');

// CREATE
// get task title from html form
addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // create task
    addDoc(colRef, {
        title: addTaskForm.title.value,
        isCompleted: false,
        createdAt: serverTimestamp(),
    })
        .then(() => addTaskForm.reset())
        .catch((err) => console.log(err.message));
    // reset tasklist to prevent duplicate entries
    tasksList.innerHTML = '';
});

// READ
// get ul element inside html and inject tasks
// real time sync
const unsubCol = onSnapshot(q, (snapshot) => {
    let tasks = [];
    snapshot.docs.forEach((doc) => {
        tasks.push({ ...doc.data(), id: doc.id });
    });
    tasks.forEach((task) => {
        tasksList.appendChild(listTaskTemplate(task));
    });
});

function listTaskTemplate(task) {
    // html template for a task

    // create list item and set list item id to task.id
    const taskListItem = document.createElement('li');
    taskListItem.setAttribute('id', task.id);

    // create a span for task title and print task.title inside span
    const taskTitleSpan = document.createElement('span');
    taskTitleSpan.innerText = task.title;

    // create completion status checkbox
    const tasksStatusCheckbox = document.createElement('input');
    tasksStatusCheckbox.setAttribute('type', 'checkbox');
    tasksStatusCheckbox.checked = task.isCompleted;
    tasksStatusCheckbox.setAttribute('value', task.id);
    tasksStatusCheckbox.onchange = () => toggleTaskStatus(task);

    // create delete task button
    const taskDeleteButton = document.createElement('button');
    taskDeleteButton.setAttribute('id', task.id);
    taskDeleteButton.innerHTML = '<i class="bi bi-trash"></i>';
    taskDeleteButton.onclick = () => deleteTask(task);

    // create edit task button, this triggers an input:text
    const taskUpdateButton = document.createElement('button');
    taskUpdateButton.setAttribute('id', task.id);
    taskUpdateButton.innerHTML = '<i class="bi bi-pencil-square"></i>';
    taskUpdateButton.onclick = () => updateTask(taskListItem, task);

    const divLeft = document.createElement('div');
    const divRight = document.createElement('div');

    divLeft.appendChild(tasksStatusCheckbox);
    divLeft.appendChild(taskTitleSpan);
    divRight.appendChild(taskUpdateButton);
    divRight.appendChild(taskDeleteButton);

    taskListItem.appendChild(divLeft);
    taskListItem.appendChild(divRight);
    return taskListItem;
}

function toggleTaskStatus(task) {
    // toggle task status
    const docRef = doc(db, 'tasks', task.id);
    updateDoc(docRef, {
        isCompleted: !task.isCompleted,
    })
        .then(() => {})
        .catch((err) => console.log(err.message));
    // reset tasklist to prevent duplicate entries
    tasksList.innerHTML = '';
}

// UPDATE
function updateTask(taskListItem, task) {
    // find task's li
    // create a div > input and div > button inside li
    const updateForm = document.createElement('div');
    const updateInput = document.createElement('input');
    updateInput.setAttribute('type', 'text');
    updateInput.required = true;
    updateInput.setAttribute('placeholder', 'New Title');
    const updateButton = document.createElement('button');
    updateButton.innerText = 'Update';
    updateForm.appendChild(updateInput);
    updateForm.appendChild(updateButton);
    taskListItem.appendChild(updateForm);

    updateButton.onclick = () => {
        // when button clicked update task.title to title
        const title = updateInput.value;

        if (title == null || title == '') {
            alert('Please Fill In All Required Fields');
            return;
        }

        const docRef = doc(db, 'tasks', task.id);
        updateDoc(docRef, {
            title,
        })
            .then(() => {})
            .catch((err) => console.log(err.message));
        // reset tasklist to prevent duplicate entries
        tasksList.innerHTML = '';
    };
}

// DELETE
function deleteTask(task) {
    const docRef = doc(db, 'tasks', task.id);
    deleteDoc(docRef)
        .then(() => {})
        .catch((err) => console.log(err));
    // reset tasklist to prevent duplicate entries
    tasksList.innerHTML = '';
}
