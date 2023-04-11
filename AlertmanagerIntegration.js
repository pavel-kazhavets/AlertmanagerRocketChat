// https://developer.rocket.chat/reference/api/rest-api/endpoints/core-endpoints/chat-endpoints/postmessage#message-object-example
// https://prometheus.io/docs/alerting/latest/notifications/
class Script {
    process_incoming_request({
        request
    }) {
        //console.log(request.content);
        
        var commonText = "";
        let alerts = [];

        // show only commonText if there is more than 2 alerts
        if (!!request.content.groupLabels && request.content.alerts.length > 1) {
            commonText = this.getCommonText(request.content);
        }
        for (i = 0; i < request.content.alerts.length; i++) {
            let finFields = [];
            // default color
            var alertColor = "red";
            var endVal = request.content.alerts[i];
            var title = endVal.labels.alertname;


            if (!!endVal.annotations.summary) {
                finFields.push({
                    title: "Summary",
                    value: endVal.annotations.summary
                });
            }
            

            // set color 
            if (endVal.status == "resolved") {
                alertColor = "green";
            } else if (!!endVal.labels.severity && endVal.labels.severity == "warning") {
                alertColor = "warning";
            } else if (!!endVal.labels.severity && endVal.labels.severity == "info") {
                alertColor = "green";
            } else if (!!endVal.labels.severity && endVal.labels.severity == "none") {
                alertColor = "grey";
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

            var links = [];
            links = this.getActionButtons(endVal);
            if (links.length > 0) {
                finFields.push({
                    title: "Links",
                    value: links.join(" ")
                });
            }

            finFields.push({
                title: "Labels",
                value: this.getLabelsField(endVal.labels),
                short: false,
            });
            

            //collapse all alerts except first two:
            var collapsed = false;
            if (i > 1) {
                collapsed = true;
            }
            alerts.push(
                {
                    color: alertColor,
                    title_link: request.content.externalURL,
                    title: endVal.status.toUpperCase()+": "+title,
                    fields: finFields,
                    collapsed: collapsed
                }
            )
        }

        return {
            content: {
                username: "Prometheus Alert",
                text: commonText,
                attachments: alerts,
            }
        };
    }


    getLabelsField(labelsObj) {
        let labelsArr = [];
        for (const key of Object.keys(labelsObj)) {
            if (key == "alertname" || key == "severity") {
                continue;
            }
            labelsArr.push("`"+key+"="+labelsObj[key]+"`");
        }
        return labelsArr.join(", ");
    }
    getLabelsURL(labelsObj) {
        let labelsArr = [];
        for (const key of Object.keys(labelsObj)) {
            labelsArr.push(key+"%3D"+labelsObj[key]);
        }
        return labelsArr.join("&matcher=");
    }

    getActionButtons(endVal) {
        let actions = [];

        if (!!endVal.annotations.silence_url && endVal.status == "firing") {
            actions.push("[🔕Silence]("+endVal.annotations.silence_url+"&"+this.getLabelsURL(endVal.labels)+")");
        }
        if (!!endVal.annotations.dashboard_url) {
            actions.push("[📈Dashboard]("+endVal.annotations.dashboard_url+")");
        }
        if (!!endVal.annotations.runbook_url) {
            actions.push("[📖Runbook]("+endVal.annotations.runbook_url+")");
        }
        return actions;
    }

    getCommonText(content) {
        let commonText = [];
        let groupLabels = [];
        let commonLabels = [];
        let commonAnnotations = [];
        if (!!content.groupLabels) {
            for (const key of Object.keys(content.groupLabels)) {
                // if (key == "x") {
                //     continue;
                // }
                groupLabels.push("`"+key+"="+content.groupLabels[key]+"`");
            }
            commonText.push("Alerts are grouped by: "+groupLabels.join(", "));
        };

        if (!!content.commonLabels) {
            for (const key of Object.keys(content.commonLabels)) {
                // if (key == "x") {
                //     continue;
                // }
                commonLabels.push("`"+key+"="+content.commonLabels[key]+"`");
            }
            commonText.push("Common labels: " + commonLabels.join(", "));
        };

        if (!!content.commonAnnotations) {
            for (const key of Object.keys(content.commonAnnotations)) {
                if (key == "silence_url" || key == "dashboard_url" || key == "runbook_url" || key == "__dashboardUid__" || key == "__panelId__" || key == "__alertId__") {
                    continue;
                }
                commonAnnotations.push("**"+key+"**: "+content.commonAnnotations[key]);
            }
            commonText.push(commonAnnotations.join("\n"));
        };

        return commonText.join("\n");

    }
}
