import uuid from 'uuidv4';

export default ({config, boundary, logger, messageHandler, entityMapper}) => {
    const {read, write} = entityMapper.define('post', []);

    return [{
        resource: "/",
        behaviors: [
            {endpoint: "/", method: "get", behavior: [
                (req, res, next) => read().then(data => res.send(data))
            ]},
            {endpoint: "/", method: "post", behavior: [
                (req, res, next) => {
                    /**
                     * probably good to do some data checking on the body
                     * before sending it on
                    **/
                    messageHandler.write(config.messaging.queue,
                            JSON.stringify({id: uuid(), ...req.body}))
                    return res.status(202).send({id})
                }
            ]}
        ]
    }];
}