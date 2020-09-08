export interface Schema {
  attributes: object
}

export interface Entry {
  id: number
}

export interface ContentType {
  schema?: Schema
}

export interface ContentTypeBase {
  contentType?: ContentType
  components?: ContentType[]
}

export interface ContentTypeResponse {
  data?: ContentTypeBase
  statusCode?: string
  error?: string
  message?: string
}

export interface Attribute {
  component?: string
  type?: string
  value?: any
  __component?: string
  __label?: string
}

export interface Fields {
  content: Attribute[];
  [key: string]: any
}

export interface FormActions {
  create: (body: object) => Promise<any>;
  update: (id: string | number, data: object) => Promise<any>;
  search: (params: object) => Promise<any>;
  delete: (id: string | number) => Promise<void>;
}

export interface FormActionable {
  createEntry: (apiID: string, body: object) => any;
  updateEntry: (apiID: string, id: string | number, data: object) => any;
  getEntries: (apiID: string, params: object) => any;
  deleteEntry: (apiID: string, id: string | number) => void;
}