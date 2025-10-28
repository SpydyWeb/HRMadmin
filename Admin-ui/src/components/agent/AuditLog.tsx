import React from 'react';
import type { IAgentSearchByCodeRequest } from '@/models/agent';
import DataTable from '../table/DataTable';
import { agentService } from '@/services/agentService';
import { useQuery } from '@tanstack/react-query';

const AuditLog = ({ Agentcode }) => {
  const requestData: IAgentSearchByCodeRequest = {
    agentCode: Agentcode,
    FetchHierarchy: true,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['auditLog', requestData],
    queryFn: () => agentService.AgentByCode(requestData),
    staleTime: 5 * 60 * 1000,
  });

  // Format date to dd-mm-yy hh:mm:ss
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date
      .getFullYear()
      .toString()
      .slice(-2)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`;
  };

  // Prepare formatted data
  const formattedData =
    data?.responseBody.agents[0].agentAuditTrail?.map((item) => ({
      ...item,
      modifiedDate: formatDateTime(item.modifiedDate),
    })) || [];

  const dynamicColumns = [
    { header: 'Modified Date', accessor: 'modifiedDate' },
    { header: 'Modified By', accessor: 'modifiedBy' },
    { header: 'Change Description', accessor: 'changeDescription' },
  ];

  return (
    <div className="bg-white p-10">
      <DataTable columns={dynamicColumns} data={formattedData} loading={isLoading} />
    </div>
  );
};

export default AuditLog;
