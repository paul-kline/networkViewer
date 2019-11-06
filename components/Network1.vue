<template>
  <div class="hard-left">
    <div class="top-bar">
      <v-btn v-on:click="fetchClick">Fetch spreadsheet data</v-btn>
      <v-btn
        v-on:click="toggleInterests"
        v-if="rawPeople && rawPeople.length > 0"
      >{{showInsterestNodes? "Hide Interests" : "Show Interests" }}</v-btn>
      <v-btn
        v-on:click="communitiesToggle"
        v-if="rawPeople && rawPeople.length > 0"
      >{{showCommunitiesNode? "Hide Communities" : "Show Communities" }}</v-btn>
      <v-btn
        v-on:click="toggleRDI"
        v-if="rawPeople && rawPeople.length > 0"
      >{{showRDI? "Hide RDI" : "Show RDI" }}</v-btn>
      <nuxt-link to="/Config">Configuration</nuxt-link>
    </div>
    <v-autocomplete
      dense
      v-if="interests.length > 0 "
      label="Focus Interest"
      :items="interests"
      v-on:change="interestSelected"
    ></v-autocomplete>

    <div class="d-flex flex-row">
      <div v-if="rawPeople && rawPeople.length > 0" class="d-flex flex-column">
        <div class="d-flex flex-column">
          zoom:
          <v-btn v-on:click="cy.zoom(cy.zoom() + 0.05)">+</v-btn>
          <v-btn v-on:click="cy.zoom(cy.zoom() - 0.05)">-</v-btn>
        </div>Layout Options
        <v-item-group
          v-model="layoutButton"
          tile
          color="deep-purple accent-3"
          single
          class="d-flex flex-column"
        >
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
        </v-item-group>
      </div>
      <div id="cy"></div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import cytoscape, { Core, CollectionReturnValue } from "cytoscape";
import { fetchParsed } from "~/ts/Fetcher";
import { Person, NodeEsq, EdgeEsq } from "~/ts/Types";
import "~/ts/layouts";

