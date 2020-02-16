import {uuid} from 'uuidv4';
import {createClient} from 'redis';
import util from 'util';
const {promisify} = util;

export default ({config, boundary, logger, messageHandler, entityMapper}) => {
    const client = createClient("redis://redis:6379");
    const hgetall = promisify(client.hgetall).bind(client);

    return [{
        resource: "/",
        behaviors: [
            {endpoint: "/", method: "get", behavior: [
                async (req, res, next) => {
                    const data = await hgetall("posts");
                    return res.send(data);
                }
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