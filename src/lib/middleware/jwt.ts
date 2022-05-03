import config from "@/config";
import {
  CommonStatusCode,
  CommonStatusMessage,
  IRequest,
  onFailureHandler,
  Redis
} from "@/lib";
import { generateRefreshTokenKey } from "@/utils";
import * as jwt from "jsonwebtoken";
import * as _ from "lodash";

export type PayLoadItemType = {
  userId: number;
  email: string;
};

export type CreateTokenParamsType = {
  jwtExpired?: string | number;
} & PayLoadItemType;

export type TokenPayLoadType = jwt.JwtPayload & PayLoadItemType;

/**
 * @description
 * @param {CreateTokenParamsType}
 * @returns {string} token
 */
export const createToken = ({
  userId,
  email,
  jwtExpired,
}: CreateTokenParamsType): string => {
  return jwt.sign(
    {
      userId,
      email,
    },
    config.jwtSecret,
    { expiresIn: jwtExpired ?? config.jwtExpired }
  );
};

export const getTokenPayload = (token: string): TokenPayLoadType => {
  return {
    ...(jwt.verify(token, config.jwtSecret, {
      ignoreExpiration: true,
    }) as TokenPayLoadType),
  };
};

export const checkToken = async (request: IRequest): Promise<void> => {
  const token = request.token;

  if (!_.isUndefined(token)) {
    /**
     * 로그인 상태
     */
    try {
      const now = new Date().getTime() / 1000;
      const jwtPayload: TokenPayLoadType = getTokenPayload(token);

      // 토큰이 유효하지 않다.
      if (!_.isUndefined(jwtPayload.exp) && now > jwtPayload.exp) {
        const refreshToken = (await Redis.get(
          generateRefreshTokenKey(jwtPayload.email)
        ));

        if (_.isNull(refreshToken)) {
          console.log(`===========> 1. refreshToken is Null ${token}`);
          onFailureHandler({
            status: CommonStatusCode.UNAUTHORIZED,
            message: CommonStatusMessage.UNAUTHORIZED,
          });
        }

        const refreshTokenPayload: TokenPayLoadType =
          getTokenPayload(refreshToken as string);
        if (!_.isUndefined(refreshTokenPayload.exp) &&  now > refreshTokenPayload.exp) {
          console.log(`===========> 2. now: ${now} > refreshToken exp ${token}`);

          // 유효하지 않은 refresh token 삭제
          await Redis.remove(
            generateRefreshTokenKey(refreshTokenPayload.email)
          );

          onFailureHandler({
            status: CommonStatusCode.UNAUTHORIZED,
            message: CommonStatusMessage.UNAUTHORIZED,
          });
        } else {
          // 토큰 연장
          request.newToken = createToken({
            userId: refreshTokenPayload.userId,
            email: refreshTokenPayload.email,
            jwtExpired: config.jwtExpired,
          });
        }
      }
    } catch (error: unknown) {
      console.log(`===========> 3. ETC Error ${error} ${token}`);
      onFailureHandler({
        status: CommonStatusCode.UNAUTHORIZED,
        message: CommonStatusMessage.UNAUTHORIZED,
      });
    }
  }
};

export const getPayload = (token: string): PayLoadItemType => {
  const payload: TokenPayLoadType = getTokenPayload(token);

  if (_.isEmpty(payload)) {
    console.log(`===========> Token Payload Empty ${token}`);
    onFailureHandler({
      status: CommonStatusCode.NOT_FOUND,
      message: CommonStatusMessage.NOT_FOUND,
    });
  }

  return {
    userId: payload.userId,
    email: payload.email,
  };
};