import { ArraytoEdges, toNode, toEdge, toClassName } from "~/ts/cytoUtils";
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
  showRDI: boolean = false;
  // Initial data can be declared as instance properties
  message: string = "Hello!";
  rawPeople: (Person)[] = [];
  //@ts-ignore
  cy: Core;
  layoutButton: any = null;
  communityNodes: NodeEsq[] = [];
  communityEdges: EdgeEsq[] = [];
  interestsNodes: NodeEsq[] = [];
  interestsEdges: EdgeEsq[] = [];
  rdiNode: NodeEsq = toNode("RDI", ["rdi"]);
  rdiEdges: EdgeEsq[] = [];
  interests: string[] = [];
  focusedElements: any = null;
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
  interestSelected(x: string) {
    console.log("new selection:", x);
    //clear last selection
    console.log("removing old focused");
    //@ts-ignore
    this.cy.$(".focused").removeClass("focused");
    if (x == "None") {
      console.log("None selected: nothing to do");
      return;
    }

    console.log("selecting:", "." + toClassName(x));
    const selection = this.cy.nodes("." + toClassName(x));

    //@ts-ignore
    const fl = this.cy.$().floydWarshall();
    for (let i = 0; i < selection.length - 1; i++) {
      for (let j = i + 1; j < selection.length; j++) {
        const path: CollectionReturnValue = fl.path(selection[i], selection[j]);
        // console.log(path);
        path.addClass("focused");
      }
    }
  }
  populateRDIEdges() {
    if (this.rdiEdges.length > 0) {
      console.log("rdi edges already populated: aborting");
      return;
    }
    console.log("populating rdi edges");
    this.rdiEdges = ArraytoEdges(
      x => x + "RDI",
      x => x,
      x => "RDI",
      this.communityNames,
      ["rdi-edge"]
    );
    console.log("rdi edges", this.rdiEdges);
    this.cy.add(this.rdiEdges as any[]);
  }
  showRDINode() {
    this.cy.add(this.rdiNode as any); // must be before edges;
    if (this.rdiEdges.length < 1) {
      this.populateRDIEdges();
    }
    this.cy.add(this.rdiEdges as any[]);
  }
  hideRDINode() {
    this.cy.$(".rdi").remove();
    this.cy.$(".rdi-edge").remove();
  }
  toggleRDI() {
    this.showRDI = !this.showRDI;
    if (this.showRDI) {
      this.showRDINode();
    } else {
      this.hideRDINode();
    }
    this.layoutHook();
  }
  setCommunityEdges(people = this.rawPeople) {
    const edges: any[] = [];
    people.forEach(p => {
      edges.push(
        toEdge(p.name + p.community, p.name, p.community, ["community-edge"])
      );
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
      }
      this.cy.add(this.communityEdges as any[]);
    } else {
      this.cy.$(".community").remove();
      this.cy.$(".community-edge").remove();
    }
    setTimeout(() => {
      this.layoutHook();
    }, 200);
  }
  doLayout(layout: string, customOptions: any = {}, duration: number = 1000) {
    if (layout == "euler") {
      //there is an infinite loop thanks to programmer if any node
      // has identical locations.
      this.doLayout("circle", null, 0);
    }
    this.currentLayout = layout;
    const options = {
      name: layout,

      fit: true, // whether to fit to viewport
      padding: 30, // fit padding
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      animate: true, // whether to transition the node positions
      animationDuration: duration, // duration of animation in ms if enabled
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
        return classes.has("person")
          ? 1
          : classes.has("community")
          ? 10
          : classes.has("interest")
          ? 100
          : classes.has("rdi")
          ? 1000
          : 0;
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
          selector: ".rdi",
          style: {
            shape: "star",
            width: "6em", //"label",
            height: "6em", //"label",
            "background-color": "#666",
            "background-height": "130%",
            "text-wrap": "wrap",
            "text-halign": "center",
            opacity: 0.5,
            "text-max-width": "40px",
            "text-valign": "center",
            "font-size": "1em",
            color: "white",
            label: "The Mission"
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
        },
        {
          selector: ".focused",
          style: {
            "border-width": "0.2em",
            "border-color": "yellow",
            "line-color": "yellow"
          }
        }
      ],

      layout: {
        name: "grid",
        rows: 1
      }
    });
  }
  /** adds optional fields to make valid node objects */
  nodifyPeople(people = this.rawPeople): Person[] {
    people.forEach(p => {
      p.data = { id: p.name };
      p.classes = ["person", ...p.interests.map(i => toClassName(i))];
    });
    return people;
  }
  /* fetches people data and creates nodes and shows.
   */
  async fetchClick() {
    const d = await fetchParsed();
    console.log("fetched people:", d);
    this.rawPeople = d;
    this.nodifyPeople();
    this.showPeopleNodes = true;
    this.initGraphToPeople();
    this.populateInterests();
  }
  initGraphToPeople(layout: string = this.currentLayout) {
    //initialize graph to people.
    //populates
    this.cy = this.mkCy();
    this.doLayout(layout);
    this.currentLayout = "cola";
  }
  layoutHook() {
    this.doLayout(this.currentLayout);
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
      nodes.push({ data: { id: c }, classes: ["community"] });
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
      if (interest.toLowerCase() == "none") return;
      this.interestsNodes.push({
        data: { id: interest },
        classes: ["interest"]
      } as any);
    });
  }
  removeInterestNodes() {
    this.cy.remove(this.cy.$(".interest"));
    this.cy.remove(this.cy.$(".interest-edge"));
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
        edges.push(
          toEdge(datum.name + interest, datum.name, interest, ["interest-edge"])
        );
      });
    });
    this.interestsEdges = edges;
  }
  addInterestNodes() {
    this.populateInterests();

    this.setInterestNodes(this.interests);
    this.cy.add(this.interestsNodes as any[]);
    this.setInterestsEdges();
    console.log("adding interests edges:", this.interestsEdges);
    this.cy.add(this.interestsEdges as any[]);
    this.layoutHook();
  }
  async toggleInterests() {
    this.showInsterestNodes = !this.showInsterestNodes;
    if (!this.showInsterestNodes) {
      this.removeInterestNodes();
    } else {
      this.addInterestNodes();
    }
    this.layoutHook();
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
    this.interests.push("None");
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
  height: 85vh;
  display: block;
  border: 1px;
  border-style: solid;
}
.hard-lefter {
  position: absolute;
  left: 10px;
}
</style>