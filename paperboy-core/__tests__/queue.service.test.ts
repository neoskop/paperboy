import { QueueService } from '../src/service/queue.service';

class TestQueueService extends QueueService {
  public listen(): Promise<void> {
    return Promise.resolve();
  }
}

test('only one build at a time', async () => {
  let promises: Promise<void>[] = [];

  const mockBuild = jest.fn(async () => {
    console.log('Executing build function');
    const buildPromise = new Promise<void>((resolve) =>
      setTimeout(() => {
        console.log('Finished build');
        resolve();
      }, 500)
    );
    promises.push(buildPromise);
    return buildPromise;
  });
  const sut = new TestQueueService(
    { queue: { uri: '' }, command: '' },
    mockBuild
  );
  promises.push(sut.processMessage({ source: 'jest' }));
  promises.push(sut.processMessage({ source: 'jest' }));
  await new Promise((c) => setTimeout(c, 250));
  expect(mockBuild.mock.calls.length).toBe(1);
  await Promise.all(promises);
});

test('will execute following build', async () => {
  let promises: Promise<void>[] = [];

  const mockBuild = jest.fn(async () => {
    console.log('Executing build function');
    const buildPromise = new Promise<void>((resolve) =>
      setTimeout(() => {
        console.log('Finished build');
        resolve();
      }, 500)
    );
    promises.push(buildPromise);
    return buildPromise;
  });
  const sut = new TestQueueService(
    { queue: { uri: '' }, command: '' },
    mockBuild
  );
  promises.push(sut.processMessage({ source: 'jest' }));
  promises.push(sut.processMessage({ source: 'jest' }));
  await Promise.all(promises);
  expect(mockBuild.mock.calls.length).toBe(2);
});
