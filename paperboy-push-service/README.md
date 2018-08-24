# Paperboy Push Service

_Paperboy Push Service_ is a simple webservice that will convert an incoming HTTP request into a message in paperboy's queue thus abstracting the complexity of multiplexing a notification to the clients.

## Usage

You push a message like

```
{"foo":"bar","source":"test"}
```

into the queue with the following cURL command:

```
curl -X POST \
  http://localhost:8081/ \
  -H 'Authorization: Bearer test' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Postman-Token: eb7dfc7b-43b8-62df-df93-155722691a87' \
  -d 'source=test&payload=%7B%22foo%22%3A%22bar%22%7D'
```

The parameters `source` and `payload` are optional. The default message will look like this:

```
{"source":"push-notifier"}
```