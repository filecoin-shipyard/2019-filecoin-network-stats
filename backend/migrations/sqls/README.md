## Important note about migrations

All previous migration *.sql files here are immutable! Do not change them.

If you would like to update the database schema please create a _new migration file_ that modifies the database state after all existing migrations have been applied.

Application level tables are truncated on deploy so we aren't losing migration tables and geolocation tables on every deploy. 

Also it's general best practice to consider migrations immutable.
