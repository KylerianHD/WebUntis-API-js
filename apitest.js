import { UntisWrapper } from "./API-Wrapper.js";
import CalendarEntry from "./calendarentry.class.js";
import fs from "fs";

var conf = JSON.parse(fs.readFileSync("./config.json"));

var instance = new UntisWrapper(conf.school, conf.username, conf.password, conf.baseurl);

// Login to WebUntis API and validate session
try {
    await instance.login();
} catch (error) {
    console.error("Failed to login:", error);
}

// Create a CalendarEntry instance and fetch details
const entry = new CalendarEntry(instance, 12132);
console.log(entry);
try {
    entry.fetch(); // Fetch calendar entry details
} catch (error) {
    console.error("Error fetching calendar entry:", error);
}
