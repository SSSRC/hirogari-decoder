const net = require('net');

module.exports.getPort = async () => {
    const server = net.createServer();

    let port;

    try {
        await server.listen(0, () => {
            port = server.address().port;

            server.close();
        });
    } catch (e) {
        port = null;
    }

    return `${port}`;
};
