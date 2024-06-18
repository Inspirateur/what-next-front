/**
 * @typedef {import('../typedefs/oeuvre.js').Oeuvre} Oeuvre
 */
/** @type {Oeuvre[]} */
let rated_oeuvres_by_medium = [];
let is_you = false;

window.onload = async function() {
    const medium = localStorage.getItem("medium");
    if (medium !== null) {
        document.getElementById("media-select").value = medium;
    }
    const username = (new URLSearchParams(document.location.search)).get("n");
    document.getElementById("username").innerText = "@"+username;
    const jwt = localStorage.getItem('jwt');
    if (jwt === undefined) {
        await load_profile(username);
    } else {
        await load_auth_profile(jwt, username);
    }
};

function load_oeuvres(oeuvres) {
    for(const rated_oeuvre of oeuvres) {
        if (rated_oeuvres_by_medium[rated_oeuvre.medium] === undefined) {
            rated_oeuvres_by_medium[rated_oeuvre.medium] = [];
        }
        rated_oeuvres_by_medium[rated_oeuvre.medium].push(rated_oeuvre);
    }
    on_medium_change();
}

async function load_auth_profile(jwt, username) {
    const response = await fetch(back_url+"/rated/"+username, {
        headers: {
            "Authorization": jwt
        }
    });
    if (response.status == 401) {
        window.location.href = "/login";
    }
    const profile = await response.json();
    if (username === localStorage.getItem("username")) {
        is_you = true;
        document.getElementById("logout").style.display = "flex";
    } else {
        document.getElementById("similarity-value").innerText = profile.similarity;
        document.getElementById("similarity").style.display = "flex";
    }
    load_oeuvres(profile.oeuvres);
}

async function load_profile(username) {
    const response = await fetch(back_url+"/rated/"+username);
    const oeuvres = await response.json(); 
    load_oeuvres(oeuvres);
}

function refresh_counts(medium) {
    let total_rated = 0;
    let medium_rated = 0;
    let medium_skipped = 0;
    for(const [other_medium, rated_oeuvres] of Object.entries(rated_oeuvres_by_medium)) {
        for(const rated_oeuvre of rated_oeuvres) {
            if (other_medium === medium) {
                if (rated_oeuvre.user_rating === 0) {
                    medium_skipped += 1;
                } else {
                    medium_rated += 1;
                }
            }
            if (rated_oeuvre.user_rating !== 0) {
                total_rated += 1;
            }
        }
    }
    document.getElementById("rated-count").innerText = medium_rated;
    document.getElementById("skipped-count").innerText = medium_skipped;
    document.getElementById("rated-total").innerText = total_rated;
}

function on_medium_change() {
    const medium = document.getElementById("media-select").value;
    localStorage.setItem("medium", medium);
    document.getElementById("rated2").innerHTML = "";
    document.getElementById("rated1").innerHTML = "";
    document.getElementById("rated-1").innerHTML = "";
    document.getElementById("rated-2").innerHTML = "";
    document.getElementById("rated0").innerHTML = "";
    if (medium === "") {
        return;
    }
    refresh_counts(medium);
    if (rated_oeuvres_by_medium[medium] === undefined) {
        return;
    }
    for(const rated_oeuvre of rated_oeuvres_by_medium[medium]) {
        let rateable = document.createElement("x-rateable");
        rateable.oeuvre = rated_oeuvre;
        rateable.disabled = !is_you;
        rateable.className = "rateable";
        rateable.on_rate = async function(rating) {
            await update_rating(rated_oeuvre.id, rating);
            rated_oeuvre.user_rating = rating;
            on_medium_change();
        }
        document.getElementById("rated"+rated_oeuvre.user_rating)
            .appendChild(rateable);
    }
}

function logout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("username");
    window.location.href = "/login";
}