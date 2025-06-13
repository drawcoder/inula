import inulaRequest from './src/inulaRequest';
import useIR from './src/core/useIR/useIR';

const {
  create,
  request,
  get,
  post,
  put,
  ['delete']: propToDelete,
  head,
  options,
  InulaRequest,
  IrError,
  CanceledError,
  isCancel,
  CancelToken,
  all,
  Cancel,
  isIrError,
  spread,
  IrHeaders,
  Axios,
  AxiosError,
  AxiosHeaders,
  isAxiosError,
} = inulaRequest;

export {
  create,
  request,
  get,
  post,
  put,
  propToDelete as delete,
  head,
  options,
  InulaRequest,
  IrError,
  CanceledError,
  isCancel,
  CancelToken,
  all,
  Cancel,
  isIrError,
  spread,
  IrHeaders,
  useIR,
  // 兼容axios
  Axios,
  AxiosError,
  AxiosHeaders,
  isAxiosError,
};

export { IrRequestConfig, IrResponse, IrInstance, CancelTokenSource, IrProgressEvent } from './src/types/interfaces';
export { Method, ResponseType } from './src/types/types';

export default inulaRequest;
