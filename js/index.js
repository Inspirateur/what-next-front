const back_url = "http://127.0.0.1:8000";
let curr_oeuvre = null;
let searched_oeuvres = [];
const Page = {
    Loading: "loading",
    Reco: "reco",
    RecoError: "reco-error",
    SearchResults: "search-results",
    SearchError: "search-error",
}
const pages = [Page.Loading, Page.Reco, Page.RecoError, Page.SearchResults, Page.SearchError];
let last_search = 0;

window.onload = async function() {
    // setup link to profile with stored username
    document.getElementById("profile-link").href = "/profile.html?n="+localStorage.getItem("username");
    // get a reco
    await get_reco();
};

function show_page(id) {
    for(const page_id of pages) {
        document.getElementById(page_id).style.display = page_id === id 
            ? "flex" : "none"; 
    }
}

function refresh_oeuvre() {
    document.getElementById("title").innerText = curr_oeuvre.title;
    document.getElementById("picture").src = curr_oeuvre.picture != "" 
        ? curr_oeuvre.picture : "placeholder.jpg";
    document.getElementById("rating").innerText = curr_oeuvre.rating;
    document.getElementById("synopsis").innerText = curr_oeuvre.synopsis;
}

async function reco_worker(request) {
    show_page(Page.Loading);
    const reco_response = await request();
    if (reco_response.status == 401) {
        window.location.href = "/login";
    } else if (reco_response.status == 404) {
        show_page(Page.RecoError);
    } else {
        curr_oeuvre = await reco_response.json();
        refresh_oeuvre();
        show_page(Page.Reco);
    }
}

async function get_reco() {
    await reco_worker(function() {
        return fetch(back_url+"/reco/"+document.getElementById("media-select").value, {
            headers: {
                "Authorization": localStorage.getItem("jwt")
            }
        });
    });
}

async function rate_oeuvre(rating) {
    await reco_worker(function() {
        return fetch(back_url+"/rate_reco", {
            method: "POST",
            body: JSON.stringify({
                oeuvre_id: curr_oeuvre.id, 
                rating: rating, 
                medium: document.getElementById("media-select").value
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("jwt")
            }
        });
    });
}

async function display_search_result() {
    document.getElementById("search-results").innerHTML = "";
    for(const oeuvre of searched_oeuvres) {
        document.getElementById("search-results").appendChild(elem_from_oeuvre(oeuvre, display_search_result, true));
    }
}

async function on_search() {
    let query = document.getElementById("search").value.trim();
    if (query.length === 0) {
        searched_oeuvres = [];
        await get_reco();
        return;
    }
    let timestamp = Date.now();
    last_search = timestamp;
    if (searched_oeuvres.length === 0) {
        show_page(Page.Loading);
    }
    let medium = document.getElementById("media-select").value;
    const search_response = await fetch(`${back_url}/search/${medium}/${query}`, {
        method: "GET",
        headers: {
            "Authorization": localStorage.getItem("jwt")
        }
    });
    if (timestamp < last_search) { return; }
    if (!search_response.ok) {
        show_page("none");
        return;
    }
    searched_oeuvres = await search_response.json();
    if (searched_oeuvres.length === 0) {
        show_page(Page.SearchError);
    } else {
        show_page(Page.SearchResults);
        await display_search_result();
    }
}