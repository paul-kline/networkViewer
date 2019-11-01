import { NodeEsq } from "./Types";
export function toNode(id: string, classes: string[] = []): NodeEsq {
  return { data: { id: id }, classes: classes };
}
export function toNodes(idGetter: (x: any) => string, classes: string[] = [], data: any[]): NodeEsq[] {
  return data.map(d => toNode(idGetter(d), classes));
}
