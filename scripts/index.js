/**
 * @typedef {import('../typedefs/oeuvre.js').Oeuvre} Oeuvre
 */
/** @type {Oeuvre} */
let curr_oeuvre = null;
/** @type {Oeuvre[]} */
let searched_oeuvres = [];
const Page = {
    Loading: "loading",
    Reco: "reco-div",
    RecoError: "reco-error",
    SearchResults: "search-results",
    SearchError: "search-error",
}
const pages = [Page.Loading, Page.Reco, Page.RecoError, Page.SearchResults, Page.SearchError];
const Anim = {
    In: "slide-in",
    Out: "slide-out"
};
let last_search = 0;

window.onload = async function() {
    const medium = localStorage.getItem("medium");
    if (medium !== null) {
        document.getElementById("media-select").value = medium;
    }
    // setup link to profile with stored username
    document.getElementById("profile-link").href = "/profile.html?n="+localStorage.getItem("username");
    // get a reco
    await get_reco();
};

/** @param {string} id @param {bool} animate */
function show_page(id, animate = false) {
    for(const page_id of pages) {
        const page = document.getElementById(page_id);
        if (page.style.display === "flex" && !page.classList.contains(Anim.Out)) {
            page.classList.remove(Anim.In);
            if (animate) {
                page.classList.add(Anim.Out);
            } else {
                page.style.display = "none";
            }
        } else if (page_id === id) {
            page.classList.remove(Anim.Out);
            page.style.display = "flex";
            if (animate) {
                page.classList.add(Anim.In);
            }
        }
    }
}

function refresh_oeuvre() {
    const reco = document.getElementById("reco");
    reco.oeuvre = curr_oeuvre;
    reco.on_rate = function(rating) {
        show_page(Page.Loading, true);
        reco_worker(function() {
            reco.oeuvre = {...curr_oeuvre, user_rating: rating};
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
}

async function reco_worker(request) {
    const reco_response = await request();
    console.log(reco_response.status);
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
    show_page(Page.Loading);
    await reco_worker(function() {
        return fetch(back_url+"/reco/"+document.getElementById("media-select").value, {
            headers: {
                "Authorization": localStorage.getItem("jwt")
            }
        });
    });
}

async function display_search_result() {
    document.getElementById("search-results").innerHTML = "";
    for(const oeuvre of searched_oeuvres) {
        let rateable = document.createElement("x-rateable");
        rateable.oeuvre = oeuvre;
        rateable.on_rate = async function(rating) {
            await update_rating(oeuvre.id, rating);
            oeuvre.user_rating = rating;
            display_search_result();
        }
        document.getElementById("search-results").appendChild(rateable);
    }
}

async function on_search() {
    let timestamp = Date.now();
    last_search = timestamp;
    localStorage.setItem("medium", document.getElementById("media-select").value);
    let query = document.getElementById("search").value.trim();
    if (query.length === 0) {
        searched_oeuvres = [];
        await get_reco();
        return;
    }
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