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
  private apiContentType: any = {};
  public fields: any = {};
  public request: any = {};
  public apiID: string = "";
  public strapiSDK: any;
  public existingModel: object;

  constructor(
    baseURL: string,
    contentType: any,
    strapiSDk: any
  ) {
    this.strapiSDK = strapiSDk;
    this.baseURL = baseURL;
    this.url = `${this.baseURL}/content-manager/content-types/${contentType}`;
  }

  get appUrl() {
    return `${this.baseURL}/${this.apiID}`;
  }

  async getContentType() {
    const res = await fetch(this.url);
    const json = await res.json();

    if (typeof json !== "object" && json.data) return {};

    this.apiContentType = json.data;
    this.apiID = this.apiContentType.contentType.apiID;
  }

  async getExistingEntry(params: any) {
    return await this.strapiSDK.getEntries(this.apiID, params);
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

  async create(data: any) {
    return await this.strapiSDK.createEntry(this.apiID, data);
  }

  async update(id: any, data: any) {
    return await this.strapiSDK.updateEntry(this.apiID, id, data);
  }

  async search(params: any) {
    return await this.strapiSDK.getEntries(this.apiID, params);
  }

  async delete(id: any) {
    return await this.strapiSDK.deleteEntry(this.apiID, id);
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
    parent = parent || this.apiContentType.contentType.schema.attributes;

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
        const componentAttrs = this.apiContentType.components[id].schema
          .attributes;
        componentAttrs.__component = id;
        componentAttrs.__label = key;
        this.fields.content.push(componentAttrs);
        this.gatherSchema(componentAttrs);
      }
    });
  }

  async getFormSchema(params: any) {
    this.existingModel = await this.getExistingEntry(params);
    await this.getContentType();
    this.gatherSchema();
    return this.fields;
  }
}
