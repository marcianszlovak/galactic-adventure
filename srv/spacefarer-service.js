import cds from "@sap/cds";

export default class SpacefarerService extends cds.ApplicationService {
  async init() {
    const { Spacefarers } = this.entities;

    this.before("CREATE", Spacefarers, (req) => this.onBeforeCreate(req));
    this.after("CREATE", Spacefarers, (data, req) => this.onAfterCreate(req));
    this.on("launchMission", Spacefarers, async (req) =>
      this.launchMission(req),
    );
    await super.init();

    console.log("SpacefarerService initialized");
  }

  onBeforeCreate(req) {
    console.log("Received request to create a new spacefarer:", req.data);

    const { wormholeNavSkill, firstName, lastName } = req.data;
    const stardustCollection =
      req.data.stardustCollection != null
        ? Number(req.data.stardustCollection)
        : null;

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

  async onAfterCreate(req) {
    const { firstName, lastName, email } = req.data;

    if (!email) {
      console.warn(
        `[@After CREATE] No email on file for ${firstName} ${lastName}, skipping notification.`,
      );
      return;
    }

    await this.sendCosmicWelcomeEmail({ email, firstName, lastName });
  }

  async sendCosmicWelcomeEmail({ email, firstName, lastName }) {
    console.log(`
    ================================
    🚀 COSMIC NOTIFICATION EMAIL 🚀
    To: ${email}
    Subject: Welcome aboard, ${firstName}!

    Dear ${firstName} ${lastName},

    Congratulations! Your journey among the stars has begun.
    Your spacesuit is fitted, your stardust reserves are stocked,
    and the galaxy awaits your wormhole navigation skills.

    Safe travels, spacefarer.
    ================================
    `);
  }

  async launchMission(req) {
    console.log(req);
  }
}
