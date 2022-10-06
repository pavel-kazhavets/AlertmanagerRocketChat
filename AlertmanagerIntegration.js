class Script {
    process_incoming_request({
        request
    }) {
        console.log(request.content);
  
        var alertColor = "warning";
        if (request.content.status == "resolved") {
            alertColor = "green";
        } else if (request.content.status == "firing") {
            alertColor = "danger";
        }

        let finFields = [];
        for (i = 0; i < request.content.alerts.length; i++) {
            var endVal = request.content.alerts[i];
            var elem = {
                title: "Alertname",
                value: endVal.labels.alertname,
                short: false
            };
            finFields.push(elem);

            if (!!endVal.annotations.summary) {
                finFields.push({
                    title: "Summary",
                    value: endVal.annotations.summary
                });
            }

            if (!!endVal.labels.severity) {
                finFields.push({
                    title: "Severity",
                    value: endVal.labels.severity
                });
            }

            if (!!endVal.annotations.description) {
                finFields.push({
                    title: "Description",
                    value: endVal.annotations.description
                });
            }

            if (!!endVal.annotations.message) {
                finFields.push({
                    title: "Message",
                    value: endVal.annotations.message
                });
            }

            finFields.push({
                title: "Labels",
                value: getLabelsField(endVal.labels)
            });
        }

        return {
            content: {
                username: "Prometheus Alert",
                attachments: [{
                    color: alertColor,
                    title_link: request.content.externalURL,
                    title: "Prometheus notification",
                    fields: finFields
                }]
            }
        };
    }

    getLabelsField(labelsObj) {
        let labelsArr = [];
        for (const key of Object.keys(labelsObj)) {
            if (key == "alertname" || key == "severity") {
                continue;
            }
            labelsArr.push(key+"="+labelsObj[key]);
        }

        return labelsArr.join(", ");
    }
}
