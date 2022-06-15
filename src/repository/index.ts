import config from "@/config";
import { ErrorStatusMessage } from "@/lib/status";
import { Contents } from "@/models/Contents";
import { User } from "@/models/User";
import _ from "lodash";
import { getManager, Repository } from "typeorm";

class AppRepository {
  private user: Repository<User> | null = null;
  private contents: Repository<Contents> | null = null;

  connect(): void {
    this.user = getManager(config.NODE_ENV).getRepository(User);
    this.contents = getManager(config.NODE_ENV).getRepository(Contents);
  }

  get User(): Repository<User> {
    if (_.isNull(this.user)) {
      throw new Error(`User ${ErrorStatusMessage.IS_EMPTY_REPOSITORY}`);
    }

    return this.user;
  }

  get Contents(): Repository<Contents> {
    if (_.isNull(this.contents)) {
      throw new Error(`Contents ${ErrorStatusMessage.IS_EMPTY_REPOSITORY}`);
    }

    return this.contents;
  }
}

export default new AppRepository();
