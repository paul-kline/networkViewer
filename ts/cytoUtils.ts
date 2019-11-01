import { NodeEsq, EdgeEsq } from "./Types";
export function toNode(id: string, classes: string[] = []): NodeEsq {
  return { data: { id: id }, classes: classes };
}
export function toNodes(idGetter: (x: any) => string, data: any[], classes: string[] = []): NodeEsq[] {
  return data.map(d => toNode(idGetter(d), classes));
}

export function toEdge(id: string, source: string, target: string, classes: string[] = []): EdgeEsq {
  const x: any = toNode(id, classes);
  x.data.source = source;
  x.data.target = target;
  return x;
}
export function toEdges(
  idGetter: (x: any) => string,
  sourceGetter: (x: any) => string,
  targetGetter: (x: any) => string,
  data: any[],
  classes: string[] = []
) {
  return data.map(d => toEdge(idGetter(d), sourceGetter(d), targetGetter(d), classes));
}
