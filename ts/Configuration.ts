import { getParams } from "./Fetcher";
interface Setting<T> {
  value: T;
  options?: T[];
  prompt: string;
  storageName: string;
  notes?: string;
  icon?: string;
}
export default class Configuration {
  private static _config: Configuration;

  endpoint: Setting<string> = {
    value: "https://script.google.com/macros/s/AKfycbya1pA6RSvSbnvHqC4ccp0LGZAA4x-a9G5ltSW-G0bAhSVzgNnJ/exec",
    prompt: "What is url to reach the sheet?",
    storageName: "endpoint",
    icon: "mdi-link"
  };

  sheet: Setting<string> = {
    value: "Form Responses 1",
    prompt: "Which sheet of this spreadsheet should be read from.",
    storageName: "sheet",
    icon: "mdi-library-books"
  };

  autoReformat: Setting<boolean> = {
    value: true,
    prompt: "Whether or not to automatically apply the current layout whenever the data changes.",
    storageName: "autoreformat",
    icon: "mdi-autorenew"
  };
  showInterests: Setting<boolean> = {
    value: false,
    prompt: "Display button to show interests in graph",
    storageName: "showinterests",
    icon: "mdi-looks"
  };
  allowUserZoom: Setting<boolean> = {
    value: false,
    prompt: "Allow user to zoom?",
    notes: "If enabled, be careful scrolling!",
    storageName: "allowzoom",
    icon: "mdi-feature-search"
  };
  nameTranslations: Setting<string[]> = {
    value: ["What is your name?"],
    prompt: "What is the column title for the name field? (ie what was the form question)",
    storageName: "nametranslations",
    icon: "mdi-account"
  };
  communityTranslations: Setting<string[]> = {
    value: ["What community do you represent?"],
    prompt: "What is the column title for the community field? (ie what was the form question)",
    storageName: "communitytranslations",
    icon: "mdi-home"
  };
  interestsTranslations: Setting<string[]> = {
    value: ["What are you working on in your community? (Pick 3)"],
    prompt: "What is the column title for the interests field? (ie what was the form question)",
    storageName: "intereststranslations",
    notes: "the values are expected to be a comma seperated list",
    icon: "mdi-looks"
  };
  settings: Setting<any>[] = [
    this.endpoint,
    this.sheet,
    this.autoReformat,
    this.showInterests,
    this.nameTranslations,
    this.communityTranslations,
    this.interestsTranslations
  ];

  public static getConfig() {
    if (!Configuration._config) {
      Configuration._config = Configuration._buildConfig();
    }
    return Configuration._config;
  }
  private static _buildConfig(): Configuration {
    const me = new Configuration();
    me.settings.forEach((s, i) => {
      s.value = builder(s.storageName, s.value);
    });
    return me;
  }
  public writeout() {
    this.settings.forEach(_writer);
  }
  public toURI() {
    return this.settings.map(_toURI).join("&");
  }
}
function builder<T>(name: string, defaultValue: T): T {
  const q = getParams();
  if (q && q[name]) {
    return JSON.parse(q[name] as any);
  } else {
    const localV = localStorage.getItem(name);
    if (localV) {
      return JSON.parse(localV);
    } else {
      return defaultValue;
    }
  }
}
function _writer<T>(x: Setting<T>) {
  localStorage.setItem(x.storageName, JSON.stringify(x.value));
}
function _toURI<T>(x: Setting<T>) {
  return x.storageName + "=" + encodeURIComponent(JSON.stringify(x.value));
}
