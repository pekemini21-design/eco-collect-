"use strict";

/*
=====================================================
ECOCOLLECT ADMIN DASHBOARD
=====================================================
Uses the same LocalStorage key as the resident page:
ecocollectRequests
=====================================================
*/

const STORAGE_KEY = "ecocollectRequests";


/*
=====================================================
GET REQUESTS
=====================================================
*/

function getRequests() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return [];
    }

    try {

        const requests = JSON.parse(saved);

        return Array.isArray(requests) ? requests : [];

    } catch (error) {

        console.error("Error reading saved requests:", error);

        return [];
    }
}


/*
=====================================================
SAVE REQUESTS
=====================================================
*/

function saveRequests(requests) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(requests)
    );
}


/*
=====================================================
DISPLAY REQUESTS
=====================================================
*/

function displayRequests() {

    const table = document.getElementById("requestsTable");

    if (!table) {
        return;
    }

    const requests = getRequests();

    table.innerHTML = "";


    /* NO REQUESTS */

    if (requests.length === 0) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td colspan="11">
                No resident requests found.
            </td>
        `;

        table.appendChild(row);

        return;
    }


    /* DISPLAY REQUESTS */

    requests.forEach(function(request, index) {

        const row = document.createElement("tr");

        const requestId =
            request.id || `REQ-${index + 1}`;

        const status =
            request.status || "Pending";


        row.innerHTML = `

            <td>
                <input
                    type="checkbox"
                    class="request-checkbox"
                    data-id="${requestId}"
                >
            </td>

            <td>
                ${requestId}
            </td>

            <td>
                ${request.resident || "N/A"}
            </td>

            <td>
                ${request.email || "N/A"}
            </td>

            <td>
                ${request.phone || "N/A"}
            </td>

            <td>
                ${request.area || "N/A"}
            </td>

            <td>
                ${request.collectionDate || "N/A"}
            </td>

            <td>
                ${request.collectionTime || "N/A"}
            </td>

            <td>
                ${request.wasteType || "N/A"}
            </td>

            <td>

                <select
                    class="status-select"
                    data-id="${requestId}"
                >

                    <option value="Pending">
                        Pending
                    </option>

                    <option value="Approved">
                        Approved
                    </option>

                    <option value="Completed">
                        Completed
                    </option>

                </select>

            </td>

            <td>

                <button
                    type="button"
                    class="delete-button"
                    data-id="${requestId}"
                >
                    Delete
                </button>

            </td>
        `;


        table.appendChild(row);


        /* Set current status */

        const statusSelect =
            row.querySelector(".status-select");

        if (statusSelect) {
            statusSelect.value = status;
        }

    });


    setupRequestEvents();
}


/*
=====================================================
STATUS AND DELETE EVENTS
=====================================================
*/

function setupRequestEvents() {


    /* STATUS */

    const statusSelects =
        document.querySelectorAll(".status-select");


    statusSelects.forEach(function(select) {

        select.addEventListener(
            "change",
            function() {

                const requestId =
                    this.getAttribute("data-id");

                const newStatus =
                    this.value;

                updateRequestStatus(
                    requestId,
                    newStatus
                );
            }
        );

    });


    /* DELETE */

    const deleteButtons =
        document.querySelectorAll(".delete-button");


    deleteButtons.forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                const requestId =
                    this.getAttribute("data-id");

                deleteRequest(requestId);
            }
        );

    });

}


/*
=====================================================
UPDATE REQUEST STATUS
=====================================================
*/

function updateRequestStatus(
    requestId,
    newStatus
) {

    const requests = getRequests();

    let found = false;


    requests.forEach(function(request) {

        if (
            String(request.id) ===
            String(requestId)
        ) {

            request.status = newStatus;

            request.updatedAt =
                new Date().toISOString();

            found = true;
        }

    });


    if (!found) {

        alert("Request not found.");

        return;
    }


    saveRequests(requests);

    displayRequests();

    updateStatistics();

}


/*
=====================================================
DELETE ONE REQUEST
=====================================================
*/

function deleteRequest(requestId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this request?"
        );


    if (!confirmed) {
        return;
    }


    const requests = getRequests();


    const remaining =
        requests.filter(function(request) {

            return String(request.id) !==
                String(requestId);

        });


    saveRequests(remaining);

    displayRequests();

    updateStatistics();

}


/*
=====================================================
RENEW SELECTED REQUEST
=====================================================
*/

function renewSelectedRequest() {

    const selected =
        document.querySelector(
            ".request-checkbox:checked"
        );


    if (!selected) {

        alert(
            "Please select a request first."
        );

        return;
    }


    const requestId =
        selected.getAttribute("data-id");


    const requests = getRequests();

    let found = false;


    requests.forEach(function(request) {

        if (
            String(request.id) ===
            String(requestId)
        ) {

            request.status = "Pending";


            /*
            Move collection date
            forward by 7 days.
            */

            if (request.collectionDate) {

                const date =
                    new Date(
                        request.collectionDate
                    );


                if (!isNaN(date.getTime())) {

                    date.setDate(
                        date.getDate() + 7
                    );


                    request.collectionDate =
                        date
                            .toISOString()
                            .split("T")[0];

                }

            }


            request.updatedAt =
                new Date().toISOString();

            found = true;
        }

    });


    if (!found) {

        alert("Request not found.");

        return;
    }


    saveRequests(requests);

    displayRequests();

    updateStatistics();


    alert(
        "Request renewed successfully."
    );

}


/*
=====================================================
DELETE ALL REQUESTS
=====================================================
*/

function deleteAllRequests() {

    const requests = getRequests();


    if (requests.length === 0) {

        alert(
            "There are no requests to delete."
        );

        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to delete ALL requests?"
        );


    if (!confirmed) {
        return;
    }


    localStorage.removeItem(STORAGE_KEY);

    displayRequests();

    updateStatistics();

}


/*
=====================================================
UPDATE STATISTICS
=====================================================
*/

function updateStatistics() {

    const requests = getRequests();

    let pending = 0;
    let approved = 0;
    let completed = 0;


    requests.forEach(function(request) {

        const status =
            request.status || "Pending";


        if (status === "Pending") {
            pending++;
        }

        else if (status === "Approved") {
            approved++;
        }

        else if (status === "Completed") {
            completed++;
        }

    });


    const totalElement =
        document.getElementById("totalRequests");

    const pendingElement =
        document.getElementById("pendingRequests");

    const approvedElement =
        document.getElementById("approvedRequests");

    const completedElement =
        document.getElementById("completedRequests");


    if (totalElement) {
        totalElement.textContent =
            requests.length;
    }


    if (pendingElement) {
        pendingElement.textContent =
            pending;
    }


    if (approvedElement) {
        approvedElement.textContent =
            approved;
    }


    if (completedElement) {
        completedElement.textContent =
            completed;
    }

}


/*
=====================================================
REFRESH BUTTON
=====================================================
*/

function setupButtons() {

    const refreshButton =
        document.getElementById("refreshButton");

    const renewButton =
        document.getElementById("renewButton");

    const deleteAllButton =
        document.getElementById("deleteAllButton");


    /* REFRESH */

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            function() {

                displayRequests();

                updateStatistics();

            }
        );

    }


    /* RENEW */

    if (renewButton) {

        renewButton.addEventListener(
            "click",
            renewSelectedRequest
        );

    }


    /* DELETE ALL */

    if (deleteAllButton) {

        deleteAllButton.addEventListener(
            "click",
            deleteAllRequests
        );

    }

}


/*
=====================================================
START DASHBOARD
=====================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    function() {

        displayRequests();

        updateStatistics();

        setupButtons();

    }
);