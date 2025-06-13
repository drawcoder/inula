import Inula from '@cloudsop/horizon';
import IRClient from './IRClient';
import { IrRequestConfig, QueryOptions } from '../../types/interfaces';

// 全局初始化一个 IRClient 实例
const irClient = new IRClient();

const useIR = <T = unknown>(url: string, config?: IrRequestConfig, options?: QueryOptions): { data?: T; error?: any } => {
  const [data, setData] = Inula.useState<T>(null as unknown as T);
  const [error, setError] = Inula.useState<any>(null);

  function handleRequest(result: any) {
    return (event: any) => {
      result = event.detail;
      setData(result);
    };
  }

  Inula.useEffect(() => {
    const fetchData = async () => {
      try {
        let result = await irClient.query(url, config, options);
        document.addEventListener('request', handleRequest(result));

        setData(result); // 未设置轮询查询时展示一次
      } catch (err) {
        setError(err);
      }
    };

    fetchData().catch(() => {}); // catch作用是消除提示

    // 清除缓存
    return () => {
      irClient.invalidateCache(url);
      document.removeEventListener('request', handleRequest);
    };
  }, [url, config]);

  return { data, error };
};

export default useIR;
