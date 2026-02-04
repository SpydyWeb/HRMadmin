import { ICommissionMgmtDashboard } from "./commission";

export interface IResponseHeader {

 errorCode: number;

 errorMessage: string;

}

export interface ICommissionMgmtResponseBody {

 commissionMgmtDashboards: ICommissionMgmtDashboard[];

}

export interface IHmsDashboardData {
  userId: number;
  totalEntitiesCount: number;
  totalEntitiesThisMonth: number;
  entitiesCreatedThisMonth: number;
  entitiesCreatedPrevMonth: number;
  entitiesTerminatedThisMonth: number;
  entitiesTerminatedPrevMonth: number;
  entitiesNetThisMonth: number;
  licenseExpiringIn30Months: number;
  certificateExpiringIn30Months: number;
  mbgCriteriaNotMet: number;
  channelDetails: any[];
  statusDetails: any[];
}

export interface IHmsDashboardResponseBody {
  hmsDashboard: IHmsDashboardData[];
}

export interface ICommissionMgmtDashboard {

  userId: number;
  totalEntitiesCount: number;
  totalEntitiesThisMonth: number;
  entitiesCreatedThisMonth: number;
  entitiesCreatedPrevMonth: number;
  entitiesTerminatedThisMonth: number;
  entitiesTerminatedPrevMonth: number;
  entitiesNetThisMonth: number;
  licenseExpiringIn30Months: number;
  certificateExpiringIn30Months: number;
  mbgCriteriaNotMet: number;
  channelDetails: any[];
  statusDetails: any[];
}


export interface IHmsDashboardApiResponse {

  responseHeader: IResponseHeader;
 
  responseBody: IHmsDashboardResponseBody
 
 }