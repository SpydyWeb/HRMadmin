// ─── KPI Library ─────────────────────────────────────────────────────────────

export interface IKpiDataSource {
  object: string
  aggregation: string
  field: string
}

export interface IKpi {
  id: string
  name: string
  description: string
  dataSources: IKpiDataSource[]
  groupBy: string[]
  timeWindow: string
  isDeleted?: boolean
  createdAt: string
  createdBy: string
}

export interface IKpiListParams {
  search?: string
  pageNumber?: number
  pageSize?: number
}

export interface IKpiListResponse {
  items: IKpi[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface ICreateKpiRequest {
  name: string
  description: string
  dataSources: IKpiDataSource[]
  groupBy: string[]
  timeWindow: string
}

export interface IUpdateKpiRequest extends ICreateKpiRequest {
  id: string
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface IDesignation {
  id: string
  name: string
}

export interface IBranchDesignations {
  branchId: string
  branchName: string
  designations: IDesignation[]
}

export interface IIncentiveFiltersParams {
  branchIds?: string[]
}

// ─── Programs ─────────────────────────────────────────────────────────────────

export interface IProgramFilter {
  branchId: string
  designationIds: string[]
}

export interface IProgramKpiWeightage {
  kpiId: string
  weight: number
}

export interface IIncentiveProgram {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  status: string
  filters?: IProgramFilter[]
  kpiWeightages?: IProgramKpiWeightage[]
  createdAt?: string
  createdBy?: string
}

export interface IProgramListParams {
  search?: string
  pageNumber?: number
  pageSize?: number
  status?: string
}

export interface IProgramListResponse {
  items: IIncentiveProgram[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface ICreateProgramRequest {
  name: string
  description?: string
  startDate: string
  endDate: string
  filters: IProgramFilter[]
  kpiWeightages: IProgramKpiWeightage[]
  productWeightages?: IProductWeightageItem[]
}

export interface IUpdateProgramRequest {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
}

// ─── Product Weightage ────────────────────────────────────────────────────────

export interface IProductWeightageItem {
  productCode: string
  productName: string
  weight: number
}

export interface IProductWeightageResponse {
  programId: string
  weightages: IProductWeightageItem[]
}

export interface ISaveProductWeightageRequest {
  id: string
  weightages: IProductWeightageItem[]
}

// ─── Weightage Master ─────────────────────────────────────────────────────────

export interface ICreateWeightageMasterRequest {
  weightName: string
  startDate: string
  endDate: string
}

export interface ICreateWeightageMasterResponse {
  weightageId: string
}

// ─── Weightage Details ────────────────────────────────────────────────────────

export interface ICreateWeightageDetailsRequest {
  weightageId: string
}

export interface ICreateWeightageDetailsResponse {
  weightageDetailsId: string
}

export interface IDeleteWeightageDetailsRequest {
  weightageDetailsId: string
}

// ─── Weightage Dimension ──────────────────────────────────────────────────────

export interface ISaveWeightageDimensionRequest {
  weightageDetailsId: string
  productCode: string
  version: string
  dimensionNo: number
  tableName: string
  property: string
  rangeFrom: string
  rangeTo: string
}

// ─── Incentive Program Upsert ─────────────────────────────────────────────────

export type ProgramDetailCategory =
  | 'standard'
  | 'fresher'
  | 'multi_layered'
  | 'career_progression'
  | 'commission'

export type ProgramScheduleType = 'perpetual' | 'one_time'

export type IncentiveFrequency = 'weekly' | 'monthly' | 'quarterly' | 'half_yearly'

export type ClawbackBasis = 'itd' | 'fytd' | 'cytd'

/** Fresher program monthly targets — `monthIdentifier` is M1…Mn in calendar order of selected months. */
export interface IFresherProgramTarget {
  targetId: number
  monthIdentifier: string
  targetDescription: string
  isActive: boolean
}

/** POST UpsertProgram — align with API body (no duplicate / UI-only aliases). */
export interface IUpsertProgramRequest {
  programName: string
  description: string
  effectiveFrom: string
  /** Omitted or null when program is perpetual with no fixed end. */
  effectiveTo?: string | null
  executionFrequency: string
  selectionExpression: string | null
  cappingAmount: number
  /** Tab label shown in UI, e.g. "Fresher Program", "Standard". */
  programCategory: string
  /** API expects title case, e.g. "One Time", "Perpetual". */
  programType: string
  conversionPeriod?: number
  cancellationPeriod?: number
  considerClawback?: boolean
  /** Human-readable period basis, e.g. "ITD" / "FYTD" / "CYTD". */
  clawbackPeriod?: string
  kpiIds: number[]
  /** When `programType` is perpetual (optional frequency label). */
  incentiveFrequency?: string
  /** Fresher program only. */
  catchUpPreviousQualification?: boolean
  earlyBonus?: boolean
  fresherTargets?: IFresherProgramTarget[]
}

// ─── KPIs List ────────────────────────────────────────────────────────────────

export interface IKpisListItem {
  kpiId: number
  kpiName: string
}

export interface IKpisListResponse {
  kpis: IKpisListItem[]
}

// ─── Selected Program KPIs ─────────────────────────────────────────────────────

export interface ISelectedProgramKpi {
  kpiId: number
  kpiName: string
  kpiDescription?: string
  dataSources?: IKpiDataSource[]
  groupBy?: string[]
  timeWindow?: string
}

export interface ISelectedProgramKpisResponse {
  programKpis?: ISelectedProgramKpi[]
  kpis?: ISelectedProgramKpi[]
  kpiLibrary?: ISelectedProgramKpi[]
  items?: ISelectedProgramKpi[]
}

// ─── Program Weightages Upsert ────────────────────────────────────────────────

export interface IUpsertProgramWeightagesRequest {
  programId: number
  weightageIds: number[]
}

// ─── Cascade Filters ──────────────────────────────────────────────────────────

export interface IFiltersCascadeParams {
  // API supports multi-select payload (preferred)
  channelIds?: number[]
  subChannelIds?: number[]
  branchIds?: number[]

  // Backward-compatible single-select payload (older callers)
  channelId?: number
  subChannelId?: number
  branchId?: number
}

// ─── Upsert Program Filters ───────────────────────────────────────────────────

export interface IUpsertProgramFiltersRequest {
  programId: number
  filters: Array<{
    filterId: number
    programId: number
    channelIds: number[]
    subChannelIds: number[]
    branchIds: number[]
    designationIds: number[]
    isActive: boolean
  }>
}

// ─── Program clubs (agent eligibility) ───────────────────────────────────────

export interface IUpsertProgramClubsRequest {
  programId: number
  clubIds: number[]
}
