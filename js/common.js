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

function make_rate_button(oeuvre, rating, on_rate, is_you) {
    let button = document.createElement("button");
    let class_list = ["rate-button", "profile"];
    if (rating == 2) {
        button.innerText =  "🤩";
    } else if (rating == 1) {
        button.innerText = "🙂";
    } else if (rating == -1) {
        button.innerText = "🤷";
    } else if (rating == -2) {
        button.innerText = "😕";
    } else if (rating == 0) {
        button.innerText = "Skip";
        class_list = [];
    }
    if (oeuvre.user_rating != rating) {
        if (is_you) {
            button.addEventListener("click", async function() { 
                await update_rating(oeuvre.id, rating);
                oeuvre.user_rating = rating;
                on_rate();
            });    
        } else {
            button.disabled = true;
        }
        button.className = class_list.join(" ");
    } else {
        button.className =  [...class_list, "selected"].join(" ");
    }
    return button;
}

function elem_from_oeuvre(oeuvre, on_rate, is_you) {
    let title = document.createElement("span");
    title.innerHTML = oeuvre.title;
    // BOTTOM LEFT RIGHT DIV
    let pic = document.createElement("img");
    pic.src = oeuvre.picture != "" 
        ? oeuvre.picture : "placeholder.jpg";
    pic.style.width = "30%";
    // BOTTOM VOTE DIV
    let button_loved = make_rate_button(oeuvre, 2, on_rate, is_you);
    let button_good = make_rate_button(oeuvre, 1, on_rate, is_you);
    let button_shrug = make_rate_button(oeuvre, -1, on_rate, is_you);
    let button_no = make_rate_button(oeuvre, -2, on_rate, is_you);
    let skip_button = make_rate_button(oeuvre, 0, on_rate, is_you);
    let subdiv_vote = document.createElement("div");
    subdiv_vote.className = "horizontal spread";
    subdiv_vote.appendChild(button_loved);
    subdiv_vote.appendChild(button_good);
    subdiv_vote.appendChild(button_shrug);
    subdiv_vote.appendChild(button_no);
    let div_vote = document.createElement("div");
    div_vote.className = "vertical";
    div_vote.style.justifyContent = "space-around";
    div_vote.appendChild(subdiv_vote);
    div_vote.appendChild(skip_button);
    let div_bottom = document.createElement("div");
    div_bottom.className = "horizontal spread";
    div_bottom.style.overflow = "auto";
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
