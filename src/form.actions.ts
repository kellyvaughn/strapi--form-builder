import StrapiSDKProvider from "@thetaproom/strapi-sdk-javascript";

export interface FormActions {
  create: (body: object) => Promise<any>;
  update: (id: string | number, data: object) => Promise<any>;
  search: (params: object) => Promise<any>;
  delete: (id: string | number) => Promise<void>;
}

export interface FormActionable {
  createEntry: (apiID: string, body: object) => any;
  updateEntry: (apiID: string, id: string|number, data: object) => any;
  getEntries: (apiID: string, params: object) => any;
  deleteEntry: (apiID: string, id: string|number) => void;
}

export class StrapiFormMethodsDecorator {
  private apiID: string;
  private strapiSDK: FormActionable;

  constructor(contentTypeUID: string, strapiSDK: FormActionable) {
    this.strapiSDK = strapiSDK;
    this.apiID = this.getApiID(contentTypeUID);
  }

  getApiID(contentTypeUID: string) {
    if (contentTypeUID.indexOf("::") === 0 || contentTypeUID.indexOf(".") === 0) {
      throw new Error(`
        Strapi Form Builder requires a global
        content type id i.e. application::contentTypeUID.contentTypeUID
      `);
    }

    return contentTypeUID.slice(
      contentTypeUID.indexOf("::") + 2,
      contentTypeUID.indexOf(".")
    );
  }

  get strapi() {
    return this.strapiSDK;
  }

  async create(data: any): Promise<any> {
    return await this.strapiSDK.createEntry(this.apiID, data);
  }

  async update(id: any, data: any): Promise<any> {
    return await this.strapiSDK.updateEntry(this.apiID, id, data);
  }

  async search(params: object): Promise<any> {
    return await this.strapiSDK.getEntries(this.apiID, params);
  }

  async delete(id: string|number): Promise<void> {
    this.strapiSDK.deleteEntry(this.apiID, id);
  }
}