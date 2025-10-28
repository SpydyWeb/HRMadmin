import React, { useEffect } from 'react';
import type { IAgent, IAgentSearchByCodeRequest } from '@/models/agent'
import DataTable from '../table/DataTable';
import { auditService } from '@/services/auditService';
import { agentService } from '@/services/agentService';
import { useQuery } from '@tanstack/react-query';


const AuditLog = ({ Agentcode }) => {
    const requestData: IAgentSearchByCodeRequest = {
        agentCode: Agentcode,
        FetchHierarchy: true,
    }

    const { data, isLoading, isError } = useQuery({
        queryKey: ['auditLog', requestData], // object form
        queryFn: () => agentService.AgentByCode(requestData), // object form
        staleTime: 5 * 60 * 1000, // optional: cache for 5 minutes
    })
    const dynamicColumns = [
        { header: 'Modified Date', accessor: 'modifiedDate' },
        { header: 'Modified By', accessor: 'modifiedBy' },
        { header: 'Change Description', accessor: 'changeDescription' },
    ]

    // Hardcoded temporary data



    return (
        <div className="bg-white p-10">
            <DataTable
                columns={dynamicColumns}
                data={data?.responseBody.agents[0].agentAuditTrail || []}
                loading={isLoading}
            />
        </div>
    );
};

export default AuditLog;