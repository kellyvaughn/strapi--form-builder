import StrapiSDKProvider from "@thetaproom/strapi-sdk-javascript";
import StrapiFormBuilder from "./form.builder";
import { StrapiFormMethodsDecorator } from "./form.actions";
import { FormActionable, AuthenticatedUser } from "./interfaces";

interface Authentication {
  identifier: string,
  password: string,
}

export class Factory {
  private baseURL: string;
  public sdk: FormActionable;
  private auth: Authentication;

  constructor(baseURL: string, auth: Authentication) {
    if (!auth) throw new Error("Strapi Form Builder needs auth to attach resources and relationships.");
    this.auth = auth;
    this.baseURL = baseURL;
    this.sdk = StrapiSDKProvider(baseURL);
  }

  async getForm(contentTypeUID: string, existingEntry: any) {
    const token = this.sdk.getToken();
    let user: AuthenticatedUser;

    if (!token) {
      user = await this.sdk.login(
        this.auth.identifier,
        this.auth.password
      );
    }

    return {
      form: await new StrapiFormBuilder(this.baseURL, contentTypeUID).getSchema(
        existingEntry
      ),
      actions: new StrapiFormMethodsDecorator(contentTypeUID, this.sdk),
      user,
    };
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