<template>
  <div>
    <v-app-bar fixed app dense>
      <v-toolbar-title>Config</v-toolbar-title>
      <v-toolbar-items>
        <v-btn text>
          <nuxt-link to="/NetworkView">NetworkView</nuxt-link>
        </v-btn>
        <v-btn v-on:click="save">Save</v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn text>
          <a
            href="https://docs.google.com/document/d/1Y4gCdoQw9anw77oeqPfxOvcwAM9k4IrXqOUwGYi-6Xg/edit?usp=sharing"
          >New form instructions</a>
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>
    <v-card v-for="s in config" class="mb-1" v-bind:key="s.storageName">
      <v-card-title>
        <v-icon v-if="s.icon" class="mr-2">{{s.icon}}</v-icon>
        {{s.prompt}}
      </v-card-title>
      <div class="container mb-0 mt-0">
        <Inputter v-model="s.value" :prompt="s.storageName"></Inputter>
      </div>
    </v-card>
    <v-btn v-on:click="save">Save</v-btn>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import cytoscape, { Core, CollectionReturnValue } from "cytoscape";
import { fetchParsed } from "~/ts/Fetcher";
import { Person, NodeEsq, EdgeEsq } from "~/ts/Types";
import "~/ts/layouts";
import Configuration from "~/ts/Configuration";
import { ArraytoEdges, toNode, toEdge, toClassName } from "~/ts/cytoUtils";
import Inputter from "~/components/Inputter.vue";
// The @Component decorator indicates the class is a Vue component
@Component({ components: { Inputter } })
export default class ConfigComp extends Vue {
  config = Configuration.getConfig();
  save() {
    console.log("name transformis:", this.config.nameTranslations);
    console.log("CONFIG:", JSON.stringify(this.config));
    this.config.writeout();
    let url = location.origin + location.pathname + "?" + this.config.toURI();
    // window.history.pushState("object or string", "Title", "new url");
    //@ts-ignore
    window.history.replaceState(null, null, "?" + this.config.toURI());

    // location.href = url;
  }
}
</script>