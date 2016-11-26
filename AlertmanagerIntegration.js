class Script {



    process_incoming_request({
        request
    }) {
        var alertColor = "warning";

        if (request.content.status == "resolved") {
            alertColor = "good";
        } else if (request.content.status == "firing") {
            alertColor = "danger";
        }
        console.log(request.content);

        let finFields = [];
        for (i = 0; i < request.content.alerts.length; i++) {
            var endVal = request.content.alerts[i];
            var elem = {
                title: "alertname: " + endVal.labels.alertname,
                value: "<b>instance: </b>" + endVal.labels.instance + "<br>" + "<b>description: </b>" + endVal.annotations.description + "<br>" + "<b>summary: </b>" + endVal.annotations.summary,
                short: false
            };

            finFields.push(elem);
        }



        return {
            content: {

                username: "Alertmanager",
                attachments: [{
                    color: alertColor,
                    title_link: request.content.externalURL,
                    title: "Prometheus notification",
                    fields: finFields,

                }]

            }
        };

        return {
            error: {
                success: false,
                message: 'Error example'
            }
        };
    }
}
