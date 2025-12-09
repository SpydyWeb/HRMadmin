
import { masterService } from "@/services/masterService";
import { useEffect, useState } from "react";

interface MasterDataItem {
  entryIdentity: number | string;
  entryDesc: string;
}

type MasterDataMap = Record<string, MasterDataItem[]>;

export function useMasterData(keys: string[]) {
  const [masterData, setMasterData] = useState<MasterDataMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMasterData = async () => {
      if (keys.length === 0) {
        if (isMounted) setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const promises = keys.map(key =>
          masterService.getmasters(key).then(res => ({
            key,
            data: (res?.responseBody as MasterDataItem[]) || []
          }))
        );

        const results = await Promise.all(promises);

        // 2. Transform the results into the desired map format
        const newMasterData: MasterDataMap = {};
        for (const result of results) {
          newMasterData[result.key] = result.data;
        }

        if (isMounted) {
          setMasterData(newMasterData);
        }
      } catch (e: any) {
        console.error("Failed to fetch master data:", e);
        if (isMounted) {
          setError(e?.message || "An unknown error occurred while fetching master data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMasterData();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(keys)]);

  const getDescription = (key: string, id: number | string): string => {
    return masterData[key]?.find(item => item.entryIdentity == id)?.entryDesc || "";
  };

  const getOptions = (key: string) => {
    return masterData[key]?.map(item => ({
      label: item.entryDesc,
      value: String(item.entryIdentity)
    })) || [];
  };

  return { masterData, loading, error, getDescription, getOptions };
}