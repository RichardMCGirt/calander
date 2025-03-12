const calendarNames = [
    "Savannah", "Charleston", "Greensboro", "Myrtle Beach",
    "Wilmington", "Greenville", "Columbia", "Raleigh"
];

const AIRTABLE_API_KEY = "patXTUS9m8os14OO1.6a81b7bc4dd88871072fe71f28b568070cc79035bc988de3d4228d52239c8238";
const BASE_ID = "appO21PVRA4Qa087I";
const TABLE_NAME = "tbl6EeKPsNuEvt5yJ";
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

let events = {};

// Load events from Airtable on page load
document.addEventListener("DOMContentLoaded", async () => {
    await fetchAirtableEvents();
    initializeCalendars();
});

// Fetch events from Airtable and map them using Field 'b'
async function fetchAirtableEvents() {
    try {
        const response = await fetch(API_URL, {
            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
        });
        const data = await response.json();
        events = processAirtableData(data.records);
    } catch (error) {
        console.error("Error fetching Airtable events:", error);
    }
}

// Process Airtable records and map them based on Field 'b'
function processAirtableData(records) {
    let eventMap = {};
    records.forEach(record => {
        const calendarName = record.fields["b"]; // Use field 'b' to assign to calendar
        if (!calendarNames.includes(calendarName)) return; // Ignore if 'b' does not match a valid calendar

        if (!eventMap[calendarName]) eventMap[calendarName] = [];
        eventMap[calendarName].push({
            id: record.id,
            title: record.fields["Lot Number and Community/Neighborhood"],
            start: record.fields["FormattedStartDate"],
            end: record.fields["FormattedEndDate"],
            description: record.fields["Description of Issue"] || ""
        });
    });
    return eventMap;
}

// Initialize and render calendars
function initializeCalendars() {
    const container = document.getElementById("calendars-container");
    container.innerHTML = "";

    calendarNames.forEach(calendarName => {
        const calendarDiv = document.createElement("div");
        calendarDiv.classList.add("calendar");

        calendarDiv.innerHTML = `
            <h2>${calendarName}</h2>
            <button class="add-event-btn" onclick="openModal('${calendarName}')">Add Event</button>
            <ul class="event-list" id="event-list-${calendarName}"></ul>
        `;

        container.appendChild(calendarDiv);
        renderEvents(calendarName);
    });
}

// Open modal to add/edit event
function openModal(calendarName, event = null) {
    document.getElementById("event-modal").style.display = "flex";
    document.getElementById("selected-calendar").value = calendarName;

    if (event) {
        document.getElementById("modal-title").textContent = "Edit Event";
        document.getElementById("event-id").value = event.id;
        document.getElementById("event-title").value = event.title;
        document.getElementById("event-start").value = event.start;
        document.getElementById("event-end").value = event.end;
        document.getElementById("event-description").value = event.description;
    } else {
        document.getElementById("modal-title").textContent = "Add Event";
        document.getElementById("event-id").value = "";
        document.getElementById("event-title").value = "";
        document.getElementById("event-start").value = "";
        document.getElementById("event-end").value = "";
        document.getElementById("event-description").value = "";
    }
}

// Close modal
function closeModal() {
    document.getElementById("event-modal").style.display = "none";
}

// Render events inside calendar
function renderEvents(calendarName) {
    const eventList = document.getElementById(`event-list-${calendarName}`);
    eventList.innerHTML = "";

    (events[calendarName] || []).forEach(event => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>${event.title}</strong> <br>
                ${new Date(event.start).toLocaleString()} - ${new Date(event.end).toLocaleString()}<br>
                ${event.description}
            </div>
            <div class="event-actions">
                <button class="edit-btn" onclick="openModal('${calendarName}', ${JSON.stringify(event)})">Edit</button>
                <button class="delete-btn" onclick="deleteEvent('${event.id}', '${calendarName}')">Delete</button>
            </div>
        `;
        eventList.appendChild(li);
    });
}

// Delete event from Airtable
async function deleteEvent(eventId, calendarName) {
    await fetch(`${API_URL}/${eventId}`, { 
        method: "DELETE", 
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } 
    });
    await fetchAirtableEvents();
    renderEvents(calendarName);
}

// Save event (new or updated)
async function saveEvent() {
    const eventId = document.getElementById("event-id").value;
    const calendarName = document.getElementById("selected-calendar").value;
    const title = document.getElementById("event-title").value;
    const start = document.getElementById("event-start").value;
    const end = document.getElementById("event-end").value;
    const description = document.getElementById("event-description").value;

    if (!title || !start || !end) {
        alert("Please fill all required fields!");
        return;
    }

    const eventData = {
        fields: {
            "Title": title,
            "Start": start,
            "End": end,
            "Description": description,
            "b": calendarName // Assign to the correct calendar based on field 'b'
        }
    };

    const method = eventId ? "PATCH" : "POST";
    const url = eventId ? `${API_URL}/${eventId}` : API_URL;

    try {
        await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${AIRTABLE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(eventData)
        });

        closeModal();
        await fetchAirtableEvents();
        renderEvents(calendarName);
    } catch (error) {
        console.error("Error saving event:", error);
    }
}
