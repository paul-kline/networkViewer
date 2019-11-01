<template>
  <div class="VueToNuxtLogo">
    <v-btn v-on:click="fetchClick">Fetch spreadsheet data</v-btn>
    <v-btn
      v-on:click="withInterest"
      v-if="rawPeople && rawPeople.length > 0"
    >{{showInsterestNodes? "Hide Interests" : "Show Interests" }}</v-btn>
    <v-btn
      v-on:click="communitiesToggle"
      v-if="rawPeople && rawPeople.length > 0"
    >{{showCommunitiesNode? "Hide Communities" : "Show Communities" }}</v-btn>
    <div v-if="rawPeople && rawPeople.length > 0">
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
            <v-btn value="left" depressed v-on="on" v-on:click="doLayout('avsdf')">avsdf</v-btn>
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
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn value="left" depressed v-on="on" v-on:click="doLayout('euler')">euler</v-btn>
          </template>
          <span>a fast, high-quality force-directed (physics simulation) layout</span>
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
import { Person, NodeEsq, EdgeEsq } from "~/ts/Types";
import "~/ts/layouts";
import Vuetify from "vuetify";
Vue.use(Vuetify);

// The @Component decorator indicates the class is a Vue component
@Component({
  // All component options are allowed in here
  template: '<button @click="onClick">Click!</button>'
})
export default class Network1 extends Vue {
  currentLayout: string = "circle";
  showInsterestNodes: boolean = false;
  showCommunitiesNode: boolean = false;
  showPeopleNodes: boolean = false;
  // Initial data can be declared as instance properties
  message: string = "Hello!";
  //@ts-ignore
  cy: Core;
  rawPeople: (Person)[] = [];
  communityNodes: NodeEsq[] = [];
  communityEdges: EdgeEsq[] = [];
  interestsNodes: NodeEsq[] = [];
  interestsEdges: EdgeEsq[] = [];
  interests: string[] = [];
  communityNames: string[] = [];
  // Component methods can be declared as instance methods
  onClick(): void {
    window.alert(this.message);
  }
  mounted() {
    console.log("mounted");
    // this.cy = this.mkCy();
    (window as any).cy = () => this.cy;
  }
  setCommunityEdges(people = this.rawPeople) {
    const edges: any[] = [];
    people.forEach(p => {
      edges.push({
        data: {
          id: p.name + p.community,
          source: p.name,
          target: p.community
        }
      });
    });
    this.communityEdges = edges;
    return edges;
  }
  communitiesToggle() {
    this.showCommunitiesNode = !this.showCommunitiesNode;
    if (this.showCommunitiesNode) {
      if (this.communityNodes.length < 1) {
        this.setCommunityNodes();
      }
      this.cy.add(this.communityNodes as any);
      if (this.communityEdges.length < 1) {
        this.setCommunityEdges();
        this.cy.add(this.communityEdges as any[]);
      }
    } else {
      this.cy.$(".community").remove();
    }
  }
  doLayout(layout: string, customOptions: any = {}) {
    this.currentLayout = layout;
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
        const classes = node._private.classes as Set<string>;
        return classes.has("person") ? 1 : classes.has("interest") ? 500 : 1000;
      },
      transform: function(node: any, position: any) {
        return position;
      }, // transform a given node position. Useful for changing flow direction in discrete layouts
      ...customOptions
    };
    this.cy.layout(options).start();
  }
  mkCy(elements = this.rawPeople): Core {
    return cytoscape({
      container: document.getElementById("cy"), // container to render in

      elements: elements as any[],

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
        },
        {
          selector: ".community",
          style: {
            shape: "rectangle",
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
  /* fetches people data and creates nodes and shows.
   */
  async fetchClick() {
    console.log(new Date());
    const d = await fetchParsed();
    console.log("fetched people:", d);
    this.rawPeople = d;
    d.forEach(item => {
      item.data = { id: item.name };
      item.classes = ["person"];
      console.log("adding item:", item);
    });
    this.showPeopleNodes = true;
    this.initToPeople();
  }
  initToPeople(layout: string = "circle") {
    //initialize graph to people.
    //populates
    this.cy = this.mkCy();
    this.doLayout(layout);
  }
  setCommunityNames(people: Person[] = this.rawPeople) {
    console.log("setting community names");
    const comms: string[] = [];
    people.forEach(p => {
      if (!comms.includes(p.community)) {
        comms.push(p.community);
      }
    });
    this.communityNames = comms;
    console.log(comms);
  }
  /* Iniitalizes communityNodes given people is set.
   */
  setCommunityNodes(people = this.rawPeople): any[] {
    if (this.communityNames.length < 1) {
      this.setCommunityNames();
    }
    const nodes: NodeEsq[] = [];

    this.communityNames.forEach(c => {
      nodes.push({ data: { id: c } });
    });
    this.communityNodes = nodes;
    return nodes;
  }
  /*initializes interestsNodes given people is set*/
  setInterestNodes(interests = this.interests) {
    if (this.interestsNodes.length > 0) {
      console.log("interests nodes already set");
      return;
    }
    interests.forEach(interest => {
      this.interestsNodes.push({
        data: { id: interest },
        classes: ["interest"]
      } as any);
    });
  }
  removeInterestNodes() {
    this.cy.remove(this.cy.$(".interest"));
    console.log("remove interest Nodes placeholder");
  }
  setInterestsEdges(data = this.rawPeople) {
    //draw edges:
    if (this.interestsEdges.length > 0) {
      console.log("interest edges already set. ");
      return;
    }
    const edges: any[] = [];
    console.log("calling setinterest edges with", data);
    data.forEach(datum => {
      datum.interests.forEach((interest: string) => {
        edges.push({
          data: {
            id: datum.name + interest,
            source: datum.name,
            target: interest
          }
        });
      });
    });
    this.interestsEdges = edges;
  }
  async withInterest(data = this.rawPeople) {
    this.showInsterestNodes = !this.showInsterestNodes;
    if (!this.showInsterestNodes) {
      this.removeInterestNodes();
      return;
    }
    if (data.length < 1) {
      console.log("please fetch data first");
    }
    this.populateInterests();
    this.setInterestNodes(this.interests);
    this.cy.add(this.interestsNodes as any[]);
    this.setInterestsEdges();
    console.log("adding interests edges:", this.interestsEdges);
    this.cy.add(this.interestsEdges as any[]);

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
  populateInterests(data = this.rawPeople) {
    //create interests.
    if (!data) {
      console.log("no data yet");
      return;
    }
    if (this.interests.length > 0) {
      console.log("interests string list is already populated ");
      return;
    }
    data.forEach(d => {
      d.interests.forEach((interest: string) => {
        if (!this.interests.includes(interest)) {
          this.interests.push(interest);
        }
      });
    });
    console.log("interests now:", this.interests);
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