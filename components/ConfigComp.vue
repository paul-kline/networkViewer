<template>
  <div>
    <v-card v-for="s in config" class="mb-1" v-bind:key="s.storageName">
      <v-card-title>{{s.prompt}}</v-card-title>
      <div class="container">
        <Inputter v-model="s.value" :prompt="s.storageName"></Inputter>
      </div>
    </v-card>
    <div>hello config view</div>
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
}
</script>