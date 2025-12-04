export interface IAgentCategoryEntry {
  orgId: number
  entryCategory: string
  entryIdentity: string
  entryDesc: string
  activeStatus:boolean
}

export interface IAgentCategoryResponse {
  agentCategory: Array<IAgentCategoryEntry>
}

export interface IMasterRequest {
  key: string
}
