import { NodeEsq, EdgeEsq } from "./Types";
import { Core } from "cytoscape";
export function toNode(id: string, classes: string[] = []): NodeEsq {
  return { data: { id: id }, classes: classes };
}
export function toNodes(idGetter: (x: any) => string, data: any[], classes: string[] = []): NodeEsq[] {
  return data.map(d => toNode(idGetter(d), classes));
}
export function toClassName(str: string): string {
  return str
    .trim()
    .replace(/[a-z][A-Z]/g, m => m[0] + "-" + m[1].toLowerCase())
    .replace(/\s/g, "-")
    .replace(/[A-Z]/g, m => m.toLowerCase())
    .replace(/\//g, "-");
}
export function toEdge(id: string, source: string, target: string, classes: string[] = []): EdgeEsq {
  const x: any = toNode(id, classes);
  x.data.source = source;
  x.data.target = target;
  return x;
}
export function ArraytoEdges(
  idGetter: (x: any) => string,
  sourceGetter: (x: any) => string,
  targetGetter: (x: any) => string,
  data: any[],
  classes: string[] = []
) {
  return data.map(d => toEdge(idGetter(d), sourceGetter(d), targetGetter(d), classes));
}
function arrayify(x: any | any[]) {
  return x instanceof Array ? x : [x];
}
export function mkEdges(source: NodeEsq | NodeEsq[], target: NodeEsq | NodeEsq[]): EdgeEsq[] {
  const sources: NodeEsq[] = arrayify(source);
  const targets: NodeEsq[] = arrayify(target);
  const edges: EdgeEsq[] = [];
  sources.forEach(s => {
    targets.forEach(t => {
      edges.push(toEdge(s.data.id + t.data.id, s.data.id, t.data.id));
    });
  });
  return edges;
}
