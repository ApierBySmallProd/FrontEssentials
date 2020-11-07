import './mock';

import expressServer from '../_utils/server';

process.env.NODE_ENV = 'test';

afterAll(() => {
  console.log('Stop express server');
  expressServer.on('close', () => {
    console.log('Server stopped');
  });
  expressServer.close();
});
