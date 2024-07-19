document.addEventListener('DOMContentLoaded', () => {
    // Task Scheduling
    fetch('http://localhost:3000/taskname')
        .then(res => res.json())
        .then(activities => {
            activities.forEach(activity => renderUpcomingActivities(activity));
        })
        .catch(error => console.error('Error:', error));

    const formEl = document.getElementById("taskSchedulerForm");
    formEl.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(formEl);
        const data = Object.fromEntries(formData);
        fetch('http://localhost:3000/taskname', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(newActivity => renderUpcomingActivities(newActivity))
            .catch(error => console.error('Error:', error));
    });
});

function renderUpcomingActivities(activity) {
    const card = document.createElement('li');
    card.className = "card";
    card.dataset.id = activity.id;
    card.innerHTML = `
        <div class="content">
            <h4>Task Name: ${activity.taskName}</h4>
            <h4>Date: ${activity.taskDate}</h4>
            <h4>Time: ${activity.taskTime}</h4>
            <p><strong>Description:</strong> ${activity.taskDescription}</p>
            <button class="update-btn" type="button">Update</button> 
            <button class="delete-btn" type="button">Delete</button> 
        </div>`;
    document.querySelector("#upcoming").appendChild(card);

    card.querySelector('.delete-btn').addEventListener('click', event => {
        event.stopPropagation();
        deleteTask(activity.id, card);
    });
    card.querySelector('.update-btn').addEventListener('click', () => {
        updateTask(activity, card);
    });
}

function deleteTask(id, cardElement) {
    fetch(`http://localhost:3000/taskname/${id}`, { method: 'DELETE' })
        .then(res => {
            if (res.ok) {
                cardElement.remove();
            } else {
                console.error('Failed to delete task');
            }
        })
        .catch(error => console.error('Error:', error));
}

function updateTask(activity, cardElement) {
    const modal = document.getElementById('updateTaskModal');
    const form = document.getElementById('updateTaskForm');

    // Populate the form with existing activity data
    form.taskName.value = activity.taskName;
    form.taskDate.value = activity.taskDate;
    form.taskTime.value = activity.taskTime;
    form.taskDescription.value = activity.taskDescription;

    // Show the modal
    modal.style.display = 'block';

    // Handle form submission
    form.onsubmit = async function(event) {
        event.preventDefault();

        const updatedActivity = {
            taskName: form.taskName.value,
            taskDate: form.taskDate.value,
            taskTime: form.taskTime.value,
            taskDescription: form.taskDescription.value
        };

        try {
            // Update the task data on the server
            const response = await fetch(`http://localhost:3000/taskname/${activity.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedActivity)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const updatedActivityFromServer = await response.json();

            // Update the UI with the new task data
            cardElement.querySelector('.content').innerHTML = `
                <h4>Task Name: ${updatedActivityFromServer.taskName}</h4>
                <h4>Date: ${updatedActivityFromServer.taskDate}</h4>
                <h4>Time: ${updatedActivityFromServer.taskTime}</h4>
                <p><strong>Description:</strong> ${updatedActivityFromServer.taskDescription}</p>
                <button class="update-btn" type="button">Update</button>
                <button class="delete-btn" type="button">Delete</button>`;

            cardElement.querySelector('.delete-btn').addEventListener('click', event => {
                event.stopPropagation();
                deleteTask(updatedActivityFromServer.id, cardElement);
            });
            cardElement.querySelector('.update-btn').addEventListener('click', () => {
                updateTask(updatedActivityFromServer, cardElement);
            });

            // Close the modal
            modal.style.display = 'none';
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    // Close modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Close modal when clicking the close button
    const closeBtn = document.querySelector('.close-btn');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };
}

// Livestock Management
document.addEventListener('DOMContentLoaded', () => {
    fetchLivestockData();
});

const livestockForm = document.getElementById('livestockForm');
const livestockList = document.getElementById('livestockList');

livestockForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const newLivestock = {
        type: document.getElementById('livestockType').value,
        age: document.getElementById('livestockAge').value,
        health: document.getElementById('livestockHealth').value,
        notes: document.getElementById('livestockNotes').value
    };
    addLivestock(newLivestock);
    sendLivestockData(newLivestock);
    livestockForm.reset();
});

function fetchLivestockData() {
    fetch('http://localhost:3000/livestock')
        .then(res => res.json())
        .then(data => {
            data.forEach(livestock => addLivestock(livestock));
            setupDeleteButtons();
        })
        .catch(error => console.error('Error fetching livestock data:', error));
}

function sendLivestockData(livestock) {
    fetch('http://localhost:3000/livestock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(livestock)
    })
        .then(res => res.json())
        .then(data => console.log('Livestock data saved:', data))
        .catch(error => console.error('Error saving livestock data:', error));
}

function addLivestock(livestock) {
    const livestockDiv = document.createElement('div');
    livestockDiv.classList.add('livestock');
    livestockDiv.innerHTML = `
        <div class="content">
            <h3>${livestock.type}</h3>
            <p>Age: ${livestock.age}</p>
            <p>Health Status: ${livestock.health}</p>
            <p>Notes: ${livestock.notes}</p>
            <button class="deletebtn" type="button">Delete</button>
        </div>`;
    livestockList.appendChild(livestockDiv);

    const deleteButton = livestockDiv.querySelector('.deletebtn');
    deleteButton.addEventListener('click', event => {
        event.stopPropagation();
        deleteLivestock(livestock.id, livestockDiv);
    });
}

function deleteLivestock(id, livestockDiv) {
    fetch(`http://localhost:3000/livestock/${id}`, { method: 'DELETE' })
        .then(res => {
            if (res.ok) {
                livestockDiv.remove();
            } else {
                console.error('Failed to delete livestock');
            }
        })
        .catch(error => console.error('Error:', error));
}

function setupDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.deletebtn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', event => {
            event.stopPropagation();
            const livestockDiv = button.closest('.livestock');
            const livestockId = livestockDiv.dataset.livestockId;
            deleteLivestock(livestockId, livestockDiv);
        });
    });
}

