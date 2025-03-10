import axios from "axios";
import type {UserService, UserInfo} from "@foxitsoftware/web-collab-server";
import {serverPort} from "./server";

/**
 * A Custom UserService to do authentication.
 */
export const userService: UserService = {
  async getUserByToken(token: string) {

    // Use collab-server's built-in simple auth for this demo.
    // The user app should use their own auth service instead.
    const result = await axios.request({
      url: `http://localhost:${serverPort}/api/user/auth`,
      method: 'post',
      params: {
        token
      }
    })
    return result.data?.data as UserInfo
  }
}
