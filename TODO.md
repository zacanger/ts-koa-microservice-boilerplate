* rehash CI and infra stuff, it's probably outdated
* address ts-ignores and eslint-disables
* turn workflow back on
* db:
    * add a postgres container to docker-compose
    * use typeorm
    * maybe work in a fallback sqlite for outside of docker
        * can use an env var in compose and check that to decide which to use
