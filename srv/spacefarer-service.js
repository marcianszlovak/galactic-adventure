import cds from "@sap/cds";

export default class SpacefarerService extends cds.ApplicationService {
  async init() {
    const { Spacefarers } = this.entities;

    await super.init();

    console.log("SpacefarerService initialized");
  }
}
