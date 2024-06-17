let username_valid = false;
let password_valid = false;
const Errors = {
    InvalidCredentials: "invalid-credentials",
    UsernameTaken: "username-taken",
    InternalError: "internal-error"
};

window.onload = async function() {
    check_username_valid();
    check_password_valid();
};

function show_error(error) {
    document.getElementById(error).style.display = "block";
}

function hide_errors() {
    for(const elem of document.getElementsByClassName("error")) {
        elem.style.display = "none";
    }
}

function toggle_buttons(enabled) {
    hide_errors();
    document.getElementById("login").disabled = !enabled;
    document.getElementById("signup").disabled = !enabled;
}

function check_username_valid() {
    username_valid = document.getElementById("username").value.length >= 3;
    toggle_buttons(username_valid && password_valid);
}

function check_password_valid() {
    password_valid = document.getElementById("password").value.length >= 8;
    toggle_buttons(username_valid && password_valid);
}

function credentials() {
    return {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };
}

async function login() {
    const creds = credentials();
    const response = await fetch(back_url+"/login", {
        method: "POST",
        body: JSON.stringify(creds),
        headers: {
            "Content-Type": "application/json",
        }
    });
    if (response.status == 401) {
        show_error(Errors.InvalidCredentials);
    } else if (response.ok) {
        let jwt = await response.text();
        localStorage.setItem("username", creds.username);
        localStorage.setItem("jwt", jwt);
        window.location.href = "/";
    } else {
        show_error(Errors.InternalError);
    }
}

async function signup() {
    const creds = credentials();
    const response = await fetch(back_url+"/signup", {
        method: "POST",
        body: JSON.stringify(creds),
        headers: {
            "Content-Type": "application/json",
        }
    });
    if (response.status === 409) {
        show_error(Errors.UsernameTaken);
    } else if (response.ok) {
        let jwt = await response.text();
        localStorage.setItem("username", creds.username);
        localStorage.setItem('jwt', jwt);
        window.location.href = "/";
    } else {
        show_error(Errors.InternalError);
    }
}