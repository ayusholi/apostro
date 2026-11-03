/**
 * Integration tests write to a database. This guard makes sure that is a
 * dedicated, disposable test database: the URL must be set explicitly and
 * the database name must end in "_test". It never falls back to
 * DATABASE_URL, so a developer's working database is never touched.
 */
export function assertSafeTestDatabase(url: string | undefined): asserts url is string {
  if (!url) {
    throw new Error(
      'TEST_DATABASE_URL is not set. Point it at a disposable database whose name ends in "_test" (see backend/README.md).',
    );
  }
  const name = new URL(url).pathname.replace(/^\//, '');
  if (!name.endsWith('_test')) {
    throw new Error(
      `Refusing to run integration tests against database "${name}": the name must end in "_test".`,
    );
  }
}
