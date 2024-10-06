export default class CalendarEntry {
    elementID = 0;
    elementType = 5;
    wrapper;
    constructor(instance, elementID, elementType = 5) {
        this.elementID = elementID;
        this.elementType = elementType;
        this.wrapper = instance;
    }
    fetch() {
        var result = this.wrapper.axios.get(`https://${this.wrapper.baseurl}/api/rest/view/v1/calendar-entry/detail?elementId=${this.elementID}&elementType=${this.elementType}&homeworkOption=DUE`);
        console.log(result);
    }
}