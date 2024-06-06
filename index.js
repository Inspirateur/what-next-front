const back_url = "http://127.0.0.1:8000";
let curr_oeuvre = null;

window.onload = async function() {
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

async function get_reco() {
    const reco_response = await fetch(back_url+"/reco", {
        method: "POST",
        body: JSON.stringify(document.getElementById("media-select").value),
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('jwt')
        }
    });
    if (reco_response.status == 401) {
        window.location.href = "/login";
    }
    curr_oeuvre = await reco_response.json();
    refresh_oeuvre();    

}

async function rate_oeuvre(rating) {
    const reco_response = await fetch(back_url+"/rate_reco", {
        method: "POST",
        body: JSON.stringify({
            oeuvre_id: curr_oeuvre.id, 
            rating: rating, 
            medium: document.getElementById("media-select").value
        }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('jwt')
        }
    });
    if (reco_response.status == 401) {
        window.location.href = "/login";
    }
    curr_oeuvre = await reco_response.json();
    refresh_oeuvre();
}