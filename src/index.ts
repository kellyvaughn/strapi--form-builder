import StrapiSDKProvider from "@thetaproom/strapi-sdk-javascript";
import StrapiFormBuilder from "./form.builder";

// baseURL = baseURL || `https://recharge-settings.herokuapp.com`;
// contentType = contentType || "application::global-settings.global-settings";

export const BuildForm = function(baseURL: string, contentType: any, domainSettings: any) {
  return new StrapiFormBuilder(
    baseURL,
    contentType,
    StrapiSDKProvider(baseURL, domainSettings)
  );
}

