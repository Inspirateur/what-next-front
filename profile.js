const back_url = "http://127.0.0.1:8000";
let rated_oeuvres = [];

window.onload = async function() {
    const response = await fetch(back_url+"/rated", {
        headers: {
            "Authorization": localStorage.getItem('jwt')
        }
    });
    if (response.status == 401) {
        window.location.href = "/login";
    }
    rated_oeuvres = await response.json();
    for(const rated_oeuvre of rated_oeuvres) {
        document.getElementById("rated"+rated_oeuvre.user_rating).appendChild(elem_from_oeuvre(rated_oeuvre));
    }
};

function update_rating(oeuvre_id, new_rating) {
    // TODO: query the back to update the rating and move the oeuvre in the corresponding div
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
        button.addEventListener("onclick", update_rating(oeuvre.id, rating));
        button.className = "rate-button profile";
    } else {
        button.className = "rate-button profile selected";
    }
    return button;
}

function elem_from_oeuvre(oeuvre) {
    // TOP DIV
    let title = document.createElement("span");
    title.innerHTML = oeuvre.title;
    let skip_button = document.createElement("button");
    skip_button.innerText = "Skip";
    if (oeuvre.user_rating != 0) {
        skip_button.addEventListener("onclick", update_rating(oeuvre.id, 0));
    } else {
        skip_button.className = "selected";
    }
    let subdiv_top = document.createElement("div");
    subdiv_top.className = "horizontal spread";
    subdiv_top.appendChild(title);
    subdiv_top.appendChild(skip_button);
    // BOTTOM DIV
    let pic = document.createElement("img");
    pic.src = oeuvre.picture != "" 
        ? oeuvre.picture : "placeholder.jpg";
    pic.style.width = "30%";
    let button_loved = make_rate_button(oeuvre, 2);
    let button_good = make_rate_button(oeuvre, 1);
    let button_shrug = make_rate_button(oeuvre, -1);
    let button_no = make_rate_button(oeuvre, -2);
    let subdiv_bottom = document.createElement("div");
    subdiv_bottom.className = "horizontal spread";
    subdiv_bottom.appendChild(pic);
    subdiv_bottom.appendChild(button_loved);
    subdiv_bottom.appendChild(button_good);
    subdiv_bottom.appendChild(button_shrug);
    subdiv_bottom.appendChild(button_no);
    let elem = document.createElement("div");
    elem.id = oeuvre.id;
    elem.className = "vertical";
    elem.style.marginTop = "1em";
    elem.appendChild(subdiv_top);
    elem.appendChild(subdiv_bottom);
    return elem;
}
