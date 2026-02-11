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

// Channel Stats Interfaces
export interface IChannel {
  channelId: number;
  channelCode: string | null;
  channelName: string;
  description: string | null;
  isActive: boolean;
  orgId: number;
  createdBy: string;
  createdDate: string;
  modifiedBy: string | null;
  modifiedDate: string | null;
  rowVersion: string | null;
  totalEntities: number;
  createdEntities: number;
  terminatedEntities: number;
}

export interface IChannelStatsResponseBody {
  channels: IChannel[];
  totalEntities: number;

  activeEntities: number;
  terminatedEntities: number;
}
export interface IDownloadReportRequest {
  id: number;
  reportType:string;
}

export interface IDownloadReportResponseBody {
  fileDownload: IFileDownload | null
}

export interface fileResponseBody {
  File: string;
  FileType: string;
}


export interface IChannelStatsApiResponse {
  responseHeader: IResponseHeader;
  responseBody: IChannelStatsResponseBody | IDownloadReportResponseBody
}


