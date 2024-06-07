const back_url = "http://127.0.0.1:8000";
let rated_oeuvres_by_medium = [];
let is_you = false;

window.onload = async function() {
    const media = await (await fetch(back_url+"/media")).json();
    let media_select = document.getElementById("media-select");
    for (const medium of media) {
        let option = document.createElement("option");
        option.value = medium;
        option.innerText = medium;
        media_select.appendChild(option);
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
    console.log(username);
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
        console.log("similarity: ", profile.similarity);
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
        document.getElementById("rated"+rated_oeuvre.user_rating).appendChild(elem_from_oeuvre(rated_oeuvre));
    }
}

async function update_rating(oeuvre_id, new_rating) {
    // query the back to update the rating
    const reco_response = await fetch(back_url+"/rate", {
        method: "POST",
        body: JSON.stringify({oeuvre_id: oeuvre_id, rating: new_rating}),
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('jwt')
        }
    });
    if (reco_response.status == 401) {
        window.location.href = "/login";
    }
}

function make_rate_button(oeuvre, rating) {
    let button = document.createElement("button");
    if (rating == 2) {
        button.innerText =  "🤩";
    } else if (rating == 1) {
        button.innerText = "🙂";
    } else if (rating == -1) {
        button.innerText = "🤷";
    } else if (rating == -2) {
        button.innerText = "😕";
    }
    if (oeuvre.user_rating != rating) {
        if (is_you) {
            button.addEventListener("click", async function() { 
                await update_rating(oeuvre.id, rating);
                oeuvre.user_rating = rating;
                on_medium_change();
            });    
        } else {
            button.disabled = true;
        }
        button.className = "rate-button profile";
    } else {
        button.className = "rate-button profile selected";
    }
    return button;
}

function elem_from_oeuvre(oeuvre) {
    let title = document.createElement("span");
    title.innerHTML = oeuvre.title;
    title.style.width = "95%";
    title.style.margin = "auto";

    // BOTTOM LEFT RIGHT DIV
    let pic = document.createElement("img");
    pic.src = oeuvre.picture != "" 
        ? oeuvre.picture : "placeholder.jpg";
    pic.style.width = "30%";
    // BOTTOM VOTE DIV
    let button_loved = make_rate_button(oeuvre, 2);
    let button_good = make_rate_button(oeuvre, 1);
    let button_shrug = make_rate_button(oeuvre, -1);
    let button_no = make_rate_button(oeuvre, -2);
    let skip_button = document.createElement("button");
    skip_button.innerText = "Skip";
    if (oeuvre.user_rating != 0) {
        if (is_you) {
            skip_button.addEventListener("onclick", function() { update_rating(oeuvre.id, 0) });
        } else {
            skip_button.disabled = true;
        }
    } else {
        skip_button.className = "selected";
    }
    let subdiv_vote = document.createElement("div");
    subdiv_vote.className = "horizontal spread";
    subdiv_vote.appendChild(button_loved);
    subdiv_vote.appendChild(button_good);
    subdiv_vote.appendChild(button_shrug);
    subdiv_vote.appendChild(button_no);
    let div_vote = document.createElement("div");
    div_vote.className = "vertical";
    div_vote.appendChild(subdiv_vote);
    div_vote.appendChild(skip_button);
    let div_bottom = document.createElement("div");
    div_bottom.className = "horizontal spread";
    div_bottom.appendChild(pic);
    div_bottom.appendChild(div_vote);
    let elem = document.createElement("div");
    elem.id = oeuvre.id;
    elem.className = "vertical";
    elem.style.marginTop = "1em";
    elem.appendChild(title);
    elem.appendChild(div_bottom);
    return elem;
}

function logout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("username");
    window.location.href = "/login";
}