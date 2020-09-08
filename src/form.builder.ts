import { StrapiFormMethodsDecorator } from "./form.actions";

export default class StrapiForm {
  private baseURL: string;
  private url: string;
  private acceptedTypes = [
    "string",
    "text",
    "integer",
    "media",
    "component",
    "boolean",
    "enumeration",
    "label",
  ];
  private blacklistedProps = ["id", "users"];
  private whitelistKeys = ["__component", "__label"];
  private contentTypeUID: any = {};
  public fields: any = {};
  public request: any = {};
  public existingModel: object;

  constructor(
    baseURL: string,
    contentTypeUID: string
  ) {
    this.baseURL = baseURL;
    this.contentTypeUID = contentTypeUID;
    this.url = `${this.baseURL}/content-manager/content-types/${this.contentTypeUID}`;
  }

  async getContentType(): Promise<void> {
    const res = await fetch(`${this.url}/${this.contentTypeUID}`);
    const json = await res.json();

    if (typeof json !== "object") return;

    this.contentTypeUID = json.data;
  }

  setRequestBody() {
    Object.keys(this.fields).map(key => {
      if (this.fields[key] && key !== "content") {
        this.fields[key] = this.fields[key].value
      }

      this.fields.content.map((component: any) => {
        if (component.__label === key) {
          component.value = this.existingModel[key];
        }
      });
    });
  }

  updateSchema(key: string, value: string, parent: string) {
    if (parent) {
      this.fields[parent][key] = value;
    } else {
      this.fields[key] = value;
    }
  }

  isBuildable(field: any) {
    return field && field.type && this.acceptedTypes.includes(field.type);
  }

  isComponent(field: any) {
    return field.type === "component";
  }

  isValidType(key: any, item: any) {
    return (
      item &&
      this.isBuildable(item) &&
      !this.isComponent(item) &&
      this.acceptedTypes.includes(item.type) !== false &&
      !this.blacklistedProps.includes(key)
    );
  }

  gatherSchema(parent?: any, componentKey?: string) {
    parent = parent || this.contentTypeUID.contentTypeUID.schema.attributes;

    Object.keys(parent).map((key) => {
      if (
        (!this.isComponent(parent[key]) &&
          this.isValidType(key, parent[key])) ||
        this.whitelistKeys.includes(key)
      ) {
        this.fields[key] = parent[key];
        this.fields[key].__label = key;
        this.fields[key].value = componentKey
          ? this.existingModel[componentKey][key]
          : this.existingModel[key];
      }

      if (this.isComponent(parent[key])) {
        const id = parent[key].component;
        const componentAttrs = this.contentTypeUID.components[id].schema
          .attributes;
        componentAttrs.__component = id;
        componentAttrs.__label = key;
        this.fields.content.push(componentAttrs);
        this.gatherSchema(componentAttrs);
      }
    });
  }

  async getSchema(existingEntry: object) {
    this.existingModel = existingEntry;
    await this.getContentType();
    this.gatherSchema();
    return this.fields;
  }
}
