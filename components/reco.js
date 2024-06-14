fetch("components/reco.html")
    .then(stream => stream.text())
    .then(html => {
        class Reco extends HTMLElement {
            /**
             * @param {(number) => void} callback
             */
            set on_rate(callback) {
                this.querySelector("#ratediv").on_rate = callback;
            }
    
            constructor() {
                super();
    
                var shadow = this.attachShadow({mode: 'open'});
                shadow.innerHTML = html;
            }
        }
    
        customElements.define('x-reco', Reco);
    });
