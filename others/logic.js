var currentDate = new Date();

main(); // runs programs 

function main() {
    getDate();
    inactivityReset();
    getColorDayandSchedule();
    document.addEventListener('contextmenu', function(event) { // disables right click
    event.preventDefault();
    });
}

// gets the current date and formats it to be displayed on the page
function getDate() {
    var formattedDate = currentDate.toLocaleDateString(undefined, {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
    });
    // Inject the date into the HTML container
    var dateElement = document.getElementById('date-display');
    if (dateElement) {
        dateElement.textContent = formattedDate;
        dateElement.setAttribute('datetime', currentDate.toISOString().split('T')[0]);
    }
}

// bring back to home page after some inactivity
function inactivityReset() {
    var INACTIVITY_TIME = 60000; // 1 minute 

    var inactivityTimer;

    function goHome() {
        window.location.replace(window.location.origin + "/roarboard/");
    }

    function resetTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(goHome, INACTIVITY_TIME);
    }

    ["mousemove", "mousedown", "keypress", "click", "scroll", "touchstart"] 
    .forEach(event => { // looks for activities and resets the timer if there is any activity
        document.addEventListener(event, resetTimer);
    });

    window.addEventListener("load", resetTimer);
}


// Read school calendar from sheet
async function getCalendar() {
    var url = 'https://docs.google.com/spreadsheets/d/1cPosjjH6-J0s35u5J3AO-xJp3w3gkHoxlGRyZ_7-1ig/gviz/tq?tqx=out:csv'; // google sheets link in csv format
    var res = await fetch(url + '&t=' + Date.now());
    var csv = await res.text();
    return csv.split('\n').map(function(row) {
        return row.split(',').map(function(c) {
            return c.replace(/^"|"$/g, '').trim();
        });
    });
}

// get data in cell
function getCell(calendar, today) {
    var col = 1 + (today.getFullYear() - 2026) * 12 + (today.getMonth() - 7);
    if (col < 1 || col > 12) return null;

    for (var r = 0; r < calendar.length; r++) {
        if (parseInt(calendar[r][0], 10) === today.getDate()) {
            return (calendar[r][col] || '').toUpperCase() || null;
        }
    }

    return null;
}

// assign color day and schedule based on the calendar data
async function getColorDayandSchedule() {
    var normalSchedule = "../pictures/blockSchedule.png";
    var halfDaySchedule = "../pictures/halfDaySchedule.png";
    var twoHourDelaySchedule = "../pictures/2HourDelaySchedule.png";
    var threeHourDelaySchedule = "../pictures/3HourDelaySchedule.png";
    var today = new Date(); // month number is one less than actual month (e.g. 8 = Sept)
    var startDate = new Date(2026, 7, 31);
    var colorDay = "Gold";

    var calendar = await getCalendar();

    var current = new Date(startDate);

    while (current < today) {
        var typeOfDay = getCell(calendar, current);

        if (typeOfDay && typeOfDay !== "N" && typeOfDay !== "-") {
            colorDay = colorDay === "Gold" ? "Blue" : "Gold";
        }

        current.setDate(current.getDate() + 1);
    }

    var typeOfDay = getCell(calendar, today);

    if (typeOfDay === "N" || typeOfDay === "-") {
        colorDay = "None";
    }

    document.getElementById("color-day-display").textContent = colorDay;

    if (window.location.pathname.includes("bellSchedule.html")) {
        if (typeOfDay === "N" || typeOfDay === "-" || typeOfDay === "Y") {
            document.getElementById("schedule").src = normalSchedule;
        } else if (typeOfDay === "H") {
            document.getElementById("schedule").src = halfDaySchedule;
        } else if (typeOfDay === "2") {
            document.getElementById("schedule").src = twoHourDelaySchedule;
        } else if (typeOfDay === "3") {
            document.getElementById("schedule").src = threeHourDelaySchedule;
        } else {
            document.getElementById("schedule").src = normalSchedule;
        }
    }
}
