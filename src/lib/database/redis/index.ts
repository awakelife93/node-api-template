import config from "@/config";
import * as redis from "redis";
import { promisify } from "util";
import { redisConfig } from "../config";
import _ = require("lodash");

/**
 * EX: s
 * PS: ms
 */
type expireModeType = "EX" | "PX";

class Redis {
  private readonly client!: redis.RedisClient;

  constructor() {
    this.client = redis.createClient(redisConfig[config.NODE_ENV]);
  }

  get(key: string): Promise<string | null> {
    return promisify(this.client.get).bind(this.client)(key);
  }

  set(
    key: string,
    value: string,
    mode: expireModeType = "PX",
    time: number = config.jwtRefreshExpireMS
  ): void {
    this.client.set(key, value, mode, time);
  }

  remove(key: string): void {
    this.client.del(key);
  }
}

export default new Redis();
