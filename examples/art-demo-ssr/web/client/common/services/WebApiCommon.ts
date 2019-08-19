import WebApiH5 from '../../../../../../packages/art-lib-common/src/core-h5/WebApiH5';
import { AxiosResponse } from 'axios';

declare global {
  interface Window { GLOBAL: any; }
}
// const GLOBAL = window.GLOBAL || {};

const domains = {
  // me: GLOBAL.routeUrl,
  me: 'http://localhost:3001',
  inte: 'http://inte.example.com',
  prod: 'https://prod.example.com'
};

export default class WebApiCommon extends WebApiH5 {
  constructor() {
    super(domains);
    this.setBasicRequestConfig({
      headers: this.config.headers
    });
  }

  private config = {
    headers: {
      'X-USER-Token': 'YourCustomizedHeader'
    }
  };

  protected responseInterceptor(response: AxiosResponse): any {
    return JSON.parse(response.data);
  }
}