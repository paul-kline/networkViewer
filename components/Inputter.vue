<template>
  <div v-if="values && values.length > 0">
    <div v-for="(val,i) in values" :key="i">
      <v-text-field v-if="val && typeof val.value == 'string'" v-model="val.value" :hint="prompt"></v-text-field>
      <v-switch
        v-else-if="val && typeof val.value == 'boolean'"
        v-model="val.value"
        :label="''+value"
      ></v-switch>
      <div v-else>not string or bool</div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { fetchParsed } from "~/ts/Fetcher";
import { Person, NodeEsq, EdgeEsq } from "~/ts/Types";
import "~/ts/layouts";
import Configuration from "~/ts/Configuration";
import { ArraytoEdges, toNode, toEdge, toClassName } from "~/ts/cytoUtils";
// The @Component decorator indicates the class is a Vue component
@Component({})
export default class ConfigComp extends Vue {
  @Prop({ default: "string" })
  value!: any;
  values: any[] = [];
  @Prop()
  prompt!: string;
  get isString() {
    return typeof this.value == "string";
  }
  get isBool() {
    return typeof this.value == "boolean";
  }
  mounted() {
    console.log("my value is", this.value);
    if (this.value instanceof Array) {
      this.values = this.value.map(v => {
        return { value: v };
      });
    } else {
      this.values = [{ value: this.value }];
    }
    console.log("this.values", this.values);
  }
}
</script>