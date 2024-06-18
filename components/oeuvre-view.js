/**
 * @typedef {import('./ratediv.js').RateDiv} RateDiv
 */
/**
 * @typedef {import('../typedefs/oeuvre.js').Oeuvre} Oeuvre
 */

let reco_html = "";
let rateable_html = "";

fetch("components/reco.html")
    .then(stream => stream.text())
    .then(loaded_html => {
        reco_html = loaded_html;
        customElements.define('x-reco', Reco);
    });

fetch("components/rateable.html")
    .then(stream => stream.text())
    .then(loaded_html => {
        rateable_html = loaded_html;
        customElements.define('x-rateable', Rateable);
    });

class OeuvreView extends HTMLElement {
    /**
     * @returns { RateDiv } the custom element containing the rating buttons
     */
    get rateDiv() {
        return this.shadowRoot.getElementById("ratediv");
    }

    /**
     * @param { Oeuvre } oeuvre
     */
    set oeuvre(oeuvre) {
        this.shadowRoot.getElementById("title").innerText = oeuvre.title;
        this.shadowRoot.getElementById("picture").src = oeuvre.picture;
        let rating = this.shadowRoot.getElementById("rating");
        if (rating !== null) {
            rating.innerText = oeuvre.rating;
        }
        if (oeuvre.user_rating !== null) {
            this.rateDiv.selected_rating = oeuvre.user_rating;
        }
        let synopsis = this.shadowRoot.getElementById("synopsis");
        if (synopsis !== null && oeuvre.synopsis) {
            synopsis.innerText = oeuvre.synopsis;
        }
    }

    /**
     * @param {bool} disabled
     */
    set disabled(disabled) {
        this.rateDiv.disabled = disabled;
    }

    /**
     * @param {(number) => void} callback
     */
    set on_rate(callback) {
        this.rateDiv.on_rate = callback;
    }

    constructor() {
        super();
    }
}

class Reco extends OeuvreView {
    constructor() {
        super();

        var shadow = this.attachShadow({mode: 'open'});
        shadow.innerHTML = reco_html;
    }
}

class Rateable extends OeuvreView {
    constructor() {
        super();

        var shadow = this.attachShadow({mode: 'open'});
        shadow.innerHTML = rateable_html;
    }
}