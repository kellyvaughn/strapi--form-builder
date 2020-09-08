import {
  AttributeTypesWhitelist,
  ATTIBUTE_TYPES,
  AttributeTypesBlacklist,
  WhitelistKeys
} from "./types/content-attribute-types";

import {
  Entry,
  ContentTypeBase,
  ContentTypeResponse,
  Attribute,
  Fields
} from "./interfaces";

export default class StrapiForm {
  private url: string;
  private acceptedTypes: string[] = AttributeTypesWhitelist;
  private blacklistedProps = AttributeTypesBlacklist;
  private whitelistKeys = WhitelistKeys;
  private contentType: ContentTypeBase;
  private contentTypeUID: string
  public fields: Fields;
  public request: Fields;
  public existingModel: any;

  constructor(
    baseURL: string,
    contentTypeUID: string
  ) {
    this.contentTypeUID = contentTypeUID;
    this.url = `${baseURL}/content-manager/content-types`;
  }

  async getContentType(): Promise<void> {
    const res = await fetch(`${this.url}/${this.contentTypeUID}`);
    const json: ContentTypeResponse = await res.json();
    if (json.statusCode)
    this.contentType = json.data;
  }

  setRequestState(key: string, componentId: string, value: any): Fields {
    if (parent) {
      for (const component of this.request.content) {
        if (component.__component === componentId) {
          component[key] = value;
        }
      }
    }

    this.request[key] = value;
    return this.fields;
  }

  updateSchema(key: string, value: string, parent: string) {
    if (parent) {
      this.fields[parent][key] = value;
    } else {
      this.fields[key] = value;
    }
  }

  isBuildable(field: Attribute): boolean {
    return field && field.type && this.acceptedTypes.includes(field.type);
  }

  isComponent(field: Attribute): boolean {
    return field.type === ATTIBUTE_TYPES.COMPONENT;
  }

  isValidType(key: string, attribute: Attribute): boolean {
    return (
      attribute &&
      this.isBuildable(attribute) &&
      !this.isComponent(attribute) &&
      this.acceptedTypes.includes(attribute.type) !== false &&
      !this.blacklistedProps.includes(key)
    );
  }

  isSimpleType(key: string, attribute: Attribute): boolean {
    return (!this.isComponent(attribute) &&
      this.isValidType(key, attribute)) ||
      this.whitelistKeys.includes(key);
  }

  buildSimpleType(key: string, attribute: Attribute, componentKey?: string): void {
    if (this.isSimpleType(key, attribute)) {
      this.fields[key] = attribute;
      this.fields[key].__label = key;
      this.fields[key].value = componentKey
        ? this.existingModel[componentKey][key]
        : this.existingModel[key];
    }
  }

  buildComplexType(key: string, attribute: Attribute): void {
    if (this.isComponent(attribute)) {
      const componentAttrs: Attribute = this.contentType.components[attribute.component].schema.attributes;
      componentAttrs.__component = attribute.component;
      componentAttrs.__label = key;
      this.fields.content.push(componentAttrs);
      this.gatherSchema(componentAttrs, key);
    }
  }

  gatherSchema(parent?: any, componentKey?: string): void {
    parent = parent || this.contentType.contentType.schema.attributes;

    Object.keys(parent).map((key) => {
      if (this.isSimpleType(key, parent[key])) {
        this.buildSimpleType(key, parent[key], componentKey);
      }

      if (this.isComponent(parent[key])) {
        this.buildComplexType(key, parent[key]);
      }
    });
  }

  async getSchema(existingEntry: Entry): Promise<Fields> {
    this.existingModel = existingEntry;
    await this.getContentType();
    this.gatherSchema();
    return this.fields;
  }
}
