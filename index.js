export default ({config, boundary, logger, messageHandler, entityMapper}) => {
    const {read, write} = entityMapper('post', []);

    return [{
        resource: "/",
        behaviors: [
            {endpoint: "/", method: "get", behavior: [
                (req, res, next) => res.send("Hello World")
            ]},
        ]
    }];
}