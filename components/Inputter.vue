<template>
  <div v-if="values && values.length > 0">
    <div v-for="(val,i) in values" :key="i">
      <div class="d-flex">
        <v-text-field
          v-if="typeof values[i] == 'string'"
          v-model="values[i]"
          v-on:input="update(values[i],i)"
          :hint="prompt"
        ></v-text-field>
        <v-switch
          color="info"
          v-else-if="typeof values[i] == 'boolean'"
          v-model="values[i]"
          v-on:change="update()"
          :label="''+values[i]"
        ></v-switch>
        <v-btn icon v-if="value instanceof Array && values.length > 1" v-on:click="deleteEntry(i)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </div>
    <v-btn icon v-if="value instanceof Array" v-on:click="addEntry">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
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
  wasArray = false;
  @Prop()
  prompt!: string;
  get isString() {
    return typeof this.value == "string";
  }
  get isBool() {
    return typeof this.value == "boolean";
  }
  clone<T>(x: T): T {
    return JSON.parse(JSON.stringify(x)) as T;
  }
  update(v?: any, i?: number) {
    if (v && (v || v === 0)) {
    }
    if (this.wasArray) {
      console.log(this.value);
      this.$emit("input", this.value);
    } else {
      console.log(this.values[0]);

      this.$emit("input", this.values[0]);
    }
  }
  addEntry() {
    this.values.push(this.clone(this.values[this.values.length - 1]));
    this.update();
  }
  deleteEntry(i: number) {
    console.log("want to delete:", i);
    this.values.splice(i, 1);
    this.update();
  }
  mounted() {
    console.log("my value is", this.value);
    if (this.value instanceof Array) {
      //this.values = this.value.map(v => {
      //  return { value: v };
      //});
      this.wasArray = true;
      this.values = this.value;
    } else {
      //this.values = [{ value: this.value }];
      this.values = [this.value];
    }
    console.log("this.values", this.values);
  }
}
</script>