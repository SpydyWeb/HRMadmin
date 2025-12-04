export interface IAgentCategoryEntry {
  orgId: number
  entryCategory: string
  entryIdentity: string
  entryDesc: string
}

export interface IAgentCategoryResponse {
  agentCategory: Array<IAgentCategoryEntry>
}

export interface IMasterRequest {
  key: string
}
