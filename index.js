import {uuid} from 'uuidv4';
import {createClient} from 'redis';
import util from 'util';
const {promisify} = util;

export default ({config, messageHandler}) => {
    const client = createClient(config.cache.url);
    const hgetall = promisify(client.hgetall).bind(client);

    return [{
        resource: "/",
        behaviors: [
            {endpoint: "/", method: "get", behavior: [
                async (req, res, next) => {
                    const data = await hgetall(config.cache.hash);
                    return res.send(data);
                }
            ]},
            {endpoint: "/", method: "post", behavior: [
                (req, res, next) => {
                    /**
                     * probably good to do some data checking on the body
                     * before sending it on
                    **/
                    const id = uuid()
                    messageHandler.write(config.messaging.queue,
                            JSON.stringify({id, ...req.body}))
                    return res.status(202).send({id})
                }
            ]}
        ]
    }];
}