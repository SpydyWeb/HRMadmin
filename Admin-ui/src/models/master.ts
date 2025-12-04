export interface IAgentCategoryEntry {
  orgId: number
  entryCategory: string
  entryIdentity: string
  entryDesc: string
}

export interface IAgentCategoryResponse {
  agentCategory: IAgentCategoryEntry[]
}

