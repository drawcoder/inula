/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import utils from '../utils/commonUtils/utils';
import IrError from '../core/IrError';
import { IrRequestConfig, IrResponse, Cancel } from '../types/interfaces';
import { Method, ResponseType } from '../types/types';
import processUploadProgress from './processUploadProgress';
import processDownloadProgress from './processDownloadProgress';
import CancelError from '../cancel/CancelError';

export const fetchRequest = (config: IrRequestConfig): Promise<IrResponse> => {
  return new Promise((resolve, reject) => {
    const {
      method = 'GET',
      baseURL,
      params = null,
      headers = {},
      responseType,
      timeout = 0,
      timeoutErrorMessage,
      cancelToken = null,
      withCredentials = false,
      onUploadProgress = null,
      onDownloadProgress = null,
      paramsSerializer,
    } = config;

    let { signal, url, data = null } = config;

    const controller = new AbortController();
    if (!signal) {
      signal = controller.signal;
    }

    // 处理请求取消
    if (cancelToken) {
      cancelToken.promise.then((reason: Cancel) => {
        const cancelError = new CancelError(reason.message, config);
        controller.abort();
        reject(cancelError);
      });
    }

    // 拼接URL
    if (baseURL) {
      url = `${baseURL}${url}`;
    }

    // 处理请求参数
    if (params) {
      const queryString = utils.objectToQueryString(utils.filterUndefinedValues(params), paramsSerializer);
      if (queryString) {
        url = `${url}${url!.includes('?') ? '&' : '?'}${queryString}`; // 支持用户将部分请求参数写在 url 中
      }
    }

    // GET HEAD 方法不允许设置 body
    if (method === 'GET' || method === 'HEAD') {
      data = null;
    }

    const options = {
      method,
      headers,
      body: data || null, // 防止用户在拦截器传入空字符串，引发 fetch 错误
      signal,
      credentials: withCredentials ? 'include' : 'omit',
    };

    if (timeout) {
      setTimeout(() => {
        controller.abort();
        const errorMsg = timeoutErrorMessage ?? `timeout of ${timeout}ms exceeded`;
        const error = new IrError(errorMsg, '', config, undefined, undefined);
        reject(error);
      }, timeout);
    }

    if (!url) {
      return Promise.reject('URL is undefined!');
    }

    if (onUploadProgress) {
      processUploadProgress(onUploadProgress, data, reject, resolve, method, url, config);
    } else {
      fetch(url, options as RequestInit)
        .then(response => {
          // 将 Headers 对象转换为普通 JavaScript 对象，可以使用 [] 访问具体响应头
          const headersObj = {};
          response.headers.forEach((value, name) => {
            headersObj[name] = value;
          });

          config.method = config.method!.toLowerCase() as Method;

          const responseData: IrResponse = {
            data: '',
            status: response.status,
            statusText: response.statusText,
            headers: headersObj,
            config,
            request: null,
            responseURL: response.url,
          };

          const responseBody = onDownloadProgress
            ? processDownloadProgress(response.body, response, onDownloadProgress)
            : response.body;

          // 根据 responseType 选择相应的解析方法
          let parseMethod;

          switch (responseType as ResponseType) {
            case 'arraybuffer':
              parseMethod = new Response(responseBody).arrayBuffer();
              break;

            case 'blob':
              parseMethod = new Response(responseBody).blob();
              break;

            // text 和 json 服务端返回的都是字符串 统一处理
            case 'text':
              parseMethod = new Response(responseBody).text();
              break;

            case 'json':
              parseMethod = new Response(responseBody).text().then((text: string) => {
                try {
                  return text ? JSON.parse(text) : ''; // 如果服务端请求成功但不返回响应值，默认返回空字符串
                } catch (e) {
                  // 显式指定返回类型 JSON解析失败报错
                  const error = new IrError('parse error', '', responseData.config, responseData.request, responseData);
                  reject(error);
                }
              });
              break;
            default:
              parseMethod = new Response(responseBody).text().then((text: string) => {
                try {
                  return text ? JSON.parse(text) : '';
                } catch (e) {
                  // 默认为 JSON 类型，若JSON校验失败则直接返回服务端数据
                  return text;
                }
              });
          }

          parseMethod
            .then((parsedData: any) => {
              responseData.data = parsedData;
              if (responseData.config.validateStatus!(responseData.status)) {
                resolve(responseData);
              } else {
                const error = new IrError(
                  responseData.statusText,
                  '',
                  responseData.config,
                  responseData.request,
                  responseData
                );
                reject(error);
              }
            })
            .catch((error: IrError) => {
              // fetch 在取消请求的极限场景会抛出 Failed to fetch 的 error，此时将其转为取消 error
              if (signal?.aborted) {
                const irError = new CancelError('request canceled', config);
                reject(irError);
              } else {
                const irError = new IrError(
                  error.message,
                  'ERR_FETCH_FAILED',
                  responseData.config,
                  responseData.request,
                  responseData
                );
                reject(irError);
              }
            });
        })
        .catch((error: IrError) => {
          if (error.name === 'AbortError') {
            const cancelError = new CancelError('request canceled', config);
            reject(cancelError);
          } else {
            const irError = new IrError(error.message, 'ERR_FETCH_FAILED');
            reject(irError);
          }
        });
    }
  });
};
