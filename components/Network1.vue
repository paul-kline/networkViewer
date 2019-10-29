<template>
  <div class="VueToNuxtLogo">
    network view
    <v-btn v-on:click="fetchClick">Fetch data</v-btn>

    <div id="cy"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import cytoscape, { Core } from "cytoscape";
import { fetchParsed } from "~/ts/Fetcher";

// The @Component decorator indicates the class is a Vue component
@Component({
  // All component options are allowed in here
  template: '<button @click="onClick">Click!</button>'
})
export default class MyComponent extends Vue {
  // Initial data can be declared as instance properties
  message: string = "Hello!";
  cy: Core;
  data: any[] = [];
  // Component methods can be declared as instance methods
  onClick(): void {
    window.alert(this.message);
  }
  mounted() {
    console.log("mounted");
    // this.cy = this.mkCy();
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
            label: "data(id)"
          }
        },

        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle"
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
      console.log("adding item:", item);
    });
    this.data = d;
    this.mkCy(d);
    // this.cy.add(d);
    console.log("network recieved:", d);
    this.cy = this.mkCy(d);
    const options = {
      name: "random",

      fit: true, // whether to fit to viewport
      padding: 30, // fit padding
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      animateFilter: function(node, i) {
        return true;
      }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function(node, position) {
        return position;
      } // transform a given node position. Useful for changing flow direction in discrete layouts
    };
    this.cy.layout({ name: "grid" }).run();
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