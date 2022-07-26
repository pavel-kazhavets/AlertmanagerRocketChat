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
                title: "alertname: " + endVal.labels.alertname,
                value: "*instance:* " + endVal.labels.instance,
                short: false
            };

            finFields.push(elem);

            if (!!endVal.annotations.summary) {
                finFields.push({
                    title: "summary",
                    value: endVal.annotations.summary
                });
            }

            if (!!endVal.annotations.severity) {
                finFields.push({
                    title: "severity",
                    value: endVal.annotations.severity
                });
            }

            if (!!endVal.annotations.description) {
                finFields.push({
                    title: "description",
                    value: endVal.annotations.description
                });
            }
			
			if (!!endVal.annotations.mention) {
                finFields.push({
                    title: "mention",
                    value: endVal.annotations.mention
                });
            }
        }

        return {
            content: {
                username: "Prometheus Alert",
				text: endVal.annotations.mention,
                attachments: [{
                    color: alertColor,
                    title_link: request.content.externalURL,
                    title: "Prometheus notification",
                    fields: finFields
                }]
            }
        };

        return {
            error: {
                success: false
            }
        };
    }
}
