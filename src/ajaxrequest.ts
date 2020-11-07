export type Method = 'POST' | 'GET' | 'DELETE' | 'PATCH' | 'PUT';

interface Response {
  statusCode: number;
  data: any;
  headers: string;
}

export default class AjaxRequest {
  public static sendRequest = (
    method: Method,
    url: string,
    data: any = {},
    headers: any = {},
  ): Promise<Response | null> => {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();

      req.open(method, url, true);
      req.setRequestHeader('Content-Type', 'application/json');
      req.setRequestHeader('Accept', 'application/json');
      let key: string;
      let value: any;
      for ([key, value] of Object.entries(headers)) {
        req.setRequestHeader(key, value);
      }

      req.onreadystatechange = () => {
        if (req.readyState === XMLHttpRequest.DONE) {
          let data = '';
          try {
            data = JSON.parse(req.responseText);
          } catch (err) {}
          resolve({
            data,
            statusCode: req.status,
            headers: req.getAllResponseHeaders(),
          });
        }
      };

      const failed = () => {
        resolve(null);
      };

      req.onabort = failed;
      req.onerror = failed;
      req.ontimeout = failed;

      req.send(JSON.stringify(data));
    });
  };
}
