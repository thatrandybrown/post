import {uuid} from 'uuidv4';
import {createClient} from 'redis';
import util from 'util';
const {promisify} = util;

export default ({config, messageHandler}) => {
    const client = createClient(config.cache.url);
    const hgetall = promisify(client.hgetall).bind(client);
    const hset = promisify(client.hset).bind(client);

    /**
     * the message recipient will just push back a message
     * the service will process it and push it to redis
     *
     * perhaps the service should also do a health check on redis
     * and send a message if redis fails / reboots to rehydrate
     *
     * or should it re-hydrate on service launch
    */
    messageHandler.read(config.messaging.rcvQueue, msg => {
        hset(config.cache.hash, msg.id, msg);
    });

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

                    /**
                     * in this case, if req.body has an id, it will overwrite
                     * the generated id.
                     *
                     * If a tree or graph structure needs to be implied by the
                     * versions, then it will need to be somewhere other than
                     * id, which will always be what is provided by the request
                    **/
                    const id = req.body.id || uuid()
                    const uid = uuid()
                    const timestamp = Date.now()
                    messageHandler.write(
                        config.messaging.sendQueue,
                        JSON.stringify({
                            id,
                            uid,
                            timestamp,
                            ...req.body
                        })
                    )
                    return res.status(202).send({id, uid})
                }
            ]}
        ]
    }];
}