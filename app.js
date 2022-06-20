{
    window.app = {
        mode: {
            random: true,
            group: false,
            network: false
        },
        nodes: [],
        links: {},
        clusters: {}
    }

    fetch("projetos.json")
        .then(response => response.json())
        .then(data => init(data));

    function init(data) {
        window.app.data = data;

        // filter buttons
        document.querySelectorAll(".topnav input")
          .forEach(function(button) {
            button.addEventListener("change", function(ev) {
                update({action: "mode-changed", value: [ev.target.id, ev.target.checked]});
            });
        });
        
        display();
    }

    function update(action) {
        const state = window.app;

        if (action.action === "mode-changed") {
            if (action.value[0] === "mode-random") {
                state.mode.random = action.value[1];
            }
            else if (action.value[0] === "mode-grouped") {
                state.mode.group = action.value[1];
            }
            else if (action.value[0] === "mode-network") {
                state.mode.network = action.value[1];
            }
            else {
                console.log("unkown mode changed");
            }
        }       

        display();
    }

    function display() {

        const state = window.app;

        const divs = document.querySelectorAll("div.projectdots");

        if (state.mode.random) {
        }

        if (state.mode.group) {
        }
  
        if (state.mode.network) {
            document.querySelector("#network-keywords").style.visibility = "visible";
        }
        else {
            document.querySelector("#network-keywords").style.visibility = "hidden";
        }    
    }    
}
