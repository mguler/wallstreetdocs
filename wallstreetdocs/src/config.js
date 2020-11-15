module.exports = {
    app: {
        port: 9999,
        startupMessage:"Application is listening on the port 9999"
    },
    remoteApi: {
        reporting: {
            endpoints: {
                auth: "https://staging-authentication.wallstreetdocs.com/oauth/token",
                request: "https://staging-gateway.priipcloud.com/api/v2.0/gateway/reports/status/service",
                download: "https://staging-gateway.priipcloud.com/api/v2.0/gateway/reports/status/service"
            },
            credentials: {
                grant_type: "client_credentials",
                client_id: "coding_test",
                client_secret: "bwZm5XC6HTlr3fcdzRnD"
            }
        }
    }
}