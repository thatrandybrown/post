import uuid from 'uuidv4';

export default ({config, boundary, logger, messageHandler, entityMapper}) => {
    const {read} = entityMapper.define('post', [id, text]);

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
                    const post = {id: uuid()}
                    messageHandler.write(config.messaging.queue,
                            JSON.stringify({...post, ...req.body}))
                    return res.status(202).send(post)
                }
            ]}
        ]
    }];
}