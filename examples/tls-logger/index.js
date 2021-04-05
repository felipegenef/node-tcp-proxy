var proxy = require("node-tcp-proxy");
var util = require("util");
var replace = require('buffer-replace');

var serviceHosts = ["www.google.com", "www.google.com"];
var servicePorts = [443, 443];

var newProxy = proxy.createProxy(8080, serviceHosts, servicePorts, {
    tls: "both",
    upstream: function(context, data) {
        log(context.proxySocket, data);
        data = replace(data, "localhost:8080", "www.google.com");
        return data;
    },
    downstream: function(context, data) {
        log(context.serviceSocket, data);
        data = replace(data, "www.google.com", "localhost:8080");
        return data;
    },
    serviceHostSelected: function(proxySocket, i) {
        console.log(util.format("Service host %s:%s selected for client %s:%s.",
            serviceHosts[i],
            servicePorts[i],
            proxySocket.remoteAddress,
            proxySocket.remotePort));
        // use your own strategy to calculate i
        return i;
    }
});

function log(socket, data) {
    console.log(util.format("%s:%s sent:",
        socket.remoteAddress,
        socket.remotePort));
    console.log(data.toString('hex'));
}

console.log("Open https://localhost:8080 in the browser.");

console.log("press Enter key to quit...");
setTimeout(handleTimeout, 1000);
function handleTimeout() {
    var data = process.stdin.read(1);
    if (data) {
        console.log("bye.");
        newProxy.end();
        process.exit(0);
    }
    setTimeout(handleTimeout, 1000);
}
