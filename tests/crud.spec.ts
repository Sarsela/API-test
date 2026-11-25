import { test, expect, APIRequestContext } from '@playwright/test';

test.describe('JSONPlaceholder CRUD', () => {
  let request: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    request = await playwright.request.newContext({
      baseURL: 'https://jsonplaceholder.typicode.com',
      extraHTTPHeaders: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });
  });

  test.afterAll(async () => {
    await request.dispose();
  });

  test('GET /posts/1 returns a single post', async () => {
    const res = await request.get('/posts/1');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toMatchObject({
      userId: 1,
      id: 1,
    });
    expect(body.title).toEqual(expect.any(String));
    expect(body.body).toEqual(expect.any(String));
  });

  test('GET /posts returns a list of 100 posts', async () => {
    const res = await request.get('/posts');
    expect(res.status()).toBe(200);

    const posts = await res.json();
    expect(Array.isArray(posts)).toBeTruthy();
    expect(posts.length).toBe(100);
    expect(posts[0]).toHaveProperty('id');
  });

  test('GET /posts/1/comments returns comments for post 1', async () => {
    const res = await request.get('/posts/1/comments');
    expect(res.status()).toBe(200);

    const comments = await res.json();
    expect(comments.length).toBeGreaterThan(0);
    comments.forEach((c: any) => expect(c.postId).toBe(1));
  });

  test('GET /comments?postId=1 filters by query param', async () => {
    const res = await request.get('/comments', { params: { postId: 1 } });
    expect(res.status()).toBe(200);

    const comments = await res.json();
    expect(comments.length).toBeGreaterThan(0);
    comments.forEach((c: any) => expect(c.postId).toBe(1));
  });

  test('POST /posts creates a new post (fake)', async () => {
    const payload = { title: 'foo', body: 'bar', userId: 1 };
    const res = await request.post('/posts', { data: payload });

    expect(res.status()).toBe(201);

    const created = await res.json();
    expect(created).toMatchObject(payload);
    expect(created.id).toBe(101);
  });

  test('PUT /posts/1 fully replaces a post', async () => {
    const payload = { id: 1, title: 'foo', body: 'bar', userId: 1 };
    const res = await request.put('/posts/1', { data: payload });

    expect(res.status()).toBe(200);

    const updated = await res.json();
    expect(updated).toEqual(payload);
  });

  test('PATCH /posts/1 partially updates title', async () => {
    const res = await request.patch('/posts/1', {
      data: { title: 'foo' },
    });
    expect(res.status()).toBe(200);

    const patched = await res.json();
    expect(patched.title).toBe('foo');
    expect(patched.id).toBe(1);
    expect(patched.userId).toBe(1);
    expect(patched.body).toEqual(expect.any(String));
  });

  test('DELETE /posts/1 returns empty object', async () => {
    const res = await request.delete('/posts/1');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toEqual({});
  });

  test('GET /posts/9999 returns 404', async () => {
    const res = await request.get('/posts/9999');
    expect(res.status()).toBe(404);
  });
});