import { AjaxRequest } from '../../..';

const originalSendRequest = AjaxRequest.sendRequest;

const withValue = (value: any = null) => {
  const mock = jest.fn(() => Promise.resolve(value));

  AjaxRequest.sendRequest = mock;

  return mock;
};

const unMock = () => {
  AjaxRequest.sendRequest = originalSendRequest;
};

export default {
  withValue,
  unMock,
};
