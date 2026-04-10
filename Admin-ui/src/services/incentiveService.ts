import { callApi } from './apiService'
import { APIRoutes } from './constant'
import type {
  IKpiListParams,
  IKpiListResponse,
  IKpi,
  ICreateKpiRequest,
  IUpdateKpiRequest,
  IIncentiveFiltersParams,
  IBranchDesignations,
  IProgramListParams,
  IProgramListResponse,
  IIncentiveProgram,
  ICreateProgramRequest,
  IUpdateProgramRequest,
  IProductWeightageResponse,
  ISaveProductWeightageRequest,
  ICreateWeightageMasterRequest,
  ICreateWeightageMasterResponse,
  ICreateWeightageDetailsRequest,
  ICreateWeightageDetailsResponse,
  IDeleteWeightageDetailsRequest,
  ISaveWeightageDimensionRequest,
  IUpsertProgramRequest,
  IKpisListResponse,
  IUpsertProgramWeightagesRequest,
  IFiltersCascadeParams,
  IUpsertProgramFiltersRequest,
  ISelectedProgramKpisResponse,
} from '@/models/incentive'


export const incentiveService = {
  // ─── KPI Library ─────────────────────────────────────────────────────────────

  /** GET /api/incentive/kpi-library — paged KPI list with optional search */
  getKpiLibrary: async (params: IKpiListParams = {}) => {
    try {
      const response = await callApi<IKpiListResponse>(
        APIRoutes.GET_INCENTIVE_KPI_LIBRARY,
        [params],
      )
      return response
    } catch (error) {
      console.error('incentiveService.getKpiLibrary error:', error)
      throw error
    }
  },

  getWeightages: async () => {
    try {
      const response = await callApi(
        APIRoutes.GET_WEIGHTAGES,
        [{}]
      )
      return response
    } catch (error) {
      console.error('downloadRecord service error:', error)
      throw error
    }
  },

  /** GET /api/incentive/kpi-library/{id} — single KPI */
  getKpiById: async (id: string) => {
    try {
      const response = await callApi<IKpi>(
        APIRoutes.GET_INCENTIVE_KPI_BY_ID,
        [{ id }],
      )
      return response
    } catch (error) {
      console.error('incentiveService.getKpiById error:', error)
      throw error
    }
  },

  /** POST /api/incentive/kpi-library — create KPI */
  createKpi: async (data: ICreateKpiRequest) => {
    try {
      const response = await callApi<IKpi>(
        APIRoutes.CREATE_INCENTIVE_KPI,
        [data],
      )
      return response
    } catch (error) {
      console.error('incentiveService.createKpi error:', error)
      throw error
    }
  },

  getUser: async () => {
    return callApi(
      "getUser",
      [{}]
    )
  },

  /** PUT /api/incentive/kpi-library/{id} — update KPI */
  updateKpi: async (data: IUpdateKpiRequest) => {
    try {
      const response = await callApi<IKpi>(
        APIRoutes.UPDATE_INCENTIVE_KPI,
        [data],
      )
      return response
    } catch (error) {
      console.error('incentiveService.updateKpi error:', error)
      throw error
    }
  },

  /** DELETE /api/incentive/kpi-library/{id} — soft-delete KPI */
  deleteKpi: async (id: string) => {
    try {
      const response = await callApi<void>(
        APIRoutes.DELETE_INCENTIVE_KPI,
        [{ id }],
      )
      return response
    } catch (error) {
      console.error('incentiveService.deleteKpi error:', error)
      throw error
    }
  },

  // ─── Filters ─────────────────────────────────────────────────────────────────

  /** GET /api/incentive/filters — cascading filter: multi-branchId → Designations */
  getFilters: async (params: IIncentiveFiltersParams = {}) => {
    try {
      const response = await callApi<IBranchDesignations[]>(
        APIRoutes.GET_INCENTIVE_FILTERS,
        [params],
      )
      return response
    } catch (error) {
      console.error('incentiveService.getFilters error:', error)
      throw error
    }
  },

  // ─── Programs ─────────────────────────────────────────────────────────────────

  /** GET /api/incentive/programs — paged program list */
  getPrograms: async (params: IProgramListParams = {}) => {
    try {
      const response = await callApi<IProgramListResponse>(
        APIRoutes.INCENTIVE_GET_PROGRAMS_LIST,
        [params],
      )
      return response
    } catch (error) {
      console.error('incentiveService.getPrograms error:', error)
      throw error
    }
  },

  /** POST /api/incentive/GetPastQualifications/{programId} */
  getPastQualifications: async (programId: number) => {
    try {
      const response = await callApi(
        APIRoutes.INCENTIVE_GET_PAST_QUALIFICATIONS,
        [{ programId }],
      )
      return response
    } catch (error) {
      console.error('incentiveService.getPastQualifications error:', error)
      throw error
    }
  },

  /** GET /api/incentive/programs/{id} — program with all child mappings */
  getProgramById: async (id: string) => {
    try {
      const response = await callApi<IIncentiveProgram>(
        APIRoutes.GET_INCENTIVE_PROGRAM_BY_ID,
        [{ id }],
      )
      return response
    } catch (error) {
      console.error('incentiveService.getProgramById error:', error)
      throw error
    }
  },

  /** POST /api/incentive/programs — atomic create (program + KPIs + weightages + filters) */
  createProgram: async (data: ICreateProgramRequest) => {
    try {
      const response = await callApi<IIncentiveProgram>(
        APIRoutes.CREATE_INCENTIVE_PROGRAM,
        [data],
      )
      return response
    } catch (error) {
      console.error('incentiveService.createProgram error:', error)
      throw error
    }
  },

  /** PUT /api/incentive/programs/{id} — update program header */
  updateProgram: async (data: IUpdateProgramRequest) => {
    try {
      const response = await callApi<IIncentiveProgram>(
        APIRoutes.UPDATE_INCENTIVE_PROGRAM,
        [data],
      )
      return response
    } catch (error) {
      console.error('incentiveService.updateProgram error:', error)
      throw error
    }
  },

  /** GET /api/incentive/programs/{id}/product-weightage — get product weightages */
  getProductWeightage: async (programId: string) => {
    try {
      const response = await callApi<IProductWeightageResponse>(
        APIRoutes.GET_INCENTIVE_PROGRAM_PRODUCT_WEIGHTAGE,
        [{ id: programId }],
      )
      return response
    } catch (error) {
      console.error('incentiveService.getProductWeightage error:', error)
      throw error
    }
  },

  /** POST /api/incentive/programs/{id}/product-weightage — save/replace product weightages (validates sum = 100%) */
  saveProductWeightage: async (data: ISaveProductWeightageRequest) => {
    try {
      const response = await callApi<IProductWeightageResponse>(
        APIRoutes.SAVE_INCENTIVE_PROGRAM_PRODUCT_WEIGHTAGE,
        [data],
      )
      return response
    } catch (error) {
      console.error('incentiveService.saveProductWeightage error:', error)
      throw error
    }
  },

  // ─── Weightage Master / Details / Dimension ───────────────────────────────

  /** POST — create Weightage Master entry, returns weightageId */
  createWeightageMaster: async (data: ICreateWeightageMasterRequest) => {
    try {
      const response = await callApi<ICreateWeightageMasterResponse>(
        APIRoutes.CREATE_WEIGHTAGE_MASTER,
        [data],
      )
      return response
    } catch (error) {
      console.error('incentiveService.createWeightageMaster error:', error)
      throw error
    }
  },

  /** POST — add a new Weightage Details row, returns weightageDetailsId */
  createWeightageDetails: async (data: ICreateWeightageDetailsRequest) => {
    try {
      const response = await callApi<ICreateWeightageDetailsResponse>(
        APIRoutes.CREATE_WEIGHTAGE_DETAILS,
        [data],
      )
      return response
    } catch (error) {
      console.error('incentiveService.createWeightageDetails error:', error)
      throw error
    }
  },

  /** DELETE — remove a Weightage Details row */
  deleteWeightageDetails: async (data: IDeleteWeightageDetailsRequest) => {
    try {
      const response = await callApi<void>(
        APIRoutes.DELETE_WEIGHTAGE_DETAILS,
        [data],
      )
      return response
    } catch (error) {
      console.error('incentiveService.deleteWeightageDetails error:', error)
      throw error
    }
  },

  /** POST — save dimension data for a specific dimension column */
  saveWeightageDimension: async (data: ISaveWeightageDimensionRequest) => {
    try {
      const response = await callApi<void>(
        APIRoutes.SAVE_WEIGHTAGE_DIMENSION,
        [data],
      )
      return response
    } catch (error) {
      console.error('incentiveService.saveWeightageDimension error:', error)
      throw error
    }
  },

  // ─── Program Upsert ───────────────────────────────────────────────────────

  /** POST /api/incentive/UpsertProgram — create or update an incentive program */
  upsertProgram: async (data: IUpsertProgramRequest) => {
    try {
      const response = await callApi(
        APIRoutes.INCENTIVE_UPSERT_PROGRAM,
        [data],
      )
      return response
    } catch (error) {
      console.error('incentiveService.upsertProgram error:', error)
      throw error
    }
  },

  // ─── KPIs List ────────────────────────────────────────────────────────────

  /** POST /api/incentive/GetKpisList — retrieve available KPIs */
  getKpisList: async (params: Record<string, unknown> = {}) => {
    try {
      const response = await callApi<IKpisListResponse>(
        APIRoutes.INCENTIVE_GET_KPIS_LIST,
        [params],
      )
      return response
    } catch (error) {
      console.error('incentiveService.getKpisList error:', error)
      throw error
    }
  },

  /** POST /api/incentive/GetSelectedProgramKpis/{programId} — KPIs mapped to a program */
  getSelectedProgramKpis: async (programId: number) => {
    try {
      const response = await callApi<ISelectedProgramKpisResponse>(
        APIRoutes.INCENTIVE_GET_SELECTED_PROGRAM_KPIS,
        [{ programId }],
      )
      return response
    } catch (error) {
      console.error('incentiveService.getSelectedProgramKpis error:', error)
      throw error
    }
  },

  // ─── KPI Builder ─────────────────────────────────────────────────────────────

  /** POST /api/incentive/GetKpiObjects — list KPI object options */
  getKpiObjects: async () => {
    try {
      const response = await callApi(
        APIRoutes.INCENTIVE_GET_KPI_OBJECTS,
        [{}],
      )
      return response
    } catch (error) {
      console.error('incentiveService.getKpiObjects error:', error)
      throw error
    }
  },

  /** POST /api/incentive/GetKpiFields?objectName=... — list KPI field options */
  getKpiFields: async (objectName: string) => {
    try {
      const response = await callApi(
        APIRoutes.INCENTIVE_GET_KPI_FIELDS,
        [{ objectName }],
      )
      return response
    } catch (error) {
      console.error('incentiveService.getKpiFields error:', error)
      throw error
    }
  },

  /** POST /api/incentive/UpsertKpi — create/update KPI from builder */
  upsertKpi: async (data: Record<string, unknown>) => {
    try {
      const response = await callApi(
        APIRoutes.INCENTIVE_UPSERT_KPI,
        [data],
      )
      return response
    } catch (error) {
      console.error('incentiveService.upsertKpi error:', error)
      throw error
    }
  },

  // ─── Program Weightages Upsert ────────────────────────────────────────────

  /** POST /api/incentive/UpsertProgramWeightages — save weightages for a program */
  upsertProgramWeightages: async (data: IUpsertProgramWeightagesRequest) => {
    try {
      const response = await callApi(
        APIRoutes.INCENTIVE_UPSERT_PROGRAM_WEIGHTAGES,
        [data],
      )
      return response
    } catch (error) {
      console.error('incentiveService.upsertProgramWeightages error:', error)
      throw error
    }
  },

  // ─── Cascading Filters ────────────────────────────────────────────────────────

  /** POST /api/incentive/filters/cascade — cascading filter: Channel → SubChannel → Branch → Designations */
  getFiltersCascade: async (params: IFiltersCascadeParams = {}) => {
    try {
      const response = await callApi(
        APIRoutes.GET_FILTERS_CASCADE,
        [params],
      )
      return response
    } catch (error) {
      console.error('incentiveService.getFiltersCascade error:', error)
      throw error
    }
  },

  // ─── Upsert Program Filters ───────────────────────────────────────────────────

  /** POST /api/incentive/UpsertProgramFilters — save agent filter selections for a program */
  upsertProgramFilters: async (data: IUpsertProgramFiltersRequest) => {
    try {
      const response = await callApi(
        APIRoutes.UPSERT_PROGRAM_FILTERS,
        [data],
      )
      return response
    } catch (error) {
      console.error('incentiveService.upsertProgramFilters error:', error)
      throw error
    }
  },
}
