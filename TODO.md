* koa-simple-static -> koajs/router
* koa-mid -> individual middlewares
* fix tests to work with stricter TS rules
* rehash CI and infra stuff, it's probably outdated
* turn workflow back on
* db:
  * add a db container to the docker-compose
  * have an in-mem fallback (or file? sqlite?)
  * add an ORM (prisma? typeorm? or something "boring" like sequelize?)
