export default ({config, boundary, logger, messageHandler, entityMapper}) => {
    const {read, write} = entityMapper.define('post', []);

    return [{
        resource: "/",
        behaviors: [
            {endpoint: "/", method: "get", behavior: [
                (req, res, next) => read().then(data => res.send(data))
            ]},
        ]
    }];
}