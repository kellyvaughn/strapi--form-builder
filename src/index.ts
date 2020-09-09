import StrapiSDKProvider from "@thetaproom/strapi-sdk-javascript";
import StrapiFormBuilder from "./form.builder";
import { StrapiFormMethodsDecorator } from "./form.actions";
import { FormActionable } from "./interfaces";

interface Authentication {
  identifier: string,
  password: string,
}

export class Factory {
  private baseURL: string;
  public sdk: FormActionable;

  constructor(baseURL: string, auth: Authentication) {
    if (!auth) throw new Error("Strapi Form Builder needs auth to attach resources and relationships.");
    this.baseURL = baseURL;
    this.sdk = StrapiSDKProvider(baseURL, { domain: auth.identifier, token: auth.password });
  }

  async getForm(contentTypeUID: string, existingEntry: any) {
    return {
      form: await new StrapiFormBuilder(this.baseURL, contentTypeUID).getSchema(existingEntry),
      actions: new StrapiFormMethodsDecorator(contentTypeUID, this.sdk)
    }
  }

  getFormBuilder(contentTypeUID: string) {
    return new StrapiFormBuilder(this.baseURL, contentTypeUID)
  }

  getActions(contentTypeUID: string) {
    return new StrapiFormMethodsDecorator(contentTypeUID, this.sdk)
  }

  getStrapiAPI() {
    return this.sdk;
  }
}