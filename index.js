import uuid from 'uuidv4';
import {createClient} from 'redis';

export default ({config, boundary, logger, messageHandler, entityMapper}) => {
    const client = createClient();

    return [{
        resource: "/",
        behaviors: [
            {endpoint: "/", method: "get", behavior: [
                (req, res, next) =>
                    client.hgetall(
                        "hosts",
                        (err,data) => err ? res.send(data) : next(err)
                    )
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