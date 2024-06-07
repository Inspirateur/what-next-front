const back_url = "http://127.0.0.1:8000";
let curr_oeuvre = null;

window.onload = async function() {
    // setup link to profile with stored username
    document.getElementById("profile-link").href = "/profile.html?n="+localStorage.getItem("username");
    // get the media
    const media = await (await fetch(back_url+"/media")).json();
    let media_select = document.getElementById("media-select");
    for (const medium of media) {
        let option = document.createElement("option");
        option.value = medium;
        option.innerText = medium;
        media_select.appendChild(option);
    }
    // get a reco
    await get_reco();
};

function refresh_oeuvre() {
    document.getElementById("title").innerText = curr_oeuvre.title;
    document.getElementById("picture").src = curr_oeuvre.picture != "" 
        ? curr_oeuvre.picture : "placeholder.jpg";
    document.getElementById("rating").innerText = curr_oeuvre.rating;
    document.getElementById("synopsis").innerText = curr_oeuvre.synopsis;
}

async function reco_worker(url, data) {
    document.getElementById("error").style.display = "none";
    document.getElementById("reco").style.display = "none";
    document.getElementById("loading").style.display = "flex";
    const reco_response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("jwt")
        }
    });
    document.getElementById("loading").style.display = "none";
    if (reco_response.status == 401) {
        window.location.href = "/login";
    } else if (reco_response.status == 404) {
        document.getElementById("error").style.display = "flex"
    } else {
        curr_oeuvre = await reco_response.json();
        refresh_oeuvre();    
        document.getElementById("reco").style.display = "flex"
    }
}

async function get_reco() {
    await reco_worker(back_url+"/reco", document.getElementById("media-select").value);
}

async function rate_oeuvre(rating) {
    await reco_worker(back_url+"/rate_reco", {
        oeuvre_id: curr_oeuvre.id, 
        rating: rating, 
        medium: document.getElementById("media-select").value
    });
}