// Crop Management
document.addEventListener('DOMContentLoaded', function () {
    const cropForm = document.getElementById('cropForm');
    const cropList = document.getElementById('cropList');

    function fetchCrops() {
        fetch('http://localhost:3000/crops')
            .then(response => response.json())
            .then(data => {
                data.forEach(crop => {
                    const cropItem = document.createElement('div');
                    cropItem.classList.add('crop-item');
                    cropItem.innerHTML = `
                        <p><strong>Crop Name:</strong> ${crop.cropName}</p>
                        <p><strong>Planting Date:</strong> ${crop.plantingDate}</p>
                        <p><strong>Expected Harvest Date:</strong> ${crop.expectedHarvest}</p>
                        <button class="livedeletebtn" type="button">Delete</button>`;
                    cropList.appendChild(cropItem);

                    const deletecrop = cropItem.querySelector('.livedeletebtn');
                    deletecrop.addEventListener('click', event => {
                        event.stopPropagation();
                        deleteCrop(crop.id, cropItem);
                    });
                });
            })
            .catch(error => console.error('Error fetching crops:', error));

    }
    function deleteCrop(id, cropElement) {
        fetch(`http://localhost:3000/crops/${id}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (res.ok) {
                // Remove the crop element from the DOM
                cropElement.remove();
            } else {
                console.error('Failed to delete crop');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    cropForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const newCrop = {
            cropName: document.getElementById('cropName').value,
            plantingDate: document.getElementById('plantingDate').value,
            expectedHarvest: document.getElementById('expectedHarvest').value
        };

        fetch('http://localhost:3000/crops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCrop)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Successfully added new crop:', data);
                cropForm.reset();
                cropList.innerHTML = '';
                fetchCrops();
            })
            .catch(error => console.error('Error adding crop:', error));
    });

    fetchCrops();
});
function toggleMenu() {
    const menuContent = document.getElementById('menuContent');
    menuContent.classList.toggle('show');
};
// script.js
function openModal() {
    document.getElementById('modal').style.display = 'block';

    // Optionally, transfer content from the card to the modal
    const upcomingItems = document.getElementById('upcoming').innerHTML;
    document.getElementById('upcoming-modal').innerHTML = upcomingItems;
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Close the modal when clicking outside of the modal content
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
