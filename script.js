const apiURL = "http://localhost:3001/tasks"; // URL de l'API JSON Server
const taskTable = document.getElementById("task-table");

// Fonction pour charger les tâches depuis JSON Server
async function fetchTasks() {
    try {
        const response = await fetch(apiURL); // Requête GET
        const tasks = await response.json(); // Convertir la réponse en JSON
        displayTasks(tasks); // Afficher les tâches dans le tableau
    } catch (error) {
        console.error("Erreur lors de la récupération des tâches :", error);
    }
}


async function deleteTask(id) {
    try {
        const response = await fetch(`${apiURL}/${id}`, { method: "DELETE" });
        console.log(`${apiURL}/${id}`)
        if (response.ok) {
            await fetchTasks(); // Recharger les tâches
        }
    } catch (error) {
        console.error("Erreur lors de la suppression de la tâche :", error);
    }
}


function editTask(id) {
    // Récupérer la tâche à modifier
    fetch(`${apiURL}/${id}`)
        .then((response) => response.json())
        .then((task) => {
            // Remplir les champs du formulaire avec les données de la tâche
            document.getElementById("task").value = task.task;
            document.getElementById("description").value = task.description;
            document.getElementById("category").value = task.category;
            document.getElementById("when").value = task.when;
            document.getElementById("priority").value = task.priority;
            document.getElementById("fulfillment").value = task.fulfillment;

            // Modifier l'action du bouton pour la mise à jour
            taskForm.setAttribute("data-edit-id", task.id);
            document.getElementById("titre").textContent = "Modifier une Tâche";
            document.querySelector("button[type='submit']").textContent = "Mettre à jour";
        })
        .catch((error) => console.error("Erreur lors de la récupération de la tâche :", error));
}


function updateActiveButton(filter) {
    const buttons = document.querySelectorAll("#task-list button");
    buttons.forEach(button => button.classList.remove("active"));

    if (filter === "all") buttons[0].classList.add("active");
    else if (filter === "todo") buttons[1].classList.add("active");
    else if (filter === "completed") buttons[2].classList.add("active");
}


async function filterTasks(filter) {
    try {
        const response = await fetch(apiURL);
        const tasks = await response.json();

        let filteredTasks = tasks;

        if (filter === "todo") {
            filteredTasks = tasks.filter(task => task.fulfillment < 100);
        } else if (filter === "completed") {
            filteredTasks = tasks.filter(task => task.fulfillment === 100);
        }

        updateActiveButton(filter); // Met à jour le bouton actif
        displayTasks(filteredTasks);
    } catch (error) {
        console.error("Erreur lors du filtrage des tâches :", error);
    }
}


// Fonction pour afficher les tâches dans le tableau
function displayTasks(tasks) {
    taskTable.innerHTML = ""; // Réinitialiser le tableau
    tasks.forEach((task) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${task.task}</td>
            <td>${task.description}</td>
            <td>${task.category}</td>
            <td>${task.when}</td>
            <td>${task.priority}</td>
            <td>${task.fulfillment}%</td>
            <td>
                <button onclick="editTask('${task.id}')">Modifier</button>
                <button onclick="deleteTask('${task.id}')">Supprimer</button>
            </td>
        `;
        taskTable.appendChild(row);
    });
}


// Charger les tâches au démarrage
fetchTasks();
// Formulaire
const taskForm = document.getElementById("task-form");
taskForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent page reload

    // Get form values
    const updatedTask = {
        task: document.getElementById("task").value,
        description: document.getElementById("description").value,
        category: document.getElementById("category").value,
        when: document.getElementById("when").value,
        priority: document.getElementById("priority").value,
        fulfillment: parseInt(document.getElementById("fulfillment").value),
    };

    // Check if in edit mode
    const editId = taskForm.getAttribute("data-edit-id");
    if (editId) {
        // **Edit Mode**: Update the task using a PUT request
        try {
            const response = await fetch(`${apiURL}/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedTask),
            });
            if (response.ok) {
                fetchTasks(); // Reload tasks
                document.getElementById("titre").textContent = "Ajouter une Tâche"
                document.querySelector("button[type='submit']").textContent = "Ajouter";
                taskForm.reset(); // Réinitialiser le formulaire

            } else {
                console.error("Failed to update the task");
            }
        } catch (error) {
            console.error("Error while updating the task:", error);
        }
    } else {
        // **Add Mode**: Create a new task using a POST request
        try {
            const response = await fetch(apiURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedTask),
            });
            if (response.ok) {
                fetchTasks(); // Reload tasks
                taskForm.reset(); // Réinitialiser le formulaire
            } else {
                console.error("Failed to add the task");
            }
        } catch (error) {
            console.error("Error while adding the task:", error);
        }
    }
});
