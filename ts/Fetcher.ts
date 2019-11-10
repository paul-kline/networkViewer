import { Person } from "./Types";
import url from "url";
import Configuration from "~/ts/Configuration";
// const config = Configuration.getConfig();
const query = getParams();
const ENDPOINT =
  (query && (query.endpoint as string)) ||
  "https://script.google.com/macros/s/AKfycbya1pA6RSvSbnvHqC4ccp0LGZAA4x-a9G5ltSW-G0bAhSVzgNnJ/exec";
const SHEET = (query && (query.sheet as string)) || "Form Responses 1";

export function getParams() {
  if (window && window.location && window.location.href) {
    return url.parse(window.location.href, true).query;
  }
  return null;
}
export async function fetchjson(url: string = ENDPOINT, sheet: string = SHEET): Promise<any> {
  const config = Configuration.getConfig();
  const r1 = await fetch(url + "?name=" + sheet);
  const r2 = await r1.json();
  console.log("fetch result", r2);
  console.log("tobojs: ", fromArrays(r2));
  const conversions = mkConversions(config);
  console.log("CONVERTED: ", convertIntereststoArray(convertObjs(fromArrays(r2), conversions)));
  return r2;
}
function mkConversions(config: Configuration) {
  const r: any = {};
  //name questions:
  config.nameTranslations.value.forEach(q => {
    r[q] = "name";
  });
  //interests question.
  config.interestsTranslations.value.forEach(q => {
    r[q] = "interests";
  });
  //community question.
  config.communityTranslations.value.forEach(q => {
    r[q] = "community";
  });
}
export async function fetchParsed(url: string = ENDPOINT, sheet: string = SHEET): Promise<Person[]> {
  console.log("fetching sheet", sheet, query);
  const jsondata = await fetchjson(url, sheet);
  return toPeople(jsondata);
}

/* 
converts raw 2d array where first row is field names and rest are values 
into objects with first row keys
*/
function fromArrays(data: any[][]): any[] {
  const headers: string[] = data[0];
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj: any = {};
    row.forEach((cell, i) => {
      obj[headers[i]] = cell;
    });
    result.push(obj);
  }
  return result;
}

const DEFAULTCONVERSIONS = {
  "What is your name?": "name",
  "What community do you represent?": "community",
  "What are you working on in your community? (Pick 3)": "interests"
};
/*
meant to convert the question key fields into shorter field names
*/
function convertObjs(data: any[], conversions: any = DEFAULTCONVERSIONS): any[] {
  return data.map(d => convertObj(d, conversions));
}
function convertObj(datum: any, conversions: any = DEFAULTCONVERSIONS) {
  for (const key in conversions) {
    if (datum[key]) {
      datum[conversions[key]] = datum[key];
      delete datum[key];
    }
  }
  return datum;
}
export function toPeople(data: any[]): Person[] {
  return convertIntereststoArray(convertObjs(fromArrays(data))) as Person[];
}
function conversion<T extends any>(obj: T, keys: string[], replaceWith: string): T {
  keys.forEach(k => {
    if (obj[k]) {
      obj[replaceWith] = obj[k];
      delete obj[k];
    }
  });
  return obj;
}
/*
converts the interests property comma seperated list into an array 
*/
function convertIntereststoArray(data: any[]): Object[] {
  const INTERESTSKEY = "interests";
  data.forEach(obj => {
    if (obj[INTERESTSKEY]) {
      obj[INTERESTSKEY] = obj[INTERESTSKEY].split(",").map((x: string) => x.trim());
    } else {
      obj[INTERESTSKEY] = [];
    }
  });
  return data;
}
