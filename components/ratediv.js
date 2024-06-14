/**
 * @typedef {Object} RateButton
 * @property {number} rating 
 * @property {HTMLButtonElement} button
 */

fetch("components/ratediv.html")
    .then(stream => stream.text())
    .then(html => {
        class RateDiv extends HTMLElement {
            /**
             * @param {(number) => void} callback
             */
            set on_rate(callback) {
                this._on_rate = callback;
                for(const {rating, button} of this._rate_buttons) {
                    button.addEventListener("click", () => callback(rating));
                }
            }
    
            constructor() {
                super();

                var shadow = this.attachShadow({mode: 'open'});
                shadow.innerHTML = html;

                // Inner div containing the 4 rating buttons
                let rating_div = shadow.children[0].children[0];

                /** @type {RateButton[]} @private */
                this._rate_buttons = [];
                console.log("???");
                for(const rating of [2, 1, -1, -2]) {
                    const rate_button = createRateButton(rating);
                    rating_div.appendChild(rate_button);
                    this._rate_buttons.push({rating: rating, button: rate_button});
                }
                const skip_button = createRateButton(0);
                shadow.children[0].appendChild(skip_button);
                this._rate_buttons.push({rating: 0, button: skip_button});
            }
        }
    
        customElements.define('x-ratediv', RateDiv);
    });


/**
 * @param {number} rating the rating value associated with the button
 * @returns {HTMLButtonElement} the rating button
 */
function createRateButton(rating) {
    let res = document.createElement("button");
    if (rating === 0) {
        res.innerText = "Skip";
        res.style.fontSize = "1em";
        return res;
    }

    res.className = "rate-button";
    if (rating === 2) {
        res.innerText = "🤩";
    } else if (rating === 1) {
        res.innerText = "🙂";
    } else if (rating === -1) {
        res.innerText = "🤷";
    } else if (rating === -2) {
        res.innerText = "😕";
    }
    return res;
}