import cds from "@sap/cds";

export default class SpacefarerService extends cds.ApplicationService {
  async init() {
    const { Spacefarers } = this.entities;

    this.before("CREATE", Spacefarers, (req) => this.onBeforeCreate(req));
    this.after("CREATE", Spacefarers, (data, req) => this.onAfterCreate(req));
    await super.init();

    console.log("SpacefarerService initialized");
  }

  onBeforeCreate(req) {
    console.log("Received request to create a new spacefarer:", req.data);

    const { stardustCollection, wormholeNavSkill, firstName, lastName } =
      req.data;

    if (
      wormholeNavSkill != null &&
      (wormholeNavSkill < 0 || wormholeNavSkill > 100)
    ) {
      return req.reject(
        400,
        `Wormhole navigation skill must be between 0 and 100. Got: ${wormholeNavSkill}`,
      );
    }

    if (stardustCollection != null && stardustCollection < 0) {
      return req.reject(
        400,
        `Stardust collection cannot be negative. Got: ${stardustCollection}`,
      );
    }

    req.data.stardustCollection = (stardustCollection ?? 0) + 50;
    req.data.wormholeNavSkill =
      wormholeNavSkill != null && wormholeNavSkill >= 10
        ? wormholeNavSkill
        : 10;

    console.log(
      `[@Before CREATE] Prepared ${firstName} ${lastName} for launch.`,
    );
  }

  async onAfterCreate(data) {
    console.log("After create");
    console.log(data);
  }
}
