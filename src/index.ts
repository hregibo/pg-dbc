// imports from external packages
import { Pool, PoolClient, PoolConfig, QueryResult, QueryResultRow } from "pg";
// exports from externam packages
export type migration = () => Promise<void>;

// singletons
let pool: Pool | undefined;

/***
 * creates a new postgresql Pool with default values, and optionally overrides them with the given parameter.
 * @version 0.1.0
 * @param options The pool creation options. The specified keys will override the defaults.
 * @returns the Postgresql Pool
 */
export const make_pool = (options?: PoolConfig) => {
  return new Pool(
    Object.assign(
      {},
      {
        application_name: "dbc",
        allowExitOnIdle: true,
        connectionString: process.env.dbc_string,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 3000,
        keepAlive: true,
        min: 3,
      },
      options
    )
  );
};

/***
 * fetches a pool client from the postgresql pool
 * @version 0.1.0
 * @returns a pool client
 */
export const get_client = async () => {
  if (!pool) {
    pool = make_pool();
  }
  return await pool.connect();
};

/***
 * Executes a SQL query with provided parameters. This function will handle the closure of the client after it executes, which should simplify your usage of postgresql.
 * @version 0.1.0
 * @param query The SQL query to execute
 * @param params parameters to bind to the query. the first element of the array will replace the `$1` in the query, and escape it safely.
 * @returns a query result (native from Postgresql connector) with specified types inferred so that TypeScript users can take advantage of the typings and linting.
 */
export const query = async <T extends QueryResultRow>(
  query: string,
  params: any[]
): Promise<QueryResult<T>> => {
  let client: PoolClient | undefined;
  try {
    client = await get_client();
    return await client.query<T, any[]>(query, params);
  } finally {
    if (client) {
      client.release();
    }
  }
};
