import cds from "@sap/cds";

export default class SpacefarerService extends cds.ApplicationService {
  async init() {
    const { Spacefarers } = this.entities;

    this.before("CREATE", Spacefarers, (req) => this.onBeforeCreate(req));

    await super.init();

    console.log("SpacefarerService initialized");
  }

  onBeforeCreate(req) {
    console.log("Before creating a spacefarer:", req.data);
  }
}
