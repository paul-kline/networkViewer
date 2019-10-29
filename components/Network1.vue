<template>
  <div class="VueToNuxtLogo">
    <v-btn v-on:click="fetchClick">Fetch spreadsheet data</v-btn>
    <v-btn v-on:click="withInterest" v-if="data && data.length > 0">Show Interests</v-btn>
    <div v-if="data && data.length > 0">
      Layout Options
      <div tile color="deep-purple accent-3" single>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn value="left" depressed v-on="on" v-on:click="doLayout('circle')">circle</v-btn>
          </template>
          <span>Circular</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn value="left" depressed v-on="on" v-on:click="doLayout('concentric')">concentric</v-btn>
          </template>
          <span>Interests in the middle</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn value="left" depressed v-on="on" v-on:click="doLayout('cola')">cola</v-btn>
          </template>
          <span>physics simulation layout</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn value="left" depressed v-on="on" v-on:click="doLayout('asvdf')">asvdf</v-btn>
          </template>
          <span>organises nodes in a circle and tries to minimise edge crossings as much as possible</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn value="left" depressed v-on="on" v-on:click="doLayout('spread')">spread</v-btn>
          </template>
          <span>tries to use all the viewport space</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn value="left" depressed v-on="on" v-on:click="doLayout('cise')">cise</v-btn>
          </template>
          <span>creates circular clusters and uses a physics simulation to create distance between the clusters</span>
        </v-tooltip>
      </div>
    </div>
    <div>
      zoom:
      <v-btn v-on:click="cy.zoom(cy.zoom() + 0.05)">+</v-btn>
      <v-btn v-on:click="cy.zoom(cy.zoom() - 0.05)">-</v-btn>
    </div>
    <div id="cy"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import cytoscape, { Core } from "cytoscape";
import { fetchParsed } from "~/ts/Fetcher";
import Vuetify from "vuetify";
Vue.use(Vuetify);
//@ts-ignore
import cola from "cytoscape-cola";
cytoscape.use(cola);
// https://github.com/iVis-at-Bilkent/cytoscape.js-avsdf
//@ts-ignore
import avsdf from "cytoscape-avsdf";
cytoscape.use(avsdf);
//https://github.com/cytoscape/cytoscape.js-spread
//@ts-ignore
import spread from "cytoscape-spread";
cytoscape.use(spread);

//github.com/iVis-at-Bilkent/cytoscape.js-cise
//@ts-ignore
import cise from "cytoscape-cise";
cytoscape.use(cise);

// The @Component decorator indicates the class is a Vue component
@Component({
  // All component options are allowed in here
  template: '<button @click="onClick">Click!</button>'
})
export default class MyComponent extends Vue {
  text: string = "center";
  // Initial data can be declared as instance properties
  message: string = "Hello!";
  //@ts-ignore
  cy: Core;
  data: any[] = [];
  interests: string[] = [];
  // Component methods can be declared as instance methods
  onClick(): void {
    window.alert(this.message);
  }
  mounted() {
    console.log("mounted");
    // this.cy = this.mkCy();
  }
  doLayout(layout: string) {
    const options = {
      name: layout,

      fit: true, // whether to fit to viewport
      padding: 30, // fit padding
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      animate: true, // whether to transition the node positions
      animationDuration: 1000, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      //@ts-ignore
      animateFilter: function(node, i) {
        return true;
      }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      concentric: function(node: any) {
        console.log((node._private.classes as Set<string>).has("person"));
        return (node._private.classes as Set<string>).has("person")
          ? 1
          : 100000;
      },
      transform: function(node: any, position: any) {
        return position;
      } // transform a given node position. Useful for changing flow direction in discrete layouts
    };
    this.cy.layout(options).start();
  }
  mkCy(
    elements = [
      // list of graph elements to start with
      {
        // node a
        data: { id: "a" }
      },
      {
        // node b
        data: { id: "b" }
      },
      {
        // edge ab
        data: { id: "ab", source: "a", target: "b" }
      }
    ]
  ): Core {
    return cytoscape({
      container: document.getElementById("cy"), // container to render in

      elements: elements,

      style: [
        // the stylesheet for the graph
        {
          selector: "node",
          style: {
            "background-color": "#666",
            shape: "rectangle",
            label: "data(id)"
          }
        },

        {
          selector: "edge",
          style: {
            width: 1.5,
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle"
          }
        },
        {
          selector: ".person",
          style: {
            "background-color": "#000",
            shape: "ellipse",
            label: "data(id)",
            color: "white"
          }
        },
        {
          selector: ".interest",
          style: {
            shape: "round-rectangle",
            width: "label",
            height: "label",
            "background-color": "#666",
            // "background-height": "130%",
            "text-wrap": "wrap",
            "text-halign": "center",
            opacity: 0.5,
            "text-max-width": "100px",
            "text-valign": "center",
            "font-size": "1em",
            color: "white",
            label: "data(id)"
          }
        }
      ],

      layout: {
        name: "grid",
        rows: 1
      }
    });
  }
  async fetchClick() {
    console.log(new Date());
    const d = await fetchParsed();
    d.forEach(item => {
      item.data = { id: item.name };
      item.classes = ["person"];
      console.log("adding item:", item);
    });
    this.data = d;
    this.mkCy(d);
    // this.cy.add(d);
    console.log("network recieved:", d);
    this.cy = this.mkCy(d);
    this.doLayout("circle");
  }
  async withInterest() {
    if (this.data.length < 1) {
      await this.fetchClick();
    }
    this.populateInterests();
    this.interests.forEach(interest => {
      this.cy.add({ data: { id: interest }, classes: ["interest"] } as any);
    });
    //draw edges:
    const edges: any[] = [];
    this.data.forEach(data => {
      data.interests.forEach((interest: string) => {
        edges.push({
          data: {
            id: data.name + interest,
            source: data.name,
            target: interest
          }
        });
      });
    });
    console.log("adding edges:", edges);
    this.cy.add(edges);
    this.cy
      .layout({
        // name: "cola",
        name: "avsdf",

        fit: true, // whether to fit to viewport
        padding: 30, // fit padding
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        animate: true, // whether to transition the node positions
        animationDuration: 1000, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled
        // animateFilter: function(node: any, i: number) {
        //   return true;
        // }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
        ready: undefined, // callback on layoutready
        stop: undefined // callback on layoutstop
        // transform: function(node, position) {
        //   return position;
        // } // transform a given node position. Useful for changing flow direction in discrete layouts
      })
      .start();
  }
  populateInterests() {
    //create interests.
    if (!this.data) {
      console.log("no data yet");
      return;
    }
    this.data.forEach(d => {
      d.interests.forEach((interest: string) => {
        if (!this.interests.includes(interest)) {
          this.interests.push(interest);
        }
      });
    });
  }
}
</script>

<style >
#cy {
  width: 90vw;
  height: 80vh;
  display: block;
  border: 1px;
  border-style: solid;
}
</style>