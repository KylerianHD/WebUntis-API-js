// API-Wrapper for the WebUntis API following the Documentation (WebUntis-API-Doc.md)

import axios from "axios";
import dateFns from "date-fns";


export class UntisWrapper {

    // Variables
    school = "";
    schoolBase64 = "";
    username = "";
    password = "";
    baseurl = "";
    cookies = "";
    id = "";
    sessionInfo = "";
    anonymous = false;
    axios;

    // Constructor
    constructor(school, username, password, baseurl, identity = "Awesome", disableUserAgent = false) {

        // Set Variables
        this.school = school;
        this.schoolBase64 = "_" + btoa(this.school); // _ Symbol is needed for the API. btoa() is a function to encode the school name to base64.
        this.username = username;
        this.password = password;
        this.baseurl = "https://" + baseurl + "/";
        this.cookies = [];
        this.id = identity;
        this.sessionInfo = {};
        this.anonymous = false;

        const additionalHeaders = {};

        if (!disableUserAgent) {

            // Set default User-Agent
            additionalHeaders["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) WebUntisAPIWrapper/1.0.0 Chrome/73.0.3683.103 Safari/537.36";
        }
        console.log(`Logging in to ${this.baseurl} - School: ${this.school} (${this.schoolBase64}) - User: ${this.username}`)
        // Create Axios Instance
        this.axios = axios.create({
            baseURL: this.baseurl,
            maxRedirects: 0,
            headers: {
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
                "X-Requested-With": "XMLHttpRequest",
                ...additionalHeaders
            },
            validateStatus: function (status) {
                return status >= 200 && status < 303;
            }
        });
        
    }

    getInstance() {
        return this;
    }

    // Login
    async login() {

        // Create response variable and get its value using axios
        const response = await this.axios.post('/WebUntis/jsonrpc.do', {
            params: {
                school: this.school
            },
            data: {
                id: this.id,
                method: "authenticate",
                params: {
                    user: this.username,
                    password: this.password,
                    client: this.id
                },
                jsonrpc: "2.0"
            }
        });

        // Checks for different errors/responses
        if (typeof response.data !== "object") {
            throw new Error("Failed to parse response from server.");
        }
        if (!response.data.result) {
            throw new Error("Failed to login: " + JSON.stringify(response.data));
        }
        if (response.data.result.code) {
            throw new Error("Login returned error code: " + response.data.result.code);
        }
        if (!response.data.result.sessionId) {
            throw new Error("Login returned no session ID.");
        }
        this.sessionInfo = response.data.result;
        return response.data.result;
    }

    async logout() {

        await this.axios.post('/WebUntis/jsonrpc.do', {
            params: {
                school: this.school
            },
            data: {
                id: this.id,
                method: "logout",
                params: {},
                jsonrpc: "2.0",
            }
        });
    }

    // Building the cookies
    buildCookies() {

        const cookies = [];
        cookies.push(serialize("JSESSIONID=" + this.sessionInfo.sessionId));
        cookies.push(serialize("schoolname=" + this.schoolBase64));
        return cookies.join("; ");
    }

    // Getting JWT
    async getJWT(validateSession = true) {

        if (validateSession && !await this.validateSession()) {
            throw new Error("Session is invalid.");
        }    
        
        const response = await this.axios.get('/WebUntis/api/token/new', {
            headers: {
                "Cookie": this.buildCookies()
            }
        });

        if (typeof response.data !== "string") {
            throw new Error("Server returned invalid data.");
        }

        this.sessionInfo.jwt = response.data;
        
        return response.data;
    }

    // Validating Session
    async validateSession() {

        const response = await this.axios.get('/WebUntis/api/version/check', {
            headers: {
                "Cookie": this.buildCookies()
            }
        });

        if (typeof response.data !== "object") {
            throw new Error("Server returned invalid data.");
        }

        return response.data.code === 200;
    }

    // Converting Date to Untis format
    convertToUntisDate(date) {
        
        return dateFns.format(date, "YYYYMMDD");
    }

}

  
// Usage (TODO: extra file.)
