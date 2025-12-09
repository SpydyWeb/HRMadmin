export interface IAgentCategoryEntry {
  orgid: number
  entryCategory: string
  entryIdentity: string
  entryDesc: string
  activeStatus:boolean
}

export interface IAgentCategoryResponse {
  master: Array<IAgentCategoryEntry>
}

export interface IMasterRequest {
  key: string
}
