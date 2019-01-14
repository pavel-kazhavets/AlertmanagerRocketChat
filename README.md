# AlertmanagerRocketChat

## Overview
AlertmanagerIntegration is script that will parse webhook notifications coming to Rocket.Chat.

## Installation

### Rocket.Chat

1) Login as admin user and go to: Administration => Integrations => New Integration => Incoming WebHook

2) Set "Enabled" and "Script Enabled" to "True"

3) Set all channel, icons, etc. as you need

3) Paste contents of [AlertmanagerIntegrations.js](https://github.com/pavel-kazhavets/AlertmanagerRocketChar/blob/master/AlertmanagerIntegration.js) into Script field.

4) Create Integration. You;ll see some values apper. Copy WebHook URL and proceed to Alertmanager.

### Alertmanager

1) Create new receiver or modify config of existing one. You'll need to add `webhooks_config` to it. Small example:

```yaml
route:
    repeat_interval: 30m
    group_interval: 30m
    receiver: 'rocketchat'

receivers:
    - name: 'rocketchat'
      webhook_configs:
          - send_resolved: false
            url: '${WEBHOOK_URL}'
```

2) Reload/restart alertmanager.

If everything is OK you should see alerts like this:

![alert example](https://i.imgur.com/RSlTSa5.png)

## Testing

In order to test the webhook you can use the following curl (replace <webhook-url>):

```yaml
curl -X POST -H 'Content-Type: application/json' --data '
{
  "text": "Example message",
  "attachments": [
    {
      "title": "Rocket.Chat",
      "title_link": "https://rocket.chat",
      "text": "Rocket.Chat, the best open source chat",
      "image_url": "https://rocket.cha t/images/mockup.png",
      "color": "#764FA5"
    }
  ],
  "status": "firing",
  "alerts": [
    {
      "labels": {
        "alertname": "high_load",
        "instance": "node-exporter:9100"
      },
      "annotations": {
        "description": "node-exporter:9100 of job xxxx is under high load.",
        "severity": "major",
        "summary": "node-exporter:9100 under high load."
      }
    }
  ]
}
' <webhook-url>
```

## NOTES

Alertmanager doesn't actually sends singular alerts - it sends array of current alerts, so it doesn't seem possible for now to split then in separate messages, but if you want, you can configure separate alerts/receivers/webhooks.

[Alertmanager Docs](https://prometheus.io/docs/alerting/overview/)

[Rocket.Chat Docs](https://rocket.chat/docs/administrator-guides/integrations/)
