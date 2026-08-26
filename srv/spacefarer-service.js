import cds from "@sap/cds";

export default class SpacefarerService extends cds.ApplicationService {
  async init() {
    const { Spacefarers } = this.entities;

    this.before("CREATE", Spacefarers, (req) => this.onBeforeCreate(req));
    await super.init();

    console.log("SpacefarerService initialized");
  }

  onBeforeCreate(req) {
    console.log("Received request to create a new spacefarer:", req.data);

    const { stardustCollection, wormholeNavSkill, firstName, lastName } =
      req.data;

    req.data.stardustCollection = (stardustCollection ?? 0) + 50;
    req.data.wormholeNavSkill =
      wormholeNavSkill != null && wormholeNavSkill >= 10
        ? wormholeNavSkill
        : 10;

    console.log(
      `[@Before CREATE] Prepared ${firstName} ${lastName} for launch.`,
    );
  }
}
