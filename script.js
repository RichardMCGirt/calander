const calendarNames = [
    "Savannah", "Charleston", "Greensboro", "Myrtle Beach",
    "Wilmington", "Greenville", "Columbia", "Raleigh"
];

const AIRTABLE_API_KEY = "patXTUS9m8os14OO1.6a81b7bc4dd88871072fe71f28b568070cc79035bc988de3d4228d52239c8238";
const BASE_ID = "appO21PVRA4Qa087I";
const TABLE_NAME = "tbl6EeKPsNuEvt5yJ";
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

let eventsByCalendar = {};

// Initialize the calendar event storage
calendarNames.forEach(name => {
    eventsByCalendar[name] = [];
});

document.addEventListener("DOMContentLoaded", async () => {
    await fetchAirtableEvents();
    generateCalendar();
});

async function fetchAirtableEvents() {
    try {
        const response = await fetch(API_URL, {
            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
        });
        const data = await response.json();

        data.records.forEach(record => {
            const calendarName = record.fields["b"]; // Field 'b' should match a calendar name

            if (calendarNames.includes(calendarName)) {
                eventsByCalendar[calendarName].push({
                    id: record.id,
                    title: record.fields["Lot Number and Community/Neighborhood"],
                    start: new Date(record.fields["FormattedStartDate"]),
                    end: new Date(record.fields["FormattedEndDate"]),
                    description: record.fields["Description of Issue"] || "",
                    calendar: calendarName
                });
            }
        });

    } catch (error) {
        console.error("Error fetching Airtable events:", error);
    }
}

function generateCalendar() {
    const container = document.getElementById("calendar-grid");
    container.innerHTML = "";

    calendarNames.forEach(calendar => {
        const calendarDiv = document.createElement("div");
        calendarDiv.classList.add("calendar-section");
        calendarDiv.innerHTML = `<h3>${calendar}</h3><div id="events-${calendar}"></div>`;
        container.appendChild(calendarDiv);
        populateEvents(calendar);
    });
}

function populateEvents(calendar) {
    const eventContainer = document.getElementById(`events-${calendar}`);
    eventContainer.innerHTML = "";

    eventsByCalendar[calendar].forEach(event => {
        const eventEl = document.createElement("div");
        eventEl.classList.add("event-circle");
        eventEl.textContent = event.title ? event.title[0] : "?";
        eventEl.onclick = () => openEventModal(event);
        eventContainer.appendChild(eventEl);
    });
}

function openEventModal(event) {
    document.getElementById("event-title").textContent = event.title;
    document.getElementById("event-start").textContent = event.start.toLocaleString();
    document.getElementById("event-end").textContent = event.end.toLocaleString();
    document.getElementById("event-description").textContent = event.description;
    document.getElementById("event-modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("event-modal").style.display = "none";
}
