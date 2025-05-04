#   EJFP frontend containers

##  Start all containers

This will build the app and serve it from webserver,

```shell
make all
```

##  Rebuild

Rebuild the app only,
without restarting webserver.

This is handy for CI/CD runners.

```shell
make rebuild
```

##  Restart

Restart webserver only,
without rebuilding the app.

This is needed only when webserver config changes.

```shell
make restart
```

##  Reset

Recreate everything.

```shell
make reset
```

