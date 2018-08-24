import express from "express";
import { Express, Router, Request, Response } from "express";
import * as http from "http";
import * as bodyParser from "body-parser";
import passport from "passport";
import * as passportBearer from "passport-http-bearer";
import { connect } from 'amqplib';
import { config } from "./config";

class App {
    static express: Express = express();
    static router: Router = Router();
    private static server;

    static start() {
        this.init().then(() => {
            App.server.listen(8080);
        });
    }

    private static async init()  {
        App.initPassport();
        await App.initExpress();
        App.server = http.createServer(App.express);
    }

    private static async initExpress() {
        App.express.use(bodyParser.json());
        App.express.use(bodyParser.urlencoded({extended: false}));
        App.express.use(passport.initialize());
        App.express.use(passport.session());
        App.express.use(App.router);
        App.router.post('/', passport.authenticate('bearer', { session: false }), App.sendNotification);
    }

    private static initPassport() {
        passport.use(new passportBearer.Strategy(
            (token, done) => {
                return done(null, token === config.get('apiToken') ? token : false);
            }
        ));

        passport.serializeUser((user: any, done) => {
            done(null, user);
        });

        passport.deserializeUser((obj: any, done) => {
            done(null, obj);
        });
    }

    private static sendNotification(req: Request, res: Response) {
        App.sendToQueue(req.body.payload || '{}', req.body.source || config.get('queue.source')).then(() => {
            res.status(201).send('OK');
        }).catch((err) => {
            console.error('Sending of notification failed', err);
            res.status(500).send('Fail');
        });        
    }

    private static async sendToQueue(body: string, source: string = config.get('queue.source')): Promise<void> {
        let connection = await connect(config.get('queue.uri'));
        let channel = await connection.createChannel();
        let message = {};
        
        try { 
            message = JSON.parse(body);
        } catch (err) {
        }

        message = Object.assign(message, {source: source});

        try {
            config.get('queue.exchange').split(',').forEach(exchange => {
                channel.assertExchange(exchange, 'fanout', {
                    durable: false
                }).then(() => {
                    channel.publish(exchange, '', Buffer.from(JSON.stringify(message)));
                });
            });
            return Promise.resolve();
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

App.start();