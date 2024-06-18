// const back_url = "https://whats-next.xyz:8000";
const back_url = "http://127.0.0.1:8000";

/**
 * @param {number} oeuvre_id 
 * @param {number} new_rating 
 */
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
