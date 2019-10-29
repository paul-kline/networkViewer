const ENDPOINT = "https://script.google.com/macros/s/AKfycbya1pA6RSvSbnvHqC4ccp0LGZAA4x-a9G5ltSW-G0bAhSVzgNnJ/exec";
const SHEET = "Form Responses 1";

export async function fetchjson(url: string = ENDPOINT, sheet: string = SHEET): Promise<any> {
  const r1 = await fetch(url);
  const r2 = await r1.json();
  console.log("fetch result", r2);
  console.log("tobojs: ", fromArrays(r2));
  console.log("CONVERTED: ", convertIntereststoArray(convertObjs(fromArrays(r2))));
  return r2;
}
export async function fetchParsed(url: string = ENDPOINT, sheet: string = SHEET): Promise<any[]> {
  const jsondata = await fetchjson(url, sheet);
  return convertIntereststoArray(convertObjs(fromArrays(jsondata)));
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
function convertObjs(data: any[], conversions: any = DEFAULTCONVERSIONS): Object[] {
  data.forEach((obj: any) => {
    for (const key in conversions) {
      if (obj[key]) {
        obj[conversions[key]] = obj[key];
        delete obj[key];
      }
    }
  });
  return data;
}
/*
converts the interests property comma seperated list into an array 
*/
function convertIntereststoArray(data: any[]): Object[] {
  const INTERESTSKEY = "interests";
  data.forEach(obj => {
    if (obj[INTERESTSKEY]) {
      obj[INTERESTSKEY] = obj[INTERESTSKEY].split(",");
    }
  });
  return data;
}
