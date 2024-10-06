import { UntisWrapper } from "./API-Wrapper.js";
import CalendarEntry from "./calendarentry.class.js";
import fs from "fs";

var conf = JSON.parse(fs.readFileSync("./config.json"));


var instance = new UntisWrapper(conf.school, conf.username, conf.password, conf.baseurl);

await instance.login()
instance.validateSession();

var entry = new CalendarEntry(instance, 12132);
console.log(entry)