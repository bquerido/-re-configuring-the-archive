{
  const NODE_SIZE = 7;
  const NODE_MARGIN_RIGHT = 110;
  const NODE_MARGIN_TOP = 31;
  const SPRING_MIN_K = 0.03;
  const SPRING_MAX_K = 0.06;

  const TURBULENCE_STRENGTH = 10;
  const NODE_SPEED = 0.6; // ~ pixels per frame

  const SCREEN_DIMS = {
    x: { min: 0, max: 0 },
    y: { min: 0, max: 0 },
  };

  const state = window.app;
  let node_font = null;
  let cluster_font = null;
  let icons;

  function preload() {
    node_font = loadFont("RobotoMono-Regular.ttf");
    cluster_font = loadFont("Inter-Regular.ttf");
    
    icons = loadImage("/icons/beatriz.gif")
    
  }

  function setup() {
    const viewport = document.getElementById("viewport");
    const viewport_width = viewport.clientWidth;
    const viewport_height = viewport.clientHeight;

    const canvas = createCanvas(viewport_width, viewport_height);
    const main = canvas.elt.parentElement;

    viewport.append(canvas.elt);
    main.remove();

    SCREEN_DIMS.x.min = 0;
    SCREEN_DIMS.x.max = width - NODE_MARGIN_RIGHT;
    SCREEN_DIMS.y.min = NODE_MARGIN_TOP;
    SCREEN_DIMS.y.max = height - NODE_MARGIN_TOP;

    // wait for data
    const wait = window.setInterval(function () {
      //nodes log
      if (state.data !== undefined) {
        window.clearInterval(wait);
        for (let i = 0; i < state.data.length; i++) {
          const item = state.data[i];

          state.nodes.push({
            pos: createVector(
              random(SCREEN_DIMS.x.min, SCREEN_DIMS.x.max),
              random(SCREEN_DIMS.y.min, SCREEN_DIMS.y.max)
            ),
            vel: createVector(random(-1, 1), random(-1, 1))
              .normalize()
              .mult(NODE_SPEED),
            spring: SPRING_MIN_K + Math.random() * SPRING_MAX_K,
          });

          // links
          item["MAIN KEYWORDS"] = item["MAIN KEYWORDS"]
            .split(",")
            .map((word) => word.trim());
          for (link_name of item["MAIN KEYWORDS"]) {
            if (state.links[link_name] === undefined) {
              state.links[link_name] = [];
            }

            state.links[link_name].push(i);
          }

        

          // clusters
          let cluster_name = item["STARTING POINTS"];
          if (!state.clusters[cluster_name]) {
            state.clusters[cluster_name] = {
              pos: createVector(
                random(SCREEN_DIMS.x.min, SCREEN_DIMS.x.max),
                random(SCREEN_DIMS.y.min, SCREEN_DIMS.y.max)
              ),
              items: [],
            };
          }

          state.clusters[cluster_name].items.push(i);
        }
        state.detail = select("#toggle");
        state.detail = select("#detail");
        
      }
    }, 100);

    state.hover = -1;

    smooth();
  }

  function draw() {
    background(249, 249, 250);

    //
    // update elements
    //
    for (let node of state.nodes) {
      if (state.mode.random) {
        node.pos.add(node.vel.normalize());
        node.vel.rotate(random(-0.1, 0.1));

        if (
          node.pos.x < SCREEN_DIMS.x.min ||
          node.pos.x > SCREEN_DIMS.x.max ||
          node.pos.y < SCREEN_DIMS.y.min ||
          node.pos.y > SCREEN_DIMS.y.max
        ) {
          node.vel.mult(-1);
        }
      }
    }

    if (state.mode.group) {
      Object.values(state.clusters).forEach((cluster) => {
        cluster.items.forEach((item) => {
          let node = state.nodes[item];
          node.vel.add(make_spring_vector(node.pos, cluster.pos, node.spring));
          node.vel.add(make_repel_vector(node.pos, cluster.pos));
        });
      });
    }


    //
    // draw elements
    //

    // network mode


    if (state.mode.network) {
      let selected = [];
      let link_names = Object.keys(state.links);
      for (const link_name of link_names) {
        let links = state.links[link_name];
        for (let i = 0; i < links.length; i++) {
          let src = state.nodes[links[i]];
          for (let j = i + 1; j < links.length; j++) {
            let target = state.nodes[links[j]];
            if (link_name === selected) {
              strokeWeight(3);
              stroke(0, 0, 0);
            } else {
              strokeWeight(1);
              stroke(160);
            }
            line(src.pos.x, src.pos.y, target.pos.x, target.pos.y);
            if (mouseX > src.pos.x && mouseX < target.pos.x) {
              if (mouseY > src.pos.y && mouseY < target.pos.y) {
                selected = i;
              }
            }
            
          }
        }
      }
    }



    let new_hover_idx = -1;
    for (let i = 0; i < state.nodes.length; i++) {
      const node = state.nodes[i];
      {
        textFont(node_font);
        textSize(12);
        fill(70);
        noStroke(0);
      }
      square(node.pos.x, node.pos.y, NODE_SIZE);
      text(state.data[i].TITLE, node.pos.x + 16, node.pos.y + 8);

      if (mouseX > node.pos.x - 15 && mouseX < node.pos.x + 50) {
        if (mouseY > node.pos.y - 15 && mouseY < node.pos.y + 15) {
          new_hover_idx = i;
        }
      }
      
      if (mouseIsPressed === true){
      var d = dist (mouseX, mouseY, node.pos.x, node.pos.y);
      if (d < 30){
      window.open(state.data[i].LINK)
      }
      }
    }

    
     
    if (new_hover_idx != state.hover) {
      if (new_hover_idx < 0) {
        app_hide_detail();
        cursor(ARROW);
      }
      else {
        let new_hover_node = state.nodes[new_hover_idx];
        new_hover_node.vel.mult(0);
        cursor(HAND);
        app_show_detail(new_hover_node.pos.x, new_hover_node.pos.y, new_hover_idx);
      }

      let old_hover_node = state.nodes[state.hover];
      old_hover_node && old_hover_node.vel.set(0, 1).rotate(random(TWO_PI));

      state.hover = new_hover_idx;
    }

    function app_show_detail(x, y, i) {
      app.detail.position(x-60, y-14);
      let el = app.detail.elt;
  
      el.classList.add("active");
      el.querySelector(".author").innerText = state.data[i]["AUTHOR"];
      el.querySelector(".keywords").innerText = state.data[i]["MAIN KEYWORDS"];
      el.querySelector(".icon").src = state.data[i]["ICON"];
    }
  
    function app_hide_detail() {
      app.detail.elt.classList.remove("active");
    }

    //group mode
    if (state.mode.group) {
      textFont(node_font);
      textStyle(BOLD);
      strokeWeight(20);
      textSize(15);
      Object.keys(state.clusters).forEach((cluster_name) => {
        let cluster = state.clusters[cluster_name];

        text(cluster_name.toUpperCase(), cluster.pos.x, cluster.pos.y);
      });
    }
  }

  // compute a spring vector from source pos, target pos and spring k
  function make_spring_vector(source, target, k) {
    let vdelta = createVector(target.x - source.x, target.y - source.y);
    return vdelta.mult(k);
  }

  //
  function make_repel_vector(source, target) {
    let d = dist(source.x, source.y, target.x, target.y);
    let v = createVector(target.x - source.x, target.y - source.y);
    return v.normalize().mult(-2.5 * exp(-0.01 * d));
  }

  //window resize
  function windowResized() {
    const viewport = document.getElementById("viewport");
    const viewport_width = viewport.clientWidth;
    const viewport_height = viewport.clientHeight;

    resizeCanvas(viewport_width, viewport_height);
  }
  
};
