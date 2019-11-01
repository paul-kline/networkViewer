export interface Person {
  interests: string[];
  community: string;
  name: string;
  //node properties.
  data?: { id: string };
  classes?: string[];
}

export interface NodeEsq {
  data: { id: string };
  classes?: string[];
}
export interface EdgeEsq {
  data: { id: string; source: string; target: string };

  classes: string[];
}
