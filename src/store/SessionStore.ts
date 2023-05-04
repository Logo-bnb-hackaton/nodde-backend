import { SessionData, Store } from 'express-session'
import { documentClient } from '@/db/dynamo'
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"

import {
    DEFAULT_HASH_KEY,
    DEFAULT_HASH_PREFIX,
    DEFAULT_SORT_KEY,
    DEFAULT_TTL,
    DEFAULT_TOUCH_INTERVAL,
    DEFAULT_KEEP_EXPIRED_POLICY,
} from './Constants'
import { toSecondsEpoch, debug, isExpired } from './Utils'


/**
 * Express.js session store for DynamoDB.
 */
export class SessionStore extends Store {

    documentClient: DynamoDBDocumentClient

    tableName?: string
    hashPrefix?: string
    hashKey?: string
    sortKey?: string
    touchInterval?: number
    ttl?: number
    keepExpired: boolean
    keySchema?: any
    attributeDefinitions: any

    constructor(options: any = {}) {
        super()
        debug('Initializing store', options)
        this.setOptionsAsInstanceAttributes(options)
        this.documentClient = documentClient
    }

    /**
     * Saves the informed store options as instance attributes.
     * @param {Object} options Store options.
     */
    setOptionsAsInstanceAttributes(options: any) {
        const {
            table = {},
            touchInterval = DEFAULT_TOUCH_INTERVAL,
            ttl,
            keepExpired = DEFAULT_KEEP_EXPIRED_POLICY
        } = options

        const {
            name = "nodde-sessions",
            hashPrefix = DEFAULT_HASH_PREFIX,
            hashKey = DEFAULT_HASH_KEY,
            sortKey = DEFAULT_SORT_KEY,
        } = table

        this.tableName = name
        this.hashPrefix = hashPrefix
        this.hashKey = hashKey
        this.sortKey = sortKey

        this.touchInterval = touchInterval
        this.ttl = ttl
        this.keepExpired = keepExpired

        this.keySchema = [{ AttributeName: this.hashKey, KeyType: 'HASH' }]
        this.attributeDefinitions = [{ AttributeName: this.hashKey, AttributeType: 'S' }]
        if (this.sortKey) {
            this.keySchema.push({ AttributeName: this.sortKey, KeyType: 'RANGE' })
            this.attributeDefinitions.push({ AttributeName: this.sortKey, AttributeType: 'S' })
        }

        console.info(this)
    }


    /**
     * Stores a session.
     * @param  {String}   sid      Session ID.
     * @param  {Object}   sess     The session object.
     * @param  {Function} callback Callback to be invoked at the end of the execution.
     */
    set(sid: string, session: SessionData, callback?: (err?: any) => void): void {
        try {
            const sessionId = this.getSessionId(sid)
            const expires = this.getExpirationDate(session)
            const params = {
                TableName: this.tableName,
                Item: {
                    [this.hashKey]: sessionId,
                    [this.sortKey]: sessionId,
                    expires: toSecondsEpoch(expires),
                    sess: {
                        ...session,
                        updated: Date.now()
                    }
                }
            }
            debug(`Saving session '${sid}'`, session)

            this.documentClient.send(new PutCommand(params)).then(callback)
        } catch (err) {

            console.error('sadfsadfasdf')
            console.error(err)

            debug('Error saving session', {
                sid,
                session,
                err
            })
            callback(err)
        }
    }

    /**
     * Retrieves a session from dynamo.
     * @param  {String}   sid      Session ID.
     * @param  {Function} callback Callback to be invoked at the end of the execution.
     */
    async get(sid: string, callback: (err: any, session?: SessionData | null) => void): Promise<void> {
        try {
            const sessionId = this.getSessionId(sid)
            const params = {
                TableName: this.tableName,
                Key: {
                    [this.hashKey]: sessionId,
                    [this.sortKey]: sessionId
                },
                ConsistentRead: true
            }
            console.log(params)

            const { Item: record } = await this.documentClient.send(new GetCommand(params))

            if (!record) {
                debug(`Session '${sid}' not found`)
                callback(null, null)
            } else if (isExpired(record.expires)) {
                this.handleExpiredSession(sid, callback)
            } else {
                debug(`Session '${sid}' found`, record.sess)
                callback(null, record.sess)
            }
        } catch (err) {
            debug(`Error getting session '${sid}'`, err)
            callback(err)
        }
    }

    /**
     * Deletes a session from dynamo.
     * @param  {String}   sid      Session ID.
     * @param  {Function} callback Callback to be invoked at the end of the execution.
     */
    async destroy(sid: string, callback?: (err?: any) => void): Promise<void> {
        try {
            const sessionId = this.getSessionId(sid)
            const params = {
                TableName: this.tableName,
                Key: {
                    [this.hashKey]: sessionId,
                    [this.sortKey]: sessionId
                }
            }
            await this.documentClient.send(new DeleteCommand(
                params
            ))
            debug(`Destroyed session '${sid}'`)
            callback(null)
        } catch (err) {
            debug(`Error destroying session '${sid}'`, err)
            callback(err)
        }
    }

    /**
     * Updates the expiration time of an existing session.
     * @param  {String}   sid      Session ID.
     * @param  {Object}   sess     The session object.
     * @param  {Function} callback Callback to be invoked at the end of the execution.
     */
    touch?(sid: string, session: SessionData, callback?: () => void): void {
        try {
            if (!session.updated || Number(session.updated) + this.touchInterval <= Date.now()) {
                const sessionId = this.getSessionId(sid)
                const expires = this.getExpirationDate(session)
                const params = {
                    TableName: this.tableName,
                    Key: {
                        [this.hashKey]: sessionId,
                        [this.sortKey]: sessionId
                    },

                    UpdateExpression: 'set expires = :e, sess.#up = :n',
                    ExpressionAttributeNames: {
                        '#up': 'updated'
                    },
                    ExpressionAttributeValues: {
                        ':e': toSecondsEpoch(expires),
                        ':n': Date.now()
                    },
                    ReturnValues: 'UPDATED_NEW'
                }
                debug(`Touching session '${sid}'`)
                this.documentClient.send(new UpdateCommand(params)).then(callback)
            } else {
                debug(`Skipping touch of session '${sid}'`)
                callback()
            }
        } catch (err) {
            debug(`Error touching session '${sid}'`, err)
            callback()
        }
    }

    /**
     * Handles get requests that found expired sessions.
     * @param  {String} sid Original session id.
     * @param  {Function} callback Callback to be invoked at the end of the execution.
     */
    async handleExpiredSession(sid: string, callback: (obj: any) => any) {
        debug(`Found session '${sid}' but it is expired`)
        if (this.keepExpired) {
            callback(null)
        } else {
            this.destroy(sid, callback)
        }
    }

    /**
     * Builds the session ID foe storage.
     * @param  {String} sid Original session id.
     * @return {String}     Prefix + original session id.
     */
    getSessionId(sid: string) {
        return `${this.hashPrefix}${sid}`
    }

    /**
     * Calculates the session expiration date.
     * @param  {Object} sess The session object.
     * @return {Date}      the session expiration date.
     */
    getExpirationDate(sess: any) {
        let expirationDate = Date.now()
        if (this.ttl !== undefined) {
            expirationDate += this.ttl
        } else if (sess.cookie && Number.isInteger(sess.cookie.maxAge)) {
            expirationDate += sess.cookie.maxAge
        } else {
            expirationDate += DEFAULT_TTL
        }
        return new Date(expirationDate)
    }
}